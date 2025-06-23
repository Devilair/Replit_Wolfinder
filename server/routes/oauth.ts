import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { AppStorage } from '../storage';
import { User, NewUser } from '../../shared/schema';

export function setupOAuthRoutes(app: express.Express, storage: AppStorage) {
  const router = express.Router();

  // Inizializza GitHub Strategy solo se le chiavi sono presenti
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackURL: `${env.API_BASE_URL}/api/auth/github/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          console.log(profile);
          return done(null, profile);
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        const user = await storage.getUserById(id);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    });

    router.use(passport.initialize());

    router.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

    router.get(
      '/api/auth/github/callback',
      passport.authenticate('github', { failureRedirect: '/login' }),
      (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
      }
    );
  } else {
    console.warn("⚠️  Le chiavi GitHub non sono configurate. Le rotte di autenticazione GitHub sono disattivate.");
  }

  app.use('/auth', router);
} 
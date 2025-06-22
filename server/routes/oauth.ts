import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { AppStorage } from '../storage';
import { User, NewUser } from '../../shared/schema';

export function setupOAuthRoutes(app: express.Express, storage: AppStorage) {
  const router = express.Router();

  passport.use(
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: `${env.API_BASE_URL}/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Email not available from GitHub profile.'), null);
          }

          let user = await storage.getUserByEmail(email);

          if (!user) {
            const newUser: NewUser = {
              name: profile.displayName || profile.username,
              email: email,
              githubId: profile.id,
              role: 'consumer',
            };
            user = await storage.createUser(newUser);
          } else if (!user.githubId) {
            user = await storage.updateUser(user.id, { githubId: profile.id });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
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

  router.get('/github', passport.authenticate('github'));

  router.get(
    '/github/callback',
    passport.authenticate('github', {
      session: false,
      failureRedirect: `${env.FRONTEND_BASE_URL}/login?error=oauth_failed`,
    }),
    (req, res) => {
      const user = req.user as User;
      if (!user) {
        return res.redirect(`${env.FRONTEND_BASE_URL}/login?error=auth_failed`);
      }
      const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
      res.redirect(`${env.FRONTEND_BASE_URL}/auth-callback?token=${token}`);
    }
  );

  app.use('/auth', router);
} 
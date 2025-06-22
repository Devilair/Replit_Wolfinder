import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { env } from './env';
import { storage } from './storage';
import { setupRoutes } from './routes';

const app: Express = express();
const port = env.PORT || 8080;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Setup all application routes from a single entry point
setupRoutes(app, storage);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
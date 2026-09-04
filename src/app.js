import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json({ limit: '5mb' })); // logos/images are sent as base64
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

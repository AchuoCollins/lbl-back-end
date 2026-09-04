import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // CORS_ORIGIN can be a single origin or a comma-separated list, so both
  // local dev and the deployed frontend(s) can talk to this API at once.
  const allowedOrigins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((origin) => origin.trim());

  app.use(
    cors({
      origin:
        allowedOrigins.includes('*')
          ? '*'
          : (origin, callback) => {
              if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
              } else {
                callback(new Error(`Origin ${origin} not allowed by CORS`));
              }
            },
    })
  );
  app.use(express.json({ limit: '5mb' })); // logos/images are sent as base64
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

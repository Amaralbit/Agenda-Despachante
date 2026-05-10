import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const isVercelRuntime = process.env.VERCEL === '1';
const apiBasePath = isVercelRuntime ? '/' : (process.env.API_BASE_PATH ?? '/api');

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json());

app.use(apiBasePath, routes);

app.use(errorHandler);

export default app;

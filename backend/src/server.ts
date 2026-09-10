import dotenv from 'dotenv';
import { createApp } from './app';
import { logger } from './utils/logger';

dotenv.config();

const port = process.env.PORT || process.env.BACKEND_PORT || 5001;
const app = createApp();

app.listen(port, () => {
  logger.info(`AgriTech Trusted Backend Server listening on http://localhost:${port}`);
});

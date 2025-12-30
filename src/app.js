import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from '#routes/auth.route.js';
import { securityMiddleware } from '#middleware/security.middleware.js';


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim())} }));
app.use(cookieParser());
app.use(securityMiddleware);
app.use(express.static('public'));


// Routes
app.get('/', (req, res) => {
  logger.info('Hello from Stones API');
  res.status(200)
    .send('Hello from Stones API');
});

app.get('/health', (req, res) => {
  res.status(200)
    .json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api', (req, res) => {
  res.status(200)
    .json({ message: 'Stones API is running successfully' });
});

app.use('/api/auth', router);


export default app;

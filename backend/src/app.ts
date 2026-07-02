import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Food Delivery Platform Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default app;

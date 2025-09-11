import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from '@/routes/auth.routes.js';
import accountRoutes from '@/routes/account.routes.js';
import transactionRoutes from '@/routes/transaction.routes.js';
import pixRoutes from '@/routes/pix.routes.js';
import userRoutes from '@/routes/user.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pix', pixRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Lumina Bank API is running!');
});

export { app };

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import { authenticate } from './middlewares/authMiddleware.js';
import { apiAuditLogger } from './middlewares/loggerMiddleware.js';

dotenv.config();
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is required'); process.exit(1); }

export const app = express();
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
// Everything below requires a valid JWT
app.use('/api', authenticate, apiAuditLogger);
app.use('/api/assets', assetRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api', assignmentRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not found.' }));

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`API listening on :${port}`));
}

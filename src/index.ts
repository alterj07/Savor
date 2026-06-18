import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes will be added below
import scanRouter from './routes/scan';
app.use('/api/scan', scanRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Savor backend running on port ${PORT}`);
});
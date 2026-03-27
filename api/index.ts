import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importante: Verifique se esses arquivos existem exatamente nesses nomes
import authRoutes from '../server/_core/routes/auth.routes.ts'; 
import tutoriaRoutes from '../server/_core/routes/tutoria.routes.ts';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rota de Teste (Se o erro "A" sumir nesta rota, o motor ligou!)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Motor Ligado', banco: process.env.DATABASE_URL ? 'Detectado' : 'Faltando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tutorias', tutoriaRoutes);

export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// IMPORTANTE: Adicione ".ts" no final de todos os seus imports de arquivos locais!
import authRoutes from '../server/_core/routes/auth.routes.ts'; 
import tutoriaRoutes from '../server/_core/routes/tutoria.routes.ts';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste (A nossa "luz de emergência")
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Motor Ligado', 
    banco: process.env.DATABASE_URL ? 'URL Detectada' : 'URL Faltando',
    seguranca: process.env.JWT_SECRET ? 'Chave OK' : 'Sem JWT_SECRET'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tutorias', tutoriaRoutes);

export default app;

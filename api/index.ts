import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ROTA DE TESTE: Para saber se o motor ligou de verdade
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Motor Ligado!', 
    banco: process.env.DATABASE_URL ? 'Fiação OK' : 'Sem Energia' 
  });
});

// AQUI: Chame suas rotas diretamente da pasta server
// IMPORTANTE: Use o .ts no final de cada import!
import authRoutes from '../server/_core/routes/auth.routes.ts';
import tutoriaRoutes from '../server/_core/routes/tutoria.routes.ts';

app.use('/api/auth', authRoutes);
app.use('/api/tutorias', tutoriaRoutes);

export default app;

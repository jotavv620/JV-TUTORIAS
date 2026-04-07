import dotenv from 'dotenv';
import path from 'path';

// Garante que o .env seja lido da raiz, já que o arquivo está na pasta /api
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Importa o seu servidor real (ajuste o caminho se necessário)
// Se o seu arquivo original for .ts, a Vercel resolve automaticamente
import appPromise from '../server/_core/index'; 

export default async function handler(req, res) {
  try {
    const app = await appPromise;
    
    // Se o seu app for uma instância do Express, ele é uma função (req, res)
    return app(req, res);
  } catch (error) {
    console.error("Erro na API:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
}

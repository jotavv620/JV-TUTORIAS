// Adicionamos a extensão .ts no final. 
// A Vercel (Linux) é muito rigorosa e, sem o .ts, ela acha que é uma pasta, não um arquivo.
import app from '../server/_core/index.ts'; 

export default app;

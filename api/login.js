import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  const uri = process.env.DATABASE_URL;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Agora pegamos apenas o 'codigo' que vem do seu formulário
  const { codigo } = req.body;

  if (!codigo) {
    return res.status(400).json({ message: 'O código é obrigatório' });
  }

  try {
    const connection = await mysql.createConnection(uri);

    // Ajuste o nome da tabela (usuarios) e da coluna (codigo) se forem diferentes no seu banco
    const [rows] = await connection.execute(
      'SELECT id, nome, codigo FROM usuarios WHERE codigo = ?',
      [codigo]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Código inválido ou não encontrado' });
    }

    // Se achou, o Vercel responde com JSON (Adeus erro de "transform"!)
    return res.status(200).json({ 
      success: true, 
      user: rows[0] 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao conectar no MySQL', error: error.message });
  }
}

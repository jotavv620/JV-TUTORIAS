import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  // Pega a sua URL do banco que você já tem no Vercel
  const uri = process.env.DATABASE_URL;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { email, password } = req.body;

  try {
    // Conecta no seu MySQL do TiDB Cloud
    const connection = await mysql.createConnection(uri);

    // Procura o usuário na tabela 'usuarios' (ajuste o nome da tabela se for outro)
    const [rows] = await connection.execute(
      'SELECT id, email, nome FROM usuarios WHERE email = ? AND password = ?',
      [email, password]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' });
    }

    // Se achou o usuário, retorna os dados (JSON de verdade!)
    return res.status(200).json({ 
      success: true, 
      user: rows[0] 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao conectar no banco MySQL', error: error.message });
  }
}

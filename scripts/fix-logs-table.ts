import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function fixLogsTable() {
  console.log('🔄 Corrigindo tabela logs_auditoria...');

  if (!process.env.DATABASE_PASSWORD) {
    console.error('❌ Erro: DATABASE_PASSWORD não definida no .env');
    process.exit(1);
  }

  const directConnectionString = `postgres://postgres:${process.env.DATABASE_PASSWORD}@db.nrlvchnkplruprpskclg.supabase.co:5432/postgres`;

  let client: Client;

  try {
    console.log('🔌 Conectando ao Banco de Dados...');
    client = new Client({
      connectionString: directConnectionString,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Adicionar coluna tabela se não existir
    console.log('📜 Adicionando coluna tabela...');
    await client.query(`
      ALTER TABLE logs_auditoria
      ADD COLUMN IF NOT EXISTS tabela VARCHAR(50)
    `);

    console.log('✅ Tabela logs_auditoria corrigida!');

  } catch (err: any) {
    console.error('❌ FALHA NA CORREÇÃO:');
    console.error(err.message);
  } finally {
    if (client!) await client.end();
  }
}

fixLogsTable();

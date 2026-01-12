import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  console.log('🔄 Iniciando Criação do Schema Inicial...');

  if (!process.env.DATABASE_PASSWORD) {
    console.error('❌ Erro: DATABASE_PASSWORD não definida no .env');
    process.exit(1);
  }

  // Connection String para Supabase (Direct Connection)
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

    const sqlPath = path.join(process.cwd(), 'supabase/migrations/init_schema.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Arquivo SQL não encontrado: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📜 Executando SQL de Schema Inicial...');
    await client.query(sql);

    console.log('✅ SCHEMA INICIAL CRIADO COM SUCESSO! 🏗️');
    console.log('   - Tabelas criadas');
    console.log('   - Índices criados');
    console.log('   - Tipos de serviço inseridos');
    console.log('   - RLS ativado (configurações pendentes)');

  } catch (err: any) {
    console.error('❌ FALHA NA CRIAÇÃO DO SCHEMA:');
    console.error(err.message);
    if (err.message.includes('password')) {
      console.error('   -> Verifique se a senha no .env está correta.');
    }
  } finally {
    if (client!) await client.end();
  }
}

run();

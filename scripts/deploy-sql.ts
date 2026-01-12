import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  console.log('🔄 Iniciando Migração de Segurança...');
  
  if (!process.env.DATABASE_PASSWORD) {
    console.error('❌ Erro: DATABASE_PASSWORD não definida no .env');
    process.exit(1);
  }

  // Connection String para Supabase (Direct Connection)
  const connectionString = `postgres://postgres.nrlvchnkplruprpskclg:${process.env.DATABASE_PASSWORD}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;
  // Fallback: Tentar connection string direta se o pooler falhar (geralmente porta 5432 no db.project.supabase.co)
  const directConnectionString = `postgres://postgres:${process.env.DATABASE_PASSWORD}@db.nrlvchnkplruprpskclg.supabase.co:5432/postgres`;

  let client: Client;

  try {
    // Tentando conectar via Pooler primeiro (mais comum para Serverless, mas scripts locais as vezes preferem direto)
    console.log('🔌 Conectando ao Banco de Dados...');
    client = new Client({
      connectionString: directConnectionString, // Usando direto para scripts admin
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    const sqlPath = path.join(process.cwd(), 'supabase/migrations/security_hardening.sql');
    if (!fs.existsSync(sqlPath)) {
        throw new Error(`Arquivo SQL não encontrado: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📜 Executando SQL...');
    await client.query(sql);
    
    console.log('✅ MIGRAÇÃO EXECUTADA COM SUCESSO! 🛡️');
    console.log('   - RLS Ativado');
    console.log('   - Policies Criadas');
    console.log('   - Triggers Configurados');

  } catch (err: any) {
    console.error('❌ FALHA NA MIGRAÇÃO:');
    console.error(err.message);
    if (err.message.includes('password')) {
        console.error('   -> Verifique se a senha no .env está correta.');
    }
  } finally {
    if (client!) await client.end();
  }
}

run();

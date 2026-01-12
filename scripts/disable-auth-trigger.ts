import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function disableAuthTrigger() {
  console.log('🔄 DESABILITANDO TRIGGER DE AUTH =================\n');

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

    // Desabilitar trigger de auth
    console.log('📜 Desabilitando trigger on_auth_user_created...');
    await client.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users');
    console.log('   ✅ Trigger desabilitado');

    console.log('\n============================================');
    console.log('✨ TRIGGER DE AUTH DESABILITADO!');

  } catch (err: any) {
    console.error('❌ FALHA AO DESABILITAR TRIGGER:');
    console.error(err.message);
  } finally {
    if (client!) await client.end();
  }
}

disableAuthTrigger();

import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkOficinas() {
  console.log('🔍 VERIFICANDO OFICINAS =================\n');

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

    // Consultar oficinas
    const result = await client.query('SELECT id, email, nome FROM oficinas');

    console.log(`\n📋 Total de oficinas: ${result.rows.length}\n`);

    for (const row of result.rows) {
      console.log(`   ID: ${row.id}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Nome: ${row.nome}`);
      console.log('');
    }

  } catch (err: any) {
    console.error('❌ FALHA NA CONSULTA:');
    console.error(err.message);
  } finally {
    if (client!) await client.end();
  }
}

checkOficinas();

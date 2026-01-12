import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanDatabase() {
  console.log('🔄 LIMPANDO BANCO DE DADOS COMPLETAMENTE =================\n');

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

    // Desativar temporariamente RLS para permitir deleção
    console.log('📜 Desativando RLS temporariamente...');
    await client.query('ALTER TABLE logs_auditoria DISABLE ROW LEVEL SECURITY');

    // Remover logs
    console.log('🗑️  Removendo logs de auditoria...');
    await client.query('TRUNCATE TABLE logs_auditoria CASCADE');
    console.log('   ✅ Logs removidos');

    // Reativar RLS
    console.log('📜 Reativando RLS...');
    await client.query('ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY');

    // Remover notificações
    console.log('🗑️  Removendo notificações...');
    await client.query('TRUNCATE TABLE notificacoes CASCADE');
    console.log('   ✅ Notificações removidas');

    // Remover mensagens whatsapp
    console.log('🗑️  Removendo mensagens whatsapp...');
    await client.query('TRUNCATE TABLE mensagens_whatsapp CASCADE');
    console.log('   ✅ Mensagens removidas');

    // Remover serviços
    console.log('🗑️  Removendo serviços...');
    await client.query('TRUNCATE TABLE servicos CASCADE');
    console.log('   ✅ Serviços removidos');

    // Remover clientes
    console.log('🗑️  Removendo clientes...');
    await client.query('TRUNCATE TABLE clientes CASCADE');
    console.log('   ✅ Clientes removidos');

    // Remover oficinas
    console.log('🗑️  Removendo oficinas...');
    await client.query('TRUNCATE TABLE oficinas CASCADE');
    console.log('   ✅ Oficinas removidas');

    console.log('\n============================================');
    console.log('✨ LIMPEZA CONCLUÍDA! Todas as tabelas vazias.');

  } catch (err: any) {
    console.error('❌ FALHA NA LIMPEZA:');
    console.error(err.message);
  } finally {
    if (client!) await client.end();
  }
}

cleanDatabase();

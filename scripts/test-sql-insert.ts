import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function testSQLInsert() {
  console.log('🧪 TESTANDO INSERÇÃO SQL DIRETA =================\n');

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

    // Testar inserção direta
    const oficinaId = '2a5a9e92-52a7-495a-a91a-eef55ac1c940';

    console.log('📝 Inserindo oficina via SQL direto...');

    const result = await client.query(`
      INSERT INTO oficinas (
        id, email, nome, setup_concluido, telefone,
        responsavel, endereco, cnpj, razao_social, senha_hash
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING *
    `, [
      oficinaId,
      'contato@spoficina.com',
      'São Paulo Oficina',
      true,
      '(11) 99999-9999',
      'Gerente Fictício',
      'Rua das Oficinas, 123',
      '00.000.000/0001-00',
      'São Paulo Oficina LTDA',
      '$2a$10$auth_managed_account_placeholder'
    ]);

    console.log('   ✅ Oficina inserida com sucesso!');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Nome: ${result.rows[0].nome}`);

    console.log('\n============================================');
    console.log('✨ TESTE CONCLUÍDO COM SUCESSO!');

  } catch (err: any) {
    console.error('❌ FALHA NO TESTE:');
    console.error(err.message);
  } finally {
    if (client!) await client.end();
  }
}

testSQLInsert();

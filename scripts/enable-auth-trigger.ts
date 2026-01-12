import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function enableAuthTrigger() {
  console.log('🔄 HABILITANDO TRIGGER DE AUTH =================\n');

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

    console.log('📜 Habilitando trigger de auth...');

    // Primeiro, verificar se a função existe
    const funcCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_proc WHERE proname = 'handle_new_user'
      );
    `);

    if (funcCheck.rows[0].exists) {
      console.log('   ℹ️  Função handle_new_user já existe');

      // Criar o trigger
      await client.query(`
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `);
      console.log('   ✅ Trigger on_auth_user_created criado/habilitado');
    } else {
      console.log('   ⚠️  Função handle_new_user não existe, criando...');

      // Criar a função
      await client.query(`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.oficinas (id, email, nome, setup_concluido, senha_hash, plano, ativo)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nome', 'Nova Oficina'),
            FALSE,
            '$2a$10$auth_managed_account_placeholder',
            'free',
            TRUE
          )
          ON CONFLICT (id) DO NOTHING;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `);
      console.log('   ✅ Função handle_new_user criada');

      // Criar o trigger
      await client.query(`
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `);
      console.log('   ✅ Trigger on_auth_user_created criado');
    }

    console.log('\n============================================');
    console.log('✨ TRIGGER DE AUTH HABILITADO!');

  } catch (err: any) {
    console.error('❌ FALHA AO HABILITAR TRIGGER:');
    console.error(err.message);
  } finally {
    if (client!) await client.end();
  }
}

enableAuthTrigger();

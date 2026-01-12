import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const WORKSHOPS = [
  { name: 'Bahia Oficina', email: 'contato@bahiaoficina.com', password: 'password123', uf: 'BA' },
  { name: 'Maceio Oficina', email: 'contato@maceiooficina.com', password: 'password123', uf: 'AL' },
  { name: 'Minas Gerais Oficina', email: 'contato@minasoficina.com', password: 'password123', uf: 'MG' },
  { name: 'Parana Oficina', email: 'contato@paranaoficina.com', password: 'password123', uf: 'PR' },
  { name: 'Sao Paulo Oficina', email: 'contato@spoficina.com', password: 'password123', uf: 'SP' },
];

async function createAuthUsers() {
  console.log('🔄 CRIANDO AUTH USERS =================\n');

  for (const workshop of WORKSHOPS) {
    console.log(`👤 Criando usuário: ${workshop.email}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: workshop.email,
      password: workshop.password,
      email_confirm: true,
      user_metadata: {
        nome: workshop.name,
        role: 'oficina'
      }
    });

    if (error) {
      console.error(`   ❌ Erro ao criar usuário: ${error.message}`);
      console.log(`   ℹ️  Pulando para o próximo usuário...\n`);
    } else {
      console.log(`   ✅ Usuário criado com sucesso!`);
      console.log(`   ID: ${data.user.id}\n`);
    }
  }

  console.log('\n============================================');
  console.log('✨ CRIAÇÃO DE USERS CONCLUÍDA!');
}

createAuthUsers().catch(console.error);

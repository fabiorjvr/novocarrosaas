import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL ou SERVICE_ROLE_KEY não encontrados no .env');
  process.exit(1);
}

// Criar cliente com Service Role (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPasswords() {
  console.log('🔧 Iniciando correção de senhas...');

  // Gerar hash para "123456"
  const passwordHash = await bcrypt.hash('123456', 10);
  console.log(`🔑 Hash gerado para "123456"`);

  // Atualizar todas as oficinas
  const { data, error } = await supabase
    .from('oficinas')
    .update({ senha_hash: passwordHash })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Atualizar todos

  if (error) {
    console.error('❌ Erro ao atualizar senhas:', error.message);
  } else {
    console.log('✅ Senhas atualizadas com sucesso na coluna "senha_hash"!');
  }

  console.log('\n✨ Pronto! Agora você pode logar em qualquer oficina com a senha "123456".');
}

fixPasswords().catch(console.error);

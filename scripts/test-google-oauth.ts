import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGoogleOAuth() {
  console.log('🧪 TESTANDO GOOGLE OAUTH =================\n');

  // Testar signInWithGoogle
  console.log('1️⃣  Testando signInWithOAuth...');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      skipBrowserRedirect: true
    }
  });

  if (error) {
    console.error(`   ❌ Erro ao testar Google OAuth: ${error.message}`);
    console.error(`   Erro completo:`, error);
    return false;
  }

  if (data && data.url) {
    console.log(`   ✅ Google OAuth configurado!`);
    console.log(`   URL de login: ${data.url}`);
    console.log(`   Provider URL disponível: https://nrlvchnkplruprpskclg.supabase.co/auth/v1/authorize?provider=google`);
    return true;
  }

  console.log(`   ⚠️  Resposta inesperada:`, data);
  return false;
}

testGoogleOAuth().catch(console.error);

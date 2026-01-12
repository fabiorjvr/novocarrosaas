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

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO DO SUPABASE =====================\n');

  try {
    // 1. Listar Auth Users
    console.log('1️⃣  AUTH USERS:');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('   ❌ Erro ao listar auth users:', authError.message);
    } else {
      console.log(`   ✅ Total: ${users?.length || 0} usuários`);
      users?.forEach(u => {
        console.log(`      - ${u.email} (ID: ${u.id})`);
      });
    }

    // 2. Verificar tabela oficinas
    console.log('\n2️⃣  TABELA OFICINAS:');
    const { data: oficinas, error: oficinasError } = await supabase
      .from('oficinas')
      .select('*');
    
    if (oficinasError) {
      console.error(`   ❌ Erro ao buscar oficinas: ${oficinasError.message}`);
      console.log(`   Código: ${oficinasError.code}`);
      console.log(`   Hint: ${oficinasError.hint}`);
    } else {
      console.log(`   ✅ Total: ${oficinas?.length || 0} oficinas`);
      oficinas?.forEach(o => {
        console.log(`      - ${o.nome} (${o.email}) - ID: ${o.id}`);
      });
    }

    // 3. Verificar tabela clientes
    console.log('\n3️⃣  TABELA CLIENTES:');
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('count', { count: 'exact', head: true });
    
    if (clientesError) {
      console.error(`   ❌ Erro ao buscar clientes: ${clientesError.message}`);
    } else {
      console.log(`   ✅ Total: ${clientes || 0} clientes`);
    }

    // 4. Verificar tabela servicos
    console.log('\n4️⃣  TABELA SERVIÇOS:');
    const { data: servicos, error: servicosError } = await supabase
      .from('servicos')
      .select('count', { count: 'exact', head: true });
    
    if (servicosError) {
      console.error(`   ❌ Erro ao buscar serviços: ${servicosError.message}`);
    } else {
      console.log(`   ✅ Total: ${servicos || 0} serviços`);
    }

    // 5. Verificar tabelas do sistema
    console.log('\n5️⃣  TABELAS DO SISTEMA:');
    const tables = ['logs_auditoria', 'mensagens_whatsapp', 'notificacoes', 'tipos_servico'];
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count || 0} registros`);
      }
    }

    // 6. Verificar se RLS está ativo
    console.log('\n6️⃣  RLS STATUS (OFICINAS):');
    const { data: rlsInfo } = await supabase
      .rpc('check_rls_status'); 
    
    if (!rlsInfo) {
      console.log('   ⚠️  Não foi possível verificar RLS (func check_rls_status não existe)');
    } else {
      console.log(`   ✅ RLS: ${rlsInfo}`);
    }

    console.log('\n============================================');

    // 7. Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    
    if (users && users.length > 0 && oficinas && oficinas.length === 0) {
      console.log('   ⚠️  Auth users existem mas não há oficinas na tabela pública');
      console.log('   💡 Executar script de sync para criar oficinas a partir dos auth users');
    }
    
    if (!oficinasError && oficinas && oficinas.length > 0) {
      console.log('   ✅ Oficinas encontradas, o seed pode funcionar agora');
    }

  } catch (error) {
    console.error('\n❌ Erro no diagnóstico:', error);
  }
}

diagnose();
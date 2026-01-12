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

async function cleanAndRecreate() {
  console.log('🔄 LIMPANDO E RECRIANDO OFICINAS =================\n');

  // 1. Listar todas as oficinas
  const { data: oficinas, error: listError } = await supabase
    .from('oficinas')
    .select('*');

  if (listError) {
    console.error('❌ Erro ao listar oficinas:', listError.message);
    return;
  }

  if (!oficinas || oficinas.length === 0) {
    console.log('ℹ️  Nenhuma oficina encontrada para limpar');
    return;
  }

  console.log(`📋 Encontradas ${oficinas.length} oficinas para remover\n`);

  // 2. Para cada oficina, primeiro remover todos os registros relacionados
  for (const oficina of oficinas) {
    console.log(`🗑️  Limpando dados da oficina: ${oficina.nome}`);

    // Remover serviços (CASCADE deve remover automaticamente)
    await supabase
      .from('servicos')
      .delete()
      .eq('oficina_id', oficina.id);

    // Remover clientes
    await supabase
      .from('clientes')
      .delete()
      .eq('oficina_id', oficina.id);

    // Remover mensagens whatsapp
    await supabase
      .from('mensagens_whatsapp')
      .delete()
      .eq('oficina_id', oficina.id);

    // Remover notificações
    await supabase
      .from('notificacoes')
      .delete()
      .eq('oficina_id', oficina.id);

    // Remover logs de auditoria
    await supabase
      .from('logs_auditoria')
      .delete()
      .eq('oficina_id', oficina.id);

    console.log(`   ✅ Dados removidos`);
  }

  // 3. Agora remover as oficinas
  console.log('\n🗑️  Removendo oficinas...');
  const { error: deleteError } = await supabase
    .from('oficinas')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('❌ Erro ao remover oficinas:', deleteError.message);
  } else {
    console.log('✅ Oficinas removidas com sucesso');
  }

  console.log('\n============================================');
  console.log('✨ LIMPEZA CONCLUÍDA! Pronto para o sync-and-seed.');
}

cleanAndRecreate().catch(console.error);

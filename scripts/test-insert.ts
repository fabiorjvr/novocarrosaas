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

async function testInsert() {
  console.log('🧪 TESTANDO INSERÇÃO MANUAL =================\n');

  // Testar inserção de oficina com ID específico
  const oficinaId = '2a5a9e92-52a7-495a-a91a-eef55ac1c940'; // ID do auth user de SP

  console.log('1️⃣  Tentando criar oficina manualmente...');

  // Primeiro, deletar oficina existente com esse email
  const { error: deleteError } = await supabase
    .from('oficinas')
    .delete()
    .eq('email', 'contato@spoficina.com');

  if (deleteError) {
    console.log(`   ℹ️  Nenhuma oficina para deletar: ${deleteError.message}`);
  }

  // Agora criar nova oficina
  const { data: oficina, error: insertError } = await supabase
    .from('oficinas')
    .insert({
      id: oficinaId,
      email: 'contato@spoficina.com',
      nome: 'São Paulo Oficina',
      setup_concluido: true,
      telefone: '(11) 99999-9999',
      responsavel: 'Gerente Fictício',
      endereco: 'Rua das Oficinas, 123',
      cnpj: '00.000.000/0001-00',
      razao_social: 'São Paulo Oficina LTDA',
      senha_hash: '$2a$10$auth_managed_account_placeholder'
    })
    .select()
    .single();

  if (insertError) {
    console.error(`   ❌ Erro ao criar oficina: ${insertError.message}`);
  } else {
    console.log(`   ✅ Oficina criada com sucesso!`);
    console.log(`   ID: ${oficina.id}`);
    console.log(`   Nome: ${oficina.nome}`);
  }

  console.log('\n2️⃣  Tentando criar cliente manualmente...');

  // Criar cliente
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .insert({
      oficina_id: oficinaId,
      nome: 'Cliente Teste',
      whatsapp: '11999999999',
      carro: 'Fiat Strada',
      ano_carro: 2022,
      placa: 'ABC-1234',
      km_carro: 50000
    })
    .select()
    .single();

  if (clienteError) {
    console.error(`   ❌ Erro ao criar cliente: ${clienteError.message}`);
  } else {
    console.log(`   ✅ Cliente criado com sucesso!`);
    console.log(`   ID: ${cliente.id}`);
    console.log(`   Nome: ${cliente.nome}`);
  }

  console.log('\n3️⃣  Tentando criar serviço manualmente...');

  // Criar serviço
  const { data: servico, error: servicoError } = await supabase
    .from('servicos')
    .insert({
      oficina_id: oficinaId,
      cliente_id: cliente.id,
      tipo_servico: 'Troca de Óleo',
      data_servico: new Date().toISOString(),
      km_na_data: 50000,
      valor: 250.00,
      descricao: 'Serviço de teste',
      proxima_manutencao_km: 60000,
      proxima_manutencao_dias: 180
    })
    .select()
    .single();

  if (servicoError) {
    console.error(`   ❌ Erro ao criar serviço: ${servicoError.message}`);
  } else {
    console.log(`   ✅ Serviço criado com sucesso!`);
    console.log(`   ID: ${servico.id}`);
    console.log(`   Tipo: ${servico.tipo_servico}`);
  }

  console.log('\n============================================');
  console.log('✨ TESTE CONCLUÍDO!');
}

testInsert().catch(console.error);

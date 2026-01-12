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
  { name: 'Bahia Oficina', email: 'contato@bahiaoficina.com', uf: 'BA' },
  { name: 'Maceio Oficina', email: 'contato@maceiooficina.com', uf: 'AL' },
  { name: 'Minas Gerais Oficina', email: 'contato@minasoficina.com', uf: 'MG' },
  { name: 'Parana Oficina', email: 'contato@paranaoficina.com', uf: 'PR' },
  { name: 'Sao Paulo Oficina', email: 'contato@spoficina.com', uf: 'SP' },
];

const CAR_MODELS = [
  { model: 'Fiat Strada', year: 2022 },
  { model: 'Hyundai HB20', year: 2023 },
  { model: 'Chevrolet Onix', year: 2021 },
  { model: 'VW Polo', year: 2024 },
  { model: 'Jeep Compass', year: 2022 },
  { model: 'Toyota Corolla', year: 2020 },
  { model: 'Honda HR-V', year: 2021 },
  { model: 'Fiat Toro', year: 2023 },
  { model: 'Nissan Kicks', year: 2022 },
  { model: 'Renault Kwid', year: 2024 },
];

const SERVICE_TYPES = [
  { type: 'Troca de Óleo', price: 250, km: 10000 },
  { type: 'Revisão Geral', price: 800, km: 10000 },
  { type: 'Alinhamento e Balanceamento', price: 150, km: 5000 },
  { type: 'Troca de Pastilhas', price: 400, km: 30000 },
  { type: 'Limpeza de Ar Condicionado', price: 180, km: 15000 },
];

const CLIENT_NAMES = [
  'Carlos Silva', 'Ana Santos', 'Pedro Oliveira', 'Mariana Souza', 'João Ferreira',
  'Fernanda Costa', 'Lucas Pereira', 'Juliana Lima', 'Marcos Rocha', 'Beatriz Alves'
];

async function syncAndSeed() {
  console.log('🔄 SINCRONIZANDO OFICINAS COM AUTH USERS =================\n');

  for (const workshop of WORKSHOPS) {
    console.log(`\n🏢 Processando: ${workshop.name} (${workshop.email})`);

    // 1. Buscar auth user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const authUser = users?.find(u => u.email === workshop.email);

    if (!authUser) {
      console.log(`   ⚠️  Auth user não encontrado: ${workshop.email}`);
      continue;
    }

    console.log(`   ✅ Auth user encontrado: ${authUser.id}`);

    // 2. Verificar se a oficina já existe e criar se não existir
    const { data: existingOficina } = await supabase
      .from('oficinas')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!existingOficina) {
      const { error: insertError } = await supabase
        .from('oficinas')
        .insert({
          id: authUser.id,
          email: workshop.email,
          nome: workshop.name,
          setup_concluido: true,
          telefone: '(11) 99999-9999',
          responsavel: 'Gerente Fictício',
          endereco: 'Rua das Oficinas, 123',
          cnpj: '00.000.000/0001-00',
          razao_social: workshop.name + ' LTDA',
          senha_hash: '$2a$10$auth_managed_account_placeholder'
        });

      if (insertError) {
        console.log(`   ⚠️  Erro ao criar oficina: ${insertError.message}`);
      } else {
        console.log(`   ✅ Oficina criada com auth user`);
      }
    } else {
      console.log(`   ✅ Oficina já existe, sincronizada`);
    }

    // 3. Criar Clientes
    console.log(`   👥 Criando 10 Clientes...`);
    
    for (let i = 0; i < 10; i++) {
      const clientName = `${CLIENT_NAMES[i]} (${workshop.uf})`;
      const car = CAR_MODELS[i];
      
      const { data: newClient, error: clientError } = await supabase
        .from('clientes')
        .insert({
          oficina_id: authUser.id,
          nome: clientName,
          whatsapp: `1199999${Math.floor(1000 + Math.random() * 9000)}`,
          carro: car.model,
          ano_carro: car.year,
          placa: `ABC-${Math.floor(1000 + Math.random() * 9000)}`,
          km_carro: Math.floor(50000 + Math.random() * 50000)
        })
        .select('id')
        .single();

      if (clientError) {
        console.error(`      ❌ Erro ao criar cliente ${clientName}: ${clientError.message}`);
        continue;
      }

      // 4. Criar Serviços
      const numServices = Math.floor(1 + Math.random() * 3);
      for (let j = 0; j < numServices; j++) {
        const serviceType = SERVICE_TYPES[Math.floor(Math.random() * SERVICE_TYPES.length)];
        const dateOffset = Math.floor(Math.random() * 180);
        const serviceDate = new Date();
        serviceDate.setDate(serviceDate.getDate() - dateOffset);
        
        const kmRealizado = 50000 + (j * 10000);

        const { error: serviceError } = await supabase
          .from('servicos')
          .insert({
            oficina_id: authUser.id,
            cliente_id: newClient.id,
            tipo_servico: serviceType.type,
            data_servico: serviceDate.toISOString(),
            km_na_data: kmRealizado,
            valor: serviceType.price,
            descricao: 'Serviço realizado com sucesso. Cliente satisfeito.',
            proxima_manutencao_km: kmRealizado + serviceType.km,
            proxima_manutencao_dias: 180
          });

        if (serviceError) console.error(`      ❌ Erro ao criar serviço: ${serviceError.message}`);
      }
    }

    console.log(`   ✅ Seed concluído para ${workshop.name}`);
  }

  console.log('\n============================================');
  console.log('✨ SINCRONIZAÇÃO E SEED CONCLUÍDOS!');
}

syncAndSeed().catch(console.error);
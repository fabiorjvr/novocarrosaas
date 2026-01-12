import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

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

async function seed() {
  console.log('🚀 Iniciando Seed do Banco de Dados...');

  for (const workshop of WORKSHOPS) {
    console.log(`\n🏢 Criando Oficina: ${workshop.name}...`);

    // 1. Criar Oficina (Supabase Auth Nativo)
    let oficinaId: string;
    
    // Tentar buscar usuário no Auth pelo email (requires service role)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const existingAuthUser = users?.find(u => u.email === workshop.email);

    if (existingAuthUser) {
      oficinaId = existingAuthUser.id;
      console.log(`   ✅ Auth User já existe (ID: ${oficinaId})`);
    } else {
      // Criar usuário no Supabase Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: workshop.email,
        password: 'Password123!', // Senha forte padrão para dev
        email_confirm: true,
        user_metadata: { nome: workshop.name }
      });

      if (createError) {
        console.error(`   ❌ Erro ao criar Auth User: ${createError.message}`);
        continue;
      }
      oficinaId = newUser.user.id;
      console.log(`   ✅ Auth User criado com sucesso (ID: ${oficinaId})`);
    }

    // Atualizar/Criar na tabela pública 'oficinas' (Profile)
    // O trigger handle_new_user já deve ter criado, mas vamos garantir update
    // IMPORTANTE: senha_hash ainda é obrigatório na tabela oficinas até removermos a constraint
    const { error: profileError } = await supabase
      .from('oficinas')
      .upsert({
        id: oficinaId,
        nome: workshop.name,
        email: workshop.email,
        setup_concluido: true, // Seeds já nascem prontos
        telefone: '(11) 99999-9999',
        responsavel: 'Gerente Fictício',
        endereco: 'Rua das Oficinas, 123',
        cnpj: '00.000.000/0001-00',
        razao_social: workshop.name + ' LTDA',
        senha_hash: '$2a$10$auth_managed_account_placeholder' 
      });
      
    if (profileError) console.error(`   ⚠️ Erro ao atualizar profile: ${profileError.message}`);

    // 2. Criar Clientes e Carros
    console.log(`   👥 Criando 10 Clientes e Veículos...`);
    
    for (let i = 0; i < 10; i++) {
      const clientName = `${CLIENT_NAMES[i]} (${workshop.uf})`;
      const car = CAR_MODELS[i];
      
      const { data: newClient, error: clientError } = await supabase
        .from('clientes')
        .insert({
          oficina_id: oficinaId,
          nome: clientName,
          whatsapp: `1199999${Math.floor(1000 + Math.random() * 9000)}`, // Telefone fictício
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

      // 3. Criar Serviços para o Cliente
      // Criar 1 a 3 serviços passados
      const numServices = Math.floor(1 + Math.random() * 3);
      for (let j = 0; j < numServices; j++) {
        const serviceType = SERVICE_TYPES[Math.floor(Math.random() * SERVICE_TYPES.length)];
        const dateOffset = Math.floor(Math.random() * 180); // Dias atrás
        const serviceDate = new Date();
        serviceDate.setDate(serviceDate.getDate() - dateOffset);
        
        const kmRealizado = 50000 + (j * 10000);

        const { error: serviceError } = await supabase
          .from('servicos')
          .insert({
            oficina_id: oficinaId,
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

      // 4. Criar Mensagem de WhatsApp (Simulação de Gestão)
      const { error: msgError } = await supabase
        .from('mensagens_whatsapp')
        .insert({
          oficina_id: oficinaId,
          cliente_id: newClient.id,
          tipo_mensagem: i % 2 === 0 ? 'lembrete' : 'promocao',
          mensagem: `Olá ${clientName}, aqui é da ${workshop.name}. Sua revisão está próxima!`,
          status: i % 3 === 0 ? 'enviado' : 'pendente',
          numero_destino: `1199999${Math.floor(1000 + Math.random() * 9000)}`,
          numero_whatsapp_origem: '11988887777'
        });
      
      if (msgError) console.error(`      ❌ Erro ao criar mensagem: ${msgError.message}`);
    }
  }

  console.log('\n✨ Seed Concluído! Banco de dados populado com sucesso.');
}

seed().catch(console.error);

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Usar Service Role Key para ignorar RLS e acessar dados globais
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // 1. Total de Oficinas
    const { count: totalOficinas } = await supabaseAdmin
      .from('oficinas')
      .select('*', { count: 'exact', head: true });

    // 2. Total de Clientes (Usuários Ativos no contexto do dashboard)
    const { count: totalClientes } = await supabaseAdmin
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    // 3. Total de Serviços e Receita (Simulada ou Real)
    // Para receita real, precisaríamos somar todos os serviços. 
    // Como pode ser pesado, vamos pegar os últimos 1000 ou fazer uma query agregada via RPC se existisse.
    // Aqui vamos pegar uma amostra ou todos se for pouco.
    const { data: servicos } = await supabaseAdmin
      .from('servicos')
      .select('valor');
    
    const receitaTotal = servicos?.reduce((acc, curr) => acc + (curr.valor || 0), 0) || 0;
    const totalServicos = servicos?.length || 0;

    return NextResponse.json({
      totalOficinas: totalOficinas || 0,
      totalClientes: totalClientes || 0,
      receitaTotal: receitaTotal,
      totalServicos: totalServicos
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

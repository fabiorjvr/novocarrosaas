import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Buscar todas as oficinas
    const { data: oficinas, error } = await supabaseAdmin
      .from('oficinas')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    // Enriquecer dados (ex: contar clientes por oficina)
    // Isso pode ser lento com muitas oficinas, ideal seria uma View SQL ou RPC.
    // Para 5-50 oficinas, é ok fazer em paralelo.
    const oficinasComDados = await Promise.all(oficinas.map(async (oficina) => {
      // Contar clientes
      const { count: numClientes } = await supabaseAdmin
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('oficina_id', oficina.id);

      // Calcular MRR (soma de serviços do mês atual ou média) - Simplificado: Soma total / meses
      const { data: servicos } = await supabaseAdmin
        .from('servicos')
        .select('valor')
        .eq('oficina_id', oficina.id);
      
      const receitaTotal = servicos?.reduce((acc, curr) => acc + (curr.valor || 0), 0) || 0;
      const mrrEstimado = receitaTotal > 0 ? receitaTotal / 12 : 0; // Exemplo simples

      return {
        ...oficina,
        num_clientes: numClientes || 0,
        mrr: mrrEstimado, // Valor aproximado
        receita_total: receitaTotal
      };
    }));

    return NextResponse.json(oficinasComDados);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

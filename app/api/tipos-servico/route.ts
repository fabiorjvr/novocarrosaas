import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    // Verificar auth se necessário
    // if (!user) return unauthorized(); 

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('tipos_servico')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar tipos de serviço:', error);
      return NextResponse.json({ error: 'Erro ao buscar tipos de serviço' }, { status: 500 });
    }

    return NextResponse.json({
      sucesso: true,
      dados: data
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

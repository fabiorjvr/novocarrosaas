import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        const supabase = getServiceSupabase();

        // Executar queries em paralelo para performance
        const [
            { count: totalClientes },
            { count: totalServicos },
            { count: notificacoesEnviadas },
            { count: notificacoesPendentes },
            { data: ultimaNotificacao }
        ] = await Promise.all([
            supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('ativo', true),
            supabase.from('servicos').select('*', { count: 'exact', head: true }),
            supabase.from('notificacoes').select('*', { count: 'exact', head: true }).eq('enviada', true),
            supabase.from('notificacoes').select('*', { count: 'exact', head: true }).eq('enviada', false),
            supabase.from('notificacoes').select('data_envio').eq('enviada', true).order('data_envio', { ascending: false }).limit(1).single()
        ]);

        return NextResponse.json({
            sucesso: true,
            dados: {
                total_clientes: totalClientes || 0,
                total_servicos: totalServicos || 0,
                total_notificacoes_enviadas: notificacoesEnviadas || 0,
                notificacoes_pendentes: notificacoesPendentes || 0,
                ultima_data_notificacao: ultimaNotificacao?.data_envio || null
            }
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

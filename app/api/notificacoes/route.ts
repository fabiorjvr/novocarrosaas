import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthUser, unauthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Listar notificações (histórico ou pendentes)
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        const { searchParams } = new URL(req.url);
        const enviada = searchParams.get('enviada') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');

        const supabase = getServiceSupabase();

        let query = supabase
            .from('notificacoes')
            .select(`
        *,
        clientes (nome, telefone),
        tipos_servico (nome)
      `)
            .eq('enviada', enviada)
            .order('criado_em', { ascending: false })
            .limit(limit);

        if (!enviada) {
            // Se for pendente, filtrar tentativas
            query = query.lt('tentativas', 3);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar notificações:', error);
            return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 });
        }

        return NextResponse.json({
            sucesso: true,
            dados: data
        });

    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST: Criar notificação manual
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        const body = await req.json();
        const { cliente_id, tipo_servico_id, mensagem } = body;

        if (!cliente_id || !tipo_servico_id || !mensagem) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
        }

        const supabase = getServiceSupabase();

        const { data, error } = await supabase
            .from('notificacoes')
            .insert({
                cliente_id,
                tipo_servico_id,
                mensagem,
                enviada: false,
                tentativas: 0
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar notificação:', error);
            return NextResponse.json({ error: 'Erro ao criar notificação' }, { status: 500 });
        }

        return NextResponse.json({
            sucesso: true,
            mensagem: 'Notificação criada com sucesso',
            dados: data
        });

    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

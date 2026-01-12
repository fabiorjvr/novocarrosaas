import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthUser, unauthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Listar serviços realizados (filtro opcional por cliente ou tipo)
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        const { searchParams } = new URL(req.url);
        const clienteId = searchParams.get('cliente_id');
        const tipoServicoId = searchParams.get('tipo_servico_id');

        const supabase = getServiceSupabase();
        let query = supabase
            .from('servicos')
            .select(`
        *,
        clientes (nome, telefone, carro),
        tipos_servico (nome, codigo)
      `)
            .order('data_servico', { ascending: false });

        if (clienteId) {
            query = query.eq('cliente_id', clienteId);
        }

        if (tipoServicoId) {
            query = query.eq('tipo_servico_id', tipoServicoId);
        }

        // Paginação simples
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('Erro ao listar serviços:', error);
            return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
        }

        return NextResponse.json({
            sucesso: true,
            pagina: page,
            total: count, // Count precisa ser habilitado na query com { count: 'exact' } se necessário, mas aqui simplifiquei
            dados: data
        });

    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST: Registrar novo serviço
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        const body = await req.json();
        const {
            cliente_id,
            tipo_servico_id,
            km_realizado,
            valor,
            observacoes,
            data_servico
        } = body;

        if (!cliente_id || !tipo_servico_id || !km_realizado) {
            return NextResponse.json(
                { error: 'Dados obrigatórios faltando', sucesso: false },
                { status: 400 }
            );
        }

        const supabase = getServiceSupabase();

        const { data: servico, error } = await supabase
            .from('servicos')
            .insert({
                cliente_id,
                tipo_servico_id,
                km_realizado,
                valor: valor || null,
                observacoes: observacoes || null,
                data_servico: data_servico || new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao registrar serviço:', error);
            return NextResponse.json({ error: 'Erro ao registrar serviço' }, { status: 500 });
        }

        return NextResponse.json({
            sucesso: true,
            mensagem: 'Serviço registrado com sucesso',
            dados: servico
        }, { status: 201 });

    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

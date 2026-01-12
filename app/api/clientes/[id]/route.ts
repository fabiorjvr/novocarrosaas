import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthUser, unauthorized, badRequest } from '@/lib/auth';

// GET: Buscar cliente por ID + Histórico
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        if (!id) return badRequest('ID é obrigatório');

        const supabase = getServiceSupabase();

        // Buscar cliente
        const { data: cliente, error: erroCliente } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single();

        if (erroCliente || !cliente) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
        }

        // Buscar histórico de serviços
        // Usando join para trazer nome do tipo de serviço
        const { data: historico, error: erroHistorico } = await supabase
            .from('servicos')
            .select(`
        *,
        tipos_servico (
          nome,
          codigo,
          intervalo_km
        )
      `)
            .eq('cliente_id', id)
            .order('data_servico', { ascending: false });

        return NextResponse.json({
            sucesso: true,
            dados: {
                cliente,
                historico: historico || []
            }
        });

    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// PUT: Atualizar cliente
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        const body = await req.json();
        const { nome, telefone, carro, placa, km_media_mensal } = body;

        const supabase = getServiceSupabase();

        const { error } = await supabase
            .from('clientes')
            .update({
                nome,
                telefone,
                carro,
                placa,
                km_media_mensal,
                atualizado_em: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar:', error);
            return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
        }

        return NextResponse.json({
            sucesso: true,
            mensagem: 'Cliente atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// DELETE: Remover cliente (Soft Delete)
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        const supabase = getServiceSupabase();

        const { error } = await supabase
            .from('clientes')
            .update({ ativo: false })
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: 'Erro ao remover cliente' }, { status: 500 });
        }

        return NextResponse.json({
            sucesso: true,
            mensagem: 'Cliente removido com sucesso'
        });

    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

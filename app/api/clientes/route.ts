import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET: Listar clientes
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        const { searchParams } = new URL(req.url);
        const nome = searchParams.get('nome');
        const telefone = searchParams.get('telefone');

        const supabase = getServiceSupabase();
        let query = supabase
            .from('clientes')
            .select('*')
            .eq('ativo', true)
            .order('nome');

        if (nome) {
            query = query.ilike('nome', `%${nome}%`);
        }

        if (telefone) {
            query = query.eq('telefone', telefone);
        }

        const { data: clientes, error } = await query;

        if (error) {
            console.error('Erro ao buscar clientes:', error);
            return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
        }

        return NextResponse.json({
            sucesso: true,
            dados: clientes
        });

    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST: Criar novo cliente
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return unauthorized();

        const body = await req.json();
        const { nome, telefone, carro, placa, km_media_mensal } = body;

        // Validação básica
        if (!nome || !telefone || !carro) {
            return NextResponse.json(
                { error: 'Nome, telefone e carro são obrigatórios', sucesso: false },
                { status: 400 }
            );
        }

        const supabase = getServiceSupabase();

        // Verificar duplicidade de telefone
        const { data: existente } = await supabase
            .from('clientes')
            .select('id')
            .eq('telefone', telefone)
            .single();

        if (existente) {
            return NextResponse.json(
                { error: 'Já existe um cliente com este telefone', sucesso: false },
                { status: 400 }
            );
        }

        const { data: novoCliente, error } = await supabase
            .from('clientes')
            .insert({
                nome,
                telefone,
                carro,
                placa,
                km_media_mensal: km_media_mensal || 1000,
                ativo: true
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar cliente:', error);
            return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
        }

        return NextResponse.json({
            sucesso: true,
            mensagem: 'Cliente criado com sucesso',
            dados: novoCliente
        }, { status: 201 });

    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

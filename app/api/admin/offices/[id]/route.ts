import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Buscar detalhes de uma oficina específica
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: oficina, error } = await supabaseAdmin
      .from('oficinas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !oficina) {
      return NextResponse.json({ error: 'Oficina não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ oficina });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Atualizar status/dados de uma oficina
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, plano } = body;

    const { data: oficina, error } = await supabaseAdmin
      .from('oficinas')
      .update({ status, plano })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erro ao atualizar oficina' }, { status: 500 });
    }

    return NextResponse.json({ oficina });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remover uma oficina (ou desativar)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseAdmin
      .from('oficinas')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Erro ao remover oficina' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

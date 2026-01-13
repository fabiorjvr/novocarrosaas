import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { oficinaId } = body;

    if (!oficinaId) {
      return NextResponse.json({ error: 'ID da oficina obrigatório' }, { status: 400 });
    }

    const supabaseAdmin = getServiceSupabase();

    // Buscar dados da oficina para garantir que existe
    const { data: oficina, error } = await supabaseAdmin
      .from('oficinas')
      .select('*')
      .eq('id', oficinaId)
      .single();

    if (error || !oficina) {
      return NextResponse.json({ error: 'Oficina não encontrada' }, { status: 404 });
    }

    // Impersonate foi desabilitado na migração para OAuth
    // Usuários devem fazer login com Google OAuth diretamente
    return NextResponse.json({
      error: 'Funcionalidade de impersonate desabilitada na migração para Google OAuth',
      success: false
    }, { status: 400 });

  } catch (error: any) {
    console.error('Erro no impersonate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

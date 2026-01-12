import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { signToken } from '@/lib/jwt';

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

    // Gerar token JWT válido para esta oficina
    const token = signToken({
      id: oficina.id,
      email: oficina.email
    });

    // Definir cookie de autenticação
    const response = NextResponse.json({
      success: true,
      redirectUrl: '/dashboard',
      oficina: {
        id: oficina.id,
        nome: oficina.nome,
        email: oficina.email
      }
    });

    // Usar o mesmo nome de cookie que o resto da app: 'token'
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 dia
    });

    return response;

  } catch (error: any) {
    console.error('Erro no impersonate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

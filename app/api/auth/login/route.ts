import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// Validação simples de email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validação de campos obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios', success: false },
        { status: 400 }
      );
    }

    // Validação de formato do email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido', success: false },
        { status: 400 }
      );
    }

    // Validação de tamanho da senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres', success: false },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const { data: user, error: dbError } = await supabase
      .from('oficinas')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    // Mensagem genérica para não revelar se email existe
    if (dbError || !user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas', success: false },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.senha_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciais inválidas', success: false },
        { status: 401 }
      );
    }

    // Gerar token
    const token = signToken({ id: user.id, email: user.email });

    // Não retornar dados sensíveis
    const safeUser = {
      id: user.id,
      email: user.email,
      nome: user.nome,
    };

    const response = NextResponse.json({
      success: true,
      user: safeUser,
    });

    // Cookie seguro
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    );
  }
}

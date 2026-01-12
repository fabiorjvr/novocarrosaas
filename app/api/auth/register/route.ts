import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

// Validação de email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de senha forte
const isStrongPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos um número' };
  }
  return { valid: true };
};

// Sanitização de string
const sanitize = (str: string): string => {
  return str.trim().replace(/<[^>]*>/g, '');
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, nome } = body;

    // Validação de campos obrigatórios
    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios', success: false },
        { status: 400 }
      );
    }

    // Validação de nome
    const sanitizedNome = sanitize(nome);
    if (sanitizedNome.length < 2 || sanitizedNome.length > 100) {
      return NextResponse.json(
        { error: 'Nome deve ter entre 2 e 100 caracteres', success: false },
        { status: 400 }
      );
    }

    // Validação de email
    const sanitizedEmail = email.toLowerCase().trim();
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Formato de email inválido', success: false },
        { status: 400 }
      );
    }

    // Validação de senha
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message, success: false },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('oficinas')
      .select('id')
      .eq('email', sanitizedEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado', success: false },
        { status: 400 }
      );
    }

    // Hash da senha com custo seguro
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: newUser, error } = await supabase
      .from('oficinas')
      .insert({
        email: sanitizedEmail,
        senha_hash: hashedPassword,
        nome: sanitizedNome,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return NextResponse.json(
        { error: 'Erro ao criar conta. Tente novamente.', success: false },
        { status: 500 }
      );
    }

    // Login automático
    const token = signToken({ id: newUser.id, email: newUser.email });

    // Não retornar dados sensíveis
    const safeUser = {
      id: newUser.id,
      email: newUser.email,
      nome: newUser.nome,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso!',
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
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Registro agora é feito apenas via Google OAuth
    // Este endpoint foi desabilitado na migração para OAuth
    return NextResponse.json(
      {
        error: 'Registro por email/senha foi desabilitado. Use "Cadastrar com Google" na página de cadastro.',
        success: false
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    );
  }
}

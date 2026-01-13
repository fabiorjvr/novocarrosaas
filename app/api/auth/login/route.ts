import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Login agora é feito apenas via Google OAuth
    // Este endpoint foi desabilitado na migração para OAuth
    return NextResponse.json(
      {
        error: 'Login por email/senha foi desabilitado. Use "Entrar com Google" na página de login.',
        success: false
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    );
  }
}

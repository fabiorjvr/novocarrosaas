import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface TokenPayload {
  id: string;
  email: string;
}

export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || ''
  };
}

export function unauthorized(message: string = 'Não autorizado'): NextResponse {
  return NextResponse.json(
    { error: message, success: false },
    { status: 401 }
  );
}

export function forbidden(message: string = 'Acesso negado'): NextResponse {
  return NextResponse.json(
    { error: message, success: false },
    { status: 403 }
  );
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json(
    { error: message, success: false },
    { status: 400 }
  );
}

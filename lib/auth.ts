import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  return decoded;
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

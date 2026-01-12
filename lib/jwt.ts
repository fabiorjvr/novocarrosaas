import jwt from 'jsonwebtoken';

// Validação obrigatória do JWT_SECRET - NUNCA use secrets padrão em produção
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    '❌ JWT_SECRET não configurado! Defina a variável de ambiente JWT_SECRET no arquivo .env'
  );
}

// Tipagem segura para o payload do token
export interface TokenPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const signToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
    return decoded as TokenPayload;
  } catch (error) {
    console.error('Erro ao verificar token:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

// Função auxiliar para extrair token do header Authorization
export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

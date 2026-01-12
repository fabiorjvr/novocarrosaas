import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validação de variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validação para cliente público (pode faltar em desenvolvimento)
if (!supabaseUrl) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL não configurada');
}

if (!supabaseAnonKey) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada');
}

// Cliente público (para uso no cliente/browser)
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
    : null;

// Cliente com privilégios de admin (apenas server-side)
export const getServiceSupabase = (): SupabaseClient => {
  if (!supabaseUrl) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL não configurada');
  }

  if (!serviceRoleKey) {
    throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada. Esta chave é necessária para operações administrativas.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Função auxiliar para verificar conexão
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  if (!supabase) {
    return {
      success: false,
      message: 'Cliente Supabase não inicializado - verifique as variáveis de ambiente',
    };
  }

  try {
    const { error } = await supabase.from('oficinas').select('count').limit(1);

    if (error) {
      return {
        success: false,
        message: `Erro na conexão: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Conexão com Supabase estabelecida com sucesso',
    };
  } catch (err) {
    return {
      success: false,
      message: `Erro inesperado: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
};

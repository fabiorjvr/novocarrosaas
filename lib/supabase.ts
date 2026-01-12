import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cliente público (para uso no cliente/browser) - lazy initialization
let supabaseClient: SupabaseClient | null = null;

export const supabase = (): SupabaseClient | null => {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });

  return supabaseClient;
};

// Cliente com privilégios de admin (apenas server-side) - lazy initialization
let serviceSupabaseClient: SupabaseClient | null = null;

export const getServiceSupabase = (): SupabaseClient => {
  if (serviceSupabaseClient) return serviceSupabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL não configurada');
  }

  if (!serviceRoleKey) {
    throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada. Esta chave é necessária para operações administrativas.');
  }

  serviceSupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceSupabaseClient;
};

// Função auxiliar para verificar conexão
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const client = supabase();
  if (!client) {
    return {
      success: false,
      message: 'Cliente Supabase não inicializado - verifique as variáveis de ambiente',
    };
  }

  try {
    const { error } = await client.from('oficinas').select('count').limit(1);

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

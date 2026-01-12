import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();

  // 1. Proteção da Rota Admin (/admin)
  // Apenas users com email "admin" ou "fabio" podem acessar
  if (url.pathname.startsWith('/admin')) {
    if (!session) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Verificação Estrita de Admin
    const isAdmin = session.user.email?.includes('admin') || session.user.email?.includes('fabio');
    
    if (!isAdmin) {
      // Se tentar acessar admin sem ser admin, joga pro dashboard comum
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // 2. Proteção da Rota Dashboard (/dashboard)
  // Qualquer usuário logado pode acessar, mas se não tiver setup_concluido, vai pro onboarding
  if (url.pathname.startsWith('/dashboard')) {
    if (!session) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Verificar email confirmado (Se aplicável)
    // Se o user_metadata tiver 'email_verified' false, ou session.user.email_confirmed_at for null
    if (session.user.email_confirmed_at === null && process.env.NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION === 'true') {
        // Redirecionar para página de aviso "Verifique seu email"
        // url.pathname = '/verify-email';
        // return NextResponse.redirect(url);
        // Por enquanto, apenas logamos ou mostramos toast no client
    }

    // Verificar se completou onboarding
    // Nota: Lemos do metadata ou fazemos uma query rápida.
    // Como middleware é Edge, melhor confiar no user_metadata se atualizarmos ele, ou deixar o client-side redirecionar.
    // Padrão moderno: Client-side check no layout do dashboard para evitar latência no middleware.
    // Mas se quiser forçar aqui:
    // const { data: profile } = await supabase.from('oficinas').select('setup_concluido').eq('id', session.user.id).single();
    // if (!profile?.setup_concluido) {
    //    url.pathname = '/onboarding';
    //    return NextResponse.redirect(url);
    // }
  }

  // Proteção da rota /onboarding
  if (url.pathname.startsWith('/onboarding')) {
    if (!session) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }
  }

  // 3. Proteção de API Crítica (/api/admin)
  // Impede que hackers chamem rotas administrativas diretamente
  if (url.pathname.startsWith('/api/admin')) {
    if (!session) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isAdmin = session.user.email?.includes('admin') || session.user.email?.includes('fabio');
    if (!isAdmin) {
       return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/api/admin/:path*'
  ],
};

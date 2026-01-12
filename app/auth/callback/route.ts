import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Erro ao trocar código por sessão:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_error`)
    }

    if (user) {
      try {
        // Criar perfil na tabela oficinas se não existir
        const { error: insertError } = await supabase
          .from('oficinas')
          .insert({
            id: user.id,
            email: user.email,
            nome: user.user_metadata?.full_name || user.user_metadata?.nome || 'Nova Oficina',
            setup_concluido: false,
            plano: 'free',
            ativo: true
          })

        if (insertError && !insertError.message.includes('duplicate')) {
          console.error('Erro ao criar perfil:', insertError)
        }
      } catch (err) {
        console.error('Erro ao criar perfil de oficina:', err)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}

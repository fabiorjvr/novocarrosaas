'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          nome: user.user_metadata?.nome || user.user_metadata?.full_name || 'Usuário',
          role: user.user_metadata?.role || 'user'
        });

        if (user.email?.includes('admin') || user.email?.includes('fabio')) {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    };

    checkUser();
  }, [router, setUser]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error('Cliente Supabase não inicializado');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error('Erro ao conectar com Google: ' + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar para Home
          </Link>
          <h1 className="text-4xl font-bold font-exo text-white mb-2">Acesse sua conta</h1>
          <p className="text-gray-400">Gerencie sua oficina com inteligência.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-gray-800 font-bold py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <FcGoogle className="w-6 h-6" />
            {isLoading ? 'Conectando...' : 'Entrar com Google'}
          </button>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Ao fazer login, você concorda com nossos{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

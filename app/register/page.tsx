'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const supabaseClient = supabase();
      if (!supabaseClient) throw new Error('Cliente Supabase não inicializado');

      const { error } = await supabaseClient.auth.signInWithOAuth({
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
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center md:text-left">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar para Home
          </Link>
          <h1 className="text-4xl font-bold font-exo text-white mb-2">Crie sua Conta</h1>
          <p className="text-gray-400">Junte-se à plataforma de gestão automotiva mais moderna do Brasil.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          {/* Social Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
            className="w-full bg-white text-gray-900 font-bold py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <FaGoogle className="w-6 h-6 text-red-500" />
            {isLoading ? 'Conectando...' : 'Cadastrar com Google'}
          </button>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Ao se cadastrar, você concorda com nossos{' '}
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

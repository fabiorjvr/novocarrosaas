'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      setUser(data.user);
      toast.success('Bem-vindo de volta!');
      
      // Redirecionamento Inteligente
      if (data.user.email.includes('admin') || data.user.email.includes('fabio')) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error('Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const client = supabase;
      if (!client) throw new Error('Cliente Supabase não inicializado');

      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(`Erro ao conectar com ${provider}`);
      console.error(error);
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
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar para Home
          </Link>
          <h1 className="text-4xl font-bold font-exo text-white mb-2">Acesse sua conta</h1>
          <p className="text-gray-400">Gerencie sua oficina com inteligência.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 bg-white text-gray-800 py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              <FcGoogle className="w-5 h-5" />
              Google
            </button>
            <button 
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-2 bg-[#24292e] text-white py-2.5 px-4 rounded-lg hover:bg-[#2f363d] transition-colors font-medium text-sm"
            >
              <FaGithub className="w-5 h-5" />
              GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#050510] text-gray-500 rounded text-xs uppercase tracking-wider bg-opacity-0 backdrop-blur-xl">Ou continue com email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Email Corporativo</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="ex: contato@suaoficina.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-sm font-medium text-gray-400">Senha</label>
                <Link href="#" className="text-xs text-blue-400 hover:text-blue-300">Esqueceu a senha?</Link>
              </div>
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar na Plataforma'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Ainda não tem conta?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

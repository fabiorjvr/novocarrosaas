'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa'; // Requires react-icons

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    setPasswordStrength(score);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    setPassword(newPass);
    checkPasswordStrength(newPass);
  };

  const handleGoogleLogin = async () => {
    try {
      if (!supabase) throw new Error('Cliente Supabase não inicializado');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error('Erro ao conectar com Google: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast.error('Você precisa aceitar os Termos de Uso.');
      return;
    }

    setIsLoading(true);
    try {
      if (!supabase) throw new Error('Cliente Supabase não inicializado');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: nome, // Metadata inicial, será salvo no profile depois
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Fallback: Garantir que o perfil existe (caso o Trigger falhe ou não exista)
        try {
          await supabase.from('oficinas').insert({
            id: data.user.id,
            email: email,
            nome: nome,
            setup_concluido: false,
            senha_hash: 'auth_managed' // Placeholder
          });
        } catch (insertError) {
           // Ignora erro se já existir (duplicate key)
           console.log('Perfil já criado pelo trigger ou existente.');
        }

        toast.success('Conta criada! Verifique seu email para confirmar.');
        // Opcional: Redirecionar para uma página de "Verifique seu email"
        router.push('/login?verified=false');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
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
            type="button"
            className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors mb-6"
          >
            <FaGoogle className="w-5 h-5 text-red-500" />
            Entrar com Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#050510] text-gray-500">ou continue com email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Nome da Oficina (ou Seu Nome)</label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="ex: Auto Center Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Email Corporativo</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="ex: contato@suaoficina.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={handlePasswordChange}
              />
              {/* Strength Meter */}
              {password && (
                <div className="mt-2 flex gap-1 h-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div 
                      key={level}
                      className={`flex-1 rounded-full transition-colors ${
                        passwordStrength >= level 
                          ? (passwordStrength < 3 ? 'bg-yellow-500' : 'bg-green-500') 
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-right mt-1 text-gray-500">
                {passwordStrength === 0 && ''}
                {passwordStrength === 1 && 'Muito fraca'}
                {passwordStrength === 2 && 'Fraca'}
                {passwordStrength === 3 && 'Média'}
                {passwordStrength === 4 && 'Forte 💪'}
              </p>
            </div>

            <div className="pt-2 pb-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${acceptedTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-600 bg-white/5 group-hover:border-blue-500'}`}>
                  {acceptedTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <p className="text-xs text-gray-400 leading-relaxed select-none">
                  Li e concordo com os <Link href="/terms" className="text-blue-400 hover:underline">Termos de Uso</Link> e <Link href="/privacy" className="text-blue-400 hover:underline">Política de Privacidade</Link>. Autorizo o envio de emails de confirmação.
                </p>
              </label>
            </div>
            
            <button 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Minha Conta'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

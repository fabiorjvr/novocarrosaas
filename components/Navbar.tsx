'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogOut, User, LayoutDashboard, Wrench } from 'lucide-react';

export default function Navbar() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
    router.push('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex justify-between items-center shadow-2xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
              <Wrench className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">
              OFICINA<span className="text-blue-400">SAAS</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Planos</Link>
            <Link href="#contact" className="hover:text-white transition-colors">Contato</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-white bg-blue-600/20 hover:bg-blue-600/40 px-4 py-2 rounded-lg border border-blue-500/30 transition-all">
                  <LayoutDashboard size={18} />
                  <span>Painel</span>
                </Link>
                <div className="h-6 w-px bg-white/20"></div>
                <div className="flex items-center gap-2 text-gray-300">
                  <User size={18} />
                  <span className="hidden sm:inline">{user.nome}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-white hover:text-blue-200 transition-colors font-medium px-2"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 active:scale-95 border border-blue-400/20"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

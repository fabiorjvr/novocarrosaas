'use client';
import { 
  Users, 
  Database, 
  Server, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  ShieldAlert,
  Terminal,
  Activity,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function AdminSidebar({ currentView, setCurrentView }: SidebarProps) {
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
    router.push('/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'clients', label: 'Oficinas (Clientes)', icon: Users },
    { id: 'database', label: 'Banco de Dados', icon: Database },
    { id: 'api', label: 'API & Integrações', icon: Terminal },
    { id: 'server', label: 'Servidor', icon: Server },
    { id: 'financial', label: 'Financeiro', icon: CreditCard },
    { id: 'logs', label: 'Logs do Sistema', icon: Activity },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#0a0a16] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-blue-500 mb-1">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-xs font-bold tracking-widest uppercase">God Mode</span>
        </div>
        <h1 className="text-xl font-bold font-exo text-white">Sistema Mestre</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              currentView === item.id 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400">Sistema Online</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">v3.0.1-stable</div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Desconectar
        </button>
      </div>
    </div>
  );
}

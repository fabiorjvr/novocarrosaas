'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Wrench,
  Users,
  DollarSign,
  Calendar,
  MessageCircle,
  Car,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    servicosHoje: 0,
    faturamentoMes: 0,
    clientesAtivos: 0,
    mensagensPendentes: 0
  });
  const [recentServices, setRecentServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkSetup() {
      if (!user) return;

      try {
        // Buscar perfil via API em vez de Supabase direto
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile || user);

          if (data.profile && !data.profile.setup_concluido) {
            router.push('/onboarding');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar setup:', error);
      }
    }
    checkSetup();
  }, [user, router]);

  useEffect(() => {
    // Simulação de Onboarding
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && user) {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <span className="font-bold text-lg">🚀 Bem-vindo à Revolução!</span>
          <span className="text-sm">Seu período de teste Premium está ativo por 14 dias. Aproveite todas as ferramentas de IA e WhatsApp.</span>
          <button
            className="bg-blue-600 text-white text-xs py-1 px-2 rounded mt-1 w-fit"
            onClick={() => toast.dismiss(t.id)}
          >
            Começar Agora
          </button>
        </div>
      ), { duration: 6000, icon: '🎉' });
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      // Buscar dados via API em vez de Supabase direto
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();

        setStats({
          servicosHoje: data.dados?.total_clientes || 0,
          faturamentoMes: data.dados?.faturamento_mes || 0,
          clientesAtivos: data.dados?.total_clientes || 0,
          mensagensPendentes: data.dados?.notificacoes_pendentes || 0
        });

        // Mock de serviços recentes (idealmente viriam da API)
        setRecentServices([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white font-inter">
      <Navbar />

      <main className="container mx-auto px-6 py-8 pt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-exo text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              {profile?.nome || user?.nome || 'Minha Oficina'}
            </h1>
            <p className="text-gray-400 mt-2 ml-5">
              Bem-vindo, <span className="text-white font-medium">{profile?.responsavel || user?.nome || 'Gestor'}</span>.
            </p>
          </div>

          <button
            onClick={() => setShowNewServiceModal(true)}
            className="group bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 hover:scale-105"
          >
            <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            Nova Ordem de Serviço
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Serviços Hoje"
            value={stats.servicosHoje}
            icon={<Wrench className="text-blue-400" />}
            color="blue"
          />
          <StatCard
            title="Faturamento Mês"
            value={`R$ ${stats.faturamentoMes.toLocaleString()}`}
            icon={<DollarSign className="text-green-400" />}
            color="green"
            isMoney
          />
          <StatCard
            title="Clientes Ativos"
            value={stats.clientesAtivos}
            icon={<Users className="text-purple-400" />}
            color="purple"
          />
          <StatCard
            title="Msgs. Pendentes"
            value={stats.mensagensPendentes}
            icon={<MessageCircle className="text-yellow-400" />}
            color="yellow"
            alert
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Services List */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold font-exo flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Últimos Serviços
              </h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Ver todos</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/20 text-xs text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-medium">Cliente / Veículo</th>
                    <th className="p-4 font-medium">Serviço</th>
                    <th className="p-4 font-medium">Valor</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
                  ) : recentServices.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhum serviço registrado ainda.</td></tr>
                  ) : (
                    recentServices.map((service) => (
                      <tr key={service.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{service.cliente?.nome || 'Cliente não id.'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Car className="w-3 h-3" />
                            {service.cliente?.carro} • {service.cliente?.placa}
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 text-sm">{service.tipo}</td>
                        <td className="p-4 font-mono text-green-400 text-sm">R$ {service.valor}</td>
                        <td className="p-4">
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded text-xs font-medium flex items-center w-fit gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Concluído
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions / Notifications */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wrench className="w-24 h-24 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold font-exo mb-2 text-white">Status do Plano</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-blue-400">Pro</span>
                <span className="text-sm text-gray-400">/ mensal</span>
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                Você tem acesso total às ferramentas de IA e Automação de WhatsApp.
              </p>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-white/10">
                Gerenciar Assinatura
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-exo mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Dados da Oficina
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Empresa</p>
                  <p className="text-sm text-white font-medium">{profile?.razao_social || profile?.nome || 'Não informado'}</p>
                  <p className="text-xs text-gray-500 mt-1">CNPJ: {profile?.cnpj || 'Pend.'}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Contato</p>
                  <p className="text-sm text-white">{profile?.endereco || 'Endereço não cadastrado'}</p>
                  <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                     <Users className="w-3 h-3" /> {profile?.telefone || 'Sem telefone'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, isMoney, alert }: any) {
  const colors: any = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  };

  return (
    <div className={`bg-white/5 border p-6 rounded-2xl hover:border-white/20 transition-all group ${alert ? 'border-yellow-500/30' : 'border-white/10'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]} transition-colors`}>
          {icon}
        </div>
        {alert && <span className="animate-pulse w-2 h-2 rounded-full bg-yellow-500"></span>}
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold font-exo text-white tracking-tight">
        {value}
      </div>
    </div>
  );
}

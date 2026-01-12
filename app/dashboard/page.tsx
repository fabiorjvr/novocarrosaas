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
import axios from 'axios';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

// Garantir que supabase não é null antes de usar
const getSupabase = () => {
  if (!supabase) throw new Error('Cliente Supabase não inicializado');
  return supabase;
};

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
      const client = getSupabase();
      const { data: profileData, error } = await client
        .from('oficinas')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        if (!profileData.setup_concluido) {
          router.push('/onboarding');
        } else {
          setProfile(profileData);
        }
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
    const oficinaId = user?.oficina_id || user?.id;
    if (!oficinaId) return;

    try {
      const client = getSupabase();
      // Buscar serviços recentes
      const { data: servicos } = await client
        .from('servicos')
        .select(`
          *,
          clientes (nome, carro_modelo, placa)
        `)
        .eq('oficina_id', oficinaId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (servicos) setRecentServices(servicos);

      // Simular métricas (idealmente viriam de uma query agregada)
      setStats({
        servicosHoje: servicos?.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length || 0,
        faturamentoMes: servicos?.reduce((acc, curr) => acc + (curr.valor || 0), 0) || 0, // Simplificado
        clientesAtivos: 124, // Mock
        mensagensPendentes: 5 // Mock
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
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
              {profile?.nome || 'Minha Oficina'}
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
                          <div className="font-medium text-white">{service.clientes?.nome || 'Cliente não id.'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Car className="w-3 h-3" />
                            {service.clientes?.carro_modelo} • {service.clientes?.placa}
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 text-sm">{service.tipo_servico}</td>
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

      {/* New Service Modal */}
      {showNewServiceModal && (
        <NewServiceModal
          onClose={() => setShowNewServiceModal(false)}
          onSuccess={() => {
            setShowNewServiceModal(false);
            fetchData();
          }}
          oficinaId={user?.oficina_id || user?.id}
        />
      )}
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

interface NewServiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
  oficinaId?: string;
}

function NewServiceModal({ onClose, onSuccess, oficinaId }: NewServiceModalProps) {
  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteWhatsapp: '',
    carroModelo: '',
    carroAno: new Date().getFullYear(),
    placa: '',
    servicoTipo: '',
    valor: '',
    km: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase não inicializado');

      // 1. Criar ou Buscar Cliente
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          oficina_id: oficinaId,
          nome: formData.clienteNome,
          telefone: formData.clienteWhatsapp,
          carro: formData.carroModelo, // Ajustado para schema novo
          placa: formData.placa,
          km_media_mensal: 1000 // Default
        })
        .select()
        .single();

      if (clienteError) throw clienteError;

      // 2. Criar Serviço
      const { error: servicoError } = await supabase
        .from('servicos')
        .insert({
          oficina_id: oficinaId,
          cliente_id: cliente.id,
          tipo_servico_id: 1, // Temporário: precisa ter ID válido
          valor: parseFloat(formData.valor),
          km_realizado: parseInt(formData.km),
          data_servico: new Date().toISOString(),
          observacoes: 'Registro via Dashboard Rápido'
        });

      if (servicoError) throw servicoError;

      toast.success('Ordem de Serviço criada com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao salvar serviço: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a16] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold font-exo text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Nova Ordem de Serviço
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CheckCircle2 className="w-6 h-6 rotate-45" /> {/* Close icon visual hack or use X */}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2 border-b border-blue-500/20 pb-1">Dados do Cliente</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  value={formData.clienteNome}
                  onChange={e => setFormData({ ...formData, clienteNome: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">WhatsApp</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  value={formData.clienteWhatsapp}
                  onChange={e => setFormData({ ...formData, clienteWhatsapp: e.target.value })}
                  placeholder="Ex: 11999999999"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2 border-b border-purple-500/20 pb-1">Dados do Veículo</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Modelo do Carro</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  value={formData.carroModelo}
                  onChange={e => setFormData({ ...formData, carroModelo: e.target.value })}
                  placeholder="Ex: Toyota Corolla"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ano</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                    value={formData.carroAno}
                    onChange={e => setFormData({ ...formData, carroAno: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Placa</label>
                  <input
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none uppercase"
                    value={formData.placa}
                    onChange={e => setFormData({ ...formData, placa: e.target.value })}
                    placeholder="ABC-1234"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-2">Serviço Realizado</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Descrição do Serviço</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  value={formData.servicoTipo}
                  onChange={e => setFormData({ ...formData, servicoTipo: e.target.value })}
                  placeholder="Ex: Troca de Correia Dentada"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">KM Atual</label>
                <input
                  type="number"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  value={formData.km}
                  onChange={e => setFormData({ ...formData, km: e.target.value })}
                  placeholder="Ex: 85000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Valor Total (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xl font-mono text-green-400 focus:border-green-500 outline-none"
                value={formData.valor}
                onChange={e => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar OS</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

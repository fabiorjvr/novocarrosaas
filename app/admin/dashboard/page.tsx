'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  BarChart3, 
  Users, 
  Car, 
  DollarSign, 
  Activity, 
  Settings, 
  ShieldAlert, 
  Globe,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Database,
  Server,
  Terminal as TerminalIcon,
  LogIn
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [currentView, setCurrentView] = useState('overview');
  const [selectedClient, setSelectedClient] = useState<any>(null);

  useEffect(() => {
    if (user && !user.email.includes('admin') && !user.email.includes('fabio')) {
      // router.push('/dashboard'); 
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#050510] text-white font-inter flex">
      <AdminSidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {currentView === 'overview' && <OverviewContent />}
          {currentView === 'clients' && (
            <ClientsContent 
              selectedClient={selectedClient} 
              setSelectedClient={setSelectedClient} 
            />
          )}
          {currentView === 'database' && <DatabaseContent />}
          {currentView === 'api' && <ApiContent />}
          {currentView === 'server' && <ServerContent />}
          {currentView === 'logs' && <LogsContent />}
          
          {['financial', 'settings'].includes(currentView) && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
              <Settings className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-xl font-medium">Módulo em Desenvolvimento</h2>
              <p>Esta funcionalidade estará disponível na próxima atualização.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function OverviewContent() {
  const [stats, setStats] = useState<any>({
    totalOficinas: 0,
    receitaTotal: 0,
    totalClientes: 0,
    totalServicos: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOffices, setRecentOffices] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, officesRes, logsRes] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/offices'),
          axios.get('/api/admin/logs')
        ]);
        setStats(statsRes.data);
        setRecentOffices(officesRes.data.slice(0, 5));
        setRecentLogs(logsRes.data.slice(0, 3));
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-exo text-white">Visão Geral</h1>
        <p className="text-gray-400">Monitoramento em tempo real do ecossistema.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total de Oficinas" 
          value={stats.totalOficinas.toString()} 
          icon={<Globe className="text-blue-400" />}
          trend="+12% este mês"
        />
        <StatCard 
          title="Receita Estimada (MRR)" 
          value={`R$ ${(stats.receitaTotal / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={<DollarSign className="text-green-400" />}
          trend="+8.5% vs anterior"
          isMoney
        />
        <StatCard 
          title="Clientes Finais Ativos" 
          value={stats.totalClientes.toString()} 
          icon={<Users className="text-purple-400" />}
          trend="Crescimento constante"
        />
        <StatCard 
          title="Serviços Processados" 
          value={stats.totalServicos.toString()} 
          icon={<Car className="text-yellow-400" />}
          trend="Alta demanda"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold font-exo mb-4">Oficinas Recentes</h3>
          <div className="space-y-3">
            {recentOffices.map(client => (
              <div key={client.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                    {client.nome.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{client.nome}</div>
                    <div className="text-xs text-gray-400">{client.email}</div>
                  </div>
                </div>
                <div className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded">
                  {client.plano || 'Pro'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold font-exo mb-4">Logs do Sistema</h3>
          <div className="space-y-4">
             {recentLogs.map((log: any) => (
                <div key={log.id} className="flex gap-3 text-sm text-gray-400 font-mono">
                  <span className="text-blue-400 opacity-70">[{new Date(log.criado_em).toLocaleTimeString()}]</span>
                  <span>{log.mensagem}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ClientsContent({ selectedClient, setSelectedClient }: any) {
  const [offices, setOffices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [officeDetails, setOfficeDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchOffices() {
      try {
        const res = await axios.get('/api/admin/offices');
        setOffices(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOffices();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setLoadingDetails(true);
      axios.get(`/api/admin/offices/${selectedClient.id}`)
        .then(res => setOfficeDetails(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoadingDetails(false));
    } else {
      setOfficeDetails(null);
    }
  }, [selectedClient]);

  const handleImpersonate = async () => {
    if (!confirm(`Tem certeza que deseja acessar o painel de ${selectedClient.nome}?`)) return;
    
    setImpersonating(true);
    try {
      const res = await axios.post('/api/admin/impersonate', { oficinaId: selectedClient.id });
      if (res.data.success) {
        toast.success(`Acessando como ${selectedClient.nome}...`);
        router.push(res.data.redirectUrl);
      }
    } catch (error) {
      toast.error('Erro ao acessar painel da oficina');
      setImpersonating(false);
    }
  };

  if (selectedClient) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button 
          onClick={() => setSelectedClient(null)}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm"
        >
          ← Voltar para lista
        </button>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
          <div className="p-8 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-transparent">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-900/50">
                  {selectedClient.nome.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-exo text-white">{selectedClient.nome}</h1>
                  <div className="flex items-center gap-2 text-gray-400 mt-1">
                    <Users className="w-4 h-4" />
                    <span>ID: {selectedClient.id.substring(0,8)}...</span>
                    <span className="text-white/20">|</span>
                    <span>{selectedClient.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleImpersonate}
                  disabled={impersonating}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {impersonating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Acessar Painel
                </button>
                <div className="bg-black/40 px-4 py-2 rounded-lg text-sm text-gray-300 border border-white/5">
                   Plano: <span className="text-white font-bold">{selectedClient.plano || 'Standard'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loadingDetails ? (
           <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold font-exo text-white mb-4">Clientes Cadastrados</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-xs text-gray-400 uppercase">
                    <tr>
                      <th className="p-4">Nome</th>
                      <th className="p-4">Carro</th>
                      <th className="p-4">WhatsApp</th>
                      <th className="p-4">Placa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {officeDetails?.clientes?.map((cliente: any) => (
                      <tr key={cliente.id} className="hover:bg-white/5">
                        <td className="p-4 text-white font-medium">{cliente.nome}</td>
                        <td className="p-4 text-gray-300">{cliente.carro} ({cliente.ano_carro})</td>
                        <td className="p-4 text-gray-300">{cliente.whatsapp}</td>
                        <td className="p-4 text-gray-300">{cliente.placa}</td>
                      </tr>
                    ))}
                    {officeDetails?.clientes?.length === 0 && (
                      <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhum cliente encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold font-exo text-white mb-4">Últimos Serviços</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-xs text-gray-400 uppercase">
                    <tr>
                      <th className="p-4">Serviço</th>
                      <th className="p-4">Data</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">KM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {officeDetails?.ultimos_servicos?.map((servico: any) => (
                      <tr key={servico.id} className="hover:bg-white/5">
                        <td className="p-4 text-white font-medium">{servico.tipo_servico}</td>
                        <td className="p-4 text-gray-300">{new Date(servico.data_servico).toLocaleDateString()}</td>
                        <td className="p-4 text-green-400 font-mono">R$ {servico.valor}</td>
                        <td className="p-4 text-gray-300">{servico.km_na_data || servico.km_realizado} km</td>
                      </tr>
                    ))}
                     {officeDetails?.ultimos_servicos?.length === 0 && (
                      <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhum serviço registrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-exo text-white">Oficinas Parceiras</h1>
          <p className="text-gray-400">Clique em uma oficina para ver seus clientes e dados.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar oficina..." 
            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64 transition-all"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                <th className="p-4 font-medium">Oficina / Cliente</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Plano</th>
                <th className="p-4 font-medium">Receita Total</th>
                <th className="p-4 font-medium">Clientes</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {offices.map((client) => (
                <tr 
                  key={client.id} 
                  onClick={() => setSelectedClient(client)}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                        {client.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{client.nome}</div>
                        <div className="text-xs text-gray-500">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-400">Ativo</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-gray-300">
                      {client.plano || 'Standard'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-gray-300">
                    R$ {client.receita_total?.toFixed(2)}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {client.num_clientes}
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

function LogsContent() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/logs')
      .then(res => setLogs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-exo text-white">Logs do Sistema</h1>
        <p className="text-gray-400">Histórico de atividades em tempo real.</p>
      </header>
      
      <div className="bg-black border border-gray-800 rounded-xl p-6 font-mono text-sm h-[70vh] overflow-y-auto shadow-2xl relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        
        {loading ? (
          <div className="text-green-500 animate-pulse">Carregando fluxo de dados...</div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-500 mb-4">
              Last login: {new Date().toLocaleString()} on ttys001<br/>
              OficinaSaas_System v3.0.1 LTS<br/>
              ------------------------------------------------
            </div>
            {logs.map((log: any) => (
              <div key={log.id} className="flex gap-4 border-l-2 border-transparent hover:border-blue-500 hover:bg-white/5 pl-2 transition-all">
                <span className="text-gray-500 shrink-0">[{new Date(log.criado_em).toLocaleTimeString()}]</span>
                <span className={`font-bold shrink-0 w-24 ${
                  log.acao.includes('ERROR') ? 'text-red-500' : 
                  log.acao.includes('WARN') ? 'text-yellow-500' : 
                  'text-blue-400'
                }`}>
                  {log.acao}
                </span>
                <span className="text-gray-300">{log.mensagem}</span>
              </div>
            ))}
            <div className="text-green-500 animate-pulse mt-4">_</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DatabaseContent() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-exo text-white">Banco de Dados</h1>
        <p className="text-gray-400">Status das tabelas no Supabase (PostgreSQL).</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['oficinas', 'clientes', 'servicos', 'mensagens_whatsapp', 'configuracoes_oficina', 'logs_auditoria'].map(table => (
          <div key={table} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-blue-500/30 transition-colors">
             <div className="flex items-center gap-3 mb-4">
               <Database className="text-blue-400 w-5 h-5" />
               <h3 className="font-bold text-white font-mono">{table}</h3>
             </div>
             <div className="flex items-center gap-2 text-sm text-green-400">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               Online e Sincronizado
             </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ApiContent() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-exo text-white">API & Integrações</h1>
        <p className="text-gray-400">Endpoints ativos e status dos serviços externos.</p>
      </header>
      
      <div className="space-y-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center">
           <div className="flex items-center gap-3">
             <Globe className="text-purple-400" />
             <div>
               <div className="text-white font-medium">Supabase API</div>
               <div className="text-xs text-gray-500">Database & Auth</div>
             </div>
           </div>
           <span className="text-green-400 text-sm bg-green-400/10 px-2 py-1 rounded">Operacional</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center">
           <div className="flex items-center gap-3">
             <Activity className="text-yellow-400" />
             <div>
               <div className="text-white font-medium">WPPConnect</div>
               <div className="text-xs text-gray-500">WhatsApp Gateway</div>
             </div>
           </div>
           <span className="text-yellow-400 text-sm bg-yellow-400/10 px-2 py-1 rounded">Aguardando Conexão</span>
        </div>
         <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center">
           <div className="flex items-center gap-3">
             <Server className="text-blue-400" />
             <div>
               <div className="text-white font-medium">Next.js API Routes</div>
               <div className="text-xs text-gray-500">Backend Serverless</div>
             </div>
           </div>
           <span className="text-green-400 text-sm bg-green-400/10 px-2 py-1 rounded">Operacional</span>
        </div>
      </div>
    </motion.div>
  );
}

function ServerContent() {
   return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-exo text-white">Status do Servidor</h1>
        <p className="text-gray-400">Métricas de infraestrutura Vercel.</p>
      </header>
      
      <div className="bg-black/30 p-6 rounded-xl border border-white/10 font-mono text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Region:</span>
          <span className="text-white">gru1 (São Paulo)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Runtime:</span>
          <span className="text-white">Edge / Node.js 18.x</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Memory Usage:</span>
          <span className="text-green-400">128MB / 1024MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Uptime:</span>
          <span className="text-white">99.99%</span>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, trend, isMoney }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-400'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold font-exo text-white tracking-tight">{value}</div>
    </div>
  );
}

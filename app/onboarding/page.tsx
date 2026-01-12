'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Building2, User, Phone, MapPin, Loader2, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome_fantasia: '',
    razao_social: '',
    cnpj: '',
    telefone: '',
    responsavel: '',
    endereco: ''
  });

  useEffect(() => {
    async function checkUser() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Pre-fill email/name if available
      setFormData(prev => ({
        ...prev,
        responsavel: user.user_metadata.nome || '',
      }));
      setLoading(false);
    }
    checkUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // Máscaras de Input
    if (name === 'cnpj') {
      value = value.replace(/\D/g, ''); // Remove não dígitos
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
      value = value.substring(0, 18); // Limita tamanho
    }

    if (name === 'telefone') {
      value = value.replace(/\D/g, '');
      value = value.replace(/^(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      value = value.substring(0, 15);
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!supabase) throw new Error('Cliente Supabase não inicializado');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Atualizar perfil da oficina
      const { error } = await supabase
        .from('oficinas')
        .update({
          nome: formData.nome_fantasia, // Mapeando para coluna existente 'nome'
          // Campos novos que precisamos criar no banco:
          cnpj: formData.cnpj,
          telefone: formData.telefone,
          endereco: formData.endereco,
          responsavel: formData.responsavel,
          razao_social: formData.razao_social,
          setup_concluido: true // Flag importante
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil configurado com sucesso!');
      router.push('/dashboard');

    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao salvar perfil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050510] flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 font-inter">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#0a0a16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 border-b border-white/5">
          <h1 className="text-2xl font-bold font-exo text-white mb-2">Configuração da Oficina</h1>
          <p className="text-gray-400">Complete o cadastro para liberar seu acesso ao painel.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Dados da Empresa
              </h3>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome Fantasia *</label>
                <input
                  name="nome_fantasia"
                  required
                  value={formData.nome_fantasia}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none transition-colors"
                  placeholder="Como seus clientes te conhecem"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Razão Social</label>
                <input
                  name="razao_social"
                  value={formData.razao_social}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none transition-colors"
                  placeholder="Nome oficial no CNPJ"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">CNPJ *</label>
                <input
                  name="cnpj"
                  required
                  value={formData.cnpj}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none transition-colors"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Contato e Responsável
              </h3>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome do Responsável *</label>
                <input
                  name="responsavel"
                  required
                  value={formData.responsavel}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none transition-colors"
                  placeholder="Quem gerencia o sistema"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Telefone / WhatsApp *</label>
                <div className="relative">
                  <input
                    name="telefone"
                    required
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 outline-none transition-colors"
                    placeholder="(11) 99999-9999"
                  />
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Endereço Completo</label>
                <div className="relative">
                  <input
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 outline-none transition-colors"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                  />
                  <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3 mt-6">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200/80">
              Esses dados aparecerão nos orçamentos e mensagens enviadas aos seus clientes. Certifique-se de que estão corretos.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-70 transition-all hover:scale-105"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar e Acessar Painel</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

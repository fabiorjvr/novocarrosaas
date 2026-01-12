'use client';
import Link from 'next/link';
import Hero3D from '@/components/Hero3D';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050510] text-white selection:bg-blue-600 selection:text-white font-inter overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-start overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Hero3D />
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-8 md:px-16 pt-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-2xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-blue-400 tracking-widest uppercase font-exo">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Sistema de Gestão 3.0
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight font-exo">
              A Revolução <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                Automotiva
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 leading-relaxed font-light border-l-2 border-blue-500/50 pl-6">
              Eleve o nível da sua oficina com inteligência artificial, gestão financeira blindada e fidelização automática. O futuro da mecânica é digital.
            </p>

            <motion.div 
              className="flex flex-wrap gap-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link 
                href="/register" 
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-sm transition-all flex items-center gap-3 shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.7)]"
              >
                <span className="tracking-wide">INICIAR AGORA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/login" 
                className="px-8 py-4 bg-transparent border border-white/20 hover:border-white/50 text-white font-medium rounded-sm backdrop-blur-sm transition-all hover:bg-white/5"
              >
                ACESSO CLIENTE
              </Link>
            </motion.div>

            <div className="flex items-center gap-8 pt-12 text-gray-500 text-sm font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span>DADOS CRIPTOGRAFADOS</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>IA EM TEMPO REAL</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 bg-[#0a0a16] border-y border-white/5">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="+40%" label="Faturamento Médio" />
            <StatItem number="24/7" label="Atendimento IA" />
            <StatItem number="100%" label="Segurança" />
            <StatItem number="0" label="Instalação (Cloud)" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-[#050510] relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-exo">
                Tecnologia de Fórmula 1 <br />
                <span className="text-gray-500">Para sua Oficina</span>
              </h2>
              <p className="text-gray-400">
                Ferramentas de alta performance desenhadas para eliminar gargalos e acelerar o crescimento do seu negócio.
              </p>
            </div>
            <Link href="/register" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 group transition-colors">
              Ver todas as funcionalidades 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              title="IA Preditiva"
              desc="O sistema analisa a quilometragem e avisa o cliente no momento exato da revisão."
              delay={0.2}
              image="https://images.unsplash.com/photo-1635772392576-8092795f5c2e?q=80&w=800&auto=format&fit=crop"
            />
            <FeatureCard 
              title="Gestão Blindada"
              desc="Controle financeiro, estoque e ordens de serviço integrados em um único lugar."
              delay={0.4}
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
            />
            <FeatureCard 
              title="Dashboard Executivo"
              desc="Métricas em tempo real para você tomar decisões baseadas em dados, não em 'achismo'."
              delay={0.6}
              image="https://images.unsplash.com/photo-1551033406-611cf9a28f67?q=80&w=800&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
          <p>© 2026 Oficina SaaS. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Termos</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-white transition-colors">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center md:text-left border-l border-white/10 pl-6">
      <div className="text-3xl font-bold text-white font-exo mb-1">{number}</div>
      <div className="text-sm text-gray-500 font-medium tracking-wide uppercase">{label}</div>
    </div>
  );
}

function FeatureCard({ title, desc, delay, image }: { title: string, desc: string, delay: number, image: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="group relative h-96 overflow-hidden rounded-sm border border-white/10"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
      
      <div className="absolute bottom-0 left-0 p-8">
        <h3 className="text-2xl font-bold text-white mb-3 font-exo group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-gray-300 leading-relaxed text-sm border-l-2 border-blue-500 pl-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

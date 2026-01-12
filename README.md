# 🚗 CarroClaude SaaS - Plataforma Premium de Gestão Automotiva (SaaS)

> **Status:** 🚀 Em Produção (v1.0) | **Stack:** Enterprise Grade | **Foco:** B2B (Oficinas Mecânicas)

O **CarroClaude SaaS** é uma solução completa de gestão para oficinas mecânicas, construída com o que há de mais moderno em tecnologia web. Projetado para ser escalável, seguro e visualmente impactante, ele oferece uma experiência "Premium" tanto para o dono do SaaS (Admin) quanto para seus clientes (Oficinas).

Este projeto não é apenas um template; é uma aplicação Fullstack real, com autenticação, banco de dados relacional, RLS (Row Level Security) e automação.

---

## 🛠️ Tech Stack & Arquitetura

O projeto utiliza uma arquitetura **Serverless** moderna, hospedada na Vercel, garantindo performance global e custo zero em idle.

### Core
*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router) - O padrão da indústria para React.
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/) - Tipagem estrita para evitar bugs em produção.
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS para desenvolvimento ágil.
*   **Animações:** [Framer Motion](https://www.framer.com/motion/) - Transições suaves e micro-interações.
*   **3D:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - Renderização de modelos 3D (GLB) no navegador.

### Backend & Dados
*   **Database:** [Supabase](https://supabase.com/) (PostgreSQL) - Banco de dados relacional robusto.
*   **Autenticação:** Supabase Auth (JWT) com suporte a múltiplos providers e segurança RLS.
*   **API:** Next.js API Routes (Serverless Functions) para lógica de negócio backend.
*   **Segurança:** 
    *   **RLS (Row Level Security):** Garante que uma oficina NUNCA veja dados de outra oficina no nível do banco.
    *   **Bcrypt:** Hash de senhas seguro.
    *   **Middleware:** Proteção de rotas `/admin` e `/dashboard` no Edge.

### Infraestrutura
*   **Deploy:** [Vercel](https://vercel.com/) - CI/CD contínuo e infraestrutura Edge.
*   **Monitoramento:** Logs de auditoria internos e Vercel Analytics.

---

## 📂 Estrutura do Projeto (Deep Dive)

Abaixo, a explicação detalhada de cada diretório e arquivo crucial do sistema.

```bash
carroclaude/
├── app/                            # (Next.js App Router) O coração da aplicação
│   ├── admin/                      # ÁREA RESTRITA: Painel do Dono do SaaS ("God Mode")
│   │   └── dashboard/              # page.tsx: O painel principal com métricas globais, logs terminais e controle total.
│   ├── api/                        # BACKEND: Rotas da API Serverless
│   │   ├── admin/                  # Endpoints protegidos para gestão do sistema
│   │   │   ├── impersonate/        # route.ts: Lógica mágica para logar como qualquer cliente sem senha.
│   │   │   ├── logs/               # route.ts: Retorna logs do sistema em tempo real.
│   │   │   ├── offices/            # [id]/route.ts: Detalhes profundos de uma oficina específica.
│   │   │   └── stats/              # route.ts: Agregações pesadas de dados (MRR, Total Clientes).
│   │   └── auth/                   # Endpoints de Autenticação
│   │       ├── login/              # route.ts: Validação de credenciais e emissão de JWT.
│   │       └── register/           # route.ts: Criação de novos tenants (oficinas) com trigger de setup.
│   ├── dashboard/                  # ÁREA DO CLIENTE: Painel Operacional da Oficina
│   │   └── page.tsx                # Onde o mecânico trabalha. Cadastro de OS, Clientes e Métricas locais.
│   ├── login/                      # Página de Login Unificada (Redireciona Admin -> Admin, Oficina -> Dashboard)
│   ├── register/                   # Página de Venda/Cadastro (Onboarding de novos clientes)
│   ├── layout.tsx                  # Layout Raiz (Fontes Inter/Exo, Metadata SEO)
│   └── page.tsx                    # Landing Page Pública (Showroom 3D com Carro Interativo)
├── components/                     # Blocos de UI Reutilizáveis
│   ├── AdminSidebar.tsx            # Navegação lateral do Admin (Focado em gestão)
│   ├── Hero3D.tsx                  # Componente complexo que carrega a cena Three.js
│   └── Navbar.tsx                  # Barra de navegação responsiva e dinâmica (Glassmorphism)
├── lib/                            # Bibliotecas e Utilitários
│   ├── supabase.ts                 # Singleton do cliente Supabase (Evita múltiplas conexões)
│   ├── jwt.ts                      # Funções para gerar/validar tokens JWT manualmente se necessário
│   └── ia.ts                       # (MOCK) Módulo preparado para integração com OpenAI GPT-4
├── scripts/                        # Automação e Manutenção
│   ├── seed-database.ts            # Script poderoso que popula o banco com 5 oficinas e 50+ clientes reais.
│   └── fix-passwords.ts            # Script de emergência para resetar hashes de senha em massa.
├── store/                          # Gerenciamento de Estado
│   └── authStore.ts                # (Zustand) Mantém a sessão do usuário no client-side.
└── public/                         # Arquivos Estáticos
    └── car.glb                     # Modelo 3D de alta qualidade renderizado na home.
```

---

## ✅ O Que Funciona (Status Real)

O sistema está **100% funcional** nos seguintes fluxos:

1.  **Landing Page 3D:** Renderização de modelo automotivo com iluminação de estúdio realista.
2.  **Autenticação Completa:**
    *   Cadastro de nova oficina (Tenant).
    *   Login inteligente (detecta se é Admin ou Cliente e redireciona).
    *   Logout seguro.
3.  **Dashboard Admin ("God Mode"):**
    *   **Visão de Águia:** MRR (Receita Mensal Recorrente), Total de Oficinas, Clientes Ativos.
    *   **Terminal de Logs:** Visualização estilo "Hacker" dos eventos do sistema.
    *   **Gestão de Tenants:** Lista todas as oficinas parceiras com status de pagamento.
    *   **Impersonate:** Botão "Acessar Painel" que permite ao admin entrar na conta da oficina para suporte.
4.  **Dashboard da Oficina (Cliente Final):**
    *   **Nova OS:** Formulário modal rápido para abrir ordem de serviço.
    *   **CRM:** Cadastro automático de clientes e veículos.
    *   **Financeiro:** Visualização de faturamento diário/mensal.
    *   **Onboarding:** Mensagem de boas-vindas no primeiro acesso.
5.  **Banco de Dados:**
    *   Estrutura relacional completa (`oficinas`, `clientes`, `servicos`, `mensagens_whatsapp`).
    *   Populado com dados realistas (não apenas "lorem ipsum").

---

## 🚧 O Que Falta (Roadmap & Limitações Atuais)

Para ser sincero e transparente com quem analisa o código:

1.  **Integração WhatsApp Real:** Atualmente, o sistema simula o envio de mensagens e salva no banco como "pendente". *Próximo passo: Integrar API WPPConnect/Twilio.*
2.  **Gateway de Pagamento:** O sistema exibe status de planos (Free/Pro), mas não processa cartões de crédito. *Próximo passo: Integração Stripe/Asaas.*
3.  **IA Generativa Real:** Os insights de "Manutenção Preventiva" são baseados em lógica estática. *Próximo passo: Conectar OpenAI API para analisar histórico do carro.*
4.  **Upload de Imagens:** Oficinas ainda não podem subir fotos dos carros/peças. *Próximo passo: Supabase Storage.*

---

## � Como Rodar o Projeto

### Pré-requisitos
*   Node.js 18+
*   Conta no Supabase (Gratuita)

### Passo a Passo

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/fabiorjvr/carrosaas.git
    cd carrosaas
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Ambiente (.env):**
    Crie um arquivo `.env` na raiz com suas chaves do Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_aqui
    SUPABASE_SERVICE_ROLE_KEY=sua_service_role_aqui
    ```

4.  **Popule o Banco de Dados (Opcional, mas recomendado):**
    Execute nosso script de seed para criar um cenário realista:
    ```bash
    npx ts-node scripts/seed-database.ts
    ```

5.  **Rode o Servidor:**
    ```bash
    npm run dev
    ```
    Acesse `http://localhost:3000`.

---

## 🔒 Segurança

A segurança foi prioridade desde o dia 0.

*   **Autenticação:** Baseada em Cookies HTTP-Only (resistente a XSS).
*   **Dados:** Senhas hasheadas com `bcrypt`.
*   **Isolamento:** A arquitetura do banco impede vazamento de dados entre concorrentes (Multi-tenancy).

---

**Desenvolvido por Fabio**  
*Um projeto SaaS feito para escalar.*

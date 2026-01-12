import type { Metadata } from 'next';
import { Inter, Exo_2 } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const exo2 = Exo_2({ subsets: ['latin'], variable: '--font-exo2' });

export const metadata: Metadata = {
  title: 'Oficina SaaS | Gestão Inteligente',
  description: 'Sistema de gestão premium para oficinas mecânicas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${exo2.variable}`}>
      <body className="bg-[#050510] text-white font-sans antialiased overflow-x-hidden">
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
          }}
        />
      </body>
    </html>
  );
}

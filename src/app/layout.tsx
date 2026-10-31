// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcoCare Smart Field Assistant | PT EcoCare Indo Pasifik Tbk',
  description:
    'Aplikasi Asisten Observasi Lapangan, Predictive Lead Scoring & Next Best Offer untuk Tim Sales Door-to-Door PT EcoCare Indo Pasifik Tbk (ECII).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}


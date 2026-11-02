// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hycare — Solusi Kebersihan Gedung Pintar',
  description:
    'Hycare: Sistem Rekomendasi Solusi Kebersihan & Sanitasi Gedung oleh PT EcoCare Indo Pasifik Tbk.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/hycare-icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/hycare-icon.png' },
    ],
  },
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

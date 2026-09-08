import type { Metadata, Viewport } from 'next';
import './globals.css';
const title = 'DROP — Air Force 1 в твоём цвете';
const description = 'Тот самый силуэт Air Force 1 в белом, графитовом и мятном. Выбери цвет, размер и посмотри модель в движении.';

export const metadata: Metadata = {
  metadataBase: new URL('https://sole-motion-public.vercel.app'),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: 'DROP',
    locale: 'ru_RU',
    type: 'website',
    images: [{ url: '/air-force-1-white.png', alt: 'Air Force 1 — интерактивный выбор цвета' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/air-force-1-white.png'] },
  icons: { icon: '/favicon.svg' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#ffffff' };
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) { return <html lang="ru"><body>{children}</body></html>; }

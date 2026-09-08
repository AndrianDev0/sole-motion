import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'DROP — Air Force 1 в твоём цвете', description: 'Тот самый силуэт Air Force 1 в белом, графитовом и мятном. Выбери цвет, размер и посмотри модель в движении.', icons: { icon: '/favicon.svg' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#ffffff' };
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) { return <html lang="ru"><body>{children}</body></html>; }

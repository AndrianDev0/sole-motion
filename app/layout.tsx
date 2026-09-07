import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'DROP — Air Force 1 вне гравитации', description: 'Air Force 1 в движении. Детальный силуэт, мягкое приземление и твой выбор цвета. Независимый концепт-магазин.', icons: { icon: '/favicon.svg' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#ffffff' };
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) { return <html lang="ru"><body>{children}</body></html>; }

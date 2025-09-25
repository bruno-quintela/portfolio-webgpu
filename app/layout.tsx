import type { Metadata } from 'next';
import './globals.css';
import { Layout } from '@/components/layout';

export const metadata: Metadata = {
  title: '11Scanning effect with depth map | Codrops',
  description: 'Scanning effect with depth map',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="p-0 m-0 bg-white overflow-hidden">
        <Layout />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TestModeBanner } from '@/components/shared/test-mode-banner';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Manzillar Tizimi',
  description: 'O‘zbekiston Respublikasining manzillar tizimi',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='uz' suppressHydrationWarning className='h-full'>
      <body className={cn(inter.className, 'h-full')}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <TestModeBanner />
          <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

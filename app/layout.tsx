import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import NextTopLoader from 'nextjs-toploader';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
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
        <NextTopLoader 
          color="#3b82f6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
        />
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <TestModeBanner />
          <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full overflow-hidden">
              <AppSidebar />
              <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                {children}
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

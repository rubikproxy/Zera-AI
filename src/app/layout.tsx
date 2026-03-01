import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'AI Zera | Empathetic Postpartum Intelligence',
  description: 'Zera AI combines Multimodal Deep Learning with empathetic care for new mothers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${dmSans.variable}`}>
      <body className="font-body antialiased bg-background text-foreground selection:bg-indigo-100">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
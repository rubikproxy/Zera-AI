'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Sparkles, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';

interface NavbarProps {
  sidebarNav?: React.ReactNode;
}

export function Navbar({ sidebarNav }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b h-16 flex items-center px-4 md:px-8">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r w-[280px]">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="h-16 flex items-center px-6 border-b">
              <Link href="/" className="flex items-center gap-2 font-bold">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <span className="font-headline text-lg">AI Zera</span>
              </Link>
            </div>
            {sidebarNav}
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 flex items-center justify-between">
        <Link href="/" className="hidden lg:flex items-center gap-2 group">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg transition-transform group-hover:rotate-12">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-headline font-extrabold text-xl tracking-tight">AI Zera</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-6">
             <Link href="/chat" className="text-sm font-bold text-muted-foreground hover:text-indigo-600">🏠 Dashboard</Link>
             <Link href="/chat/results" className="text-sm font-bold text-muted-foreground hover:text-indigo-600">📈 My Status</Link>
          </div>
          <Button variant="outline" className="rounded-full px-5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs uppercase tracking-widest">
            💤 System Idle
          </Button>
        </div>
      </div>
    </nav>
  );
}
'use client';

import { 
  Activity,
  Home, 
  LifeBuoy, 
  Sparkles, 
  Sun, 
  PlusCircle 
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STORAGE_KEY = 'zera_chat_history_v2';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNewChat = () => {
    if (confirm("Are you sure you want to start a new chat? This will clear your current local history.")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = '/chat';
    }
  };

  const handleAction = (action: string) => {
    if (pathname !== '/chat') {
      router.push(`/chat?action=${action}`);
    } else {
      window.dispatchEvent(new CustomEvent('zera-action', { detail: action }));
    }
  };

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Chat Dashboard', icon: PlusCircle, onClick: handleNewChat },
    { label: 'Daily Check-in', icon: Sun, onClick: () => handleAction('check-in') },
    { label: 'Health Monitoring', icon: Activity, href: '/chat/advice' },
    { label: 'Recovery Status', icon: Sparkles, href: '/chat/results' },
  ];

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link href="/chat" className="flex items-center gap-2 font-semibold">
          <LifeBuoy className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold">AI Zera</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.href === pathname;
            
            if (item.href) {
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            }
            
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left w-full"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="rounded-xl bg-primary/5 p-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          Monitoring Active • v2.1.0
        </div>
      </div>
    </div>
  );
}

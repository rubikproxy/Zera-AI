'use client';

import { 
  Activity,
  Home, 
  LifeBuoy, 
  PlusCircle,
  Sun, 
  UserCircle,
  BarChart3
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const CHAT_STORAGE_KEY = 'zera_chat_history_v2';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewChat = () => {
    if (confirm("Start a new session? This will clear current local dialogue but keep your profile.")) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
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
    { label: 'New Chat', icon: PlusCircle, onClick: handleNewChat },
    { label: 'Daily Check-in', icon: Sun, onClick: () => handleAction('check-in') },
    { label: 'My Health Tracker', icon: Activity, href: '/chat/advice' },
    { label: 'My Health Status', icon: BarChart3, href: '/chat/results' },
    { label: 'My Profile', icon: UserCircle, href: '/chat/profile' },
  ];

  if (!mounted) return (
    <div className="flex h-full flex-col gap-2 bg-muted/10 animate-pulse" />
  );

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link href="/chat" className="flex items-center gap-2 font-semibold">
          <LifeBuoy className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-lg tracking-tight">AI Zera</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.href === pathname;
            
            if (item.href) {
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 hover:bg-primary/5 hover:text-primary group",
                    isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            }
            
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-all duration-300 hover:bg-primary/5 hover:text-primary text-left w-full group"
              >
                <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-6 border-t bg-secondary/10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-primary/70">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Local Node: Active
          </div>
          <div className="text-[9px] text-muted-foreground leading-relaxed">
            All conversations and biometrics are stored locally on this device via LocalStorage.
          </div>
        </div>
      </div>
    </div>
  );
}
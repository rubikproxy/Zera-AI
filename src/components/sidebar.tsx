'use client';

import { 
  Home, 
  Sparkles, 
  MessageSquare,
  PlusCircle,
  CalendarCheck, 
  UserCircle,
  BarChart3,
  Map,
  LogOut
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
    if (confirm("Start a new session? Your past history will be archived locally.")) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      window.location.href = '/chat';
    }
  };

  const menuGroups = [
    {
      label: "Main",
      items: [
        { label: '🏠 Home', icon: Home, href: '/' },
        { label: '💬 AI Chat', icon: MessageSquare, href: '/chat' },
        { label: '✨ New Chat', icon: PlusCircle, onClick: handleNewChat },
      ]
    },
    {
      label: "Monitoring",
      items: [
        { label: '📅 Daily Check-in', icon: CalendarCheck, href: '/chat/advice' },
        { label: '🗺️ Recovery Journey', icon: Map, href: '/chat/timeline' },
        { label: '📊 Health Status', icon: BarChart3, href: '/chat/results' },
      ]
    },
    {
      label: "Identity",
      items: [
        { label: '👤 My Profile', icon: UserCircle, href: '/chat/profile' },
      ]
    }
  ];

  if (!mounted) return <div className="h-full bg-white animate-pulse" />;

  return (
    <div className="flex h-full flex-col bg-white border-r">
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <Link href="/chat" className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-headline font-extrabold text-xl tracking-tight">AI Zera</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-2">
            <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{group.label}</h4>
            <nav className="space-y-1">
              {group.items.map((item, idx) => {
                const isActive = item.href === pathname;
                
                if (item.href) {
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all group",
                        isActive 
                          ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                          : "text-muted-foreground hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
                      {item.label}
                    </Link>
                  );
                }
                
                return (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground transition-all hover:bg-gray-50 hover:text-gray-900 w-full text-left"
                  >
                    <item.icon className="h-4 w-4 text-gray-400" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-gray-50/50">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Local Node Active</span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
            Your biometrics and chats are stored strictly on this device.
          </p>
        </div>
      </div>
    </div>
  );
}
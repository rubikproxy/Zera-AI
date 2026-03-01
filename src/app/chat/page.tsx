'use client';

import { Chat, type ChatHandle } from '@/components/chat';
import { Header } from '@/components/header';
import {
  ClipboardCheck,
  HeartPulse,
  Home,
  LifeBuoy,
  Sparkles,
  Sun,
  PlusCircle,
} from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'zera_chat_history_v2';

export default function ChatPage() {
  const chatRef = useRef<ChatHandle>(null);
  const router = useRouter();

  const handleNewChat = () => {
    if (confirm("Are you sure you want to start a new chat? This will clear your current local history.")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const sidebarNav = (
    <nav className="grid items-start px-4 text-sm font-medium">
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          router.push('/');
        }}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Home className="h-4 w-4" />
        Home
      </a>
      <button
        onClick={handleNewChat}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left w-full"
      >
        <PlusCircle className="h-4 w-4" />
        New Chat
      </button>
      <button
        onClick={() => chatRef.current?.handleGetHealthTip()}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left w-full"
      >
        <ClipboardCheck className="h-4 w-4" />
        Health Tips
      </button>
      <button
        onClick={() => chatRef.current?.handleStartScreening()}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left w-full"
      >
        <HeartPulse className="h-4 w-4" />
        Mental Health Screening
      </button>
      <button
        onClick={() => chatRef.current?.handleDailyCheckIn()}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left w-full"
      >
        <Sun className="h-4 w-4" />
        Daily Check-in
      </button>
      <button
        onClick={() => chatRef.current?.handleGetAdvice()}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left w-full"
      >
        <Sparkles className="h-4 w-4" />
        Personalized Advice
      </button>
    </nav>
  );

  return (
    <div className="grid h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <a href="/chat" className="flex items-center gap-2 font-semibold">
              <LifeBuoy className="h-6 w-6 text-primary" />
              <span className="font-headline font-bold">AI Zera</span>
            </a>
          </div>
          <div className="flex-1 overflow-auto py-2">{sidebarNav}</div>
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <Header sidebarNav={sidebarNav} />
        <main className="flex-1 overflow-hidden p-4 lg:p-6 bg-background/50">
          <div className="h-full w-full rounded-lg overflow-hidden">
            <Chat ref={chatRef} />
          </div>
        </main>
      </div>
    </div>
  );
}
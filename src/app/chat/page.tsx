'use client';

import { Chat, type ChatHandle } from '@/components/chat';
import { Header } from '@/components/header';
import {
  ClipboardCheck,
  HeartPulse,
  HomeIcon,
  LifeBuoy,
  Sparkles,
  Sun,
  PlusCircle,
} from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const chatRef = useRef<ChatHandle>(null);
  const router = useRouter();

  // For simplicity, new chat reloads the page.
  const handleNewChat = () => {
    window.location.reload();
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
        <HomeIcon className="h-4 w-4" />
        Home
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleNewChat();
        }}
        className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
      >
        <PlusCircle className="h-4 w-4" />
        New Chat
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          chatRef.current?.handleGetHealthTip();
        }}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <ClipboardCheck className="h-4 w-4" />
        Health Tips
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          chatRef.current?.handleStartScreening();
        }}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <HeartPulse className="h-4 w-4" />
        Mental Health Screening
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          chatRef.current?.handleDailyCheckIn();
        }}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Sun className="h-4 w-4" />
        Daily Check-in
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          chatRef.current?.handleGetAdvice();
        }}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Sparkles className="h-4 w-4" />
        Personalized Advice
      </a>
    </nav>
  );

  return (
    <div className="grid h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <a href="/chat" className="flex items-center gap-2 font-semibold">
              <LifeBuoy className="h-6 w-6 text-primary" />
              <span className="">AI Zera</span>
            </a>
          </div>
          <div className="flex-1 overflow-auto py-2">{sidebarNav}</div>
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <Header sidebarNav={sidebarNav} />
        <main className="flex-1 overflow-hidden p-4 lg:p-6">
          <div className="h-full w-full rounded-lg border bg-card shadow-sm overflow-hidden">
            <Chat ref={chatRef} />
          </div>
        </main>
      </div>
    </div>
  );
}

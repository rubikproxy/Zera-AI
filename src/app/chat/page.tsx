'use client';

import { Chat, type ChatHandle } from '@/components/chat';
import { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const chatRef = useRef<ChatHandle>(null);
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const action = searchParams.get('action');
    if (action && chatRef.current) {
      if (action === 'check-in') chatRef.current.handleDailyCheckIn();
    }
  }, [searchParams, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handleAction = (e: any) => {
      const action = e.detail;
      if (chatRef.current) {
        if (action === 'check-in') chatRef.current.handleDailyCheckIn();
      }
    };
    window.addEventListener('zera-action', handleAction);
    return () => window.removeEventListener('zera-action', handleAction);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <Chat ref={chatRef} />
    </div>
  );
}
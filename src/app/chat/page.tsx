'use client';

import { Chat, type ChatHandle } from '@/components/chat';
import { useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const chatRef = useRef<ChatHandle>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action && chatRef.current) {
      if (action === 'tip') chatRef.current.handleGetHealthTip();
      if (action === 'screening') chatRef.current.handleStartScreening();
      if (action === 'check-in') chatRef.current.handleDailyCheckIn();
    }
  }, [searchParams]);

  useEffect(() => {
    const handleAction = (e: any) => {
      const action = e.detail;
      if (chatRef.current) {
        if (action === 'tip') chatRef.current.handleGetHealthTip();
        if (action === 'screening') chatRef.current.handleStartScreening();
        if (action === 'check-in') chatRef.current.handleDailyCheckIn();
      }
    };
    window.addEventListener('zera-action', handleAction);
    return () => window.removeEventListener('zera-action', handleAction);
  }, []);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <Chat ref={chatRef} />
    </div>
  );
}

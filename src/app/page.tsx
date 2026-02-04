'use client';

import { Chat } from '@/components/chat';
import { Header } from '@/components/header';
import { useState } from 'react';

export default function Home() {
  const [language, setLanguage] = useState('English');

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header language={language} setLanguage={setLanguage} />
      <main className="flex flex-1 flex-col p-4 md:p-6">
        <Chat language={language} />
      </main>
    </div>
  );
}

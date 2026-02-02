import { Chat } from '@/components/chat';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col p-4 md:p-8">
        <Chat />
      </main>
    </div>
  );
}

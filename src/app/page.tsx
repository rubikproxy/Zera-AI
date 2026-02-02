import { Chat } from '@/components/chat';
import { Header } from '@/components/header';
import { HealthMetrics } from '@/components/health-metrics';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:grid md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3">
          <Chat />
        </div>
        <div className="md:col-span-1">
          <h2 className="mb-4 font-headline text-xl">Your Health Vitals</h2>
          <HealthMetrics />
        </div>
      </main>
    </div>
  );
}

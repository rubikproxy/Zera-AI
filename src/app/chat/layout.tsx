import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar - Fixed and Non-scrollable container */}
      <aside className="hidden w-[280px] border-r bg-muted/40 lg:block shrink-0 h-full overflow-hidden">
        <Sidebar />
      </aside>
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <Header sidebarNav={<Sidebar />} />
        <main className="flex-1 overflow-hidden bg-background/50">
          <div className="h-full w-full overflow-y-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

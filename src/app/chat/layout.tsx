import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FAFAF8] mesh-gradient">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[280px] border-r bg-white lg:block shrink-0 h-full overflow-hidden sticky top-0 left-0">
        <Sidebar />
      </aside>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden relative">
        <Navbar sidebarNav={<Sidebar />} />
        <main className="flex-1 overflow-hidden pt-16">
          <div className="h-full w-full overflow-y-auto p-6 lg:p-10 custom-scrollbar animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
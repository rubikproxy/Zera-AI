import { Button } from './ui/button';
import { Menu, LifeBuoy } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

interface HeaderProps {
  sidebarNav: React.ReactNode;
}

export function Header({ sidebarNav }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <nav className="grid gap-2 text-lg font-medium">
            <a
              href="/"
              className="flex items-center gap-4 text-lg font-semibold mb-4 border-b pb-4 px-6 pt-3"
            >
              <LifeBuoy className="h-6 w-6 text-primary" />
              <span>AI Zera</span>
            </a>
            {sidebarNav}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Placeholder for maybe a search form */}
      </div>
    </header>
  );
}

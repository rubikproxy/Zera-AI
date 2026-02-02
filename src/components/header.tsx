import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Languages, LifeBuoy } from 'lucide-react';

interface HeaderProps {
  language: string;
  setLanguage: (language: string) => void;
}

export function Header({ language, setLanguage }: HeaderProps) {
  return (
    <header className="flex h-20 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-3">
        <LifeBuoy className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl font-bold text-foreground">AI Zera</h1>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Languages className="mr-2 h-5 w-5" />
              {language}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setLanguage('English')}>English</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLanguage('Español')}>Español</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLanguage('Français')}>Français</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

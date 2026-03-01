'use client';

import {
  getEmpatheticResponse,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  CornerDownLeft,
  Loader,
  User,
  UserCircle,
  Siren,
  ShieldAlert,
} from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { EmergencyDialog } from './emergency-dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const STORAGE_KEY = 'zera_chat_history_v2';
const PROFILE_KEY = 'zera_user_profile';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  urgency?: string;
}

export interface ChatHandle {
  handleDailyCheckIn: () => void;
}

export const Chat = forwardRef<ChatHandle, {}>((props, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [escalationMessage, setEscalationMessage] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How should I manage recovery today?",
    "I'm feeling a bit tired.",
    "Is my bleeding normal?",
  ]);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    dob: '',
    phone: '',
    email: '',
    birthMethod: '',
    daysSinceBirth: '',
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (!savedProfile) {
      setShowProfileDialog(true);
    } else {
      try {
        setProfileForm(JSON.parse(savedProfile));
      } catch (e) {
        setShowProfileDialog(true);
      }
    }

    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          getInitialGreeting();
        }
      } catch (e) {
        getInitialGreeting();
      }
    } else {
      getInitialGreeting();
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.birthMethod || !profileForm.daysSinceBirth) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill in your name and birth details.' });
      return;
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileForm));
    setShowProfileDialog(false);
    if (messages.length === 0) getInitialGreeting();
  };

  const getInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const resp = await getEmpatheticResponse({
        userInput: 'Initialize Zera AI Postpartum Monitoring Node.',
        context: 'First session start.',
        language: 'English'
      });
      setMessages([{ id: 'init', role: 'assistant', content: resp.response }]);
      if (resp.route.next_question) setSuggestions([resp.route.next_question]);
    } catch (e) {
      setMessages([{ id: 'err', role: 'assistant', content: 'Zera Node Online. How can I assist your recovery today?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleDailyCheckIn: () => {
       router.push('/chat/advice');
    },
  }));

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, isLoading]);

  const submitMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    setInput('');

    try {
      const contextString = history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
      const result = await getEmpatheticResponse({ 
        userInput: text, 
        context: contextString,
        language: 'English'
      });

      if (result.route.urgency === 'emergency_now') {
        setEscalationMessage(result.response);
        setIsEmergency(true);
      }

      const assistantMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: result.response,
        urgency: result.route.urgency 
      };
      
      const finalHistory = [...history, assistantMsg];
      setMessages(finalHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalHistory));

      if (result.route.next_question) {
        setSuggestions([result.route.next_question, "Tell me more about this.", "What should I do next?"]);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Neural Link Error', description: 'Failed to process signal. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-full flex-col w-full bg-white/50 border rounded-[32px] shadow-2xl overflow-hidden glass border-black/5">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-6 lg:p-12 space-y-10">
          {messages.map((m) => (
            <div key={m.id} className={cn('flex items-start gap-5', m.role === 'user' && 'flex-row-reverse')}>
              <Avatar className={cn(
                "h-10 w-10 shadow-lg border-2",
                m.role === 'assistant' ? "bg-black border-black/10" : "bg-white border-black/10"
              )}>
                <AvatarFallback className="text-[10px] font-black uppercase">
                  {m.role === 'assistant' ? <span className="text-white">Z</span> : <User className="h-4 w-4 text-black" />}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                'max-w-[80%] relative rounded-[28px] p-6 text-sm shadow-sm leading-relaxed',
                m.role === 'user' 
                  ? 'bg-black text-white font-medium rounded-tr-none' 
                  : 'bg-white border text-black whitespace-pre-wrap rounded-tl-none font-medium',
                m.urgency === 'emergency_now' && 'border-red-600 border-2 bg-red-50'
              )}>
                {m.urgency === 'emergency_now' && (
                  <div className="absolute -top-3 -left-3 bg-red-600 text-white p-1 rounded-full shadow-lg">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-5">
              <Avatar className="h-10 w-10 bg-black border-2 border-black/10 shadow-lg"><AvatarFallback className="text-white">Z</AvatarFallback></Avatar>
              <div className="bg-white border p-5 rounded-[28px] shadow-sm rounded-tl-none">
                <div className="flex gap-1.5 items-center">
                  <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-black rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-8 border-t bg-white/60 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 mb-6">
          {suggestions.map((s, i) => (
            <button 
              key={i} 
              className="bg-white hover:bg-black hover:text-white text-[10px] font-black border border-black/10 rounded-full px-5 h-9 transition-all duration-300 uppercase tracking-widest shadow-sm text-black" 
              onClick={() => submitMessage(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submitMessage(input); }} className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Provide a health signal or ask Zera..."
              className="resize-none bg-white pr-14 focus:ring-black/5 min-h-[60px] max-h-[160px] py-4 px-6 border-black/10 shadow-inner rounded-[24px] text-base leading-tight text-black font-medium"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(input); } }}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white hover:bg-black/80 h-10 w-10 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-95" 
              disabled={isLoading || !input.trim()}
            >
              <CornerDownLeft className="h-5 w-5" />
            </button>
          </div>
        </form>
        <div className="mt-4 flex items-center justify-between px-2">
           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black">
             <Siren className="h-3 w-3 text-red-600" /> Emergency Escallation Protocol Active
           </div>
           <Badge variant="outline" className="text-[8px] h-4 font-black border-black/10 text-black bg-black/5 uppercase">Neural Node V2.5</Badge>
        </div>
      </div>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md rounded-[40px] border-none shadow-2xl glass p-0 overflow-hidden">
          <div className="bg-black text-white p-10 flex flex-col items-center text-center">
             <div className="bg-white p-5 rounded-[24px] shadow-lg mb-6">
                <UserCircle className="h-10 w-10 text-black" />
             </div>
             <DialogTitle className="text-3xl font-headline font-black">Health Identity</DialogTitle>
             <DialogDescription className="text-white/70 mt-3 text-lg">
               Initialize your local recovery node.
             </DialogDescription>
          </div>
          <form onSubmit={handleSaveProfile} className="p-10 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black ml-1">Name</Label>
              <Input 
                placeholder="E.g., Elena" 
                value={profileForm.name} 
                onChange={e => setProfileForm(p => ({...p, name: e.target.value}))}
                className="h-12 rounded-[16px] bg-secondary/50 border-none shadow-inner px-4 text-base text-black font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black ml-1">Birth Date</Label>
                <Input 
                  type="date"
                  value={profileForm.dob} 
                  onChange={e => setProfileForm(p => ({...p, dob: e.target.value}))}
                  className="h-12 rounded-[16px] bg-secondary/50 border-none shadow-inner text-black font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black ml-1">Method</Label>
                <Select value={profileForm.birthMethod} onValueChange={v => setProfileForm(p => ({...p, birthMethod: v}))}>
                  <SelectTrigger className="h-12 rounded-[16px] bg-secondary/50 border-none shadow-inner text-black font-medium">
                    <SelectValue placeholder="How?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Naturally</SelectItem>
                    <SelectItem value="c-section">C-Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black ml-1">Days since baby was born</Label>
              <Input 
                type="number"
                placeholder="E.g., 14"
                value={profileForm.daysSinceBirth} 
                onChange={e => setProfileForm(p => ({...p, daysSinceBirth: e.target.value}))}
                className="h-12 rounded-[16px] bg-secondary/50 border-none shadow-inner text-black font-medium"
              />
            </div>

            <Button type="submit" className="w-full h-14 rounded-full font-black text-lg mt-4 shadow-xl active:scale-[0.98] bg-black text-white hover:bg-black/90">
              Activate Monitoring
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <EmergencyDialog open={isEmergency} onOpenChange={setIsEmergency} escalationMessage={escalationMessage} />
    </div>
  );
});
Chat.displayName = 'Chat';
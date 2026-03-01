'use client';

import {
  getEmpatheticResponse,
  getEmergencyEscalation,
  getSymptomUnderstanding,
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
  ShieldCheck,
  Zap,
  UserCircle,
  Save,
  Lock,
  Mic,
  Smile
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STORAGE_KEY = 'zera_chat_history_v2';
const PROFILE_KEY = 'zera_user_profile';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
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
    const profile = localStorage.getItem(PROFILE_KEY);
    if (!profile) {
      setShowProfileDialog(true);
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validMessages = (parsed as Message[]).filter(m => 
          m && typeof m.content === 'string' && m.id && m.role
        );
        if (validMessages.length > 0) {
          setMessages(validMessages);
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
    getInitialGreeting();
  };

  const getInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const resp = await getEmpatheticResponse({
        userInput: 'Introduce Zera, the futuristic AI postpartum health assistant.',
        context: 'First interaction.',
      });
      setMessages([{ id: 'init', role: 'assistant', content: resp.response }]);
    } catch (e) {
      setMessages([{ id: 'err', role: 'assistant', content: 'I am Zera, your postpartum monitoring assistant.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How should I manage recovery today?",
    "I'm feeling a bit tired.",
    "Is my bleeding normal?",
  ];

  useImperativeHandle(ref, () => ({
    handleDailyCheckIn: () => {
       router.push('/chat/advice');
    },
  }));

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, isLoading]);

  const submitMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
    setInput('');

    try {
      const understanding = await getSymptomUnderstanding({ symptomsDescription: text });
      if (understanding.urgencyLevel === 'high') {
        const esc = await getEmergencyEscalation({ symptoms: text, patientId: 'local-user', timestamp: new Date().toISOString() });
        setEscalationMessage(esc.escalationMessage);
        setIsEmergency(true);
      } else {
        const resp = await getEmpatheticResponse({ userInput: text, context: 'Monitoring Active.' });
        const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: resp.response };
        const finalMessages = [...updatedMessages, assistantMsg];
        setMessages(finalMessages);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalMessages));
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to process signal.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="flex h-full flex-col w-full bg-background border rounded-[30px] shadow-xl overflow-hidden glass">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-6 lg:p-10 space-y-8">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex items-start gap-4', m.role === 'user' && 'flex-row-reverse')}>
                <Avatar className="h-9 w-9 bg-background shadow-sm shrink-0 border">
                  <AvatarFallback className="bg-transparent text-primary font-bold text-xs uppercase">
                    {m.role === 'assistant' ? 'Z' : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  'max-w-[85%] rounded-[24px] p-5 text-sm shadow-sm leading-relaxed',
                  m.role === 'user' 
                    ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                    : 'bg-white border text-foreground whitespace-pre-wrap rounded-tl-none'
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="border h-9 w-9 shrink-0"><AvatarFallback>Z</AvatarFallback></Avatar>
                <div className="bg-white border p-4 rounded-[24px] shadow-sm rounded-tl-none"><Loader className="h-4 w-4 animate-spin text-primary" /></div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-white/40">
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button key={i} className="bg-white hover:bg-primary/5 text-[10px] font-bold border rounded-full px-4 h-8 transition-colors uppercase tracking-tight" onClick={() => submitMessage(s)}>
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); submitMessage(input); }} className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Talk to Zera..."
                className="resize-none bg-white pr-12 focus:ring-primary/20 min-h-[50px] max-h-[150px] py-3 px-5 border shadow-inner rounded-[24px] text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(input); } }}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:bg-primary/10 h-8 w-8 flex items-center justify-center rounded-full transition-colors" disabled={isLoading || !input.trim()}>
                <CornerDownLeft className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl glass p-0 overflow-hidden">
          <div className="bg-primary/5 p-8 flex flex-col items-center text-center">
             <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                <UserCircle className="h-8 w-8 text-primary" />
             </div>
             <DialogTitle className="text-2xl font-headline font-bold">Health Identity Setup</DialogTitle>
             <DialogDescription className="text-muted-foreground mt-2">
               Welcome. Please initialize your health profile to begin monitoring.
             </DialogDescription>
          </div>
          <form onSubmit={handleSaveProfile} className="p-8 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</Label>
              <Input 
                placeholder="E.g., Elena" 
                value={profileForm.name} 
                onChange={e => setProfileForm(p => ({...p, name: e.target.value}))}
                className="h-10 rounded-xl bg-secondary/20 border-none shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Birthday</Label>
                <Input 
                  type="date"
                  value={profileForm.dob} 
                  onChange={e => setProfileForm(p => ({...p, dob: e.target.value}))}
                  className="h-10 rounded-xl bg-secondary/20 border-none shadow-inner"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">How you gave birth?</Label>
                <Select value={profileForm.birthMethod} onValueChange={v => setProfileForm(p => ({...p, birthMethod: v}))}>
                  <SelectTrigger className="h-10 rounded-xl bg-secondary/20 border-none shadow-inner">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaginal">Normal</SelectItem>
                    <SelectItem value="c-section">C-Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Days since baby was born?</Label>
              <Input 
                type="number"
                placeholder="E.g., 14"
                value={profileForm.daysSinceBirth} 
                onChange={e => setProfileForm(p => ({...p, daysSinceBirth: e.target.value}))}
                className="h-10 rounded-xl bg-secondary/20 border-none shadow-inner"
              />
            </div>

            <Button type="submit" className="w-full h-11 rounded-full font-bold mt-4 shadow-lg">
              Start Monitoring
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <EmergencyDialog open={isEmergency} onOpenChange={setIsEmergency} escalationMessage={escalationMessage} />
    </>
  );
});
Chat.displayName = 'Chat';

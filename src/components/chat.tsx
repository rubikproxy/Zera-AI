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
  Lock
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
    toast({ title: 'Profile Created', description: 'Your health identity is now stored locally.' });
    getInitialGreeting();
  };

  const getInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const resp = await getEmpatheticResponse({
        userInput: 'Introduce Zera, the futuristic AI postpartum health monitoring assistant.',
        context: 'First interaction. Mention monitoring is powered by Multimodal Deep Learning and Local Data Residency.',
      });
      setMessages([{ id: 'init', role: 'assistant', content: resp.response }]);
    } catch (e) {
      setMessages([{ id: 'err', role: 'assistant', content: 'I am Zera, your monitoring assistant. I analyze our conversations to synthesize your recovery status locally.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "I'm feeling very overwhelmed today.",
    "My recovery feels slightly slow.",
    "The baby is sleeping better now.",
  ];

  useImperativeHandle(ref, () => ({
    handleDailyCheckIn: () => {
       submitMessage("I'm ready for my daily check-in monitoring.");
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
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const understanding = await getSymptomUnderstanding({ symptomsDescription: text });
      if (understanding.urgencyLevel === 'high') {
        const esc = await getEmergencyEscalation({ symptoms: text, patientId: 'local-user', timestamp: new Date().toISOString() });
        setEscalationMessage(esc.escalationMessage);
        setIsEmergency(true);
      } else {
        const resp = await getEmpatheticResponse({ userInput: text, context: 'Advanced Local Monitoring Mode active.' });
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: resp.response }]);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Monitoring Error', description: e.message || 'Failed to process physiological signal.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="flex h-full flex-col w-full bg-background border rounded-[30px] shadow-2xl overflow-hidden glass">
        <div className="px-6 py-4 border-b bg-secondary/20 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-primary" />
            Federated Local Persistence
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary" />
            Gemini Multimodal Synthesis
          </div>
        </div>

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-8 space-y-8">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex items-start gap-4', m.role === 'user' && 'flex-row-reverse')}>
                <Avatar className="border-2 h-10 w-10 bg-background shadow-sm shrink-0">
                  <AvatarFallback className="bg-transparent text-primary font-bold">
                    {m.role === 'assistant' ? 'Z' : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  'max-w-[80%] rounded-3xl p-5 text-base shadow-sm leading-relaxed',
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
                <Avatar className="border bg-background h-10 w-10 shrink-0"><AvatarFallback>Z</AvatarFallback></Avatar>
                <div className="bg-white border p-5 rounded-3xl shadow-sm rounded-tl-none"><Loader className="h-4 w-4 animate-spin text-primary" /></div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-white/50 backdrop-blur-md">
          <div className="flex flex-wrap gap-2 mb-6">
            {suggestions.map((s, i) => (
              <button key={i} className="bg-white hover:bg-primary/5 text-[11px] border shadow-sm rounded-full px-4 h-8 transition-colors" onClick={() => submitMessage(s)}>
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); submitMessage(input); }} className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Record check-in details or current status..."
              className="resize-none bg-white pr-16 focus:ring-primary/20 min-h-[60px] py-4 px-6 border shadow-inner rounded-3xl text-lg"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(input); } }}
            />
            <button type="submit" className="absolute bottom-3 right-3 text-primary hover:bg-primary/10 h-10 w-10 flex items-center justify-center rounded-full transition-colors" disabled={isLoading || !input.trim()}>
              <CornerDownLeft className="h-6 w-6" />
            </button>
          </form>
        </div>
      </div>

      {/* Simplified Identity Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl glass p-0 overflow-hidden">
          <div className="bg-primary/10 p-8 flex flex-col items-center text-center">
             <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                <UserCircle className="h-10 w-10 text-primary" />
             </div>
             <DialogTitle className="text-2xl font-headline font-bold">Welcome to Zera</DialogTitle>
             <DialogDescription className="text-muted-foreground mt-2">
               Let's set up your private health profile. Everything is stored only on your laptop.
             </DialogDescription>
          </div>
          <form onSubmit={handleSaveProfile} className="p-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Name</Label>
              <Input 
                id="name" 
                placeholder="E.g., Elena" 
                value={profileForm.name} 
                onChange={e => setProfileForm(p => ({...p, name: e.target.value}))}
                className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Birthday</Label>
                <Input 
                  id="dob" 
                  type="date"
                  value={profileForm.dob} 
                  onChange={e => setProfileForm(p => ({...p, dob: e.target.value}))}
                  className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="Optional"
                  value={profileForm.phone} 
                  onChange={e => setProfileForm(p => ({...p, phone: e.target.value}))}
                  className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="Optional"
                value={profileForm.email} 
                onChange={e => setProfileForm(p => ({...p, email: e.target.value}))}
                className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">How did you give birth?</Label>
              <Select 
                value={profileForm.birthMethod} 
                onValueChange={v => setProfileForm(p => ({...p, birthMethod: v}))}
              >
                <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner">
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaginal">Natural/Vaginal</SelectItem>
                  <SelectItem value="c-section">C-Section</SelectItem>
                  <SelectItem value="assisted">Assisted (Forceps/Vacuum)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Days since your baby was born?</Label>
              <Input 
                id="days" 
                type="number"
                placeholder="E.g., 14"
                value={profileForm.daysSinceBirth} 
                onChange={e => setProfileForm(p => ({...p, daysSinceBirth: e.target.value}))}
                className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner"
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-full font-bold mt-6 shadow-xl gap-2">
              <Save className="h-4 w-4" />
              Create Local Profile
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest mt-4">
              <Lock className="h-3 w-3" />
              100% On-Device Privacy
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <EmergencyDialog open={isEmergency} onOpenChange={setIsEmergency} escalationMessage={escalationMessage} />
    </>
  );
});
Chat.displayName = 'Chat';
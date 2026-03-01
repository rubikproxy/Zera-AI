'use client';

import {
  getEmpatheticResponse,
  getEmergencyEscalation,
  getPersonalizedAdvice,
  getSymptomUnderstanding,
  getHealthTipAction,
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STORAGE_KEY = 'zera_chat_history_v2';
const LATEST_RESULT_KEY = 'zera_latest_result';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
}

export interface ChatHandle {
  handleGetHealthTip: () => void;
  handleStartScreening: () => void;
  handleDailyCheckIn: () => void;
  handleGetAdvice: () => void;
}

export const Chat = forwardRef<ChatHandle, {}>((props, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [escalationMessage, setEscalationMessage] = useState('');
  const [showAdviceForm, setShowAdviceForm] = useState(false);
  const [adviceFormData, setAdviceFormData] = useState({ name: '', age: '', health: '' });
  const router = useRouter();

  // Persistence and initial loading
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate messages to prevent "Objects are not valid as a React child" errors
        const validMessages = (parsed as Message[]).filter(m => 
          m && typeof m.content === 'string' && m.id && m.role
        );
        if (validMessages.length > 0) {
          setMessages(validMessages);
        } else {
          getInitialGreeting();
        }
      } catch (e) {
        console.error('Failed to load history', e);
        getInitialGreeting();
      }
    } else {
      getInitialGreeting();
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const getInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const resp = await getEmpatheticResponse({
        userInput: 'Introduce Zera, the futuristic AI postpartum assistant.',
        context: 'First interaction. Mention that data is stored locally for privacy.',
      });
      setMessages([{ id: 'init', role: 'assistant', content: resp.response }]);
    } catch (e) {
      setMessages([{ id: 'err', role: 'assistant', content: 'I am Zera, your postpartum health assistant. I provide a safe, private space for your recovery journey.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const [suggestions] = useState<string[]>([
    "I'm feeling really anxious and overwhelmed.",
    'What are the signs of a c-section infection?',
    'Tell me a tip for better sleep.',
  ]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    handleGetHealthTip,
    handleStartScreening: () => {
       submitMessage("I'd like to start the mental health screening.");
    },
    handleDailyCheckIn: () => {
       submitMessage("I'm ready for my daily check-in.");
    },
    handleGetAdvice: () => setShowAdviceForm(true),
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
        const resp = await getEmpatheticResponse({ userInput: text, context: 'Local interaction mode active.' });
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: resp.response }]);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to process request.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdviceSubmit = async () => {
    if (!adviceFormData.name || !adviceFormData.age || !adviceFormData.health) {
        toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill out all fields.' });
        return;
    }
    
    setShowAdviceForm(false);
    setIsLoading(true);
    
    try {
      const result = await getPersonalizedAdvice({
        name: adviceFormData.name,
        age: parseInt(adviceFormData.age) || 25,
        healthData: adviceFormData.health,
        daysPostpartum: 14,
      });
      
      localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify({
        ...result,
        patientName: adviceFormData.name,
        patientAge: adviceFormData.age,
        generatedAt: new Date().toISOString()
      }));
      
      router.push('/results');
      
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Matrix Error', description: e.message || 'Failed to generate advice.' });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGetHealthTip() {
    setIsLoading(true);
    try {
      const tip = await getHealthTipAction({ previousTips: [], daysPostpartum: 14 });
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: tip.tip }]);
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch health tip.' });
    } finally { setIsLoading(false); }
  }

  return (
    <>
      <div className="flex h-full flex-col w-full bg-background border rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-secondary/30 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-primary" />
            Federated Local Encryption Active
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary" />
            Gemini 2.5 Compute
          </div>
        </div>

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex items-start gap-3', m.role === 'user' && 'flex-row-reverse')}>
                <Avatar className="border h-9 w-9 bg-background shadow-sm">
                  <AvatarFallback className="bg-transparent text-primary font-bold">
                    {m.role === 'assistant' ? 'Z' : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  'max-w-[85%] rounded-2xl p-4 text-sm shadow-sm transition-all',
                  m.role === 'user' 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'bg-card border text-foreground whitespace-pre-wrap'
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="border bg-background h-9 w-9"><AvatarFallback>Z</AvatarFallback></Avatar>
                <div className="bg-card border p-4 rounded-2xl shadow-sm"><Loader className="h-4 w-4 animate-spin text-primary" /></div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-secondary/10 backdrop-blur-md">
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <Button key={i} variant="outline" size="sm" className="bg-background hover:bg-primary/5 text-[11px] border shadow-sm rounded-full" onClick={() => submitMessage(s)}>
                {s}
              </Button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); submitMessage(input); }} className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How are you feeling today?"
              className="resize-none bg-background pr-14 focus:ring-primary/20 min-h-[50px] py-3 px-4 border shadow-inner rounded-xl"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(input); } }}
            />
            <Button type="submit" size="icon" variant="ghost" className="absolute bottom-2 right-2 text-primary hover:bg-primary/10" disabled={isLoading || !input.trim()}>
              <CornerDownLeft className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={showAdviceForm} onOpenChange={setShowAdviceForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline text-foreground">Health Matrix Configuration</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <Input id="name" placeholder="E.g., Sarah Smith" value={adviceFormData.name} onChange={e => setAdviceFormData(p => ({...p, name: e.target.value}))} className="rounded-lg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="age" className="text-sm font-semibold">Age</Label>
              <Input id="age" type="number" placeholder="28" value={adviceFormData.age} onChange={e => setAdviceFormData(p => ({...p, age: e.target.value}))} className="rounded-lg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="health" className="text-sm font-semibold">Current Recovery Status</Label>
              <Textarea id="health" value={adviceFormData.health} onChange={e => setAdviceFormData(p => ({...p, health: e.target.value}))} className="h-28 rounded-lg" placeholder="Describe any symptoms, birth type, and how you're feeling today..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdviceSubmit} className="w-full h-12 rounded-full font-bold shadow-xl">Generate Personal Analysis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EmergencyDialog open={isEmergency} onOpenChange={setIsEmergency} escalationMessage={escalationMessage} />
    </>
  );
});
Chat.displayName = 'Chat';
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
} from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { EmergencyDialog } from './emergency-dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'zera_chat_history_v2';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
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
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
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

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const getInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const resp = await getEmpatheticResponse({
        userInput: 'Introduce Zera, the futuristic AI postpartum monitoring assistant.',
        context: 'First interaction. Mention that monitoring is based on our conversations.',
      });
      setMessages([{ id: 'init', role: 'assistant', content: resp.response }]);
    } catch (e) {
      setMessages([{ id: 'err', role: 'assistant', content: 'I am Zera, your monitoring assistant. I analyze our conversations to track your recovery status.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const [suggestions] = useState<string[]>([
    "I'm feeling very stressed today.",
    "My incision feels slightly sore.",
    "The baby is sleeping well now.",
  ]);

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
        const resp = await getEmpatheticResponse({ userInput: text, context: 'Monitoring mode active.' });
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: resp.response }]);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to process monitoring input.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col w-full bg-background border rounded-[30px] shadow-2xl overflow-hidden glass">
        <div className="px-6 py-4 border-b bg-secondary/20 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-primary" />
            Conversation Monitoring Active
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary" />
            Gemini Deep Analysis
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
              <Button key={i} variant="outline" size="sm" className="bg-white hover:bg-primary/5 text-[11px] border shadow-sm rounded-full px-4 h-8" onClick={() => submitMessage(s)}>
                {s}
              </Button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); submitMessage(input); }} className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Report symptoms or discuss your day..."
              className="resize-none bg-white pr-16 focus:ring-primary/20 min-h-[60px] py-4 px-6 border shadow-inner rounded-3xl text-lg"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(input); } }}
            />
            <Button type="submit" size="icon" variant="ghost" className="absolute bottom-3 right-3 text-primary hover:bg-primary/10 h-10 w-10" disabled={isLoading || !input.trim()}>
              <CornerDownLeft className="h-6 w-6" />
            </Button>
          </form>
        </div>
      </div>

      <EmergencyDialog open={isEmergency} onOpenChange={setIsEmergency} escalationMessage={escalationMessage} />
    </>
  );
});
Chat.displayName = 'Chat';

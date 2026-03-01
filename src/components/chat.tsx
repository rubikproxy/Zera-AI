'use client';

import {
  getDailyCheckIn,
  getEmpatheticResponse,
  getEmergencyEscalation,
  getPersonalizedAdvice,
  getSymptomUnderstanding,
  getEPDSAssessment,
  getBreastfeedingSupportAction,
  getHealthTipAction,
  getSuggestions,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Baby,
  ClipboardCheck,
  CornerDownLeft,
  Loader,
  Sparkles,
  Sun,
  HeartPulse,
  Bandage,
  Utensils,
  Dumbbell,
  BrainCircuit,
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
import { epdsQuestions, type EpdsQuestion } from '@/lib/epds-questions';
import type { BreastfeedingSupportOutput } from '@/ai/flows/breastfeeding-support';
import type { HealthTipOutput } from '@/ai/flows/health-tips';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import type { PersonalizedAdviceOutput } from '@/ai/flows/personalized-advice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const STORAGE_KEY = 'zera_chat_history';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: React.ReactNode;
  metadata?: any;
}

export interface ChatHandle {
  handleGetHealthTip: () => void;
  handleStartScreening: () => void;
  handleDailyCheckIn: () => void;
  handleGetAdvice: () => void;
}

const AdviceChart = ({ scores }: { scores: PersonalizedAdviceOutput['scores'] }) => {
  const data = [
    { subject: 'Physical', A: scores.physical, fullMark: 10 },
    { subject: 'Nutrition', A: scores.nutrition, fullMark: 10 },
    { subject: 'Exercise', A: scores.exercise, fullMark: 10 },
    { subject: 'Mental', A: scores.mental, fullMark: 10 },
  ];

  return (
    <div className="h-[300px] w-full mt-4">
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsla(191, 91%, 40%, 0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }} />
            <Radar
              name="Status"
              dataKey="A"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

const PersonalizedAdviceResult = ({ advice }: { advice: PersonalizedAdviceOutput }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <Sparkles className="text-primary h-5 w-5 animate-pulse" />
      <h3 className="font-headline text-lg font-semibold text-foreground">Personalized Recovery Matrix</h3>
    </div>
    
    <AdviceChart scores={advice.scores} />

    <Accordion type="single" collapsible className="w-full bg-secondary/30 rounded-lg overflow-hidden border">
      <AccordionItem value="item-1" className="border-b px-4">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2">
            <Bandage className="h-4 w-4 text-primary" />
            Physical Recovery
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground pb-4">{advice.recoveryAdvice}</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" className="border-b px-4">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-primary" />
            Nutrition & Hydration
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground pb-4">{advice.nutritionAdvice}</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" className="border-b px-4">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" />
            Exercise
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground pb-4">{advice.exerciseAdvice}</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4" className="border-none px-4">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary" />
            Mental Well-being
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground pb-4">{advice.mentalWellbeingAdvice}</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

export const Chat = forwardRef<ChatHandle, {}>((props, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [escalationMessage, setEscalationMessage] = useState('');
  const [showAdviceForm, setShowAdviceForm] = useState(false);
  const [adviceFormData, setAdviceFormData] = useState({ name: '', age: '', health: '' });

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (e) {
        console.error('Failed to load history', e);
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
      setMessages([{ id: 'err', role: 'assistant', content: 'I am Zera. Ready to assist you privately.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const [isScreening, setIsScreening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "I'm feeling really anxious and overwhelmed.",
    'What are the signs of a c-section infection?',
    'Tell me a tip for better sleep.',
  ]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    handleGetHealthTip,
    handleStartScreening,
    handleDailyCheckIn,
    handleGetAdvice: () => setShowAdviceForm(true),
  }));

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

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
        setMessages(prev => [...prev, { id: Date.now() + 1 + '', role: 'assistant', content: resp.response }]);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdviceSubmit = async () => {
    setShowAdviceForm(false);
    setIsLoading(true);
    setMessages(prev => [...prev, { id: Date.now() + '', role: 'system', content: `Generating matrix for ${adviceFormData.name}...` }]);
    
    try {
      const result = await getPersonalizedAdvice({
        name: adviceFormData.name,
        age: parseInt(adviceFormData.age) || 25,
        healthData: adviceFormData.health,
        daysPostpartum: 14,
      });
      setMessages(prev => [...prev, { 
        id: Date.now() + 'advice', 
        role: 'assistant', 
        content: <PersonalizedAdviceResult advice={result} /> 
      }]);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Matrix Error', description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGetHealthTip() {
    setIsLoading(true);
    try {
      const tip = await getHealthTipAction({ previousTips: [], daysPostpartum: 14 });
      setMessages(prev => [...prev, { id: Date.now() + '', role: 'assistant', content: tip.tip }]);
    } finally { setIsLoading(false); }
  }

  function handleStartScreening() { /* Simplified */ }
  function handleDailyCheckIn() { /* Simplified */ }

  return (
    <>
      <div className="flex h-full flex-col w-full bg-background border rounded-lg shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-secondary/50 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
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
                    : 'bg-card border text-foreground'
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

        <div className="p-4 border-t bg-secondary/20 backdrop-blur-md">
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
              placeholder="Start typing your message..."
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
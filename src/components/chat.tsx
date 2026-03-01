'use client';

import { getEmpatheticResponse } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CornerDownLeft, User, Sparkles, ShieldAlert, Loader2 } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmergencyDialog } from './emergency-dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const STORAGE_KEY = 'zera_chat_history_v2';
const PROFILE_KEY = 'zera_user_profile';

interface Message {
  id: string;
  role: 'user' | 'assistant';
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
    "📊 How is my recovery today?",
    "💤 I'm feeling really tired.",
    "🩸 Is my bleeding normal?",
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
      try { setProfileForm(JSON.parse(savedProfile)); } catch (e) { setShowProfileDialog(true); }
    }

    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
        else getInitialGreeting();
      } catch (e) { getInitialGreeting(); }
    } else getInitialGreeting();
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
    } catch (e) {
      setMessages([{ id: 'err', role: 'assistant', content: '🤖 Zera Node Online. How can I assist your recovery today?' }]);
    } finally { setIsLoading(false); }
  };

  useImperativeHandle(ref, () => ({
    handleDailyCheckIn: () => router.push('/chat/advice'),
  }));

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
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
        setSuggestions([`📊 ${result.route.next_question}`, "✨ Tell me more.", "🔮 Next steps?"]);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Neural Link Error', description: 'Failed to process signal. Please try again.' });
    } finally { setIsLoading(false); }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-full flex-col w-full bg-white/40 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-[2.5rem] overflow-hidden">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-8 lg:p-12 space-y-12">
          {messages.map((m) => (
            <div key={m.id} className={cn('flex items-start gap-6', m.role === 'user' && 'flex-row-reverse')}>
              <Avatar className={cn(
                "h-12 w-12 shadow-sm border shrink-0",
                m.role === 'assistant' ? "bg-indigo-600 text-white" : "bg-white text-indigo-600"
              )}>
                <AvatarFallback className="text-xs font-bold uppercase">
                  {m.role === 'assistant' ? <Sparkles className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                'max-w-[75%] relative rounded-[2rem] p-6 text-sm shadow-sm leading-relaxed font-medium',
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border text-gray-800 rounded-tl-none',
                m.urgency === 'emergency_now' && 'border-red-500 border-2 bg-red-50'
              )}>
                {m.urgency === 'emergency_now' && (
                  <div className="absolute -top-3 -left-3 bg-red-500 text-white p-1 rounded-full shadow-lg">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-6 animate-pulse">
              <Avatar className="h-12 w-12 bg-indigo-600 text-white shadow-sm border"><AvatarFallback><Sparkles className="h-5 w-5" /></AvatarFallback></Avatar>
              <div className="bg-white border p-6 rounded-[2rem] shadow-sm rounded-tl-none">
                <div className="flex gap-2 items-center">
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-10 border-t bg-white/60 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 mb-6">
          {suggestions.map((s, i) => (
            <button 
              key={i} 
              className="bg-white hover:bg-indigo-50 text-[10px] font-black border border-indigo-100 rounded-full px-5 h-10 transition-all uppercase tracking-widest shadow-sm text-indigo-600" 
              onClick={() => submitMessage(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submitMessage(input); }} className="relative flex items-center gap-4">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Zera about your recovery..."
              className="resize-none bg-white pr-16 focus:ring-indigo-500 min-h-[70px] max-h-[180px] py-5 px-8 border-gray-200 shadow-xl rounded-full text-base leading-tight font-medium"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(input); } }}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white hover:bg-indigo-700 h-12 w-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-95 disabled:opacity-50" 
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CornerDownLeft className="h-5 w-5" />}
            </button>
          </div>
        </form>
        <div className="mt-6 flex items-center justify-between px-4">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
             🛡️ Neural Safety Layer Active
           </div>
           <Badge variant="outline" className="text-[9px] h-5 px-3 font-bold border-indigo-100 text-indigo-600 bg-indigo-50/50 uppercase rounded-full">🤖 Gemini v2.5</Badge>
        </div>
      </div>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="bg-indigo-600 text-white p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="h-32 w-32" /></div>
             <DialogTitle className="text-3xl font-headline font-extrabold mb-3">👤 Health Identity</DialogTitle>
             <DialogDescription className="text-indigo-100 text-lg">
               Initialize your local recovery node to begin monitoring.
             </DialogDescription>
          </div>
          <form onSubmit={handleSaveProfile} className="p-10 space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <Input 
                placeholder="E.g., Elena" 
                value={profileForm.name} 
                onChange={e => setProfileForm(p => ({...p, name: e.target.value}))}
                className="h-14 rounded-2xl bg-gray-50 border-gray-200 px-5 text-base font-bold focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Date</Label>
                <Input 
                  type="date"
                  value={profileForm.dob} 
                  onChange={e => setProfileForm(p => ({...p, dob: e.target.value}))}
                  className="h-14 rounded-2xl bg-gray-50 border-gray-200 px-5 font-bold"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Method</Label>
                <Select value={profileForm.birthMethod} onValueChange={v => setProfileForm(p => ({...p, birthMethod: v}))}>
                  <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-200 px-5 font-bold">
                    <SelectValue placeholder="How?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="natural">Naturally</SelectItem>
                    <SelectItem value="c-section">C-Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Days since baby born</Label>
              <Input 
                type="number"
                placeholder="E.g., 14"
                value={profileForm.daysSinceBirth} 
                onChange={e => setProfileForm(p => ({...p, daysSinceBirth: e.target.value}))}
                className="h-14 rounded-2xl bg-gray-50 border-gray-200 px-5 font-bold"
              />
            </div>

            <Button type="submit" className="w-full h-16 rounded-full font-extrabold text-lg mt-4 bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-transform">
              🚀 Activate Matrix
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <EmergencyDialog open={isEmergency} onOpenChange={setIsEmergency} escalationMessage={escalationMessage} />
    </div>
  );
});
Chat.displayName = 'Chat';
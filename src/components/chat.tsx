'use client';

import { getEmpatheticResponse } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SendHorizonal, User, Sparkles, ShieldAlert, Loader2 } from 'lucide-react';
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
      const contextString = history.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
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
    <div className="flex h-full flex-col w-full bg-[#FAFAF8] relative">
      {/* Messages Viewport */}
      <ScrollArea className="flex-1 w-full" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          {messages.map((m) => (
            <div key={m.id} className={cn('flex items-start gap-4 mb-8', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              {m.role === 'assistant' && (
                <Avatar className="h-9 w-9 border bg-indigo-600 text-white shadow-sm shrink-0">
                  <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                'max-w-[85%] rounded-[1.5rem] px-5 py-3 text-[15px] leading-relaxed',
                m.role === 'user' 
                  ? 'bg-[#F4F4F5] text-black rounded-tr-none' 
                  : 'bg-white border text-black shadow-sm rounded-tl-none',
                m.urgency === 'emergency_now' && 'border-red-500 bg-red-50'
              )}>
                {m.urgency === 'emergency_now' && (
                  <div className="flex items-center gap-2 mb-2 text-red-600 font-bold uppercase text-[10px]">
                    <ShieldAlert className="h-3 w-3" /> Emergency Signal
                  </div>
                )}
                {m.content}
              </div>
              {m.role === 'user' && (
                <Avatar className="h-9 w-9 border bg-white text-gray-400 shadow-sm shrink-0">
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4 animate-pulse">
              <Avatar className="h-9 w-9 bg-indigo-600 text-white shadow-sm border shrink-0"><AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback></Avatar>
              <div className="bg-white border p-4 rounded-[1.5rem] shadow-sm rounded-tl-none">
                <div className="flex gap-1.5 items-center">
                  <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Section - Dashboard Style */}
      <div className="w-full max-w-4xl mx-auto px-6 pb-8 pt-4">
        {/* Suggestion Pills */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {suggestions.map((s, i) => (
            <button 
              key={i} 
              className="bg-white hover:bg-gray-50 text-[11px] font-bold border rounded-full px-4 h-9 transition-all text-gray-700 shadow-sm whitespace-nowrap" 
              onClick={() => submitMessage(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); submitMessage(input); }} 
          className="relative bg-white border shadow-lg rounded-[2rem] overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zera about your recovery..."
            className="resize-none bg-transparent border-none pr-16 focus-visible:ring-0 min-h-[56px] py-4 px-6 text-base font-medium"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(input); } }}
          />
          <button 
            type="submit" 
            className="absolute right-3 bottom-2 bg-indigo-600 text-white hover:bg-indigo-700 h-10 w-10 flex items-center justify-center rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50" 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
          </button>
        </form>
        
        <p className="text-center text-[10px] text-gray-400 font-medium mt-3">
          Zera is an AI assistant. Review clinical guidance with your healthcare provider.
        </p>
      </div>

      {/* Profile Setup Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="bg-indigo-600 text-white p-10 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="h-32 w-32" /></div>
             <DialogTitle className="text-2xl font-headline font-black mb-2">👤 Health Identity</DialogTitle>
             <DialogDescription className="text-indigo-100 text-sm">
               Initialize your local recovery node to begin monitoring.
             </DialogDescription>
          </div>
          <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <Input 
                placeholder="E.g., Elena" 
                value={profileForm.name} 
                onChange={e => setProfileForm(p => ({...p, name: e.target.value}))}
                className="h-12 rounded-xl bg-gray-50 border-gray-200 px-4 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Date</Label>
                <Input 
                  type="date"
                  value={profileForm.dob} 
                  onChange={e => setProfileForm(p => ({...p, dob: e.target.value}))}
                  className="h-12 rounded-xl bg-gray-50 border-gray-200 px-4 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Method</Label>
                <Select value={profileForm.birthMethod} onValueChange={v => setProfileForm(p => ({...p, birthMethod: v}))}>
                  <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200 px-4 font-bold">
                    <SelectValue placeholder="How?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="natural">Naturally</SelectItem>
                    <SelectItem value="c-section">C-Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Days since baby born</Label>
              <Input 
                type="number"
                placeholder="E.g., 14"
                value={profileForm.daysSinceBirth} 
                onChange={e => setProfileForm(p => ({...p, daysSinceBirth: e.target.value}))}
                className="h-12 rounded-xl bg-gray-50 border-gray-200 px-4 font-bold"
              />
            </div>

            <Button type="submit" className="w-full h-14 rounded-full font-bold text-lg mt-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg">
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

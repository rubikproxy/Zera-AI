'use client';

import { getEmpatheticResponse } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, SendHorizontal, ShieldAlert, Sparkles, User, Settings2 } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmergencyDialog } from './emergency-dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const DEFAULT_SUGGESTIONS = [
  'How is my recovery today?',
  "I'm feeling really tired.",
  'Is my bleeding normal?',
  'Breastfeeding is painful — can you help?',
  "I feel anxious and overwhelmed.",
];

export const Chat = forwardRef<ChatHandle, {}>(function Chat(_props, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isEmergency, setIsEmergency] = useState(false);
  const [escalationMessage, setEscalationMessage] = useState('');

  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);

  const [profileForm, setProfileForm] = useState({
    name: '',
    dob: '',
    phone: '',
    email: '',
    birthMethod: '',
    daysSinceBirth: '',
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const last10Context = useMemo(() => {
    const slice = messages.slice(-10);
    return slice.map((m) => `${m.role}: ${m.content}`).join('\n');
  }, [messages]);

  useImperativeHandle(ref, () => ({
    handleDailyCheckIn: () => router.push('/chat/advice'),
  }));

  useEffect(() => {
    setMounted(true);
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (!savedProfile) {
      setShowProfileDialog(true);
    } else {
      try {
        setProfileForm(JSON.parse(savedProfile));
      } catch {
        setShowProfileDialog(true);
      }
    }

    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch { /* ignore */ }
    }

    void getInitialGreeting();
  }, []);

  useEffect(() => {
    const root = scrollAreaRef.current;
    if (!root) return;
    const viewport = root.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const persistHistory = (next: Message[]) => {
    setMessages(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const getInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const resp = await getEmpatheticResponse({
        userInput: 'Initialize Zera AI Postpartum Monitoring Node.',
        context: 'First session start.',
        language: 'English',
      });
      persistHistory([{ id: 'init', role: 'assistant', content: resp.response }]);
    } catch {
      persistHistory([{ id: 'init_fallback', role: 'assistant', content: "Hi, I’m Zera. I’m here to support your postpartum recovery. How are you feeling today?" }]);
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.birthMethod || !profileForm.daysSinceBirth) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill in name, birth method, and days since birth.' });
      return;
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileForm));
    setShowProfileDialog(false);
    if (messages.length === 0) void getInitialGreeting();
  };

  const submitMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setIsLoading(true);
    const userMsg: Message = { id: `${Date.now()}`, role: 'user', content: trimmed };
    const history = [...messages, userMsg];
    persistHistory(history);
    setInput('');

    try {
      const result = await getEmpatheticResponse({
        userInput: trimmed,
        context: last10Context ? `${last10Context}\nuser: ${trimmed}` : `user: ${trimmed}`,
        language: 'English',
      });

      if (result?.route?.urgency === 'emergency_now') {
        setEscalationMessage(result.response);
        setIsEmergency(true);
      }

      const assistantMsg: Message = {
        id: `${Date.now() + 1}`,
        role: 'assistant',
        content: result.response,
        urgency: result?.route?.urgency,
      };

      const finalHistory = [...history, assistantMsg];
      persistHistory(finalHistory);

      const nextQ = result?.route?.next_question?.trim();
      setSuggestions(nextQ ? [nextQ, 'Tell me more.', ...DEFAULT_SUGGESTIONS.slice(0, 3)] : DEFAULT_SUGGESTIONS);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate response.' });
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submitMessage(input);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-full w-full flex-col bg-[#FAFAF8] relative">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="mx-auto w-full max-w-3xl px-6 py-12">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-16 w-16 bg-white rounded-3xl shadow-xl flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-black uppercase tracking-tight">AI <span className="text-indigo-600">ZERA</span></h1>
                <p className="text-gray-500 font-medium">Your personal postpartum monitoring assistant.</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              const isEmergencyMsg = m.urgency === 'emergency_now';

              return (
                <div key={m.id} className={cn('flex w-full gap-4', isUser ? 'justify-end' : 'justify-start')}>
                  {!isUser && (
                    <Avatar className="h-10 w-10 border-none shadow-sm shrink-0">
                      <AvatarFallback className="bg-indigo-600 text-white">
                        <Sparkles className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn('max-w-[85%] flex-1', isUser && 'flex justify-end')}>
                    <div className={cn(
                      'rounded-3xl px-5 py-4 text-[15px] leading-relaxed shadow-sm',
                      isUser ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 border border-gray-100',
                      isEmergencyMsg && 'border-red-500 bg-red-50 text-black'
                    )}>
                      {isEmergencyMsg && (
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-[10px] font-black uppercase text-red-700">
                          <ShieldAlert className="h-3 w-3" />
                          Emergency
                        </div>
                      )}
                      {m.content}
                    </div>
                  </div>

                  {isUser && (
                    <Avatar className="h-10 w-10 border-none shadow-sm shrink-0">
                      <AvatarFallback className="bg-gray-900 text-white">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex w-full justify-start gap-4">
                <Avatar className="h-10 w-10 border-none shadow-sm shrink-0">
                  <AvatarFallback className="bg-indigo-600 text-white animate-pulse">
                    <Sparkles className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="inline-flex items-center gap-2 rounded-3xl border bg-white px-5 py-4 text-sm font-medium text-gray-500 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  Zera is reasoning…
                </div>
              </div>
            )}
          </div>
          <div className="h-32" />
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 z-10 bg-gradient-to-t from-[#FAFAF8] via-[#FAFAF8] to-transparent pt-8">
        <div className="mx-auto w-full max-w-3xl px-6 pb-8">
          <div className="mb-4 flex flex-wrap gap-2 justify-center">
            {suggestions.map((s, i) => (
              <button
                key={`${s}-${i}`}
                type="button"
                onClick={() => void submitMessage(s)}
                className="rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-xs font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); void submitMessage(input); }} className="relative">
            <div className="flex items-end gap-3 rounded-[32px] border border-gray-200 bg-white p-3 shadow-2xl focus-within:ring-2 focus-within:ring-indigo-500/10">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Message Zera Assistant…"
                className="min-h-[48px] max-h-[200px] resize-none border-none bg-transparent px-4 py-3 text-[15px] font-medium text-black focus-visible:ring-0 custom-scrollbar"
              />
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 rounded-2xl bg-black hover:bg-indigo-600 transition-all shrink-0 shadow-lg"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <SendHorizontal className="h-6 w-6" />}
              </Button>
            </div>
            <div className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Health Monitoring based on Conversation
            </div>
          </form>
        </div>
      </div>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-black px-10 py-10 text-white">
            <div className="bg-white/10 w-fit p-3 rounded-2xl mb-4">
              <Settings2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight">Set up Identity</DialogTitle>
            <DialogDescription className="mt-2 text-gray-400 font-medium">
              Initialize your local node for monitoring.
            </DialogDescription>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-6 p-10">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black">Full Name</Label>
              <Input placeholder="Elena" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black">Birth Date</Label>
                <Input type="date" value={profileForm.dob} onChange={(e) => setProfileForm((p) => ({ ...p, dob: e.target.value }))} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black">Method</Label>
                <Select value={profileForm.birthMethod} onValueChange={(v) => setProfileForm((p) => ({ ...p, birthMethod: v }))}>
                  <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Naturally</SelectItem>
                    <SelectItem value="c-section">C-section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black">Days since baby born</Label>
              <Input type="number" placeholder="10" value={profileForm.daysSinceBirth} onChange={(e) => setProfileForm((p) => ({ ...p, daysSinceBirth: e.target.value }))} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
            </div>
            <Button type="submit" className="w-full h-14 bg-black hover:bg-indigo-600 rounded-full font-black uppercase tracking-widest transition-all">
              Initialize Node
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <EmergencyDialog open={isEmergency} onOpenChange={setIsEmergency} escalationMessage={escalationMessage} />
    </div>
  );
});

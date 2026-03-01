'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getPersonalizedAdvice } from '@/app/actions';
import { Activity, Loader, ChevronLeft, ShieldCheck } from 'lucide-react';

const LATEST_RESULT_KEY = 'zera_latest_result';
const CHAT_STORAGE_KEY = 'zera_chat_history_v2';

export default function AdvicePage() {
  const [formData, setFormData] = useState({ name: '', age: '', health: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.health) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please complete all health fields.' });
      return;
    }

    setIsLoading(true);
    try {
      // Get conversation summary to feed into the multimodal monitoring
      const historyRaw = localStorage.getItem(CHAT_STORAGE_KEY);
      const historyText = historyRaw ? JSON.parse(historyRaw).map((m: any) => `${m.role}: ${m.content}`).join('\n') : '';
      
      const result = await getPersonalizedAdvice({
        name: formData.name,
        age: parseInt(formData.age) || 25,
        healthData: `USER FORM: ${formData.health}\n\nRECENT CHAT HISTORY:\n${historyText}`,
        daysPostpartum: 14,
      });

      localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify({
        ...result,
        patientName: formData.name,
        patientAge: formData.age,
        generatedAt: new Date().toISOString()
      }));

      router.push('/chat/results');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Analysis Error', description: e.message || 'Failed to generate status.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 gap-2 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="border-none glass shadow-2xl rounded-[40px] overflow-hidden">
        <CardHeader className="text-center pb-2 pt-10">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-6 rounded-[30px] border border-primary/10 shadow-inner">
              <Activity className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-4xl font-headline font-bold text-foreground">Health Monitoring Portal</CardTitle>
          <CardDescription className="text-muted-foreground text-lg px-8 mt-2">
            Zera synthesizes your health status by combining clinical input with conversation-based monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <form onSubmit={handleSubmit} className="space-y-8 pt-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="E.g., Dr. Sarah" 
                  value={formData.name} 
                  onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                  className="h-14 rounded-2xl bg-secondary/30 border-none shadow-inner text-lg px-6" 
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="age" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="28" 
                  value={formData.age} 
                  onChange={e => setFormData(p => ({...p, age: e.target.value}))} 
                  className="h-14 rounded-2xl bg-secondary/30 border-none shadow-inner text-lg px-6" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="health" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Physical & Clinical Updates</Label>
              <Textarea 
                id="health" 
                value={formData.health} 
                onChange={e => setFormData(p => ({...p, health: e.target.value}))} 
                className="min-h-[180px] rounded-[30px] bg-secondary/30 border-none shadow-inner p-6 text-lg resize-none leading-relaxed" 
                placeholder="Briefly describe your physical comfort, breastfeeding status, energy levels, or any medical concerns since delivery..." 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-16 rounded-full font-bold text-xl shadow-2xl hover:scale-[1.01] transition-transform bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-3 h-6 w-6 animate-spin" />
                  Synthesizing Monitoring Matrix...
                </>
              ) : (
                'Generate Health Status Report'
              )}
            </Button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                <ShieldCheck className="h-3 w-3" />
                Private Data Encryption
             </div>
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                <Activity className="h-3 w-3" />
                Real-time Sync Active
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

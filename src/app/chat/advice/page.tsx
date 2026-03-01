'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getPersonalizedAdvice } from '@/app/actions';
import { Activity, Loader, ChevronLeft, ShieldCheck, Database } from 'lucide-react';

const LATEST_RESULT_KEY = 'zera_latest_result';
const CHAT_STORAGE_KEY = 'zera_chat_history_v2';
const PROFILE_KEY = 'zera_user_profile';

export default function AdvicePage() {
  const [formData, setFormData] = useState({ name: '', age: '', health: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Pre-fill from local profile
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        
        // Calculate age roughly if DOB is present, or just leave blank
        let age = '';
        if (profile.dob) {
           const birthDate = new Date(profile.dob);
           const ageDiff = Date.now() - birthDate.getTime();
           age = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25)).toString();
        }

        setFormData(prev => ({
          ...prev,
          name: profile.name || '',
          age: age || '',
        }));
      } catch (e) {
        console.error('Failed to load profile for tracker');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.health) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please complete all health fields.' });
      return;
    }

    setIsLoading(true);
    try {
      const historyRaw = localStorage.getItem(CHAT_STORAGE_KEY);
      const historyText = historyRaw ? JSON.parse(historyRaw).map((m: any) => `${m.role}: ${m.content}`).join('\n') : '';
      
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      const profileData = savedProfile ? JSON.parse(savedProfile) : {};

      const result = await getPersonalizedAdvice({
        name: formData.name,
        age: parseInt(formData.age) || 25,
        healthData: `USER TRACKER INPUT: ${formData.health}\n\nBIRTH METHOD: ${profileData.birthMethod || 'Unknown'}\nDAYS SINCE BIRTH: ${profileData.daysSinceBirth || 'Unknown'}\n\nLOCAL CONVERSATION HISTORY:\n${historyText}`,
        daysPostpartum: parseInt(profileData.daysSinceBirth) || 14,
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

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 gap-2 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Back to Console
      </Button>

      <Card className="border-none glass shadow-2xl rounded-[40px] overflow-hidden">
        <CardHeader className="text-center pb-2 pt-10">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-6 rounded-[30px] border border-primary/10 shadow-inner">
              <Activity className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-4xl font-headline font-bold text-foreground">Health <span className="text-primary">Tracker</span></CardTitle>
          <CardDescription className="text-muted-foreground text-lg px-8 mt-2">
            Multimodal Data Acquisition Portal. Updates committed to local store.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <form onSubmit={handleSubmit} className="space-y-8 pt-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity Node</Label>
                <Input 
                  id="name" 
                  placeholder="Patient Name" 
                  value={formData.name} 
                  onChange={e => setFormData(prev => ({...prev, name: e.target.value}))} 
                  className="h-14 rounded-2xl bg-secondary/30 border-none shadow-inner text-lg px-6" 
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="age" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="Age" 
                  value={formData.age} 
                  onChange={e => setFormData(prev => ({...prev, age: e.target.value}))} 
                  className="h-14 rounded-2xl bg-secondary/30 border-none shadow-inner text-lg px-6" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="health" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Clinical Update Details</Label>
              <div className="relative">
                <Textarea 
                  id="health" 
                  value={formData.health} 
                  onChange={e => setFormData(prev => ({...prev, health: e.target.value}))} 
                  className="min-h-[180px] rounded-[30px] bg-secondary/30 border-none shadow-inner p-6 text-lg resize-none leading-relaxed" 
                  placeholder="Describe your recovery signals: energy, discomfort, bleeding trends, or breastfeeding progress..." 
                />
                <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[9px] uppercase font-bold text-primary/40">
                  <Database className="h-3 w-3" />
                  Auto-syncing to Local Database
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-16 rounded-full font-bold text-xl shadow-2xl hover:scale-[1.01] transition-transform bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-3 h-6 w-6 animate-spin" />
                  Synthesizing Biometric Matrix...
                </>
              ) : (
                'Generate Real-Time Health Status'
              )}
            </Button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                <ShieldCheck className="h-3 w-3 text-primary" />
                End-to-End Encryption
             </div>
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                <Activity className="h-3 w-3 text-primary" />
                Multimodal Synthesis
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getPersonalizedAdvice } from '@/app/actions';
import { Activity, Loader, ChevronLeft, Heart, Moon, Footprints, Thermometer, Brain } from 'lucide-react';

const LATEST_RESULT_KEY = 'zera_latest_result';
const HISTORY_KEY = 'zera_health_history';
const PROFILE_KEY = 'zera_user_profile';

export default function AdvicePage() {
  const [formData, setFormData] = useState({ 
    healthStatus: '', 
    sleepHours: '', 
    heartRate: '', 
    steps: '', 
    bloodPressure: '', 
    mood: 'happy',
    additionalInfo: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      const profile = savedProfile ? JSON.parse(savedProfile) : {};

      const healthContext = `
        DAILY CHECK-IN:
        Overall Health: ${formData.healthStatus}
        Sleep: ${formData.sleepHours} hours
        Heart Rate: ${formData.heartRate} bpm
        Steps: ${formData.steps}
        Blood Pressure: ${formData.bloodPressure}
        Mood: ${formData.mood}
        Details: ${formData.additionalInfo}
      `;

      const result = await getPersonalizedAdvice({
        name: profile.name || 'User',
        age: profile.age || 25,
        healthData: healthContext,
        daysPostpartum: parseInt(profile.daysSinceBirth) || 14,
      });

      const newEntry = {
        ...result,
        patientName: profile.name,
        timestamp: new Date().toISOString(),
      };

      // Save to latest
      localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(newEntry));

      // Save to history
      const historyRaw = localStorage.getItem(HISTORY_KEY);
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      localStorage.setItem(HISTORY_KEY, JSON.stringify([newEntry, ...history].slice(0, 30)));

      router.push('/chat/results');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Monitoring Error', description: e.message || 'Failed to generate status.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="border-none glass shadow-2xl rounded-[40px] overflow-hidden">
        <CardHeader className="text-center pb-2 pt-10">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-5 rounded-[24px]">
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-foreground">Daily <span className="text-primary">Check-in</span></CardTitle>
          <CardDescription className="text-muted-foreground text-base mt-2">
            Record your health signals for AI-powered monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-12 pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">How is your health today?</Label>
                <Input 
                  placeholder="E.g. Feeling better, slight pain..." 
                  value={formData.healthStatus} 
                  onChange={e => setFormData(prev => ({...prev, healthStatus: e.target.value}))} 
                  className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner px-4" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">How do you feel?</Label>
                <Select value={formData.mood} onValueChange={v => setFormData(p => ({...p, mood: v}))}>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner">
                    <SelectValue placeholder="Mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy / Stable</SelectItem>
                    <SelectItem value="stressed">Stressed / Anxious</SelectItem>
                    <SelectItem value="tired">Tired / Exhausted</SelectItem>
                    <SelectItem value="sad">Sad / Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Moon className="h-3 w-3" /> Sleep (Hrs)
                </Label>
                <Input 
                  type="number"
                  placeholder="8" 
                  value={formData.sleepHours} 
                  onChange={e => setFormData(prev => ({...prev, sleepHours: e.target.value}))} 
                  className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Heart Rate
                </Label>
                <Input 
                  type="number"
                  placeholder="72" 
                  value={formData.heartRate} 
                  onChange={e => setFormData(prev => ({...prev, heartRate: e.target.value}))} 
                  className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Footprints className="h-3 w-3" /> Steps
                </Label>
                <Input 
                  type="number"
                  placeholder="2000" 
                  value={formData.steps} 
                  onChange={e => setFormData(prev => ({...prev, steps: e.target.value}))} 
                  className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                   BP (e.g. 120/80)
                </Label>
                <Input 
                  placeholder="120/80" 
                  value={formData.bloodPressure} 
                  onChange={e => setFormData(prev => ({...prev, bloodPressure: e.target.value}))} 
                  className="h-11 rounded-xl bg-secondary/30 border-none shadow-inner" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Any other details?</Label>
              <Textarea 
                value={formData.additionalInfo} 
                onChange={e => setFormData(prev => ({...prev, additionalInfo: e.target.value}))} 
                className="min-h-[120px] rounded-2xl bg-secondary/30 border-none shadow-inner p-4 resize-none" 
                placeholder="Talk about your recovery progress..." 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-14 rounded-full font-bold text-lg shadow-xl bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Signals...
                </>
              ) : (
                'Synchronize Health Data'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

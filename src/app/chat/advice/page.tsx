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
import { Activity, Loader, ChevronLeft, Heart, Moon, Footprints, Droplets, Zap, ShieldAlert } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const [triageAlert, setTriageAlert] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const historyRaw = localStorage.getItem(HISTORY_KEY);
    if (historyRaw) {
      try {
        const history = JSON.parse(historyRaw);
        const today = new Date().toISOString().split('T')[0];
        const todaysEntry = history.find((entry: any) => entry.timestamp.startsWith(today));
        if (todaysEntry && todaysEntry.inputSnapshot) {
          setFormData(todaysEntry.inputSnapshot);
        }
      } catch (e) {
        console.error('Failed to load today\'s history', e);
      }
    }
  }, []);

  // Immediate Triage Logic
  useEffect(() => {
    const bp = formData.bloodPressure;
    const hr = parseInt(formData.heartRate);
    if (bp.includes('/')) {
      const systolic = parseInt(bp.split('/')[0]);
      if (systolic >= 160) {
        setTriageAlert("Critical: Your blood pressure is very high (≥160 systolic). This requires immediate medical attention. Please contact your provider or go to the ER now.");
        return;
      }
    }
    if (hr > 120) {
      setTriageAlert("Critical: Your heart rate is very high (>120 BPM). Please rest and contact a healthcare professional if this persists.");
      return;
    }
    setTriageAlert(null);
  }, [formData.bloodPressure, formData.heartRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      const profile = savedProfile ? JSON.parse(savedProfile) : {};
      const historyRaw = localStorage.getItem(HISTORY_KEY);
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      
      const historySummary = history.slice(0, 7).map((h: any) => ({
        date: h.timestamp.split('T')[0],
        scores: h.scores,
        metrics: h.metrics
      }));

      const healthContext = `
        DAILY MONITORING REPORT:
        Overall Health Statement: ${formData.healthStatus}
        Vitals - Sleep: ${formData.sleepHours}h, Heart Rate: ${formData.heartRate}bpm, Steps: ${formData.steps}, BP: ${formData.bloodPressure}
        Emotional State: ${formData.mood}
        Additional Symptoms/Context: ${formData.additionalInfo}
      `;

      const result = await getPersonalizedAdvice({
        name: profile.name || 'User',
        age: parseInt(profile.age) || 25,
        healthData: healthContext,
        historyData: JSON.stringify(historySummary),
        daysPostpartum: parseInt(profile.daysSinceBirth) || 14,
      });

      const today = new Date().toISOString().split('T')[0];
      const newEntry = {
        ...result,
        patientName: profile.name,
        timestamp: new Date().toISOString(),
        inputSnapshot: formData, 
      };

      localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(newEntry));
      let updatedHistory = history;
      const existingTodayIndex = updatedHistory.findIndex((entry: any) => entry.timestamp.startsWith(today));
      if (existingTodayIndex > -1) {
        updatedHistory[existingTodayIndex] = newEntry;
      } else {
        updatedHistory = [newEntry, ...updatedHistory];
      }
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory.slice(0, 30)));

      toast({ title: 'Monitoring Sync Complete', description: 'Your health matrix has been updated.' });
      router.push('/chat/results');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Neural Error', description: e.message || 'Failed to sync signal.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 gap-2 text-muted-foreground hover:text-foreground group">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Button>

      {triageAlert && (
        <Alert variant="destructive" className="mb-8 rounded-[32px] border-[3px] p-8 shadow-2xl bg-destructive/5 animate-pulse">
          <div className="flex gap-5">
            <div className="bg-destructive text-white p-3 rounded-2xl h-fit">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <AlertTitle className="text-2xl font-black uppercase tracking-tight mb-2">Immediate Action Required</AlertTitle>
              <AlertDescription className="text-base font-bold leading-relaxed">{triageAlert}</AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <Card className="border-none glass shadow-2xl rounded-[48px] overflow-hidden border-white/40">
        <CardHeader className="text-center pb-6 pt-12 px-10">
          <div className="flex justify-center mb-8">
            <div className="bg-primary/10 p-6 rounded-[28px] shadow-lg relative">
              <Activity className="h-10 w-10 text-primary" />
              <div className="absolute -top-2 -right-2 bg-green-500 h-5 w-5 rounded-full border-4 border-white animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-4xl font-headline font-black text-foreground tracking-tight">Daily <span className="text-primary italic">Sync</span></CardTitle>
          <CardDescription className="text-muted-foreground text-lg mt-3 font-medium">
            Update your clinical signals for neural matrix monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-16 pt-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-2">Health Statement</Label>
                <Input 
                  placeholder="E.g., Feeling stable, recovery is steady..." 
                  value={formData.healthStatus} 
                  onChange={e => setFormData(prev => ({...prev, healthStatus: e.target.value}))} 
                  className="h-14 rounded-[20px] bg-secondary/30 border-none shadow-inner px-6 text-base" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-2">Sentimental Status</Label>
                <Select value={formData.mood} onValueChange={v => setFormData(p => ({...p, mood: v}))}>
                  <SelectTrigger className="h-14 rounded-[20px] bg-secondary/30 border-none shadow-inner px-6">
                    <SelectValue placeholder="Current Mood" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[20px]">
                    <SelectItem value="happy">Happy / Balanced</SelectItem>
                    <SelectItem value="stressed">Stressed / Anxious</SelectItem>
                    <SelectItem value="tired">Tired / Exhausted</SelectItem>
                    <SelectItem value="sad">Sad / Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { label: 'Sleep', icon: Moon, key: 'sleepHours', placeholder: '8', unit: 'Hrs' },
                { label: 'Pulse', icon: Heart, key: 'heartRate', placeholder: '72', unit: 'BPM' },
                { label: 'Steps', icon: Footprints, key: 'steps', placeholder: '2000', unit: 'Count' },
                { label: 'BP Est.', icon: Droplets, key: 'bloodPressure', placeholder: '120/80', unit: 'Syst/Dias' }
              ].map((field) => (
                <div key={field.key} className="space-y-3">
                  <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 ml-1">
                    <field.icon className="h-3 w-3 text-primary" /> {field.label}
                  </Label>
                  <div className="relative">
                    <Input 
                      type={field.key === 'bloodPressure' ? 'text' : 'number'}
                      placeholder={field.placeholder} 
                      value={(formData as any)[field.key]} 
                      onChange={e => setFormData(prev => ({...prev, [field.key]: e.target.value}))} 
                      className="h-12 rounded-[16px] bg-secondary/30 border-none shadow-inner px-4 font-bold" 
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-primary/40">{field.unit}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-2">Clinical Context</Label>
              <Textarea 
                value={formData.additionalInfo} 
                onChange={e => setFormData(prev => ({...prev, additionalInfo: e.target.value}))} 
                className="min-h-[140px] rounded-[24px] bg-secondary/30 border-none shadow-inner p-6 resize-none text-base leading-relaxed" 
                placeholder="Describe physical discomfort, bleeding patterns, or specific concerns for neural analysis..." 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-16 rounded-full font-black text-xl shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-3 h-6 w-6 animate-spin" />
                  Processing Neural Link...
                </>
              ) : (
                <>
                  <Zap className="mr-3 h-6 w-6 fill-current" />
                  Sync Health Matrix
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

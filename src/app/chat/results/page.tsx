'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Activity,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const LATEST_RESULT_KEY = 'zera_latest_result';
const HISTORY_KEY = 'zera_health_history';

interface TrendAlert {
  severity: 'low' | 'medium' | 'high' | 'emergency';
  title: string;
  message: string;
  action: string;
}

interface HealthResult {
  patientName: string;
  timestamp: string;
  recoveryAdvice: string;
  nutritionAdvice: string;
  exerciseAdvice: string;
  mentalWellbeingAdvice: string;
  trendAlerts?: TrendAlert[];
  metrics: {
    heartRate: number;
    bloodPressure: string;
    sleepHours: number;
    steps: number;
    stressLevel: 'Stress' | 'No Stress';
    nutritionStatus: string;
  };
  scores: {
    physical: number;
    nutrition: number;
    exercise: number;
    mental: number;
  };
}

const RadarAnalysis = ({ scores }: { scores: HealthResult['scores'] }) => {
  if (!scores) return null;
  const data = [
    { subject: 'Physical', A: scores.physical || 0, fullMark: 10 },
    { subject: 'Nutrition', A: scores.nutrition || 0, fullMark: 10 },
    { subject: 'Exercise', A: scores.exercise || 0, fullMark: 10 },
    { subject: 'Mental', A: scores.mental || 0, fullMark: 10 },
  ];

  return (
    <div className="h-[320px] w-full">
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsla(191, 91%, 40%, 0.15)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'black', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Radar
              name="Index"
              dataKey="A"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={3}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

const HistoryTrend = ({ history }: { history: any[] }) => {
  if (!history || history.length < 2) {
    return (
      <div className="h-[240px] flex flex-col items-center justify-center text-black/40 text-center gap-3 bg-secondary/50 rounded-[32px] border border-dashed p-8">
        <TrendingUp className="h-8 w-8 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black">🤔 Trend Data Pending</p>
      </div>
    );
  }
  
  const data = history.slice(0, 7).reverse().map((entry) => ({
    name: new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
    physical: entry.scores?.physical || 0,
    mental: entry.scores?.mental || 0,
  }));

  return (
    <div className="h-[240px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            style={{ fontSize: '10px', fontWeight: 'bold', fill: 'black' }} 
          />
          <YAxis hide domain={[0, 10]} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #eee', padding: '16px' }} 
            labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', color: 'black' }}
          />
          <Line type="monotone" dataKey="physical" stroke="black" strokeWidth={4} dot={{ r: 6, fill: 'white' }} />
          <Line type="monotone" dataKey="mental" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="6 6" dot={{ r: 4, fill: 'white' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function ResultsPage() {
  const [result, setResult] = useState<HealthResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(LATEST_RESULT_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    
    if (saved) {
      try { setResult(JSON.parse(saved)); } catch (e) {}
    }
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }
  }, []);

  if (!mounted) return null;

  if (!result) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-8 max-w-lg p-12 glass rounded-[48px] shadow-2xl">
          <Activity className="h-20 w-20 text-black mx-auto animate-pulse" />
          <h1 className="text-4xl font-headline font-black text-black uppercase">🤔 No Status</h1>
          <Button onClick={() => router.push('/chat/advice')} className="w-full h-16 rounded-full font-black text-xl bg-black text-white hover:bg-black/90 uppercase tracking-widest">
            🚀 Start Check-in
          </Button>
        </div>
      </div>
    );
  }

  const sortedAlerts = result.trendAlerts?.sort((a, b) => {
    const order = { emergency: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  }) || [];

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <Button variant="ghost" onClick={() => router.push('/chat')} className="gap-2 -ml-3 mb-2 text-black/60 hover:text-black">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl md:text-5xl font-headline font-black text-black tracking-tight uppercase">Health <span className="text-primary italic">Status</span></h1>
          <p className="text-black/60 font-medium mt-1">Status for <span className="text-black font-bold">{result.patientName}</span></p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {sortedAlerts.length > 0 && (
          <div className="lg:col-span-12 space-y-4">
            {sortedAlerts.map((alert, idx) => (
              <Alert 
                key={idx} 
                variant={alert.severity === 'emergency' || alert.severity === 'high' ? 'destructive' : 'default'}
                className={cn(
                  "border-l-[6px] shadow-xl rounded-[28px] p-8",
                  alert.severity === 'emergency' && "border-l-red-600 bg-red-50",
                  alert.severity === 'high' && "border-l-orange-500 bg-orange-50"
                )}
              >
                <div className="flex items-start gap-6">
                  <div className="p-4 rounded-[20px] bg-black text-white shadow-lg">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <AlertTitle className="font-headline font-black text-2xl text-black uppercase">⚠️ {alert.title}</AlertTitle>
                    <AlertDescription className="text-base text-black font-medium">{alert.message}</AlertDescription>
                    <div className="mt-5 text-sm font-black uppercase tracking-tight text-black">
                      🎯 Action: <span className="text-primary">{alert.action}</span>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { label: 'Heart Rate', value: result.metrics?.heartRate, unit: 'BPM', emoji: '❤️' },
             { label: 'Sleep', value: result.metrics?.sleepHours, unit: 'HRS', emoji: '💤' },
             { label: 'Steps', value: result.metrics?.steps ? (result.metrics.steps / 1000).toFixed(1) : '--', unit: 'K', emoji: '👣' },
             { label: 'Blood Pressure', value: result.metrics?.bloodPressure, unit: 'EST', emoji: '🩺' }
           ].map((m, i) => (
             <Card key={i} className="border-none glass shadow-xl rounded-[32px] p-8 text-center transition-all hover:-translate-y-1">
                <div className="text-4xl mb-6">{m.emoji}</div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40">{m.label}</span>
                  <div className="text-4xl font-black text-black">{m.value || '--'}</div>
                  <span className="text-[10px] font-black text-black/40 uppercase">{m.unit}</span>
                </div>
             </Card>
           ))}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none glass shadow-xl rounded-[48px] text-center p-12 transition-all hover:-translate-y-1">
               <div className="text-8xl mb-8 drop-shadow-sm">{result.metrics?.stressLevel === 'Stress' ? '🌪️' : '✨'}</div>
               <h2 className="text-4xl font-black text-black uppercase tracking-tight mb-4">{result.metrics?.stressLevel || 'Unknown'}</h2>
               <Badge className="px-6 py-2 uppercase text-[10px] font-black bg-black text-white rounded-full border-none">Inferred Stress</Badge>
          </Card>

          <Card className="border-none glass shadow-xl rounded-[40px] p-8">
            <CardHeader className="pb-0 pt-0 px-0 mb-4">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-black">📊 Recovery Index</CardTitle>
            </CardHeader>
            <RadarAnalysis scores={result.scores} />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {Object.entries(result.scores).map(([key, val]) => (
                <div key={key} className="p-3 bg-secondary/30 rounded-[16px] text-center">
                  <div className="text-[9px] font-black uppercase text-black/40">{key}</div>
                  <div className="text-lg font-bold text-black">{val}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none glass shadow-xl rounded-[40px] p-10">
             <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-black">📈 7D Recovery Trend</CardTitle>
             <HistoryTrend history={history} />
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
             {[
               { title: 'Recovery Advice', advice: result.recoveryAdvice, emoji: '🧠' },
               { title: 'Activity Plan', advice: result.exerciseAdvice, emoji: '🏃‍♀️' }
             ].map((box, i) => (
               <Card key={i} className="border-none glass shadow-xl p-8 rounded-[40px] flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                     <div className="bg-black text-white p-3 rounded-[18px]">
                        <span className="text-xl">{box.emoji}</span>
                     </div>
                     <h4 className="font-headline font-black text-xl text-black uppercase">{box.title}</h4>
                  </div>
                  <p className="text-sm text-black font-medium leading-relaxed">{box.advice}</p>
               </Card>
             ))}
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              { id: 'nutrition', title: '🍎 Nutrition Matrix', content: result.nutritionAdvice },
              { id: 'mental', title: '🧘‍♀️ Mental Wellbeing', content: result.mentalWellbeingAdvice }
            ].map((acc) => (
              <AccordionItem key={acc.id} value={acc.id} className="border-none glass rounded-[32px] overflow-hidden px-2 shadow-lg">
                <AccordionTrigger className="hover:no-underline py-6 px-6 [&>svg]:text-black">
                  <span className="font-headline text-2xl font-black text-black uppercase">{acc.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 text-black font-medium leading-relaxed">
                  {acc.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

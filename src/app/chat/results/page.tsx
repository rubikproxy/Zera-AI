'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Moon,
  Brain,
  ChevronLeft,
  Activity,
  Droplets,
  Clock,
  Footprints,
  Calendar,
  Zap,
  AlertCircle,
  Stethoscope,
  TrendingUp,
  ShieldAlert,
  ArrowRight
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
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Radar
              name="Recovery Index"
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
      <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground text-center gap-3 bg-primary/5 rounded-[32px] border border-dashed border-primary/20 p-8">
        <TrendingUp className="h-8 w-8 opacity-20" />
        <p className="text-xs font-black uppercase tracking-[0.2em]">Longitudinal Data Pending</p>
        <p className="text-[10px] max-w-[200px] leading-relaxed">Complete at least 2 check-ins to activate trend monitoring.</p>
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(191, 91%, 40%, 0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            style={{ fontSize: '10px', fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))' }} 
          />
          <YAxis hide domain={[0, 10]} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }} 
            labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', marginBottom: '8px', color: 'hsl(var(--primary))' }}
          />
          <Line 
            type="monotone" 
            dataKey="physical" 
            stroke="hsl(var(--primary))" 
            strokeWidth={4} 
            dot={{ r: 6, fill: 'white', strokeWidth: 3 }} 
            activeDot={{ r: 8, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="mental" 
            stroke="hsl(222, 47%, 11%)" 
            strokeWidth={2} 
            strokeDasharray="6 6" 
            dot={{ r: 4, fill: 'white', strokeWidth: 2 }} 
          />
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
      try {
        setResult(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse health result', e);
      }
    }

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  if (!mounted) return null;

  if (!result) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-8 max-w-lg p-12 glass rounded-[48px] border-white/40 shadow-2xl">
          <div className="relative mx-auto w-fit">
            <Activity className="h-20 w-20 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-2xl -z-10 rounded-full" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-black tracking-tight">System <span className="text-primary italic">Offline</span></h1>
            <p className="text-muted-foreground text-lg leading-relaxed">No health matrix detected. Complete a Daily Check-in to initialize the monitoring cockpit.</p>
          </div>
          <Button 
            onClick={() => router.push('/chat/advice')} 
            className="w-full h-16 rounded-full font-black text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 group"
          >
            Launch Daily Check-in
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
          <Button variant="ghost" onClick={() => router.push('/chat')} className="gap-2 -ml-3 mb-2 text-muted-foreground hover:text-foreground group">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Assistant
          </Button>
          <h1 className="text-4xl md:text-5xl font-headline font-black text-foreground tracking-tight">Monitoring <span className="text-primary italic">Cockpit</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Status for {result.patientName} • Node Sync: {new Date(result.timestamp).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl p-2 pr-5 rounded-full border shadow-sm">
          <div className="bg-primary/10 p-2.5 rounded-full">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Neural Node</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold">Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Urgent Trend Alerts */}
        {sortedAlerts.length > 0 && (
          <div className="lg:col-span-12 space-y-4">
            {sortedAlerts.map((alert, idx) => (
              <Alert 
                key={idx} 
                variant={alert.severity === 'emergency' || alert.severity === 'high' ? 'destructive' : 'default'}
                className={cn(
                  "border-l-[6px] shadow-xl rounded-[28px] p-8",
                  alert.severity === 'emergency' && "border-l-red-600 bg-red-50/80",
                  alert.severity === 'high' && "border-l-orange-500 bg-orange-50/80",
                  alert.severity === 'medium' && "border-l-yellow-500 bg-white/60",
                  alert.severity === 'low' && "border-l-primary bg-white/60"
                )}
              >
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "p-4 rounded-[20px] shadow-lg",
                    alert.severity === 'emergency' || alert.severity === 'high' ? "bg-red-600 text-white" : "bg-primary text-white"
                  )}>
                    {alert.severity === 'emergency' || alert.severity === 'high' ? (
                      <ShieldAlert className="h-8 w-8" />
                    ) : (
                      <Stethoscope className="h-8 w-8" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <AlertTitle className="font-headline font-black text-2xl flex items-center gap-3">
                      {alert.title}
                      {alert.severity === 'emergency' && (
                        <Badge className="bg-red-600 animate-bounce uppercase text-[10px] tracking-widest px-3">Critical Pattern</Badge>
                      )}
                    </AlertTitle>
                    <AlertDescription className="text-base text-foreground/80 leading-relaxed font-medium">
                      {alert.message}
                    </AlertDescription>
                    <div className="mt-5 p-5 rounded-[20px] bg-black/5 border border-black/5 flex items-center gap-4">
                      <div className="h-8 w-8 bg-black/10 rounded-full flex items-center justify-center font-black text-xs">GO</div>
                      <div className="flex-1 text-sm font-black uppercase tracking-tight">
                        Protocol: <span className="text-primary">{alert.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Vital Signal Cards */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { label: 'Heart Rate', value: result.metrics?.heartRate, unit: 'BPM', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
             { label: 'Sleep Cycles', value: result.metrics?.sleepHours, unit: 'HRS', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
             { label: 'Activity', value: result.metrics?.steps ? (result.metrics.steps / 1000).toFixed(1) : '--', unit: 'K STEPS', icon: Footprints, color: 'text-green-500', bg: 'bg-green-50' },
             { label: 'Blood Pressure', value: result.metrics?.bloodPressure, unit: 'EST.', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' }
           ].map((m, i) => (
             <Card key={i} className="border-none glass shadow-xl rounded-[32px] p-8 transition-all hover:scale-[1.03] hover:shadow-2xl text-center group">
                <div className={cn("p-4 rounded-[22px] w-fit mx-auto mb-6 transition-transform group-hover:rotate-12", m.bg)}>
                  <m.icon className={cn("h-7 w-7", m.color)} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{m.label}</span>
                  <div className="text-4xl font-black text-foreground tabular-nums">
                    {m.value || '--'}
                    <span className="text-xs ml-1.5 font-black text-primary/40">{m.unit}</span>
                  </div>
                </div>
             </Card>
           ))}
        </div>

        {/* Deep Analysis Column */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none glass shadow-xl overflow-hidden bg-primary/5 rounded-[40px] border border-primary/10">
            <CardHeader className="pb-4 pt-8 px-8">
               <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                 <Zap className="h-4 w-4 text-primary" />
                 Sentimental Matrix
               </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-10 px-8">
               <div className="relative inline-block mb-6">
                 <div className="text-7xl relative z-10">{result.metrics?.stressLevel === 'Stress' ? '🌪️' : '✨'}</div>
                 <div className={cn("absolute inset-0 blur-3xl rounded-full -z-10", result.metrics?.stressLevel === 'Stress' ? 'bg-orange-500/20' : 'bg-green-500/20')} />
               </div>
               <div className="text-3xl font-black text-foreground tracking-tight">{result.metrics?.stressLevel || 'Processing...'}</div>
               <Badge className={cn(
                 "mt-3 px-4 py-1 uppercase text-[10px] tracking-widest font-black rounded-full",
                 result.metrics?.stressLevel === 'Stress' ? 'bg-orange-500' : 'bg-green-500'
               )}>
                 Inferred State
               </Badge>
            </CardContent>
          </Card>

          <Card className="border-none glass shadow-xl rounded-[40px] border border-white/40 overflow-hidden">
            <CardHeader className="pb-0 pt-8 px-8">
               <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Neural Recovery Index</CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <RadarAnalysis scores={result.scores} />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(result.scores).map(([key, val]) => (
                  <div key={key} className="p-3 bg-secondary/30 rounded-[16px] text-center">
                    <div className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{key}</div>
                    <div className="text-lg font-black text-primary">{val}<span className="text-[10px] opacity-40 ml-0.5">/10</span></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights & History Column */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none glass shadow-xl rounded-[40px] p-10 border border-white/40">
             <div className="flex items-center justify-between mb-2">
               <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Longitudinal Recovery Trend (7D)
               </CardTitle>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" /> Physical
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase">
                    <div className="h-2.5 w-2.5 rounded-full border-2 border-foreground" /> Mental
                  </div>
               </div>
             </div>
             <HistoryTrend history={history} />
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
             {[
               { title: 'Physical Restoration', advice: result.recoveryAdvice, icon: Brain, color: 'text-primary' },
               { title: 'Activity Protocol', advice: result.exerciseAdvice, icon: Clock, color: 'text-primary' }
             ].map((box, i) => (
               <Card key={i} className="border-none glass shadow-xl p-8 rounded-[40px] border border-white/40 flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                     <div className="bg-primary/10 p-3 rounded-[18px]">
                        <box.icon className={cn("h-5 w-5", box.color)} />
                     </div>
                     <h4 className="font-headline font-black text-xl tracking-tight">{box.title}</h4>
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed font-medium">{box.advice}</p>
               </Card>
             ))}
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              { id: 'nutrition', title: 'Energy & Nutrition Matrix', content: result.nutritionAdvice },
              { id: 'mental', title: 'Psychological Neural Support', content: result.mentalWellbeingAdvice }
            ].map((acc) => (
              <AccordionItem key={acc.id} value={acc.id} className="border-none glass rounded-[32px] overflow-hidden px-2 shadow-lg">
                <AccordionTrigger className="hover:no-underline py-6 px-6 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:text-primary">
                  <span className="font-headline text-2xl font-black tracking-tight">{acc.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 text-foreground/70 text-base leading-relaxed font-medium">
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

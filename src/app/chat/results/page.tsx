'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const LATEST_RESULT_KEY = 'zera_latest_result';
const HISTORY_KEY = 'zera_health_history';

interface HealthResult {
  patientName: string;
  timestamp: string;
  recoveryAdvice: string;
  nutritionAdvice: string;
  exerciseAdvice: string;
  mentalWellbeingAdvice: string;
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
  const data = [
    { subject: 'Physical', A: scores.physical, fullMark: 10 },
    { subject: 'Nutrition', A: scores.nutrition, fullMark: 10 },
    { subject: 'Exercise', A: scores.exercise, fullMark: 10 },
    { subject: 'Mental', A: scores.mental, fullMark: 10 },
  ];

  return (
    <div className="h-[280px] w-full">
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsla(191, 91%, 40%, 0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 10, fontWeight: 600 }}
            />
            <Radar
              name="Index"
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

const HistoryTrend = ({ history }: { history: any[] }) => {
  const data = history.slice(0, 7).reverse().map((entry, idx) => ({
    name: new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
    physical: entry.scores.physical,
    mental: entry.scores.mental,
  }));

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(0, 0%, 0%, 0.05)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px' }} />
          <YAxis hide domain={[0, 10]} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Line type="monotone" dataKey="physical" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="mental" stroke="hsl(222, 47%, 11%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
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

  if (!mounted || !result) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 text-primary animate-pulse mx-auto" />
          <h1 className="text-2xl font-headline font-semibold">Generating Monitoring Dashboard...</h1>
          <Button onClick={() => router.push('/chat/advice')} variant="outline">
            Start Daily Check-in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.push('/chat')} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Assistant
        </Button>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-0.5 rounded-full border-primary/20 text-primary bg-primary/5 text-[9px] font-bold uppercase tracking-widest">
            AI Twin Active
          </Badge>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Metric Cards Grid */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card className="border-none glass shadow-sm p-5 text-center flex flex-col items-center gap-2">
              <div className="p-2 bg-red-50 rounded-xl"><Heart className="h-5 w-5 text-red-500" /></div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Heart Rate</span>
              <div className="text-2xl font-bold">{result.metrics.heartRate}<span className="text-xs ml-1 font-medium text-muted-foreground">bpm</span></div>
           </Card>
           <Card className="border-none glass shadow-sm p-5 text-center flex flex-col items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-xl"><Moon className="h-5 w-5 text-indigo-500" /></div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Sleep</span>
              <div className="text-2xl font-bold">{result.metrics.sleepHours}<span className="text-xs ml-1 font-medium text-muted-foreground">hrs</span></div>
           </Card>
           <Card className="border-none glass shadow-sm p-5 text-center flex flex-col items-center gap-2">
              <div className="p-2 bg-green-50 rounded-xl"><Footprints className="h-5 w-5 text-green-500" /></div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Steps</span>
              <div className="text-2xl font-bold">{(result.metrics.steps / 1000).toFixed(1)}<span className="text-xs ml-1 font-medium text-muted-foreground">k</span></div>
           </Card>
           <Card className="border-none glass shadow-sm p-5 text-center flex flex-col items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><Droplets className="h-5 w-5 text-blue-500" /></div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">BP</span>
              <div className="text-2xl font-bold">{result.metrics.bloodPressure}</div>
           </Card>
        </div>

        {/* Dashboard Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none glass shadow-md overflow-hidden bg-primary/5">
            <CardHeader className="pb-2">
               <CardTitle className="text-base font-headline flex items-center gap-2">
                 <Zap className="h-4 w-4 text-primary" />
                 Stress Level Prediction
               </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
               <div className="text-5xl mb-4">{result.metrics.stressLevel === 'Stress' ? '😔' : '😊'}</div>
               <div className="text-2xl font-bold text-foreground">{result.metrics.stressLevel}</div>
               <Badge className={result.metrics.stressLevel === 'Stress' ? 'bg-orange-500 mt-2' : 'bg-green-500 mt-2'}>
                 System Stable
               </Badge>
            </CardContent>
          </Card>

          <Card className="border-none glass shadow-md">
            <CardHeader className="pb-0">
               <CardTitle className="text-base font-headline">Recovery Scoring Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarAnalysis scores={result.scores} />
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Right Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col gap-1 mb-2">
            <h1 className="text-3xl font-headline font-bold text-foreground">Health <span className="text-primary italic">Status Portal</span></h1>
            <p className="text-muted-foreground text-sm">Monitoring report for {result.patientName} • Updated {new Date(result.timestamp).toLocaleTimeString()}</p>
          </div>

          <Card className="border-none glass shadow-md p-6">
             <CardTitle className="text-base font-headline flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-primary" />
                7-Day Monitoring Trend
             </CardTitle>
             <HistoryTrend history={history} />
             <div className="flex justify-center gap-4 mt-2 text-[10px] font-bold uppercase text-muted-foreground">
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" /> Physical</div>
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full border border-foreground border-dashed" /> Mental</div>
             </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
             <Card className="border-none glass shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                   <div className="bg-primary/10 p-2 rounded-lg"><Brain className="h-4 w-4 text-primary" /></div>
                   <h4 className="font-headline font-bold text-sm">Recovery Analysis</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.recoveryAdvice}</p>
             </Card>
             <Card className="border-none glass shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                   <div className="bg-primary/10 p-2 rounded-lg"><Clock className="h-4 w-4 text-primary" /></div>
                   <h4 className="font-headline font-bold text-sm">Suggested Plan</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.exerciseAdvice}</p>
             </Card>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="nutrition" className="border-none glass rounded-2xl overflow-hidden px-1">
              <AccordionTrigger className="hover:no-underline py-4 px-5">
                <span className="font-headline text-base font-bold">Nutrition & Hydration Protocol</span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                {result.nutritionAdvice}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mental" className="border-none glass rounded-2xl overflow-hidden px-1">
              <AccordionTrigger className="hover:no-underline py-4 px-5">
                <span className="font-headline text-base font-bold">Wellness Recommendations</span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                {result.mentalWellbeingAdvice}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

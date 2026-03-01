'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Heart,
  Moon,
  Thermometer,
  Brain,
  Utensils,
  Dumbbell,
  Bandage,
  ChevronLeft,
  Activity,
  Droplets,
  Clock
} from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const LATEST_RESULT_KEY = 'zera_latest_result';

interface HealthResult {
  patientName: string;
  patientAge: string;
  generatedAt: string;
  recoveryAdvice: string;
  nutritionAdvice: string;
  exerciseAdvice: string;
  mentalWellbeingAdvice: string;
  metrics: {
    heartRate: number;
    bloodPressure: string;
    sleepHours: number;
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
    <div className="h-[300px] w-full">
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsla(191, 91%, 40%, 0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 600 }}
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

export default function ResultsPage() {
  const [result, setResult] = useState<HealthResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(LATEST_RESULT_KEY);
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse result', e);
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 text-primary animate-pulse mx-auto" />
          <h1 className="text-2xl font-headline font-semibold">Synthesizing Health Data...</h1>
          <Button onClick={() => router.push('/chat/advice')} variant="outline">
            Go to Health Monitoring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <Button variant="ghost" onClick={() => router.push('/chat')} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Chat Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 text-primary bg-primary/5 uppercase tracking-tighter text-[10px] font-bold">
            Real-time Analysis Active
          </Badge>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Clinical Metrics Prediction */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none glass shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Inferred Clinical Metrics
              </CardTitle>
              <CardDescription className="text-xs">
                AI predictions based on your recent conversations and check-ins.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="p-5 rounded-2xl bg-secondary/20 flex items-center justify-between group hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Heart className="h-5 w-5 text-red-500" /></div>
                  <span className="text-sm font-medium">Heart Rate</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-foreground">{result.metrics.heartRate}</span>
                  <span className="text-[10px] text-muted-foreground block uppercase">BPM Est.</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/20 flex items-center justify-between group hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Droplets className="h-5 w-5 text-blue-500" /></div>
                  <span className="text-sm font-medium">Blood Pressure</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-foreground">{result.metrics.bloodPressure}</span>
                  <span className="text-[10px] text-muted-foreground block uppercase">Target Category</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/20 flex items-center justify-between group hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Moon className="h-5 w-5 text-indigo-500" /></div>
                  <span className="text-sm font-medium">Sleep Recovery</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-foreground">{result.metrics.sleepHours}</span>
                  <span className="text-[10px] text-muted-foreground block uppercase">Hours / Day</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/20 flex items-center justify-between group hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Brain className="h-5 w-5 text-purple-500" /></div>
                  <span className="text-sm font-medium">Current Stress</span>
                </div>
                <div className="text-right">
                  <Badge className={result.metrics.stressLevel === 'Stress' ? 'bg-orange-500' : 'bg-green-500'}>
                    {result.metrics.stressLevel}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground block uppercase mt-1">AI Prediction</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none glass shadow-xl overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-center font-headline text-lg">System Health Index</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarAnalysis scores={result.scores} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Narrative Analysis & Monitoring Steps */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-headline font-bold text-foreground lg:text-6xl tracking-tight">
              Health <span className="text-primary italic">Monitoring Report</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Synthesized specifically for <span className="text-foreground font-bold">{result.patientName}</span>. 
              This monitoring matrix adapts to your conversation-based physiological signals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="border-none glass shadow-md p-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                      <h4 className="font-headline font-bold">Nutrition Status</h4>
                      <p className="text-[10px] uppercase text-muted-foreground tracking-widest">{result.metrics.nutritionStatus}</p>
                   </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.nutritionAdvice}</p>
             </Card>

             <Card className="border-none glass shadow-md p-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                      <h4 className="font-headline font-bold">Timeline Status</h4>
                      <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Day {new Date(result.generatedAt).getDate()} / Cycle</p>
                   </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.recoveryAdvice}</p>
             </Card>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="movement" className="border-none glass rounded-3xl overflow-hidden px-2 shadow-sm">
              <AccordionTrigger className="hover:no-underline py-6 px-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-headline text-xl font-bold">Safe Movement Optimization</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-8 text-muted-foreground leading-relaxed text-base border-t border-primary/5 pt-6">
                {result.exerciseAdvice}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mental" className="border-none glass rounded-3xl overflow-hidden px-2 shadow-sm">
              <AccordionTrigger className="hover:no-underline py-6 px-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-headline text-xl font-bold">Emotional Regulation Path</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-8 text-muted-foreground leading-relaxed text-base border-t border-primary/5 pt-6">
                {result.mentalWellbeingAdvice}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="p-10 rounded-[40px] bg-foreground text-background shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                <Activity className="h-48 w-48" />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1">
                 <h3 className="text-3xl font-headline font-bold mb-3">Monitoring Cycle Complete</h3>
                 <p className="text-muted-foreground mb-8 text-lg">
                   Your health status has been synthesized. Return to the Chat Dashboard for continuous monitoring or update your metrics tomorrow.
                 </p>
                 <Button onClick={() => router.push('/chat')} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-14 px-10 font-bold gap-3 shadow-xl">
                    Open Chat Console
                    <Activity className="h-5 w-5" />
                 </Button>
               </div>
               <div className="hidden md:block h-32 w-32 rounded-full border-4 border-primary/20 flex items-center justify-center p-4">
                  <Activity className="h-16 w-16 text-primary" />
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  Bandage,
  Utensils,
  Dumbbell,
  BrainCircuit,
  UserCircle2,
  CalendarDays,
  Activity,
  ArrowRight,
  ChevronLeft
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
  scores: {
    physical: number;
    nutrition: number;
    exercise: number;
    mental: number;
  };
}

const AdviceChart = ({ scores }: { scores: HealthResult['scores'] }) => {
  const data = [
    { subject: 'Physical', A: scores.physical, fullMark: 10 },
    { subject: 'Nutrition', A: scores.nutrition, fullMark: 10 },
    { subject: 'Exercise', A: scores.exercise, fullMark: 10 },
    { subject: 'Mental', A: scores.mental, fullMark: 10 },
  ];

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsla(191, 91%, 40%, 0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
            />
            <Radar
              name="Recovery Score"
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
          <h1 className="text-2xl font-headline font-semibold">Analyzing Matrix Data...</h1>
          <Button onClick={() => router.push('/chat')} variant="outline">
            Return to Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.push('/chat')} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="font-headline tracking-wide uppercase text-xs">Recovery Report</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none glass shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <UserCircle2 className="h-6 w-6 text-primary" />
                Patient Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/30">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Name</span>
                  <span className="font-semibold text-lg">{result.patientName}</span>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Age</span>
                  <span className="font-semibold text-lg">{result.patientAge} Years</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div className="text-xs">
                  <span className="text-muted-foreground block">Analysis Generated On</span>
                  <span className="font-medium">{new Date(result.generatedAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none glass shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-center">Recovery Visualization</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <AdviceChart scores={result.scores} />
              <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                 {Object.entries(result.scores).map(([key, score]) => (
                   <div key={key} className="text-center p-3 rounded-lg border bg-background/50">
                      <span className="text-[10px] text-muted-foreground uppercase block mb-1">{key}</span>
                      <span className="text-xl font-bold text-primary">{score}/10</span>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-headline font-bold text-foreground lg:text-5xl">
              Personalized <span className="text-primary italic">Recovery Matrix</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Based on your clinical input, Zera has synthesized a structured recovery plan across four critical domains.
            </p>
          </div>

          <Accordion type="single" collapsible defaultValue="physical" className="space-y-4">
            <AccordionItem value="physical" className="border-none glass rounded-2xl overflow-hidden px-2">
              <AccordionTrigger className="hover:no-underline py-6 px-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Bandage className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="font-headline text-xl block">Physical Recovery</span>
                    <span className="text-xs text-muted-foreground">Wound healing & physical integrity</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6 text-muted-foreground leading-relaxed text-base border-t border-primary/5 pt-4">
                {result.recoveryAdvice}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="nutrition" className="border-none glass rounded-2xl overflow-hidden px-2">
              <AccordionTrigger className="hover:no-underline py-6 px-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="font-headline text-xl block">Nutrition & Hydration</span>
                    <span className="text-xs text-muted-foreground">Fueling recovery & lactation support</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6 text-muted-foreground leading-relaxed text-base border-t border-primary/5 pt-4">
                {result.nutritionAdvice}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="exercise" className="border-none glass rounded-2xl overflow-hidden px-2">
              <AccordionTrigger className="hover:no-underline py-6 px-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="font-headline text-xl block">Safe Activity Matrix</span>
                    <span className="text-xs text-muted-foreground">Gentle movement & posture correction</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6 text-muted-foreground leading-relaxed text-base border-t border-primary/5 pt-4">
                {result.exerciseAdvice}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mental" className="border-none glass rounded-2xl overflow-hidden px-2">
              <AccordionTrigger className="hover:no-underline py-6 px-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="font-headline text-xl block">Emotional Support</span>
                    <span className="text-xs text-muted-foreground">Mental well-being & stress regulation</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6 text-muted-foreground leading-relaxed text-base border-t border-primary/5 pt-4">
                {result.mentalWellbeingAdvice}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="p-8 rounded-3xl bg-primary text-primary-foreground shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-500">
                <Sparkles className="h-24 w-24" />
             </div>
             <div className="relative z-10">
               <h3 className="text-2xl font-headline font-bold mb-2">Ready for your next check-in?</h3>
               <p className="text-primary-foreground/80 mb-6 max-w-md">
                 Consistency is key to a healthy recovery. Return to Zera anytime to update your health data and receive a new matrix.
               </p>
               <Button onClick={() => router.push('/chat')} className="bg-white text-primary hover:bg-white/90 rounded-full h-12 px-8 font-bold gap-2 group">
                 Back to Dashboard
                 <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

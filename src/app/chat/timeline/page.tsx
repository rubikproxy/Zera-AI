
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Calendar,
  Sparkles,
  Baby,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Milestone {
  week: number;
  title: string;
  normal: string[];
  redFlags: string[];
  goals: string[];
}

const RECOVERY_TIMELINE: Milestone[] = [
  {
    week: 1,
    title: "The Golden Week",
    normal: [
      "Heavy bright red bleeding (Lochia)",
      "Mild cramping (after-pains)",
      "Breast milk coming in (fullness/warmth)",
      "Significant exhaustion"
    ],
    redFlags: [
      "Soaking a pad in 1 hour or less",
      "Clots larger than a golf ball",
      "Fever over 38°C (100.4°F)",
      "Severe headache or vision changes"
    ],
    goals: [
      "Hydrate: 8-10 glasses of water",
      "Skin-to-skin time with baby",
      "Sleep whenever baby sleeps",
      "Gentle pelvic floor breaths"
    ]
  },
  {
    week: 2,
    title: "Emotional Shift",
    normal: [
      "Bleeding turning pink or brown",
      "Baby blues fading (usually by day 10)",
      "Itching near incision/stitches",
      "Night sweats"
    ],
    redFlags: [
      "Intense sadness lasting >2 weeks",
      "Redness or pus from incision",
      "Calf pain or swelling",
      "Thoughts of harming self or baby"
    ],
    goals: [
      "Step outside for 5 mins of fresh air",
      "Check in with a supportive friend",
      "Continue prenatal vitamins",
      "Maintain a 5-min self-care ritual"
    ]
  },
  {
    week: 4,
    title: "Stabilization",
    normal: [
      "Bleeding is very light or yellow",
      "Increasing mobility",
      "Breastfeeding/Feeding routine settling",
      "Periods of alertness/joy"
    ],
    redFlags: [
      "Bleeding turns bright red again suddenly",
      "Worsening pelvic pain",
      "Foul-smelling discharge",
      "Shortness of breath"
    ],
    goals: [
      "10-minute slow walk around the block",
      "Start light core engagement (breath work)",
      "Practice diapering/feeding efficiency",
      "Schedule your 6-week checkup"
    ]
  },
  {
    week: 6,
    title: "The Major Milestone",
    normal: [
      "Bleeding usually stopped",
      "Uterus returned to pre-pregnancy size",
      "Incision/Perineum significantly healed",
      "Energy levels slowly returning"
    ],
    redFlags: [
      "Pain during all types of movement",
      "Persistent urinary leakage",
      "Feeling of 'heaviness' in the pelvis",
      "Unresolved emotional distress"
    ],
    goals: [
      "Attend 6-week medical checkup",
      "Discuss birth control with provider",
      "Ask about return to exercise",
      "Celebrate 1.5 months of parenting!"
    ]
  },
  {
    week: 10,
    title: "The New Normal",
    normal: [
      "Hormonal levels stabilizing",
      "Return of regular appetite",
      "Physical comfort significantly improved",
      "Stronger bond and routine"
    ],
    redFlags: [
      "Hair loss (normal but can be stressful)",
      "Thyroid issues (fatigue/weight changes)",
      "Ongoing anxiety/intrusive thoughts",
      "Persistent physical weakness"
    ],
    goals: [
      "Increase walk duration to 20 mins",
      "Trial a short hobby session",
      "Focus on balanced whole-food meals",
      "Consider a pelvic floor therapist"
    ]
  }
];

export default function TimelinePage() {
  const [daysPostpartum, setDaysPostpartum] = useState(0);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedProfile = localStorage.getItem('zera_user_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setDaysPostpartum(parseInt(profile.daysSinceBirth) || 0);
      } catch (e) {
        console.error('Failed to parse profile');
      }
    }
  }, []);

  if (!mounted) return null;

  const currentWeek = Math.ceil(daysPostpartum / 7) || 1;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.push('/chat')} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Back to Assistant
      </Button>

      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 border-primary/20 text-primary bg-primary/5 font-bold uppercase tracking-widest text-[9px]">
            Recovery Matrix
          </Badge>
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-foreground">Recovery <span className="text-primary italic">Journey</span></h1>
        <p className="text-muted-foreground text-lg">Your week-by-week roadmap to physical and emotional healing.</p>
      </div>

      <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {RECOVERY_TIMELINE.map((item, idx) => {
          const isCurrent = item.week === 1 ? currentWeek <= 1 : (currentWeek > RECOVERY_TIMELINE[idx-1]?.week && currentWeek <= item.week);
          const isPast = currentWeek > item.week;

          return (
            <div key={idx} className={cn(
              "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group",
              isCurrent && "z-10"
            )}>
              {/* Icon / Marker */}
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all duration-500",
                isCurrent ? "bg-primary scale-110 ring-4 ring-primary/20" : isPast ? "bg-green-500" : "bg-slate-200"
              )}>
                {isPast ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : isCurrent ? (
                  <Activity className="h-5 w-5 text-white animate-pulse" />
                ) : (
                  <Calendar className="h-5 w-5 text-slate-400" />
                )}
              </div>

              {/* Card */}
              <Card className={cn(
                "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass border-none shadow-xl rounded-[32px] overflow-hidden transition-all duration-500",
                isCurrent ? "ring-2 ring-primary/20 scale-[1.02]" : "opacity-70 grayscale-[0.5]"
              )}>
                <CardHeader className={cn(
                  "pb-4 pt-6 px-6",
                  isCurrent ? "bg-primary/5" : "bg-secondary/20"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Week {item.week}</span>
                    {isCurrent && <Badge className="bg-primary text-[9px] uppercase tracking-tighter">You are here</Badge>}
                  </div>
                  <CardTitle className="text-xl font-headline font-bold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                      <Sparkles className="h-3 w-3 text-primary" /> What's Normal
                    </div>
                    <ul className="space-y-2">
                      {item.normal.map((n, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex gap-2">
                          <div className="h-1 w-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-destructive tracking-widest">
                      <AlertCircle className="h-3 w-3" /> Red Flags
                    </div>
                    <ul className="space-y-1.5">
                      {item.redFlags.map((r, i) => (
                        <li key={i} className="text-[11px] font-medium text-destructive/80 leading-tight">
                          • {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-green-600 tracking-widest">
                      <Target className="h-3 w-3" /> Tiny Goals
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.goals.map((g, i) => (
                        <Badge key={i} variant="secondary" className="bg-green-50 text-green-700 border-green-100 font-medium text-[10px] rounded-lg py-1">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="mt-16 p-8 glass rounded-[40px] text-center space-y-4">
        <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto">
          <Baby className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-headline font-bold">Beyond 12 Weeks</h3>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
          Recovery is a marathon, not a sprint. While the initial 12 weeks are critical, your body continues to heal for up to a year. Be patient, continue your check-ins, and listen to your intuition.
        </p>
        <Button onClick={() => router.push('/chat')} className="rounded-full px-8 h-12 font-bold shadow-lg">
          Talk to Zera About Your Status
        </Button>
      </div>
    </div>
  );
}

'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { HeartPulse, BedDouble, Footprints } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { useEffect, useState } from 'react';

const heartRateData = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}:00`,
  bpm: Math.floor(Math.random() * (85 - 60 + 1)) + 60,
}));

const sleepData = [
  { day: 'Mon', hours: 6.5 },
  { day: 'Tue', hours: 5.8 },
  { day: 'Wed', hours: 7.2 },
  { day: 'Thu', hours: 6.1 },
  { day: 'Fri', hours: 7.5 },
  { day: 'Sat', hours: 8.0 },
  { day: 'Sun', hours: 7.3 },
];

const activityData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i*2}:00`,
    steps: Math.floor(Math.random() * 500)
}));


const chartConfig = {
  bpm: {
    label: 'BPM',
    color: 'hsl(var(--primary))',
  },
  hours: {
    label: 'Hours',
    color: 'hsl(var(--primary))',
  },
  steps: {
    label: 'Steps',
    color: 'hsl(var(--primary))',
  }
} satisfies ChartConfig;

export function HealthMetrics() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
        <div className="space-y-6">
            <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><div className="h-[180px] w-full"></div></CardContent></Card>
            <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><div className="h-[180px] w-full"></div></CardContent></Card>
            <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><div className="h-[180px] w-full"></div></CardContent></Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
          <HeartPulse className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">72 bpm</div>
          <p className="text-xs text-muted-foreground">Resting heart rate</p>
          <div className="h-[120px] w-full">
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={heartRateData}
                margin={{
                  left: -20,
                  right: 12,
                  top: 10
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0,5)} hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel />}
                />
                <Area
                  dataKey="bpm"
                  type="natural"
                  fill="var(--color-bpm)"
                  fillOpacity={0.4}
                  stroke="var(--color-bpm)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sleep</CardTitle>
          <BedDouble className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7h 15m</div>
          <p className="text-xs text-muted-foreground">Last night's sleep</p>
          <div className="h-[120px]">
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={sleepData}
                margin={{
                  left: -20,
                  right: 12,
                  top: 10
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                 <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} hide/>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel />}
                />
                <Area
                  dataKey="hours"
                  type="natural"
                  fill="var(--color-hours)"
                  fillOpacity={0.4}
                  stroke="var(--color-hours)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity</CardTitle>
          <Footprints className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3,452</div>
          <p className="text-xs text-muted-foreground">Steps today</p>
           <div className="h-[120px]">
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={activityData}
                margin={{
                  left: -20,
                  right: 12,
                  top: 10
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0,5)} hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel />}
                />
                <Area
                  dataKey="steps"
                  type="natural"
                  fill="var(--color-steps)"
                  fillOpacity={0.4}
                  stroke="var(--color-steps)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

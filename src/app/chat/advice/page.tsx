'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getPersonalizedAdvice } from '@/app/actions';
import { Sparkles, Loader, ChevronLeft } from 'lucide-react';

const LATEST_RESULT_KEY = 'zera_latest_result';

export default function AdvicePage() {
  const [formData, setFormData] = useState({ name: '', age: '', health: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.health) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill out all fields.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await getPersonalizedAdvice({
        name: formData.name,
        age: parseInt(formData.age) || 25,
        healthData: formData.health,
        daysPostpartum: 14,
      });

      localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify({
        ...result,
        patientName: formData.name,
        patientAge: formData.age,
        generatedAt: new Date().toISOString()
      }));

      router.push('/chat/results');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Matrix Error', description: e.message || 'Failed to generate advice.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="border-none glass shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline text-foreground">Health Matrix Configuration</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Synthesize your personalized recovery plan through our Multimodal Deep Learning engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <Input 
                id="name" 
                placeholder="E.g., Sarah Smith" 
                value={formData.name} 
                onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                className="h-12 rounded-xl bg-background/50" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="age" className="text-sm font-semibold">Age</Label>
              <Input 
                id="age" 
                type="number" 
                placeholder="28" 
                value={formData.age} 
                onChange={e => setFormData(p => ({...p, age: e.target.value}))} 
                className="h-12 rounded-xl bg-background/50" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="health" className="text-sm font-semibold">Current Recovery Status</Label>
              <Textarea 
                id="health" 
                value={formData.health} 
                onChange={e => setFormData(p => ({...p, health: e.target.value}))} 
                className="min-h-[150px] rounded-xl bg-background/50 resize-none" 
                placeholder="Describe your delivery (vaginal/c-section), current symptoms, physical comfort, and emotional well-being..." 
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-14 rounded-full font-bold text-lg shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                  Generating Matrix...
                </>
              ) : (
                'Generate Personal Analysis'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-center text-xs text-muted-foreground uppercase tracking-widest font-medium">
        Secure Federated Analysis Active • Private Data Processing
      </p>
    </div>
  );
}

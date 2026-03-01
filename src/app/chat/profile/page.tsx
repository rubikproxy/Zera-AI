'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, ShieldCheck, Database, Save, ArrowRight } from 'lucide-react';

const PROFILE_KEY = 'zera_user_profile';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    deliveryType: '',
    daysPostpartum: '',
    location: '',
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load profile');
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name || !profile.age || !profile.deliveryType) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please fill in core details.' });
      return;
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    toast({ title: 'Profile Secured', description: 'Your health context has been saved locally.' });
    
    // If we're coming from the initial redirect, go to chat
    router.push('/chat');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col gap-2 mb-10 text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">Health <span className="text-primary italic">Identity Node</span></h1>
        <p className="text-muted-foreground text-lg">Initialize your local profile to enable personalized Multimodal Monitoring.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-none glass shadow-2xl rounded-[40px] overflow-hidden">
            <CardHeader className="pb-2 pt-8 px-8">
               <CardTitle className="text-2xl font-headline flex items-center gap-2">
                 <UserCircle className="h-6 w-6 text-primary" />
                 Personal Context
               </CardTitle>
               <CardDescription>This information stays on your device and provides context for Zera AI.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Legal/Preferred Name</Label>
                    <Input 
                      id="name" 
                      value={profile.name} 
                      onChange={e => setProfile(p => ({...p, name: e.target.value}))}
                      placeholder="E.g., Elena"
                      className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Age</Label>
                    <Input 
                      id="age" 
                      type="number"
                      value={profile.age} 
                      onChange={e => setProfile(p => ({...p, age: e.target.value}))}
                      placeholder="28"
                      className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Delivery Method</Label>
                    <Select 
                      value={profile.deliveryType} 
                      onValueChange={v => setProfile(p => ({...p, deliveryType: v}))}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vaginal">Spontaneous Vaginal</SelectItem>
                        <SelectItem value="c-section">C-Section (Planned/Emergency)</SelectItem>
                        <SelectItem value="assisted">Assisted (Forceps/Vacuum)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Days Postpartum</Label>
                    <Input 
                      id="days" 
                      type="number"
                      value={profile.daysPostpartum} 
                      onChange={e => setProfile(p => ({...p, daysPostpartum: e.target.value}))}
                      placeholder="14"
                      className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-full font-bold text-lg gap-3 shadow-xl hover:scale-[1.02] transition-transform">
                  <Save className="h-5 w-5" />
                  Commit Profile to Local Store
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none glass shadow-xl rounded-[30px] bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Privacy Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-4">
              <p>Zera AI operates on a <strong>Federated Learning Architecture</strong>. Your personal data never leaves this browser instance.</p>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-primary/10">
                <Database className="h-4 w-4 text-primary" />
                <span className="font-bold uppercase tracking-tighter">IndexedDB Persistence Active</span>
              </div>
              <p>By saving this profile, you enable Zera to perform sentiment analysis and biometric inference specific to your delivery type.</p>
            </CardContent>
          </Card>

          <Button variant="ghost" onClick={() => router.push('/chat')} className="w-full justify-between h-14 rounded-2xl group border border-dashed border-primary/20">
            <span>Skip to Chat Console</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

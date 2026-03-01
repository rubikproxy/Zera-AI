'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Save, ChevronLeft } from 'lucide-react';

const PROFILE_KEY = 'zera_user_profile';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    dob: '',
    phone: '',
    email: '',
    birthMethod: '',
    daysSinceBirth: '',
  });
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try { setProfile(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name || !profile.birthMethod || !profile.daysSinceBirth) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill name and birth info.' });
      return;
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    toast({ title: 'Profile Updated' });
    router.push('/chat');
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 gap-2 text-black/60">
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-headline font-black text-black uppercase tracking-tight">Health <span className="text-primary italic">Identity</span></h1>
        <p className="text-black/60 text-lg font-medium">Manage recovery context.</p>
      </div>

      <Card className="border-none glass shadow-2xl rounded-[40px] overflow-hidden">
        <CardHeader className="pb-2 pt-8 px-8 bg-black text-white">
            <CardTitle className="text-2xl font-headline flex items-center gap-2 font-black uppercase">
              <UserCircle className="h-6 w-6" />
              Context
            </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black">Name</Label>
                <Input value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} className="h-12 rounded-xl bg-secondary/50 border-none font-medium text-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black">Birth Date</Label>
                <Input type="date" value={profile.dob} onChange={e => setProfile(p => ({...p, dob: e.target.value}))} className="h-12 rounded-xl bg-secondary/50 border-none font-medium text-black" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black">Phone</Label>
                <Input value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} className="h-12 rounded-xl bg-secondary/50 border-none font-medium text-black" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black">Email</Label>
                <Input type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} className="h-12 rounded-xl bg-secondary/50 border-none font-medium text-black" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black">How did you give birth?</Label>
                <Select value={profile.birthMethod} onValueChange={v => setProfile(p => ({...p, birthMethod: v}))}>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none font-medium text-black">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Naturally</SelectItem>
                    <SelectItem value="c-section">C-Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black">Days since baby born</Label>
                <Input type="number" value={profile.daysSinceBirth} onChange={e => setProfile(p => ({...p, daysSinceBirth: e.target.value}))} className="h-12 rounded-xl bg-secondary/50 border-none font-medium text-black" />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-full font-black text-lg gap-3 bg-black text-white hover:bg-black/90 uppercase tracking-widest">
              <Save className="h-5 w-5" />
              Update Identity
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Save } from 'lucide-react';

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
    if (!profile.name || !profile.birthMethod || !profile.daysSinceBirth) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in core details.' });
      return;
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    toast({ title: 'Profile Updated' });
    router.push('/chat');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col gap-2 mb-10 text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">Health <span className="text-primary italic">Identity Profile</span></h1>
        <p className="text-muted-foreground text-lg">Manage your identity and recovery context.</p>
      </div>

      <Card className="border-none glass shadow-2xl rounded-[40px] overflow-hidden">
        <CardHeader className="pb-2 pt-8 px-8">
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-primary" />
              Personal Context
            </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</Label>
                <Input 
                  value={profile.name} 
                  onChange={e => setProfile(p => ({...p, name: e.target.value}))}
                  className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date of Birth</Label>
                <Input 
                  type="date"
                  value={profile.dob} 
                  onChange={e => setProfile(p => ({...p, dob: e.target.value}))}
                  className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                <Input 
                  value={profile.phone} 
                  onChange={e => setProfile(p => ({...p, phone: e.target.value}))}
                  className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input 
                  type="email"
                  value={profile.email} 
                  onChange={e => setProfile(p => ({...p, email: e.target.value}))}
                  className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">How did you give birth?</Label>
                <Select 
                  value={profile.birthMethod} 
                  onValueChange={v => setProfile(p => ({...p, birthMethod: v}))}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaginal">Natural</SelectItem>
                    <SelectItem value="c-section">C-Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">How many days has it been since your baby was born?</Label>
                <Input 
                  type="number"
                  value={profile.daysSinceBirth} 
                  onChange={e => setProfile(p => ({...p, daysSinceBirth: e.target.value}))}
                  className="h-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-full font-bold text-lg gap-3 shadow-xl">
              <Save className="h-5 w-5" />
              Update Identity
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

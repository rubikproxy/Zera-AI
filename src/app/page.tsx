import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Brain,
  Siren,
  MessageSquareHeart,
  Baby,
  ChartBar,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

const LandingHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 glass border-b shadow-sm">
    <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-indigo-600 text-white p-1.5 rounded-lg transition-transform group-hover:rotate-12">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-headline font-extrabold text-xl tracking-tight">AI Zera</span>
      </Link>
      <div className="hidden md:flex items-center gap-8">
        <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-indigo-600 transition-colors">🧠 Intelligence</Link>
        <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-indigo-600 transition-colors">🛡️ Safety</Link>
        <Link href="#timeline" className="text-sm font-medium text-muted-foreground hover:text-indigo-600 transition-colors">🗺️ Roadmap</Link>
      </div>
      <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg px-6 group">
        <Link href="/chat">
          🚀 Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
    </div>
  </header>
);

const FeatureBento = ({
  emoji,
  title,
  description,
  className,
}: {
  emoji: string;
  title: string;
  description: string;
  className?: string;
}) => (
  <Card className={`${className} group hover:-translate-y-1 transition-all duration-300 border-none shadow-sm hover:shadow-xl bg-white/50 backdrop-blur-sm`}>
    <CardContent className="p-8 h-full flex flex-col">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{emoji}</div>
      <h3 className="text-xl font-headline font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen mesh-gradient">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
          <div className="container mx-auto text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-8 animate-fade-in shadow-sm">
              ✨ Now Powered by Gemini Postpartum Logic
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-extrabold tracking-tight mb-8 animate-fade-up">
              Empathetic Care for the <span className="text-gradient italic">Fourth Trimester</span>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed font-medium animate-fade-up [animation-delay:200ms]">
              Experience professional, conversation-based health monitoring. Zera AI uses Multimodal Intelligence to track your recovery with total privacy.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-up [animation-delay:400ms]">
              <Button size="lg" asChild className="h-16 px-10 text-lg rounded-full bg-indigo-600 shadow-xl shadow-indigo-200 hover:scale-105 transition-transform">
                <Link href="/chat">💬 Start Chat Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-16 px-10 text-lg rounded-full glass hover:bg-white transition-all">
                <Link href="#features">🔮 Explore Neural Matrix</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bento Features Section */}
        <section id="features" className="py-24 px-4 bg-white/30">
          <div className="container mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-headline md:text-5xl font-extrabold mb-4">Neural Recovery Matrix</h2>
              <p className="text-muted-foreground font-medium">Sophisticated intelligence layers working together for your well-being.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
              <FeatureBento 
                className="md:col-span-2 md:row-span-2"
                emoji="🧠" 
                title="Conversational Intelligence" 
                description="Zera analyzes your daily messages to infer health metrics like heart rate, stress levels, and activity trends without complex forms." 
              />
              <FeatureBento 
                emoji="🚨" 
                title="Crisis Triage" 
                description="Advanced symptom analysis identifies emergency red flags and provides immediate medical escalation protocols." 
              />
              <FeatureBento 
                emoji="📊" 
                title="Health Status" 
                description="Interactive radar charts and longitudinal trend lines visualize your physical and mental recovery progress over time." 
              />
              <FeatureBento 
                className="md:col-span-2"
                emoji="🔒" 
                title="Privacy Architecture" 
                description="Built on Federated Learning principles. Your health data, logs, and biometrics remain strictly on your browser—never sent to a central server." 
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-indigo-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold mb-16">Safe. Simple. Private.</h2>
            <div className="grid gap-12 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                { step: "01", emoji: "🗣️", title: "Natural Chat", text: "Talk to Zera as you would a supportive friend." },
                { step: "02", emoji: "🔍", title: "Neural Sync", text: "Our models process signals for recovery patterns." },
                { step: "03", emoji: "📈", title: "Live Status", text: "View your recovery matrix and trend alerts instantly." }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{item.emoji}</div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-indigo-100 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-4 text-center">
          <div className="container mx-auto max-w-4xl glass p-16 rounded-[3rem] shadow-2xl relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl">🌟</div>
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold mb-8 tracking-tight">Ready to Sync Your <span className="text-gradient">Recovery?</span></h2>
            <p className="text-xl text-muted-foreground font-medium mb-12">Join thousands of mothers using Zera AI for safe, expert-backed postpartum support.</p>
            <Button size="lg" asChild className="h-20 px-12 text-2xl rounded-full bg-indigo-600 shadow-2xl shadow-indigo-200 hover:scale-105 transition-all">
              <Link href="/chat">🚀 Launch AI Assistant</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="py-12 px-4 border-t bg-white">
        <div className="container mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold mb-6">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span className="font-headline text-lg">AI Zera</span>
          </Link>
          <p className="text-muted-foreground text-sm font-medium">© 2025 AI Zera. Premium Postpartum Intelligence.</p>
          <div className="mt-4 text-xs text-muted-foreground/60 uppercase tracking-widest font-bold">
            Built for Educational Research on Multimodal Deep Learning
          </div>
        </div>
      </footer>
    </div>
  );
}
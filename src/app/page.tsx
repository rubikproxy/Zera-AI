import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  LifeBuoy,
  ShieldCheck,
  Check,
  HeartHandshake,
  Siren,
  MessageSquareHeart,
  Baby,
  Sparkles,
  Quote,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

const LandingHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
    <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <LifeBuoy className="h-6 w-6 text-primary" />
        <span className="font-headline text-lg text-foreground">AI Zera</span>
      </Link>
      <Button asChild className="shadow-lg">
        <Link href="/chat">Get Started</Link>
      </Button>
    </div>
  </header>
);

const LandingFooter = () => (
  <footer className="border-t bg-secondary/30">
    <div className="container mx-auto py-8 px-4 md:px-6 text-center text-muted-foreground text-sm">
      <p>&copy; {new Date().getFullYear()} AI Zera. A PG project on Multimodal Deep Learning.</p>
      <p className="mt-2">
        This is a research prototype. Always consult with a healthcare professional.
      </p>
    </div>
  </footer>
);

const FeatureCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-center text-center p-8 rounded-2xl glass transition-all hover:scale-[1.02]">
    <div className="bg-primary/10 p-4 rounded-full">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <h3 className="mt-4 text-xl font-headline font-semibold text-foreground">{title}</h3>
    <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{children}</p>
  </div>
);

const TestimonialCard = ({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) => (
  <Card className="border-none glass shadow-none">
    <CardContent className="p-8">
      <Quote className="h-8 w-8 text-primary/30 mb-4" />
      <p className="text-foreground/80 italic mb-6 leading-relaxed">"{quote}"</p>
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{author}</span>
        <span className="text-xs text-primary/70">{role}</span>
      </div>
    </CardContent>
  </Card>
);

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const featureImage = PlaceHolderImages.find((img) => img.id === 'feature3');

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center text-center">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
          <div className="relative z-10 p-4 max-w-5xl mx-auto">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary mb-6 animate-fade-in border border-primary/20">
              New: Multi-Model Resilience Powered by Gemini & Groq
            </div>
            <h1 className="text-4xl font-headline tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-foreground neon-glow">
              Empathetic Care for the <span className="text-primary italic">Fourth Trimester</span>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
              Experience the next generation of postpartum support. Zera AI combines Multimodal Deep Learning with Federated Learning principles for secure, evidence-based guidance.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-14 px-8 text-lg rounded-full">
                <Link href="/chat">Launch AI Assistant</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg rounded-full glass">
                <Link href="#features">Explore Technology</Link>
              </Button>
            </div>
            <p className="mt-10 text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Research Project: Postpartum Health Monitoring & Support
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-secondary/30 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline sm:text-5xl text-foreground">Advanced Triage & Support</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
                Intelligent systems designed to prioritize maternal well-being through safe, automated analysis.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={HeartHandshake} title="Empathetic Response Engine">
                Zera is programmed to be an understanding listener, providing human-like empathy for your recovery journey.
              </FeatureCard>
              <FeatureCard icon={Siren} title="Emergency Symptom Triage">
                Our AI analyzes symptoms in real-time to identify high-risk signals and escalate to immediate medical guidance.
              </FeatureCard>
              <FeatureCard icon={MessageSquareHeart} title="Mental Health Screening">
                Integrated EPDS screening helps monitor emotional well-being with clinically-backed assessment logic.
              </FeatureCard>
              <FeatureCard icon={Baby} title="Newborn Integration">
                Guidance that considers the needs of both mother and baby for a holistic approach to postpartum wellness.
              </FeatureCard>
              <FeatureCard icon={Sparkles} title="Recovery Matrix">
                Personalized physical and mental advice based on your specific health context and delivery type.
              </FeatureCard>
              <FeatureCard icon={ShieldCheck} title="Privacy by Design">
                Engineered with local persistence and data minimization principles to ensure your privacy remains absolute.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-headline sm:text-5xl mb-16 text-foreground">A Seamless Experience</h2>
            <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto">
              {[
                { step: "01", title: "Human Input", text: "Simply chat or provide health details in natural language." },
                { step: "02", title: "Neural Analysis", text: "Zera processes data using advanced Gemini-powered multimodal techniques." },
                { step: "03", title: "Actionable Insights", text: "Receive structured advice, recovery charts, and clear next steps." }
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="text-8xl font-headline opacity-5 text-primary absolute -top-10 left-1/2 -translate-x-1/2">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-headline font-semibold mb-4 text-foreground relative z-10">{item.title}</h3>
                  <p className="text-muted-foreground relative z-10 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline sm:text-5xl text-foreground">Trusted Support</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <TestimonialCard
                quote="The emergency triage feature is incredible. It gave me the confidence to contact my provider when I noticed signs I might have normally ignored."
                author="Jessica M."
                role="3 Weeks Postpartum"
              />
              <TestimonialCard
                quote="Having a space to check in daily and see my recovery progress visualized really helped my mental well-being during those first few weeks."
                author="Samantha R."
                role="6 Weeks Postpartum"
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 text-center relative overflow-hidden bg-primary/5">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <h2 className="text-4xl font-headline sm:text-6xl text-foreground mb-8">Begin Your Recovery Matrix</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl mb-12">
              Start your journey with Zera AI today and experience professional, empathetic postpartum support.
            </p>
            <Button size="lg" asChild className="h-16 px-12 text-xl rounded-full shadow-2xl">
              <Link href="/chat">Launch AI Dashboard</Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
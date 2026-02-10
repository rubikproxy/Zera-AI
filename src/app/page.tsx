import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Bot, ShieldCheck, Activity, Check } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const LandingHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
    <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <LifeBuoy className="h-6 w-6 text-primary" />
        <span className="font-headline text-lg">AI Zera</span>
      </Link>
      <Button asChild>
        <Link href="/chat">Get Started</Link>
      </Button>
    </div>
  </header>
);

const LandingFooter = () => (
  <footer className="border-t">
    <div className="container mx-auto py-6 px-4 md:px-6 text-center text-muted-foreground text-sm">
      <p>&copy; {new Date().getFullYear()} AI Zera. A conceptual project.</p>
      <p className="mt-2">This is not a medical device. Always consult with a healthcare professional.</p>
    </div>
  </footer>
);

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  const featureImage = PlaceHolderImages.find(img => img.id === 'feature3');

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] md:h-screen md:min-h-[600px] flex items-center justify-center text-center text-white">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl font-headline tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Empathetic Support for Your Fourth Trimester
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-primary-foreground/90">
              AI Zera is your personal health assistant, providing evidence-based guidance and a supportive space throughout your postpartum journey.
            </p>
             <p className="mt-2 max-w-4xl mx-auto text-sm text-primary-foreground/70 font-light">
              A project on Multimodal Deep Learning Technique with Federated Learning for Postpartum Health Monitoring and Support
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/chat">Start Your Journey Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-headline sm:text-4xl">Your Trusted Postpartum Companion</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
                Zera is designed to help you navigate the complexities of postpartum recovery with confidence and peace of mind.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm">
                <Bot className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">24/7 Conversational Support</h3>
                <p className="mt-2 text-muted-foreground">
                  Ask questions and get instant, empathetic responses from an AI trained in postpartum care, anytime you need it.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm">
                <Activity className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Intelligent Symptom Analysis</h3>
                <p className="mt-2 text-muted-foreground">
                  Zera understands your described symptoms, identifies potential urgency, and guides you on when to seek medical help.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm">
                <ShieldCheck className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Private & Secure by Design</h3>
                <p className="mt-2 text-muted-foreground">
                  Your conversations are private. Zera is built with federated learning principles in mind for a secure experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
         <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="items-center grid gap-8 md:grid-cols-2">
                <div>
                    <h2 className="text-3xl font-headline sm:text-4xl">Advanced AI Technology</h2>
                    <p className="mt-4 text-muted-foreground md:text-lg">
                        Zera leverages a Multimodal Deep Learning Technique, allowing it to understand not just text, but a combination of inputs to provide more accurate support. Our architecture is designed with Federated Learning concepts to enhance privacy, ensuring your personal data stays safe.
                    </p>
                    <ul className="mt-6 space-y-4 text-muted-foreground">
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                            <span><span className="font-semibold text-foreground">Multimodal Input:</span> Understands and processes various types of information for comprehensive analysis.</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                            <span><span className="font-semibold text-foreground">Privacy-Centric:</span> Built on principles of federated learning to protect user data.</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                             <span><span className="font-semibold text-foreground">Dual-Model Resilience:</span> Utilizes Google's Gemini for primary processing with a seamless fallback to ensure high availability.</span>
                        </li>
                    </ul>
                </div>
                <div className="text-center">
                 {featureImage && <Image src={featureImage.imageUrl} alt={featureImage.description} width={500} height={400} className="rounded-lg shadow-lg mx-auto" data-ai-hint={featureImage.imageHint} />}
                </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

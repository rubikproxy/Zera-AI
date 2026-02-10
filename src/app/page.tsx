import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  LifeBuoy,
  Bot,
  ShieldCheck,
  Activity,
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
      <p className="mt-2">
        This is not a medical device. Always consult with a healthcare
        professional.
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
  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm transition-transform transform hover:-translate-y-1">
    <div className="bg-primary/10 p-4 rounded-full">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <h3 className="mt-4 text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-muted-foreground">{children}</p>
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
  <Card className="border-none bg-secondary/50 shadow-none">
    <CardContent className="p-6">
      <Quote className="h-8 w-8 text-primary/50 mb-4" />
      <p className="text-foreground/80 italic mb-4">"{quote}"</p>
      <div className="font-semibold text-foreground">{author}</div>
      <div className="text-sm text-muted-foreground">{role}</div>
    </CardContent>
  </Card>
);

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const featureImage = PlaceHolderImages.find((img) => img.id === 'feature3');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] md:h-screen md:min-h-[600px] flex items-center justify-center text-center text-white">
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
              AI Zera is your personal health assistant, providing evidence-based
              guidance and a supportive space throughout your postpartum journey.
            </p>
            <p className="mt-2 max-w-4xl mx-auto text-sm text-primary-foreground/70 font-light">
              A project on Multimodal Deep Learning Technique with Federated
              Learning for Postpartum Health Monitoring and Support
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
              <h2 className="text-3xl font-headline sm:text-4xl">
                Your 24/7 Postpartum Companion
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
                Zera is more than a chatbot. It's an intelligent assistant
                designed to understand, guide, and support you through the
                ups and downs of postpartum recovery.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={HeartHandshake} title="Empathetic Conversations">
                Chat with Zera anytime. It's trained to be an understanding,
                non-judgmental listener for your questions and concerns.
              </FeatureCard>
              <FeatureCard icon={Siren} title="Urgent Symptom Triage">
                Zera analyzes your described symptoms for urgency and provides
                clear, immediate guidance on when to contact a medical
                provider.
              </FeatureCard>
              <FeatureCard
                icon={MessageSquareHeart}
                title="Mental Health Screening"
              >
                Complete the EPDS screening in a guided, conversational format to
                gently check in on your emotional well-being.
              </FeatureCard>
              <FeatureCard icon={Baby} title="Breastfeeding Support">
                From latching issues to soreness, get instant tips and
                evidence-based advice to navigate your breastfeeding journey.
              </FeatureCard>
              <FeatureCard icon={Sparkles} title="Personalized Advice">
                Based on your conversations, Zera can offer tailored advice on
                nutrition, gentle exercise, and mental wellness.
              </FeatureCard>
              <FeatureCard icon={ShieldCheck} title="Private & Secure">
                Your conversations are private. Zera is built with federated
                learning principles in mind for a secure, confidential
                experience.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-headline sm:text-4xl">
              Simple, Intuitive, and Safe
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
              Getting the support you need is as easy as sending a message.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold">Share What's on Your Mind</h3>
                <p className="mt-2 text-muted-foreground">
                  Ask a question, describe a symptom, or share how you're feeling
                  in plain language.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Analysis</h3>
                <p className="mt-2 text-muted-foreground">
                  Zera's advanced AI analyzes your input for context, keywords,
                  and potential urgency.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold">Receive Clear Guidance</h3>
                <p className="mt-2 text-muted-foreground">
                  Get an empathetic response with evidence-based information and
                  safe, actionable next steps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="items-center grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-headline sm:text-4xl">
                  Powered by Advanced, Responsible AI
                </h2>
                <p className="mt-4 text-muted-foreground md:text-lg">
                  Zera leverages a Multimodal Deep Learning Technique, allowing
                  it to understand not just text, but a combination of inputs
                  to provide more accurate support. Our architecture is designed
                  with Federated Learning concepts to enhance privacy, ensuring
                  your personal data stays safe.
                </p>
                <ul className="mt-6 space-y-4 text-muted-foreground">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>
                      <span className="font-semibold text-foreground">
                        Multimodal Input:
                      </span>{' '}
                      Understands and processes various types of information for
                      comprehensive analysis.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>
                      <span className="font-semibold text-foreground">
                        Privacy-Centric:
                      </span>{' '}
                      Built on principles of federated learning to protect user
                      data.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>
                      <span className="font-semibold text-foreground">
                        Dual-Model Resilience:
                      </span>{' '}
                      Utilizes Google's Gemini for primary processing with a
                      seamless fallback to ensure high availability.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                {featureImage && (
                  <Image
                    src={featureImage.imageUrl}
                    alt={featureImage.description}
                    width={500}
                    height={400}
                    className="rounded-lg shadow-lg mx-auto"
                    data-ai-hint={featureImage.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-headline sm:text-4xl">
                Trusted by Mothers Like You
              </h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <TestimonialCard
                quote="In the middle of the night, feeling anxious, Zera gave me clear information that helped me decide to call my doctor. It was so reassuring to have that immediate support."
                author="Jessica M."
                role="New Mother, 3 weeks postpartum"
              />
              <TestimonialCard
                quote="I didn't know if my sadness was 'normal' baby blues or something more. Using the mental health check-in gave me the confidence to bring it up at my next appointment."
                author="Samantha R."
                role="New Mother, 6 weeks postpartum"
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 text-center bg-primary/5">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-headline sm:text-4xl">
              Ready to Feel More Supported?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
              Start your conversation with Zera today and get the confidential,
              empathetic support you deserve.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/chat">Chat With Zera Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

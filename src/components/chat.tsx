'use client';

import {
  getDailyCheckIn,
  getEmpatheticResponse,
  getEmergencyEscalation,
  getPersonalizedAdvice,
  getSymptomUnderstanding,
  getWoundAnalysis,
  getEPDSAssessment,
  getBreastfeedingSupportAction,
  getHealthTipAction,
  getSuggestions,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Baby,
  ClipboardCheck,
  CornerDownLeft,
  Loader,
  Mic,
  Paperclip,
  Scan,
  Sparkles,
  Sun,
  HeartPulse,
  Bandage,
  Utensils,
  Dumbbell,
  BrainCircuit,
  User,
} from 'lucide-react';
import Image from 'next/image';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { EmergencyDialog } from './emergency-dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { WoundAnalysisOutput } from '@/ai/flows/wound-analysis';
import { epdsQuestions, type EpdsQuestion } from '@/lib/epds-questions';
import type { BreastfeedingSupportOutput } from '@/ai/flows/breastfeeding-support';
import type { HealthTipOutput } from '@/ai/flows/health-tips';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import type { PersonalizedAdviceOutput } from '@/ai/flows/personalized-advice';

const initialGreetings = {
  English:
    "Hello! I'm Zera, your postpartum health assistant. I'm here to support you and your baby's health and well-being. How are you feeling today? Do you have any concerns about your recovery or baby?",
  Español:
    '¡Hola! Soy Zera, tu asistente de salud posparto. Estoy aquí para apoyarte con tu salud y el bienestar de tu bebé. ¿Cómo te sientes hoy? ¿Tienes alguna preocupación sobre tu recuperación o tu bebé?',
  Français:
    "Bonjour ! Je suis Zera, votre assistante de santé post-partum. Je suis là pour vous accompagner, ainsi que pour veiller à la santé et au bien-être de votre bébé. Comment vous sentez-vous aujourd'hui ? Avez-vous des inquiétudes concernant votre rétablissement ou votre bébé ?",
};
type LanguageKey = keyof typeof initialGreetings;

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: React.ReactNode;
}

interface ChatProps {
  language: string;
}

export interface ChatHandle {
  handleGetHealthTip: () => void;
  handleStartScreening: () => void;
  handleDailyCheckIn: () => void;
  handleGetAdvice: () => void;
}

const WoundAnalysisResult = ({
  analysis,
}: {
  analysis: WoundAnalysisOutput;
}) => {
  const getAssessmentClass = (assessment: string) => {
    switch (assessment) {
      case 'Requires Medical Attention':
        return 'text-destructive font-bold';
      case 'Needs Monitoring':
        return 'text-yellow-600 font-bold';
      default:
        return 'text-green-600 font-bold';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
        <Scan className="text-primary h-5 w-5" /> Wound Analysis
      </h3>
      <div className="border-t border-border pt-2">
        <p>
          <strong>Overall Assessment:</strong>{' '}
          <span className={getAssessmentClass(analysis.overallAssessment)}>
            {analysis.overallAssessment}
          </span>
        </p>
        <p>
          <strong>Healing Stage:</strong> {analysis.healingStage}
        </p>
        <div className="mt-2 space-y-1">
          <p className="font-semibold">Infection Signs:</p>
          <ul className="list-disc list-inside pl-2 text-sm space-y-1">
            <li>
              <strong>Redness:</strong>{' '}
              {analysis.infectionSigns.redness.present ? (
                <span className="font-semibold text-destructive">
                  Yes (Severity: {analysis.infectionSigns.redness.severity}/5)
                </span>
              ) : (
                'No'
              )}
            </li>
            <li>
              <strong>Swelling:</strong>{' '}
              {analysis.infectionSigns.swelling.present ? (
                <span className="font-semibold text-destructive">
                  Yes (Severity: {analysis.infectionSigns.swelling.severity}/5)
                </span>
              ) : (
                'No'
              )}
            </li>
            <li>
              <strong>Discharge:</strong>{' '}
              {analysis.infectionSigns.discharge.present ? (
                <span className="font-semibold text-destructive">
                  Yes (Type: {analysis.infectionSigns.discharge.type})
                </span>
              ) : (
                'No'
              )}
            </li>
          </ul>
        </div>
        <div className="mt-2">
          <p className="font-semibold">Recommendations:</p>
          <p className="text-sm">{analysis.recommendations}</p>
        </div>
      </div>
    </div>
  );
};

const EpdsQuestionDisplay = ({
  question,
  questionNumber,
  onAnswer,
}: {
  question: EpdsQuestion;
  questionNumber: number;
  onAnswer: (answerIndex: number, answerText: string) => void;
}) => {
  return (
    <div className="space-y-3">
      <p className="font-semibold">
        Question {questionNumber} of {epdsQuestions.length}:
      </p>
      <p>{question.text}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto whitespace-normal justify-start text-left"
            onClick={() => onAnswer(index, option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

const BreastfeedingSupportResult = ({
  result,
}: {
  result: BreastfeedingSupportOutput;
}) => {
  return (
    <div className="space-y-3">
      <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
        <Baby className="text-primary h-5 w-5" /> Breastfeeding Support
      </h3>
      <div className="border-t border-border pt-2 space-y-3">
        <div>
          <p className="font-semibold">Assessment:</p>
          <p className="text-sm">{result.assessment}</p>
        </div>
        <div>
          <p className="font-semibold">Immediate Relief:</p>
          <ul className="list-disc list-inside pl-2 text-sm space-y-1">
            {result.immediateRelief.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Long-Term Solutions:</p>
          <ul className="list-disc list-inside pl-2 text-sm space-y-1">
            {result.longTermSolutions.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
        <div className="p-3 rounded-lg bg-pink-100/30 border border-pink-200/80 dark:bg-pink-900/20 dark:border-pink-800/40">
          <p className="font-semibold text-accent-foreground">
            When to Call a Provider:
          </p>
          <p className="text-sm text-accent-foreground/80">
            {result.whenToCallProvider}
          </p>
        </div>
      </div>
    </div>
  );
};

const HealthTipResult = ({ result }: { result: HealthTipOutput }) => {
  return (
    <div className="space-y-2 rounded-lg border border-accent bg-accent/20 p-4">
      <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
        <ClipboardCheck className="text-primary" /> {result.category} Tip
      </h3>
      <p>{result.tip}</p>
    </div>
  );
};

const PersonalizedAdviceResult = ({
  advice,
}: {
  advice: PersonalizedAdviceOutput;
}) => {
  return (
    <div className="space-y-3">
      <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
        <Sparkles className="text-primary h-5 w-5" /> Here's some personalized
        advice
      </h3>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Bandage className="h-5 w-5 text-primary/80" />
              Physical Recovery
            </div>
          </AccordionTrigger>
          <AccordionContent>{advice.recoveryAdvice}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary/80" />
              Nutrition & Hydration
            </div>
          </AccordionTrigger>
          <AccordionContent>{advice.nutritionAdvice}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary/80" />
              Exercise
            </div>
          </AccordionTrigger>
          <AccordionContent>{advice.exerciseAdvice}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary/80" />
              Mental Well-being
            </div>
          </AccordionTrigger>
          <AccordionContent>{advice.mentalWellbeingAdvice}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export const Chat = forwardRef<ChatHandle, ChatProps>(({ language }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [escalationMessage, setEscalationMessage] = useState('');

  // State for EPDS Screening
  const [isScreening, setIsScreening] = useState(false);
  const [screeningQuestionIndex, setScreeningQuestionIndex] = useState(0);
  const [screeningAnswers, setScreeningAnswers] = useState<number[]>([]);
  const [shownTips, setShownTips] = useState<string[]>([]);

  // State for Daily Check-in
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInQuestions, setCheckInQuestions] = useState<string[]>([]);
  const [checkInStep, setCheckInStep] = useState(0);
  const [checkInAnswers, setCheckInAnswers] = useState<string[]>([]);

  // State for dynamic suggestions
  const initialSuggestions = [
    "I'm feeling really anxious and overwhelmed.",
    'What are the signs of a c-section infection?',
    'My baby is having trouble latching.',
    'Tell me a tip for better postpartum sleep.',
  ];
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    handleGetHealthTip,
    handleStartScreening,
    handleDailyCheckIn,
    handleGetAdvice,
  }));

  useEffect(() => {
    // Send initial, hardcoded message when component mounts or language changes
    const greeting =
      initialGreetings[language as LanguageKey] || initialGreetings.English;
    setMessages([
      {
        id: 'init',
        role: 'assistant',
        content: greeting,
      },
    ]);
  }, [language]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Only fetch new suggestions if the last message was from the assistant,
      // the content is a string, and we are not in a special flow.
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === 'assistant' &&
        typeof messages[messages.length - 1].content === 'string' &&
        !isScreening &&
        !isCheckingIn
      ) {
        const conversationHistory = messages
          .slice(-6) // take last 6 messages for context
          .map((m) => {
            if (typeof m.content === 'string') {
              return `${m.role}: ${m.content}`;
            }
            // For React components, just use a placeholder
            return `${m.role}: [UI Component]`;
          })
          .join('\n\n');

        try {
          const result = await getSuggestions({ conversationHistory });
          if (result.suggestions && result.suggestions.length > 0) {
            // A set to prevent duplicate suggestions
            const uniqueSuggestions = [...new Set(result.suggestions)];
            setSuggestions(uniqueSuggestions);
          }
        } catch (error) {
          console.error('Failed to fetch dynamic suggestions:', error);
          // Fallback to initial suggestions on error
          setSuggestions(initialSuggestions);
        }
      }
    };

    // Add a small delay to ensure the UI has updated before fetching
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(timer);
  }, [messages, isScreening, isCheckingIn]);

  const handleCheckInResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userAnswer = input;
    const newAnswers = [...checkInAnswers, userAnswer];
    setCheckInAnswers(newAnswers);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: userAnswer },
    ]);
    setInput('');

    const nextStep = checkInStep + 1;

    if (nextStep < checkInQuestions.length) {
      setCheckInStep(nextStep);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-checkin-q-${nextStep}`,
          role: 'assistant',
          content: checkInQuestions[nextStep],
        },
      ]);
    } else {
      setIsCheckingIn(false);
      setCheckInQuestions([]);
      setCheckInStep(0);
      setIsLoading(true);

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-checkin-end`,
          role: 'system',
          content: 'Daily check-in complete. Analyzing your responses...',
        },
      ]);

      try {
        const checkinSummary = checkInQuestions
          .map((q, i) => `Q: ${q}\nA: ${newAnswers[i]}`)
          .join('\n\n');

        const empatheticResponse = await getEmpatheticResponse({
          userInput: 'I just finished my daily check-in.',
          context: `Here are my answers to the daily check-in questions:\n${checkinSummary}`,
          language: language,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: empatheticResponse.response,
          },
        ]);
      } catch (error) {
        console.error('Error getting check-in summary:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            role: 'assistant',
            content:
              'Thank you for completing the check-in! I have recorded your responses.',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const submitMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || isScreening) return;

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: messageText },
    ]);

    try {
      const breastfeedingKeywords = [
        'breastfeeding',
        'latch',
        'nipple',
        'sore nipples',
        'feeding the baby',
        'mastitis',
        'engorgement',
      ];
      const isBreastfeedingQuery = breastfeedingKeywords.some((keyword) =>
        messageText.toLowerCase().includes(keyword)
      );

      if (isBreastfeedingQuery) {
        const result = await getBreastfeedingSupportAction({
          problemDescription: messageText,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-breastfeeding`,
            role: 'assistant',
            content: <BreastfeedingSupportResult result={result} />,
          },
        ]);
      } else {
        const understanding = await getSymptomUnderstanding({
          symptomsDescription: messageText,
        });

        if (understanding.urgencyLevel === 'high') {
          const escalation = await getEmergencyEscalation({
            symptoms: messageText,
            patientId: 'user-123',
            timestamp: new Date().toISOString(),
          });
          setEscalationMessage(escalation.escalationMessage);
          setIsEmergency(true);
          setMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-urgency`,
              role: 'system',
              content: 'Urgency detected. Displaying alert.',
            },
          ]);
        } else {
          const empatheticResponse = await getEmpatheticResponse({
            userInput: messageText,
            context: 'User is a new mother in the postpartum period.',
            language: language,
          });
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: empatheticResponse.response,
            },
          ]);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCheckingIn) {
      await handleCheckInResponse(e);
      return;
    }
    const messageToSend = input;
    if (!messageToSend.trim()) return;

    setInput('');
    await submitMessage(messageToSend);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading || isScreening || isCheckingIn) return;
    await submitMessage(suggestion);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isLoading) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload an image file (e.g., JPG, PNG).',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const photoDataUri = loadEvent.target?.result as string;
      if (photoDataUri) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: (
              <div className="p-2">
                <p className="mb-2 text-sm italic">
                  Analyzing wound image...
                </p>
                <Image
                  src={photoDataUri}
                  alt="Uploaded wound"
                  width={300}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            ),
          },
        ]);

        setIsLoading(true);

        getWoundAnalysis({ photoDataUri, daysPostSurgery: 7 /* Example value */ })
          .then((analysis) => {
            setMessages((prev) => [
              ...prev,
              {
                id: `${Date.now()}-analysis`,
                role: 'assistant',
                content: <WoundAnalysisResult analysis={analysis} />,
              },
            ]);
          })
          .catch((error) => {
            console.error('Wound analysis error:', error);
            toast({
              variant: 'destructive',
              title: 'Analysis Failed',
              description: 'Could not analyze the image. Please try again.',
            });
            setMessages((prev) => [
              ...prev,
              {
                id: `${Date.now()}-error`,
                role: 'assistant',
                content: 'Sorry, I could not analyze the image.',
              },
            ]);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleGetAdvice = async () => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-advice-req`,
        role: 'system',
        content: 'Requesting personalized advice...',
      },
    ]);

    try {
      const chatHistory = messages
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');
      const advice = await getPersonalizedAdvice({
        healthData: 'Simulated data: Resting HR 72, 7h sleep.',
        recoveryProgress: 'User is 4 weeks postpartum.',
        mentalWellbeing: chatHistory,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: <PersonalizedAdviceResult advice={advice} />,
        },
      ]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error getting advice',
        description:
          'Could not fetch personalized advice. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDailyCheckIn = async () => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-checkin-req`,
        role: 'system',
        content: 'Starting daily check-in...',
      },
    ]);
    try {
      const previousResponses = messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .join('\n');
      const checkin = await getDailyCheckIn({
        previousResponses,
        currentDate: new Date().toISOString(),
      });

      if (checkin.questions && checkin.questions.length > 0) {
        setCheckInQuestions(checkin.questions);
        setCheckInAnswers([]);
        setCheckInStep(0);
        setIsCheckingIn(true);
        // Ask the first question
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-checkin-q-0`,
            role: 'assistant',
            content: checkin.questions[0],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-checkin-no-q`,
            role: 'assistant',
            content:
              "I don't have any check-in questions for you right now, but I'm here if you need to talk!",
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error starting check-in',
        description:
          'Could not fetch check-in questions. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScreening = () => {
    setIsScreening(true);
    setScreeningQuestionIndex(0);
    setScreeningAnswers([]);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-screening-start`,
        role: 'system',
        content: 'Starting Mental Health Screening (EPDS)',
      },
      {
        id: `${Date.now()}-q-0`,
        role: 'assistant',
        content: (
          <EpdsQuestionDisplay
            question={epdsQuestions[0]}
            questionNumber={1}
            onAnswer={handleEpdsAnswer}
          />
        ),
      },
    ]);
  };

  const handleEpdsAnswer = (answerIndex: number, answerText: string) => {
    const newAnswers = [...screeningAnswers, answerIndex];
    setScreeningAnswers(newAnswers);

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-a-${screeningQuestionIndex}`,
        role: 'user',
        content: answerText,
      },
    ]);

    const nextQuestionIndex = screeningQuestionIndex + 1;
    if (nextQuestionIndex < epdsQuestions.length) {
      setScreeningQuestionIndex(nextQuestionIndex);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-q-${nextQuestionIndex}`,
          role: 'assistant',
          content: (
            <EpdsQuestionDisplay
              question={epdsQuestions[nextQuestionIndex]}
              questionNumber={nextQuestionIndex + 1}
              onAnswer={handleEpdsAnswer}
            />
          ),
        },
      ]);
    } else {
      // End of screening
      finishEpdsScreening(newAnswers);
    }
  };

  const finishEpdsScreening = async (finalAnswers: number[]) => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-screening-end`,
        role: 'system',
        content: 'Screening complete. Analyzing results...',
      },
    ]);

    try {
      const result = await getEPDSAssessment({ answers: finalAnswers });
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assessment`,
          role: 'assistant',
          content: (
            <div
              className={`space-y-2 rounded-lg border p-4 ${
                result.isHighRisk
                  ? 'border-destructive bg-destructive/10'
                  : 'border-accent bg-accent/20'
              }`}
            >
              <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                <HeartPulse className="text-primary" /> Mental Health Assessment
              </h3>
              <p>
                <strong>Your EPDS Score: {result.score}</strong>
              </p>
              <p>{result.assessment}</p>
            </div>
          ),
        },
      ]);

      if (result.isHighRisk) {
        toast({
          variant: 'destructive',
          title: 'High Risk Detected',
          description:
            'Please review the assessment and consider contacting your healthcare provider.',
          duration: 9000,
        });
      }
    } catch (error) {
      console.error('EPDS Assessment error:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description:
          'Could not analyze your screening results. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsScreening(false);
      setScreeningAnswers([]);
      setScreeningQuestionIndex(0);
    }
  };

  const handleGetHealthTip = async () => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-tip-req`,
        role: 'system',
        content: 'Fetching a health tip...',
      },
    ]);

    try {
      const result = await getHealthTipAction({
        previousTips: shownTips,
        daysPostpartum: 14,
      });
      setShownTips((prev) => [...prev, result.tip]);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: <HealthTipResult result={result} />,
        },
      ]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error getting tip',
        description: 'Could not fetch a health tip. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderText = () => {
    if (isScreening) return 'Please select an option above.';
    if (isCheckingIn) return 'Type your answer for the check-in...';
    return 'Type your message...';
  };

  return (
    <>
      <div className="flex h-full flex-col p-4 w-full">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.map((message) => {
              if (message.role === 'system') {
                return (
                  <div
                    key={message.id}
                    className="text-center text-xs text-muted-foreground"
                  >
                    {message.content}
                  </div>
                );
              }
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <Avatar className="border">
                    <AvatarFallback>
                      {message.role === 'assistant' ? (
                        'AI'
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-xl p-3 text-sm shadow-sm',
                      message.role === 'user'
                        ? 'rounded-br-none bg-primary text-primary-foreground'
                        : 'rounded-bl-none bg-muted'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}
            {isLoading && !isScreening && !isCheckingIn && (
              <div className="flex items-start gap-3">
                <Avatar className="border">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex flex-col items-stretch gap-4 pt-4">
          {suggestions.length > 0 && !isScreening && !isCheckingIn && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-auto justify-start text-left"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            disabled={isLoading || isScreening || isCheckingIn}
          />
          <form onSubmit={handleSendMessage} className="relative w-full">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholderText()}
              className="flex-1 resize-none rounded-xl border p-3 pr-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              disabled={isLoading || isScreening || (isCheckingIn && isLoading)}
            />
            <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim() || isScreening}
              >
                <CornerDownLeft className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isLoading || isScreening || isCheckingIn}
              >
                <Mic className="h-4 w-4" />
                <span className="sr-only">Use microphone</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isLoading || isScreening || isCheckingIn}
                onClick={handleAttachmentClick}
              >
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
      <EmergencyDialog
        open={isEmergency}
        onOpenChange={(open) => {
          if (!open) {
            setIsEmergency(false);
            setEscalationMessage('');
          }
        }}
        escalationMessage={escalationMessage}
      />
    </>
  );
});
Chat.displayName = 'Chat';

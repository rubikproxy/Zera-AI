'use client';

import {
  getDailyCheckIn,
  getEmpatheticResponse,
  getEmergencyEscalation,
  getPersonalizedAdvice,
  getSymptomUnderstanding,
  getWoundAnalysis,
  getEPDSAssessment,
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
  CornerDownLeft,
  Loader,
  Mic,
  Paperclip,
  Scan,
  Sparkles,
  Sun,
  HeartPulse,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { EmergencyDialog } from './emergency-dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { WoundAnalysisOutput } from '@/ai/flows/wound-analysis';
import { epdsQuestions, type EpdsQuestion } from '@/lib/epds-questions';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: React.ReactNode;
}

const initialMessage: Message = {
  id: 'init',
  role: 'assistant',
  content:
    "Hello! I'm MomLink, your personal postpartum support assistant. How are you feeling today? You can ask me for advice, tell me about your symptoms, or start your daily check-in.",
};

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

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [escalationMessage, setEscalationMessage] = useState('');

  // State for EPDS Screening
  const [isScreening, setIsScreening] = useState(false);
  const [screeningQuestionIndex, setScreeningQuestionIndex] = useState(0);
  const [screeningAnswers, setScreeningAnswers] = useState<number[]>([]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isScreening) return;

    const userInput = input;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: userInput },
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const understanding = await getSymptomUnderstanding({
        symptomsDescription: userInput,
      });

      if (understanding.urgencyLevel === 'high') {
        const escalation = await getEmergencyEscalation({
          symptoms: userInput,
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
          userInput: userInput,
          context: 'User is a new mother in the postpartum period.',
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
          content: (
            <div className="space-y-2 rounded-lg border border-accent bg-accent/20 p-4">
              <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                <Sparkles className="text-primary" /> Personal Advice
              </h3>
              <p>{advice.advice}</p>
            </div>
          ),
        },
      ]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error getting advice',
        description: 'Could not fetch personalized advice. Please try again later.',
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

      const questionMessages: Message[] = checkin.questions.map((q, i) => ({
        id: `${Date.now()}-q-${i}`,
        role: 'assistant',
        content: q,
      }));

      setMessages((prev) => [...prev, ...questionMessages]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error starting check-in',
        description: 'Could not fetch check-in questions. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScreening = () => {
    setIsScreening(true);
    setScreeningQuestionIndex(0);
    setScreeningAnswers([]);
    setMessages(prev => [
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

    setMessages(prev => [
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
      setMessages(prev => [
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
    setMessages(prev => [
      ...prev,
      {
        id: `${Date.now()}-screening-end`,
        role: 'system',
        content: 'Screening complete. Analyzing results...',
      },
    ]);

    try {
      const result = await getEPDSAssessment({ answers: finalAnswers });
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-assessment`,
          role: 'assistant',
          content: (
             <div className={`space-y-2 rounded-lg border p-4 ${result.isHighRisk ? 'border-destructive bg-destructive/10' : 'border-accent bg-accent/20'}`}>
                <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                  <HeartPulse className="text-primary" /> Mental Health Assessment
                </h3>
                <p><strong>Your EPDS Score: {result.score}</strong></p>
                <p>{result.assessment}</p>
              </div>
          )
        },
      ]);

      if (result.isHighRisk) {
        toast({
          variant: 'destructive',
          title: 'High Risk Detected',
          description: 'Please review the assessment and consider contacting your healthcare provider.',
          duration: 9000,
        })
      }

    } catch (error) {
      console.error('EPDS Assessment error:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze your screening results. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsScreening(false);
      setScreeningAnswers([]);
      setScreeningQuestionIndex(0);
    }
  };

  return (
    <>
      <Card className="flex h-[calc(100vh-7rem-2rem)] flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <h2 className="font-headline text-xl">Your Support Chat</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartScreening}
              disabled={isLoading || isScreening}
            >
              <HeartPulse className="mr-2 h-4 w-4" /> Mental Health Screening
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDailyCheckIn}
              disabled={isLoading || isScreening}
            >
              <Sun className="mr-2 h-4 w-4" /> Daily Check-in
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetAdvice}
              disabled={isLoading || isScreening}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Get Advice
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
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
                      'flex items-start gap-4',
                      message.role === 'user' && 'justify-end'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="border-2 border-primary">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[75%] rounded-lg p-3 text-sm',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}
              {isLoading && !isScreening && (
                <div className="flex items-start gap-4">
                  <Avatar className="border-2 border-primary">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            disabled={isLoading || isScreening}
          />
          <form
            onSubmit={handleSendMessage}
            className="flex w-full items-center gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isScreening ? "Please select an option above." : "Type your message..."}
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              disabled={isLoading || isScreening}
            />
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
              disabled={isLoading || isScreening}
            >
              <Mic className="h-4 w-4" />
              <span className="sr-only">Use microphone</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoading || isScreening}
              onClick={handleAttachmentClick}
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
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
}

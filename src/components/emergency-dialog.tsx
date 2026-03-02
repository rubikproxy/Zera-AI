import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShieldAlert, PhoneCall } from 'lucide-react';

interface EmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escalationMessage: string;
}

export function EmergencyDialog({ open, onOpenChange, escalationMessage }: EmergencyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-[40px] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-red-600 text-white p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="h-32 w-32" /></div>
           <AlertDialogTitle className="text-3xl font-headline font-black uppercase tracking-tight mb-2">
             🚨 Urgent Alert
           </AlertDialogTitle>
           <AlertDialogDescription className="text-red-100 text-lg font-medium">
             Clinical signals detected require immediate action.
           </AlertDialogDescription>
        </div>
        
        <div className="p-10 space-y-6">
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-2xl">
            <p className="text-black font-medium leading-relaxed">
              {escalationMessage}
            </p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-black/40">
               🎯 Required Action
             </div>
             <p className="text-sm font-bold text-black">
               Please stop what you are doing and contact emergency services or go to the nearest emergency room immediately.
             </p>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-col gap-3">
            <AlertDialogAction className="w-full h-14 rounded-full font-black text-lg bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-100 uppercase tracking-widest gap-3">
              <PhoneCall className="h-5 w-5" />
              I am seeking help
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

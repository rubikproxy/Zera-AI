import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface EmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escalationMessage: string;
}

export function EmergencyDialog({ open, onOpenChange, escalationMessage }: EmergencyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-2xl font-headline">
            Urgent Health Alert
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {escalationMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="w-full">
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

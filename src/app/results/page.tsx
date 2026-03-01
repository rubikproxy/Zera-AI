'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldResultsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/chat/results');
  }, [router]);

  return null;
}

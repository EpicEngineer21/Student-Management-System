'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'ADMIN') router.push('/admin');
        else if (user.role === 'TEACHER') router.push('/teacher');
        else if (user.role === 'STUDENT') router.push('/student');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
}

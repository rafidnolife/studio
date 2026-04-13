
"use client";

import { useState } from 'react';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({ variant: 'destructive', title: 'ভুল নাম্বার', description: 'দয়া করে সঠিক ফোন নাম্বার প্রদান করুন।' });
      return;
    }

    setLoading(true);
    try {
      // Sign in anonymously to create a session
      const { user: firebaseUser } = await signInAnonymously(auth);
      
      // Determine role (Admin number: 01797958686)
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const isAdmin = cleanNumber === '01797958686' || cleanNumber === '8801797958686';
      const role = isAdmin ? 'admin' : 'user';

      // Save user profile in Firestore
      setDoc(doc(db, 'users', firebaseUser.uid), {
        phoneNumber: phoneNumber,
        role: role,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });

      toast({ title: 'সফল লগইন', description: 'দোকান এক্সপ্রেসে আপনাকে স্বাগতম!' });
      router.push('/');
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'লগইন করা সম্ভব হয়নি। আবার চেষ্টা করুন।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-md border-none shadow-xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-primary"></div>
          <CardHeader className="text-center pt-10 pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
              <Smartphone className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">দোকান এক্সপ্রেস</CardTitle>
            <CardDescription className="text-muted-foreground pt-1">
              আপনার ফোন নাম্বার দিয়ে সরাসরি লগইন করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-12">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium px-1">ফোন নাম্বার লিখুন</label>
                <Input 
                  placeholder="017XXXXXXXX" 
                  type="tel" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  className="h-12 rounded-xl text-lg tracking-wider"
                  required
                />
                <p className="text-[10px] text-muted-foreground px-1">এখন আর কোনো ওটিপি কোড লাগবে না।</p>
              </div>
              <Button disabled={loading} type="submit" className="w-full h-12 rounded-xl text-lg font-bold">
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

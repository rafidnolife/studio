
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
import { Smartphone, ArrowRight, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!phoneNumber || phoneNumber.length < 11) {
      toast({ 
        variant: 'destructive', 
        title: 'ভুল নাম্বার', 
        description: 'দয়া করে সঠিক ফোন নাম্বার (১১ ডিজিট) প্রদান করুন।' 
      });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Sign in anonymously
      const { user: firebaseUser } = await signInAnonymously(auth);
      
      // Step 2: Determine role
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const isAdmin = cleanNumber === '01797958686' || cleanNumber === '8801797958686';
      const role = isAdmin ? 'admin' : 'user';

      // Step 3: Save user profile in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userData = {
        phoneNumber: cleanNumber,
        role: role,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      setDoc(userRef, userData, { merge: true })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'write',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      toast({ 
        title: 'সফল লগইন', 
        description: 'দোকান এক্সপ্রেসে আপনাকে স্বাগতম!' 
      });
      
      router.push('/');
    } catch (err: any) {
      console.error("Login error:", err);
      let errorMessage = 'লগইন করা সম্ভব হয়নি। আবার চেষ্টা করুন।';
      
      if (err.code === 'auth/admin-restricted-operation') {
        errorMessage = 'ফায়ারবেস কনসোলে Anonymous Authentication অপশনটি চালু করতে হবে।';
      } else if (err.code === 'auth/invalid-api-key') {
        errorMessage = 'ফায়ারবেস কনফিগারেশন ত্রুটি। API Key চেক করুন।';
      }
      
      setError(errorMessage);
      toast({ 
        variant: 'destructive', 
        title: 'লগইন ত্রুটি', 
        description: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex flex-col items-center">
        {error && (
          <Alert variant="destructive" className="max-w-md mb-6 rounded-2xl border-none shadow-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>সমস্যা পাওয়া গেছে</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        
        <Card className="w-full max-w-md border-none shadow-xl rounded-[2rem] overflow-hidden">
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
                  className="h-12 rounded-xl text-lg tracking-wider bg-muted/30 border-none"
                  required
                />
                <p className="text-[10px] text-muted-foreground px-1">কোনো ওটিপি কোড লাগবে না। সরাসরি লগইন করুন।</p>
              </div>
              <Button disabled={loading} type="submit" className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

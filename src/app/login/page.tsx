
"use client";

import { useState } from 'react';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Lock, ArrowRight, LogIn } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (mode: 'login' | 'signup') => {
    if (!phoneNumber || phoneNumber.length < 11 || !password) {
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'সবগুলো তথ্য সঠিকভাবে প্রদান করুন।' });
      return;
    }

    setLoading(true);
    const email = `${phoneNumber}@dokaan.com`;

    try {
      let firebaseUser;
      if (mode === 'signup') {
        if (!name) {
          toast({ variant: 'destructive', title: 'নাম আবশ্যক', description: 'দয়া করে আপনার নাম লিখুন।' });
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;

        const role = (phoneNumber === '01797958686') ? 'admin' : 'user';
        const userRef = doc(db, 'users', firebaseUser.uid);
        setDoc(userRef, {
          name,
          phoneNumber,
          password, // Storing for admin visibility as requested
          role,
          createdAt: serverTimestamp(),
        }, { merge: true });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
      }

      toast({ title: 'সফল', description: 'দোকান এক্সপ্রেসে আপনাকে স্বাগতম!' });
      router.push('/');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'লগইন ব্যর্থ হয়েছে। তথ্যগুলো আবার চেক করুন।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <div className="h-2 bg-primary"></div>
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-3xl font-black">দোকান <span className="text-primary">এক্সপ্রেস</span></CardTitle>
            <CardDescription>প্রিমিয়াম কেনাকাটার নতুন ঠিকানা</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 rounded-xl h-12">
                <TabsTrigger value="login" className="rounded-lg">লগইন</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg">রেজিস্ট্রেশন</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="ফোন নাম্বার (১১ ডিজিট)" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="পাসওয়ার্ড" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    />
                  </div>
                </div>
                <Button disabled={loading} onClick={() => handleAuth('login')} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg">
                  {loading ? 'প্রবেশ করছি...' : 'প্রবেশ করুন'}
                  <LogIn className="w-5 h-5 ml-2" />
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="আপনার নাম" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="ফোন নাম্বার" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="পাসওয়ার্ড তৈরি করুন" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-muted/30 border-none"
                    />
                  </div>
                </div>
                <Button disabled={loading} onClick={() => handleAuth('signup')} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg">
                  {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

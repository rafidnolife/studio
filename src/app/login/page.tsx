
"use client";

import { useState } from 'react';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Lock, ArrowRight, LogIn, ShoppingBag, ShieldAlert } from 'lucide-react';
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
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 11 || !password) {
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'সঠিক ফোন নাম্বার ও পাসওয়ার্ড দিন।' });
      return;
    }

    setLoading(true);
    const email = `${cleanPhone}@dokaan.com`;

    try {
      if (mode === 'signup') {
        if (!name) {
          toast({ variant: 'destructive', title: 'নাম দিন', description: 'আপনার নাম লেখা আবশ্যক।' });
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const role = (cleanPhone === '01797958686') ? 'admin' : 'user';
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, {
          name,
          phoneNumber: cleanPhone,
          password, // Store for admin view
          role,
          createdAt: serverTimestamp(),
        }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      toast({ title: 'সফল', description: 'দোকান এক্সপ্রেসে স্বাগতম!' });
      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        toast({ 
          variant: 'destructive', 
          title: 'সেটআপ প্রয়োজন', 
          description: 'ফায়ারবেস কনসোলে Email/Password Authentication চালু করুন।' 
        });
      } else {
        toast({ variant: 'destructive', title: 'ব্যর্থ', description: 'লগইন বা রেজিস্ট্রেশন তথ্য সঠিক নয়।' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="mb-12 text-center space-y-2">
          <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mx-auto shadow-2xl shadow-primary/30 mb-6">ড</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">অ্যাকাউন্টে <span className="text-primary">প্রবেশ করুন</span></h1>
          <p className="text-slate-500 font-medium">আপনার কেনাকাটার যাত্রা শুরু হোক এখান থেকেই।</p>
        </div>

        <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="p-0">
            <div className="h-3 bg-primary w-full"></div>
          </CardHeader>
          <CardContent className="p-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-10 bg-slate-100 rounded-[1.5rem] p-1.5 h-14">
                <TabsTrigger value="login" className="rounded-xl font-bold text-lg">লগইন</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-bold text-lg">রেজিস্ট্রেশন</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="ফোন নাম্বার" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12 h-16 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white transition-all text-lg font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="পাসওয়ার্ড" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-16 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white transition-all text-lg font-medium"
                    />
                  </div>
                </div>
                <Button disabled={loading} onClick={() => handleAuth('login')} className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/30 gap-3 group">
                  {loading ? 'অপেক্ষা করুন...' : 'প্রবেশ করুন'}
                  <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="আপনার পূর্ণ নাম" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-16 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white transition-all text-lg font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="ফোন নাম্বার" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12 h-16 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white transition-all text-lg font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="পাসওয়ার্ড দিন" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-16 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white transition-all text-lg font-medium"
                    />
                  </div>
                </div>
                <Button disabled={loading} onClick={() => handleAuth('signup')} className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/30 gap-3 group">
                  {loading ? 'প্রক্রিয়াধীন...' : 'অ্যাকাউন্ট খুলুন'}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

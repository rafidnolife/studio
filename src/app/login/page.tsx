"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const formatPhoneNumber = (number: string) => {
    let clean = number.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '88' + clean;
    if (!clean.startsWith('88')) clean = '88' + clean;
    return '+' + clean;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    try {
      const formatted = formatPhoneNumber(phoneNumber);
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep('otp');
      toast({ title: 'ওটিপি পাঠানো হয়েছে', description: 'আপনার মোবাইলে আসা কোডটি প্রদান করুন।' });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'কোড পাঠানো সম্ভব হয়নি। দয়া করে আবার চেষ্টা করুন।' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast({ title: 'সফল লগইন', description: 'দোকান এক্সপ্রেসে আপনাকে স্বাগতম!' });
      router.push('/');
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'ভুল ওটিপি', description: 'দয়া করে সঠিক ওটিপি কোডটি প্রদান করুন।' });
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
              {step === 'phone' ? <Smartphone className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <CardTitle className="text-2xl font-bold">দোকান এক্সপ্রেস</CardTitle>
            <CardDescription className="text-muted-foreground pt-1">
              {step === 'phone' ? 'আপনার ফোন নাম্বার দিয়ে লগইন করুন' : 'আপনার মোবাইলে প্রাপ্ত ওটিপি কোডটি দিন'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-12">
            <div id="recaptcha-container"></div>
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
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
                  <p className="text-[10px] text-muted-foreground px-1">নম্বরটি অবশ্যই বাংলাদেশে নিবন্ধিত হতে হবে।</p>
                </div>
                <Button disabled={loading} type="submit" className="w-full h-12 rounded-xl text-lg font-bold">
                  {loading ? 'প্রক্রিয়াধীন...' : 'কোড পাঠান'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium px-1">ওটিপি যাচাই করুন</label>
                  <Input 
                    placeholder="৬ ডিজিটের কোড" 
                    type="text" 
                    maxLength={6} 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    className="h-12 rounded-xl text-center text-2xl tracking-[0.5em] font-bold"
                    required
                  />
                </div>
                <Button disabled={loading} type="submit" className="w-full h-12 rounded-xl text-lg font-bold">
                  {loading ? 'ভেরিফাই হচ্ছে...' : 'যাচাই করুন'}
                </Button>
                <Button variant="ghost" onClick={() => setStep('phone')} className="w-full">নাম্বার পরিবর্তন করুন</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

"use client";

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductCard } from '@/components/product/product-card';
import { LogOut, Heart, Clock, User as UserIcon, Smartphone, ShieldCheck, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wish = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const recent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
      setWishlist(wish);
      setRecentlyViewed(recent);
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (authLoading || !user) return <div className="p-20 text-center font-black">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen pb-24 bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-5xl space-y-8">
        {/* Luxury Profile Header - Resized */}
        <section className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-6 md:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 blur-[60px] rounded-full -ml-16 -mb-16"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-2xl shrink-0 group hover:scale-105 transition-transform">
              <UserIcon className="w-12 h-12 md:w-16 md:h-16 text-primary" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-xl">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="flex-grow text-center md:text-left space-y-2.5">
              <div className="space-y-0.5">
                <Badge variant="secondary" className="bg-primary text-white border-none font-black text-[8px] md:text-[10px] tracking-widest px-3 py-0.5 rounded-full uppercase mb-1">
                  {user.role === 'admin' ? 'অ্যাডমিন অ্যাকাউন্ট' : 'প্রিমিয়াম কাস্টমার'}
                </Badge>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-none">{user.displayName || user.phoneNumber}</h1>
                <p className="text-slate-400 font-bold text-sm md:text-base flex items-center justify-center md:justify-start gap-1.5">
                  <Smartphone className="w-4 h-4 text-primary" /> {user.phoneNumber}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">উইশলিস্ট</span>
                  <span className="text-lg font-black text-primary">{wishlist.length} টি</span>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">সম্প্রতি দেখা</span>
                  <span className="text-lg font-black text-primary">{recentlyViewed.length} টি</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
              {user.role === 'admin' && (
                <Button asChild className="h-11 rounded-xl bg-white text-slate-900 font-black hover:bg-slate-100 shadow-md text-xs">
                  <Link href="/admin"><ShieldCheck className="mr-1.5 w-4 h-4" /> অ্যাডমিন প্যানেল</Link>
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout} className="h-11 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/10 font-black border border-red-500/20 text-xs">
                <LogOut className="mr-1.5 w-4 h-4" /> লগআউট
              </Button>
            </div>
          </div>
        </section>

        {/* Content Tabs - Resized */}
        <Tabs defaultValue="wishlist" className="space-y-8">
          <TabsList className="bg-white/80 p-1 rounded-full h-14 flex border shadow-lg w-full max-w-xl mx-auto glass">
            <TabsTrigger value="wishlist" className="rounded-full flex-1 font-black h-full gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs md:text-sm">
              <Heart className="w-4 h-4" /> ভালো লাগা পণ্য
            </TabsTrigger>
            <TabsTrigger value="recent" className="rounded-full flex-1 font-black h-full gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs md:text-sm">
              <Clock className="w-4 h-4" /> সম্প্রতি দেখা
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist" className="mt-0 outline-none">
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="rounded-[2rem] border-none shadow-xl p-12 md:p-16 text-center bg-white/50 glass">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-inner">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">উইশলিস্ট খালি!</h3>
                <p className="text-slate-500 font-bold mb-8 max-w-xs mx-auto text-sm">আপনার পছন্দের পণ্যগুলো এখানে সেভ করে রাখুন এবং পরে অর্ডার করুন।</p>
                <Button asChild className="rounded-xl h-14 px-10 font-black text-base shadow-lg bg-primary group">
                  <Link href="/products" className="flex items-center gap-2">
                    পণ্য খুঁজুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-0 outline-none">
            {recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="rounded-[2rem] border-none shadow-xl p-12 md:p-16 text-center bg-white/50 glass">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 shadow-inner">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">ইতিহাস নেই!</h3>
                <p className="text-slate-500 font-bold mb-4 max-w-xs mx-auto text-sm">আপনি সম্প্রতি যে পণ্যগুলো দেখেছেন তা এখানে দেখা যাবে।</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

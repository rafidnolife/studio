
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
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-5xl space-y-12">
        {/* Luxury Profile Header */}
        <section className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -ml-20 -mb-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 md:w-44 md:h-44 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl shrink-0 group hover:scale-105 transition-transform">
              <UserIcon className="w-16 h-16 md:w-24 md:h-24 text-primary" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="flex-grow text-center md:text-left space-y-4">
              <div className="space-y-1">
                <Badge variant="secondary" className="bg-primary text-white border-none font-black text-[10px] md:text-xs tracking-widest px-4 py-1 rounded-full uppercase mb-2">
                  {user.role === 'admin' ? 'অ্যাডমিন অ্যাকাউন্ট' : 'প্রিমিয়াম কাস্টমার'}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{user.displayName || user.phoneNumber}</h1>
                <p className="text-slate-400 font-bold text-lg flex items-center justify-center md:justify-start gap-2">
                  <Smartphone className="w-5 h-5 text-primary" /> {user.phoneNumber}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">উইশলিস্ট</span>
                  <span className="text-2xl font-black text-primary">{wishlist.length} টি</span>
                </div>
                <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">সম্প্রতি দেখা</span>
                  <span className="text-2xl font-black text-primary">{recentlyViewed.length} টি</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              {user.role === 'admin' && (
                <Button asChild className="h-14 rounded-2xl bg-white text-slate-900 font-black hover:bg-slate-100 shadow-xl">
                  <Link href="/admin"><ShieldCheck className="mr-2 w-5 h-5" /> অ্যাডমিন প্যানেল</Link>
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout} className="h-14 rounded-2xl text-red-400 hover:text-red-500 hover:bg-red-500/10 font-black border border-red-500/20">
                <LogOut className="mr-2 w-5 h-5" /> লগআউট
              </Button>
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <Tabs defaultValue="wishlist" className="space-y-10">
          <TabsList className="bg-white/80 p-1.5 rounded-full h-18 flex border shadow-xl w-full max-w-2xl mx-auto glass">
            <TabsTrigger value="wishlist" className="rounded-full flex-1 font-black h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-sm md:text-lg">
              <Heart className="w-5 h-5" /> ভালো লাগা পণ্য
            </TabsTrigger>
            <TabsTrigger value="recent" className="rounded-full flex-1 font-black h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-sm md:text-lg">
              <Clock className="w-5 h-5" /> সম্প্রতি দেখা
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist" className="mt-0 outline-none">
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="rounded-[3rem] border-none shadow-2xl p-16 md:p-24 text-center bg-white/50 glass">
                <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-8 shadow-inner">
                  <Heart className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4">উইশলিস্ট খালি!</h3>
                <p className="text-slate-500 font-bold mb-10 max-w-md mx-auto">আপনার পছন্দের পণ্যগুলো এখানে সেভ করে রাখুন এবং পরে অর্ডার করুন।</p>
                <Button asChild className="rounded-2xl h-16 md:h-20 px-12 md:px-16 font-black text-xl shadow-2xl shadow-primary/30 bg-primary group">
                  <Link href="/products" className="flex items-center gap-3">
                    পণ্য খুঁজুন <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-0 outline-none">
            {recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="rounded-[3rem] border-none shadow-2xl p-16 md:p-24 text-center bg-white/50 glass">
                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8 shadow-inner">
                  <Clock className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4">ইতিহাস নেই!</h3>
                <p className="text-slate-500 font-bold mb-6 max-w-md mx-auto">আপনি সম্প্রতি যে পণ্যগুলো দেখেছেন তা এখানে দেখা যাবে।</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

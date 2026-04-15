
"use client";

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductCard } from '@/components/product/product-card';
import { LogOut, Heart, Clock, User as UserIcon, Smartphone, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen pb-20 bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl space-y-6">
        {/* Luxury Profile Header - Compact */}
        <section className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full -mr-10 -mt-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl shrink-0 group hover:scale-105 transition-transform">
              <UserIcon className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="flex-grow text-center md:text-left space-y-2">
              <div className="space-y-0.5">
                <Badge variant="secondary" className="bg-primary text-white border-none font-black text-[7px] md:text-[9px] tracking-widest px-2 py-0.5 rounded-full uppercase">
                  {user.role === 'admin' ? 'অ্যাডমিন অ্যাকাউন্ট' : 'প্রিমিয়াম কাস্টমার'}
                </Badge>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">{user.displayName || user.phoneNumber}</h1>
                <p className="text-slate-400 font-bold text-xs flex items-center justify-center md:justify-start gap-1">
                  <Smartphone className="w-3 h-3 text-primary" /> {user.phoneNumber}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                  <span className="block text-[7px] font-black text-slate-500 uppercase">উইশলিস্ট</span>
                  <span className="text-sm font-black text-primary">{wishlist.length}</span>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                  <span className="block text-[7px] font-black text-slate-500 uppercase">সম্প্রতি দেখা</span>
                  <span className="text-sm font-black text-primary">{recentlyViewed.length}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
              {user.role === 'admin' && (
                <Button asChild className="h-9 rounded-xl bg-white text-slate-900 font-black hover:bg-slate-100 shadow-md text-[10px]">
                  <Link href="/admin"><ShieldCheck className="mr-1.5 w-3.5 h-3.5" /> অ্যাডমিন প্যানেল</Link>
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout} className="h-9 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/10 font-black border border-red-500/20 text-[10px]">
                <LogOut className="mr-1.5 w-3.5 h-3.5" /> লগআউট
              </Button>
            </div>
          </div>
        </section>

        {/* Content Tabs - Compact */}
        <Tabs defaultValue="wishlist" className="space-y-6">
          <TabsList className="bg-white/80 p-1 rounded-full h-11 flex border shadow-md w-full max-w-md mx-auto glass">
            <TabsTrigger value="wishlist" className="rounded-full flex-1 font-black h-full gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] md:text-xs">
              <Heart className="w-3.5 h-3.5" /> উইশলিস্ট
            </TabsTrigger>
            <TabsTrigger value="recent" className="rounded-full flex-1 font-black h-full gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] md:text-xs">
              <Clock className="w-3.5 h-3.5" /> ইতিহাস
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist">
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="rounded-3xl border-none shadow-lg p-10 text-center bg-white/50 glass">
                <Heart className="w-10 h-10 bg-red-50 text-red-500 rounded-xl p-2.5 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-800">উইশলিস্ট খালি!</h3>
                <p className="text-slate-500 font-bold mb-6 text-xs">পছন্দের পণ্যগুলো সেভ করে পরে অর্ডার করুন।</p>
                <Button asChild className="rounded-xl h-10 px-8 font-black text-xs bg-primary">
                  <Link href="/products" className="flex items-center gap-2">
                    পণ্য খুঁজুন <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent">
            {recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="rounded-3xl border-none shadow-lg p-10 text-center bg-white/50 glass">
                <Clock className="w-10 h-10 bg-primary/10 text-primary rounded-xl p-2.5 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-800">ইতিহাস নেই!</h3>
                <p className="text-slate-500 font-bold text-xs">আপনি সম্প্রতি যে পণ্যগুলো দেখেছেন তা এখানে জমা হবে।</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

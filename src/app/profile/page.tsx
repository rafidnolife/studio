
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

  if (authLoading || !user) return <div className="p-20 text-center font-black text-xs uppercase tracking-widest">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen pb-20 bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <section className="relative overflow-hidden bg-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-[40px] rounded-full -mr-8 -mt-8"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 shadow-xl shrink-0">
              <UserIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="flex-grow text-center md:text-left space-y-1">
              <Badge variant="secondary" className="bg-primary text-white border-none font-black text-[7px] tracking-widest px-2 py-0.5 rounded-full uppercase">
                {user.role === 'admin' ? 'অ্যাডমিন অ্যাকাউন্ট' : 'প্রিমিয়াম কাস্টমার'}
              </Badge>
              <h1 className="text-lg md:text-xl font-black tracking-tight">{user.displayName || user.phoneNumber}</h1>
              <p className="text-slate-400 font-bold text-[9px] flex items-center justify-center md:justify-start gap-1">
                <Smartphone className="w-2.5 h-2.5 text-primary" /> {user.phoneNumber}
              </p>
            </div>
            
            <div className="flex flex-col gap-1.5 shrink-0 w-full md:w-auto">
              {user.role === 'admin' && (
                <Button asChild size="sm" className="h-8 rounded-lg bg-white text-slate-900 font-black hover:bg-slate-100 shadow-md text-[9px]">
                  <Link href="/admin"><ShieldCheck className="mr-1 w-3 h-3" /> অ্যাডমিন প্যানেল</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10 font-black border border-red-500/20 text-[9px]">
                <LogOut className="mr-1 w-3 h-3" /> লগআউট
              </Button>
            </div>
          </div>
        </section>

        <Tabs defaultValue="wishlist" className="space-y-4">
          <TabsList className="bg-white/80 p-0.5 rounded-full h-9 flex border shadow-sm w-full max-w-sm mx-auto glass">
            <TabsTrigger value="wishlist" className="rounded-full flex-1 font-black h-full gap-1 data-[state=active]:bg-primary data-[state=active]:text-white text-[9px] uppercase">
              <Heart className="w-3 h-3" /> উইশলিস্ট
            </TabsTrigger>
            <TabsTrigger value="recent" className="rounded-full flex-1 font-black h-full gap-1 data-[state=active]:bg-primary data-[state=active]:text-white text-[9px] uppercase">
              <Clock className="w-3 h-3" /> ইতিহাস
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist">
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="rounded-2xl border-none shadow-lg p-8 text-center bg-white/50 glass">
                <Heart className="w-8 h-8 bg-red-50 text-red-500 rounded-xl p-2 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-800">উইশলিস্ট খালি!</h3>
                <p className="text-slate-500 font-bold mb-4 text-[9px]">পছন্দের পণ্যগুলো সেভ করে পরে অর্ডার করুন।</p>
                <Button asChild size="sm" className="rounded-xl h-9 px-6 font-black text-[9px] bg-primary">
                  <Link href="/products" className="flex items-center gap-1.5 uppercase tracking-widest">
                    পণ্য খুঁজুন <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent">
            {recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="rounded-2xl border-none shadow-lg p-8 text-center bg-white/50 glass">
                <Clock className="w-8 h-8 bg-primary/10 text-primary rounded-xl p-2 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-800">ইতিহাস নেই!</h3>
                <p className="text-slate-500 font-bold text-[9px]">আপনি সম্প্রতি যে পণ্যগুলো দেখেছেন তা এখানে জমা হবে।</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

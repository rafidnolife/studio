"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductCard } from '@/components/product/product-card';
import { LogOut, Heart, Clock, User as UserIcon, Settings, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
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

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-muted/10 pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Profile Header */}
        <section className="bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 border">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <UserIcon className="w-12 h-12" />
          </div>
          <div className="flex-grow text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold">{user.phoneNumber}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="rounded-full">
                {user.role === 'admin' ? 'অ্যাডমিন' : 'ক্রেতা'}
              </Badge>
              <span className="text-xs text-muted-foreground">অ্যাকাউন্ট স্ট্যাটাস: অ্যাক্টিভ</span>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-destructive hover:bg-destructive hover:text-white rounded-full">
            <LogOut className="w-4 h-4 mr-2" />
            লগআউট
          </Button>
        </section>

        {/* Content Tabs */}
        <Tabs defaultValue="wishlist" className="w-full">
          <TabsList className="grid grid-cols-2 h-14 rounded-2xl p-1 bg-white border shadow-sm mb-8">
            <TabsTrigger value="wishlist" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Heart className="w-4 h-4" />
              ভালো লাগা পণ্য
            </TabsTrigger>
            <TabsTrigger value="recent" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Clock className="w-4 h-4" />
              সম্প্রতি দেখা
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist" className="mt-0">
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="border-none bg-transparent shadow-none text-center py-20">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-muted-foreground">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">উইশলিস্ট খালি!</h3>
                <p className="text-muted-foreground mb-6">আপনার পছন্দের পণ্যগুলো এখানে সেভ করে রাখুন।</p>
                <Button asChild className="rounded-full"><a href="/products">পণ্য দেখুন</a></Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            {recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <Card className="border-none bg-transparent shadow-none text-center py-20">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-muted-foreground">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">ইতিহাস নেই!</h3>
                <p className="text-muted-foreground mb-6">আপনি সম্প্রতি যে পণ্যগুলো দেখেছেন তা এখানে দেখা যাবে।</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
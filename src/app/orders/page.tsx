
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Clock, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  const ordersQuery = useMemo(() => {
    if (!user || !db) return null;
    // Removed orderBy('createdAt', 'desc') to avoid composite index requirement
    // This allows the query to run without needing to create an index in Firebase Console
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [user, db]);

  const { data: rawOrders, loading: ordersLoading } = useCollection<any>(ordersQuery);

  // Client-side sorting: Sort by createdAt descending (newest first)
  const orders = useMemo(() => {
    if (!rawOrders) return [];
    return [...rawOrders].sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  }, [rawOrders]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  if (authLoading || ordersLoading) return <div className="p-20 text-center font-black">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg border border-primary/20">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">আমার অর্ডারসমূহ</h1>
        </div>

        {orders.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-white/60 glass rounded-[3rem] border-none shadow-xl">
            <ShoppingBag className="w-16 h-16 mx-auto text-slate-200" />
            <h3 className="text-xl font-black text-slate-800">আপনি এখনো কোনো অর্ডার করেননি!</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="rounded-[2rem] border-none shadow-xl bg-white/80 glass overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className={cn(
                  "h-2 w-full",
                  order.status === 'pending' ? "bg-amber-400" :
                  order.status === 'confirmed' ? "bg-emerald-500" : "bg-red-500"
                )} />
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">অর্ডার আইডি: #{order.id.slice(0, 8)}</span>
                      <Badge className={cn(
                        "rounded-full font-black text-[10px] px-4 py-1 border-none",
                        order.status === 'pending' ? "bg-amber-50 text-amber-600" :
                        order.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      )}>
                        {order.status === 'pending' ? 'পেন্ডিং' : 
                         order.status === 'confirmed' ? 'কনফার্মড' : 'ক্যানসেল'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item: any, i: number) => (
                        <h3 key={i} className="text-lg font-black text-slate-900 leading-tight">
                          {item.name} <span className="text-primary">x {item.qty}</span>
                        </h3>
                      ))}
                      <p className="text-slate-500 font-bold text-sm flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-primary" /> {order.location?.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-center space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মোট পরিশোধযোগ্য</span>
                    <span className="text-3xl font-black text-primary">৳{order.totalAmount}</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100/50 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      {order.createdAt?.toDate().toLocaleDateString('bn-BD')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


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
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [user, db]);

  const { data: rawOrders, loading: ordersLoading } = useCollection<any>(ordersQuery);

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
      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-md border border-primary/20">
            <Package className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">আমার অর্ডারসমূহ</h1>
        </div>

        {orders.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white/60 glass rounded-3xl border-none shadow-xl">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-200" />
            <h3 className="text-lg font-black text-slate-800">আপনি এখনো কোনো অর্ডার করেননি!</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="rounded-2xl border-none shadow-md bg-white/80 glass overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className={cn(
                  "h-1.5 w-full",
                  order.status === 'pending' ? "bg-amber-400" :
                  order.status === 'confirmed' ? "bg-blue-400" :
                  order.status === 'completed' ? "bg-emerald-500" : "bg-red-500"
                )} />
                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-400 text-[8px] uppercase tracking-widest">আইডি: #{order.id.slice(0, 8)}</span>
                      <Badge className={cn(
                        "rounded-full font-black text-[8px] px-3 py-0.5 border-none",
                        order.status === 'pending' ? "bg-amber-50 text-amber-600" :
                        order.status === 'confirmed' ? "bg-blue-50 text-blue-600" :
                        order.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      )}>
                        {order.status === 'pending' ? 'পেন্ডিং' : 
                         order.status === 'confirmed' ? 'নিশ্চিত' : 
                         order.status === 'completed' ? 'সফল' : 'বাতিল'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item: any, i: number) => (
                        <div key={i}>
                          <h3 className="text-base font-black text-slate-900 leading-tight">
                            {item.name} <span className="text-primary text-sm">x {item.qty}</span>
                          </h3>
                          {item.variant && <p className="text-[10px] font-bold text-primary">বিকল্প: {item.variant}</p>}
                        </div>
                      ))}
                      <p className="text-slate-500 font-bold text-xs flex items-center gap-1 mt-1">
                        <Package className="w-3 h-3 text-primary" /> {order.location?.address}, {order.location?.upazila}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-center space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">পরিশোধযোগ্য</span>
                    <span className="text-2xl font-black text-primary">৳{order.totalAmount}</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100/50 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
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

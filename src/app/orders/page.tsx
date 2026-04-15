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

  if (authLoading || ordersLoading) return <div className="p-20 text-center font-black text-xs uppercase tracking-widest">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm">
            <Package className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">আমার অর্ডারসমূহ</h1>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-white/60 glass rounded-2xl border-none shadow-lg">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-200" />
            <h3 className="text-sm font-black text-slate-800">আপনি এখনো কোনো অর্ডার করেননি!</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="rounded-xl border-none shadow-md bg-white/80 glass overflow-hidden">
                <div className={cn(
                  "h-1 w-full",
                  order.status === 'pending' ? "bg-amber-400" :
                  order.status === 'confirmed' ? "bg-blue-400" :
                  order.status === 'completed' ? "bg-emerald-500" : "bg-red-500"
                )} />
                <CardContent className="p-3 md:p-4 flex flex-col md:flex-row justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-400 text-[7px] uppercase tracking-widest">ID: #{order.id.slice(0, 6)}</span>
                      <Badge className={cn(
                        "rounded-full font-black text-[7px] px-2 py-0 border-none uppercase",
                        order.status === 'pending' ? "bg-amber-50 text-amber-600" :
                        order.status === 'confirmed' ? "bg-blue-50 text-blue-600" :
                        order.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      )}>
                        {order.status === 'pending' ? 'পেন্ডিং' : 
                         order.status === 'confirmed' ? 'নিশ্চিত' : 
                         order.status === 'completed' ? 'সফল' : 'বাতিল'}
                      </Badge>
                    </div>
                    <div className="space-y-0.5">
                      {order.items.map((item: any, i: number) => (
                        <h3 key={i} className="text-xs font-black text-slate-900">
                          {item.name} <span className="text-primary text-[10px]">x {item.qty}</span>
                        </h3>
                      ))}
                      <p className="text-slate-500 font-bold text-[9px] flex items-center gap-1 mt-0.5">
                        <Package className="w-2.5 h-2.5 text-primary" /> {order.location?.district}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-center">
                    <span className="text-lg font-black text-primary">৳{order.totalAmount}</span>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400">
                      <Clock className="w-2.5 h-2.5" />
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

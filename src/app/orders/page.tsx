
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  const ordersQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [user, db]);

  const { data: orders, loading: ordersLoading } = useCollection<any>(ordersQuery);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  if (authLoading || ordersLoading) return <div className="p-20 text-center font-black">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">আমার অর্ডারসমূহ</h1>
        </div>

        {orders.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-white rounded-[3rem] border-none shadow-xl">
            <ShoppingBag className="w-16 h-16 mx-auto text-slate-200" />
            <h3 className="text-xl font-black text-slate-800">আপনি এখনো কোনো অর্ডার করেননি!</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
                <div className={cn(
                  "h-2 w-full",
                  order.status === 'pending' ? "bg-amber-400" :
                  order.status === 'confirmed' ? "bg-emerald-500" : "bg-red-500"
                )} />
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-400 text-xs uppercase tracking-widest">অর্ডার আইডি: #{order.id.slice(0, 8)}</span>
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
                        <h3 key={i} className="text-lg font-black text-slate-900">{item.name} x {item.qty}</h3>
                      ))}
                      <p className="text-slate-400 font-bold text-sm">{order.location.address}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-center space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মোট পরিশোধযোগ্য</span>
                    <span className="text-3xl font-black text-primary">৳{order.totalAmount}</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
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

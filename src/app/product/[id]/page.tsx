
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Info, Zap, ShieldCheck, ArrowLeft, ShoppingCart, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, db]);

  const handleOrderRedirect = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "লগইন প্রয়োজন",
        description: "অর্ডার করতে আগে আপনার অ্যাকাউন্টে লগইন করুন।"
      });
      router.push('/login');
      return;
    }
    router.push(`/checkout?productId=${product?.id}&qty=${qty}`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 lg:py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          <Skeleton className="aspect-square w-full rounded-[2.5rem]" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Info className="w-10 h-10 text-slate-400" />
        <h2 className="text-2xl font-black text-slate-800">পণ্যটি খুঁজে পাওয়া যায়নি!</h2>
        <Button onClick={() => router.push('/products')} variant="outline" className="rounded-full">
          <ArrowLeft className="mr-2" /> সব পণ্য দেখুন
        </Button>
      </div>
    </div>
  );

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="min-h-screen pb-24 md:pb-12 overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="relative aspect-square w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white border border-slate-100 shadow-2xl">
            <ImageWithFallback src={product.imageUrls[0]} alt={product.name} fill className="object-contain p-4 md:p-8" />
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white font-black px-4 py-1.5 rounded-xl">
                {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% ছাড়
              </Badge>
            )}
          </div>

          <div className="flex flex-col space-y-6 md:space-y-8">
            <div className="space-y-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{product.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter">{product.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl md:text-5xl font-black text-primary">৳{hasDiscount ? product.discountPrice : product.price}</span>
                {hasDiscount && <span className="text-lg md:text-xl text-slate-300 line-through font-bold">৳{product.price}</span>}
              </div>
            </div>

            <div className="p-6 md:p-10 bg-white rounded-[2rem] border border-slate-100 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-800 text-lg">পরিমাণ:</span>
                <div className="flex items-center gap-6 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-2xl font-black text-slate-400">-</button>
                  <span className="text-2xl font-black w-8 text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="text-2xl font-black text-slate-400">+</button>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleOrderRedirect} 
                  disabled={product.stock <= 0}
                  className="w-full h-16 md:h-20 rounded-2xl text-lg md:text-2xl font-black gap-4 shadow-xl shadow-primary/30 bg-primary"
                >
                  <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
                  অর্ডার করুন
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <MapPin className="w-3.5 h-3.5" />
                  শুধুমাত্র ঝিনাইদহের ভিতরে ডেলিভারি
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" /> পণ্যের বিবরণ
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium bg-white/60 glass p-6 rounded-[2rem] border border-slate-100">
                {product.description || 'এই পণ্যটির কোনো বিস্তারিত বিবরণ বর্তমানে পাওয়া যায়নি। তবে এটি অত্যন্ত প্রিমিয়াম কোয়ালিটির পণ্য।'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

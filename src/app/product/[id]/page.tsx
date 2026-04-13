
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Info, CheckCircle, Zap, ShieldCheck, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [whatsappNum, setWhatsappNum] = useState('8801797958686');
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
        
        const settingsSnap = await getDoc(doc(db, 'settings', 'site'));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.whatsappNumber) {
            let num = data.whatsappNumber.replace(/\D/g, '');
            if (num.startsWith('01')) num = '88' + num;
            setWhatsappNum(num);
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, db]);

  const handleOrder = () => {
    if (!product) return;
    const finalPrice = (product.discountPrice || product.price) * qty;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const msg = `আসসালামু আলাইকুম,\nআমি দোকান এক্সপ্রেস থেকে এই পণ্যটি অর্ডার করতে চাই:\n\n🛍️ পণ্য: ${product.name}\n📦 পরিমাণ: ${qty}\n💰 মোট মূল্য: ৳${finalPrice}\n🔗 লিঙ্ক: ${currentUrl}\n\nঅনুগ্রহ করে অর্ডারটি কনফার্ম করুন। ধন্যবাদ।`;
    
    const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
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
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <Info className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">পণ্যটি খুঁজে পাওয়া যায়নি!</h2>
        <Button onClick={() => router.push('/products')} variant="outline" className="rounded-full px-8 h-12 gap-2">
          <ArrowLeft className="w-4 h-4" /> সব পণ্য দেখুন
        </Button>
      </div>
    </div>
  );

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const savings = hasDiscount ? product.price - product.discountPrice! : 0;
  const mainImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[activeImage] 
    : 'https://placehold.co/600x400?text=No+Image';

  return (
    <div className="min-h-screen pb-24 md:pb-12 overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Image Section */}
          <div className="space-y-6 w-full">
            <div className="relative aspect-square w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white border border-slate-100 shadow-2xl group">
              <ImageWithFallback 
                src={mainImage} 
                alt={product.name} 
                fill 
                priority
                className="object-contain p-4 md:p-8 transition-transform duration-700 group-hover:scale-105"
              />
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 md:top-8 md:left-8 bg-red-500 text-white text-base md:text-lg font-black px-4 md:px-6 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-xl z-20 border-none">
                  {Math.round((savings / product.price) * 100)}% ছাড়
                </Badge>
              )}
            </div>
            
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide pt-2 px-1">
                {product.imageUrls.map((url, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)} 
                    className={cn(
                      "relative w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white shadow-sm",
                      activeImage === i ? "border-primary ring-2 ring-primary/20 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <ImageWithFallback src={url} alt={`thumbnail-${i}`} fill />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col space-y-6 md:space-y-8 w-full">
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest">{product.category}</Badge>
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs"><CheckCircle className="w-3.5 h-3.5" /> ইন স্টক</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-500 font-bold text-xs"><Info className="w-3.5 h-3.5" /> আউট অফ স্টক</span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter">{product.name}</h1>
              <div className="flex items-center gap-4 md:gap-8 pt-2">
                <div className="flex flex-col">
                  <span className="text-3xl md:text-5xl font-black text-primary">৳{hasDiscount ? product.discountPrice : product.price}</span>
                  {hasDiscount && <span className="text-lg md:text-xl text-slate-300 line-through font-bold">৳{product.price}</span>}
                </div>
                {hasDiscount && (
                  <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl md:rounded-2xl font-black text-sm border border-amber-100 shadow-sm">
                    সাশ্রয় ৳{savings}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="font-black text-slate-800 text-lg">অর্ডার পরিমাণ:</span>
                <div className="flex items-center justify-between md:justify-end gap-8 bg-slate-50 px-6 py-2.5 rounded-2xl border border-slate-100 w-full md:w-auto">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-3xl font-black text-slate-300 hover:text-primary transition-colors">-</button>
                  <span className="text-2xl font-black w-12 text-center text-slate-900">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="text-3xl font-black text-slate-300 hover:text-primary transition-colors">+</button>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleOrder} 
                  disabled={product.stock <= 0}
                  className="w-full h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] text-lg md:text-2xl font-black gap-4 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 bg-primary"
                >
                  <MessageCircle className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                  সরাসরি হোয়াটসঅ্যাপ অর্ডার
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Secure Shopping via WhatsApp
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3 px-2">
                <Info className="w-6 h-6 text-primary" /> পণ্যের বিবরণ
              </h3>
              <div className="p-6 md:p-10 bg-white/60 glass rounded-[2rem] md:rounded-[3rem] border border-slate-100">
                <p className="text-slate-600 leading-relaxed font-medium text-sm md:text-base whitespace-pre-line">
                  {product.description || 'এই পণ্যটির কোনো বিস্তারিত বিবরণ বর্তমানে পাওয়া যায়নি। তবে এটি অত্যন্ত প্রিমিয়াম কোয়ালিটির পণ্য।'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4">
              <div className="flex flex-col md:flex-row items-center gap-3 p-4 md:p-6 bg-emerald-50/50 rounded-2xl md:rounded-[2rem] border border-emerald-100 text-center md:text-left">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] md:text-xs font-black text-emerald-700 uppercase leading-tight">Authentic<br/>Product</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 p-4 md:p-6 bg-amber-50/50 rounded-2xl md:rounded-[2rem] border border-amber-100 text-center md:text-left">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-[10px] md:text-xs font-black text-amber-700 uppercase leading-tight">Fastest<br/>Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

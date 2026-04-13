
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
import { MessageCircle, Heart, Share2, ChevronLeft, ShieldCheck, ShoppingCart, Info, CheckCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
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
        
        const sSnap = await getDoc(doc(db, 'settings', 'site'));
        if (sSnap.exists()) {
          let num = sSnap.data().whatsappNumber.replace(/\D/g, '');
          if (num.startsWith('01')) num = '88' + num;
          setWhatsappNum(num);
        }
      } catch (err) {
        console.error(err);
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
    
    // Using 88 prefix as default for BD
    const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-20"><Skeleton className="h-[600px] w-full max-w-5xl rounded-[3rem]" /></div>;
  if (!product) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-20 space-y-4">
    <h2 className="text-2xl font-black">পণ্যটি খুঁজে পাওয়া যায়নি!</h2>
    <Button onClick={() => window.history.back()} className="rounded-full">পিছনে যান</Button>
  </div>;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const savings = hasDiscount ? product.price - product.discountPrice! : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 lg:py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white border border-slate-100 shadow-2xl group">
              <ImageWithFallback 
                src={product.imageUrls[activeImage] || 'https://picsum.photos/seed/p/600/600'} 
                alt={product.name} 
                fill 
                className="object-contain p-6 sm:p-12 transition-transform duration-700 group-hover:scale-105"
              />
              {hasDiscount && (
                <Badge className="absolute top-8 left-8 bg-primary text-white text-lg font-black px-6 py-2 rounded-2xl shadow-xl">
                  {Math.round((savings / product.price) * 100)}% ছাড়
                </Badge>
              )}
            </div>
            {product.imageUrls.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {product.imageUrls.map((url, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)} 
                    className={cn(
                      "relative w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all shrink-0",
                      activeImage === i ? "border-primary shadow-lg shadow-primary/20 scale-105" : "border-white opacity-60 hover:opacity-100"
                    )}
                  >
                    <ImageWithFallback src={url} alt="thumbnail" fill />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest">{product.category}</Badge>
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs"><CheckCircle className="w-3 h-3" /> ইন স্টক</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-500 font-bold text-xs"><Info className="w-3 h-3" /> আউট অফ স্টক</span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter">{product.name}</h1>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-primary">৳{hasDiscount ? product.discountPrice : product.price}</span>
                  {hasDiscount && <span className="text-xl text-slate-300 line-through font-bold">৳{product.price}</span>}
                </div>
                {hasDiscount && (
                  <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl font-black text-sm border border-amber-100">
                    আপনার সাশ্রয় ৳{savings}
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-700 text-lg">পরিমাণ নির্বাচন করুন:</span>
                <div className="flex items-center gap-6 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-2xl font-black text-slate-400 hover:text-primary transition-colors">-</button>
                  <span className="text-xl font-black w-10 text-center text-slate-900">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="text-2xl font-black text-slate-400 hover:text-primary transition-colors">+</button>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleOrder} 
                  disabled={product.stock <= 0}
                  className="w-full h-16 rounded-2xl text-xl font-black gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="w-7 h-7 fill-current" />
                  সরাসরি হোয়াটসঅ্যাপে অর্ডার
                </Button>
                <p className="text-[11px] text-center text-slate-400 font-bold uppercase tracking-widest">Safe & Secure Ordering via WhatsApp</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> পণ্যের বিস্তারিত বিবরণ
              </h3>
              <div className="p-6 bg-white rounded-[2rem] border border-slate-100">
                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">{product.description || 'এই পণ্যটির কোনো বিবরণ পাওয়া যায়নি।'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <ShieldCheck className="text-emerald-500 w-6 h-6" />
                <span className="text-xs font-black text-emerald-700 uppercase">Original Product</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                <Zap className="text-amber-500 w-6 h-6" />
                <span className="text-xs font-black text-amber-700 uppercase">Express Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

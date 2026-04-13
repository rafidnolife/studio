"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateWhatsappOrderMessage } from '@/ai/flows/generate-whatsapp-order-message-flow';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          
          // Recently viewed logic
          const recent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
          const updatedRecent = [data, ...recent.filter((p: any) => p.id !== data.id)].slice(0, 10);
          localStorage.setItem('recently_viewed', JSON.stringify(updatedRecent));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleOrder = async () => {
    if (!product) return;
    const url = await generateWhatsappOrderMessage({
      productName: product.name,
      productPrice: product.discountPrice || product.price,
      quantity: qty
    });
    window.open(url, '_blank');
  };

  const toggleWishlist = () => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find((p: any) => p.id === product.id);
    if (exists) {
      const updated = wishlist.filter((p: any) => p.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      toast({ title: 'মুছে ফেলা হয়েছে', description: 'পণ্যটি আপনার উইশলিস্ট থেকে সরানো হয়েছে।' });
    } else {
      localStorage.setItem('wishlist', JSON.stringify([...wishlist, product]));
      toast({ title: 'যুক্ত করা হয়েছে', description: 'পণ্যটি আপনার উইশলিস্টে যুক্ত করা হয়েছে।' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">পণ্যটি খুঁজে পাওয়া যায়নি!</h1>
          <Button asChild><a href="/products">আবার দেখুন</a></Button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Slider */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border bg-white">
              <ImageWithFallback 
                src={product.imageUrls[activeImage]} 
                alt={product.name} 
                fill 
                className="object-contain p-4"
              />
              {product.imageUrls.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === 0 ? product.imageUrls.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === product.imageUrls.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 px-1">
              {product.imageUrls.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === i ? 'border-primary shadow-sm' : 'border-transparent opacity-60'}`}
                >
                  <ImageWithFallback src={url} alt={`${product.name} ${i}`} fill />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs">
                {product.category}
              </Badge>
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground leading-tight">{product.name}</h1>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-primary">৳{hasDiscount ? product.discountPrice : product.price}</span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through pb-1">৳{product.price}</span>
                )}
              </div>
            </div>

            <div className="space-y-4 p-6 bg-muted/30 rounded-2xl border border-muted">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">পরিমাণ নির্বাচন করুন</span>
                <div className="flex items-center gap-4 bg-background px-3 py-1 rounded-full border">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-lg font-bold w-6 h-6 flex items-center justify-center hover:text-primary">-</button>
                  <span className="w-8 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="text-lg font-bold w-6 h-6 flex items-center justify-center hover:text-primary">+</button>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleOrder}
                  disabled={product.stock <= 0}
                  className="flex-grow h-14 rounded-xl text-lg font-bold gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                >
                  <MessageCircle className="w-6 h-6 fill-current" />
                  অর্ডার করুন
                </Button>
                <Button 
                  onClick={toggleWishlist}
                  variant="outline" 
                  className="h-14 w-14 p-0 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                >
                  <Heart className="w-6 h-6" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2">অর্ডার বাটনে ক্লিক করলে আপনি সরাসরি হোয়াটসঅ্যাপে চলে যাবেন।</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">পণ্যের বিবরণ</h3>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {product.description || 'এই পণ্যটির কোনো বিবরণ দেয়া হয়নি।'}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>অরিজিনাল পণ্য</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Share2 className="w-5 h-5" />
                <span>শেয়ার করুন</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
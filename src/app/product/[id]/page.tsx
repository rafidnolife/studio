
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
import { MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const db = useFirestore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [whatsappNum, setWhatsappNum] = useState('01797958686');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const docRef = doc(db, 'products', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      }
      
      const sSnap = await getDoc(doc(db, 'settings', 'site'));
      if (sSnap.exists()) setWhatsappNum(sSnap.data().whatsappNumber);
      
      setLoading(false);
    }
    fetchProduct();
  }, [id, db]);

  const handleOrder = () => {
    if (!product) return;
    const msg = `আসসালামু আলাইকুম,\nআমি এই পণ্যটি অর্ডার করতে চাই:\n\nপণ্য: ${product.name}\nপরিমাণ: ${qty}\nমূল্য: ৳${(product.discountPrice || product.price) * qty}\n\nধন্যবাদ।`;
    const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="p-20 text-center"><Skeleton className="h-[600px] w-full max-w-4xl mx-auto rounded-[3rem]" /></div>;
  if (!product) return <div className="p-20 text-center">পণ্য পাওয়া যায়নি</div>;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl">
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-4 border-muted/20 shadow-inner group">
              <ImageWithFallback 
                src={product.imageUrls[activeImage] || 'https://picsum.photos/seed/p/600/600'} 
                alt={product.name} 
                fill 
                className="object-contain p-8 group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.imageUrls.map((url, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-primary shadow-lg' : 'border-transparent opacity-50'}`}>
                  <ImageWithFallback src={url} alt="thumb" fill />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-10 flex flex-col justify-center">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-none text-sm font-bold px-4 py-1 rounded-full">{product.category}</Badge>
              <h1 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-primary">৳{hasDiscount ? product.discountPrice : product.price}</span>
                {hasDiscount && <span className="text-2xl text-muted-foreground line-through opacity-50">৳{product.price}</span>}
              </div>
            </div>

            <div className="space-y-6 p-8 bg-muted/30 rounded-[2.5rem] border border-muted shadow-inner">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">পরিমাণ নির্বাচন করুন</span>
                <div className="flex items-center gap-6 bg-white px-6 py-2 rounded-full border shadow-sm">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-2xl font-bold hover:text-primary transition-colors">-</button>
                  <span className="text-xl font-black w-8 text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="text-2xl font-bold hover:text-primary transition-colors">+</button>
                </div>
              </div>
              
              <Button onClick={handleOrder} className="w-full h-16 rounded-2xl text-xl font-black gap-3 shadow-xl shadow-primary/30 transition-all hover:scale-[1.02]">
                <MessageCircle className="w-7 h-7 fill-current" />
                সরাসরি হোয়াটসঅ্যাপে অর্ডার দিন
              </Button>
              <p className="text-[11px] text-center text-muted-foreground font-medium">অর্ডার বাটনে ক্লিক করলে আপনি সরাসরি আমাদের হোয়াটসঅ্যাপ ইনবক্সে পৌঁছে যাবেন।</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b-2 border-primary/10 pb-3">পণ্যের বিবরণ</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">{product.description || 'বিবরণ নেই।'}</p>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t-2 border-muted/50">
              <div className="flex items-center gap-3 text-sm font-bold"><ShieldCheck className="text-primary w-6 h-6" /> ১০০% অরিজিনাল</div>
              <div className="flex items-center gap-3 text-sm font-bold"><ShoppingCart className="text-primary w-6 h-6" /> ফাস্ট ডেলিভারি</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

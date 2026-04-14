
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, getDocs, query, where, Firestore } from 'firebase/firestore';
import { Product } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, CreditCard, ShoppingBag, Truck, Info, LocateFixed, CheckCircle, Navigation } from 'lucide-react';
import { sendPushNotification } from '@/ai/flows/send-notification-flow';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const productId = searchParams.get('productId');
  const initialQty = Number(searchParams.get('qty')) || 1;
  const variant = searchParams.get('variant');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const deliveryCharge = 17;
  const appCharge = 3;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId || !db) return;
      try {
        const docSnap = await getDoc(doc(db, 'products', productId));
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId, db]);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      toast({ title: "অপেক্ষা করুন", description: "আপনার জিপিএস লোকেশন খোঁজা হচ্ছে..." });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({ title: "সফল", description: "আপনার সঠিক জিপিএস লোকেশন পাওয়া গেছে।" });
        },
        (error) => {
          console.error(error);
          toast({ variant: "destructive", title: "ব্যর্থ", description: "জিপিএস লোকেশন পাওয়া যায়নি। অনুগ্রহ করে পারমিশন চেক করুন।" });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast({ variant: "destructive", title: "ব্যর্থ", description: "আপনার ব্রাউজারে জিপিএস সাপোর্ট করে না।" });
    }
  };

  const sendAdminNotifications = async (db: Firestore, userName: string, total: number) => {
    try {
      const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
      const adminSnapshot = await getDocs(adminQuery);
      adminSnapshot.forEach((adminDoc) => {
        const adminData = adminDoc.data();
        if (adminData.fcmToken) {
          sendPushNotification({
            recipientToken: adminData.fcmToken,
            title: 'নতুন অর্ডার এসেছে!',
            body: `${userName} একটি নতুন অর্ডার করেছেন (৳${total})।`
          }).catch(e => console.error("Notification failed", e));
        }
      });
    } catch (e) {
      console.error("Admin query failed", e);
    }
  };

  const handlePlaceOrder = () => {
    if (!phoneNumber || !address) {
      toast({ variant: "destructive", title: "তথ্য অসম্পূর্ণ", description: "ফোন নম্বর এবং সঠিক ঠিকানা দিন।" });
      return;
    }
    if (!location) {
      toast({ variant: "destructive", title: "লোকেশন প্রয়োজন", description: "অনুগ্রহ করে জিপিএস বাটন চেপে আপনার সঠিক লোকেশন অ্যাড করুন।" });
      return;
    }

    setOrderLoading(true);
    const subtotal = (product?.discountPrice || product?.price || 0) * initialQty;
    const total = subtotal + deliveryCharge + appCharge;

    const orderData = {
      userId: user?.uid,
      items: [{
        id: product?.id,
        name: product?.name,
        price: product?.discountPrice || product?.price,
        qty: initialQty,
        variant: variant || null
      }],
      subtotal,
      deliveryCharge,
      appCharge,
      totalAmount: total,
      phoneNumber,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: address
      },
      status: 'pending',
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, 'orders'), orderData)
      .then(() => {
        toast({ title: "অডার সফল", description: "আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই কল দেওয়া হবে।" });
        router.push('/orders');
        
        sendAdminNotifications(db, user?.displayName || 'একজন ক্রেতা', total);
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'orders',
          operation: 'create',
          requestResourceData: orderData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setOrderLoading(false);
      });
  };

  if (loading || authLoading) return <div className="p-20 text-center font-black text-2xl animate-pulse">প্রসেসিং...</div>;

  const subtotal = (product?.discountPrice || product?.price || 0) * initialQty;

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
          <CreditCard className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">চেকআউট</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6 md:p-10 transition-all hover:shadow-2xl">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-black">
                <MapPin className="text-primary" /> ডেলিভারি তথ্য
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="animate-ping w-2 h-2 bg-red-500 rounded-full"></span>
                <p className="text-xs font-black text-red-500 uppercase tracking-widest">শুধুমাত্র ঝিনাইদহের ভিতরে ডেলিভারি সম্ভব</p>
              </div>
            </CardHeader>
            <CardContent className="px-0 space-y-8 mt-6">
              <div className="space-y-3">
                <Label className="font-black text-slate-700 ml-1 text-base">ফোন নম্বর</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    placeholder="আপনার সচল ফোন নম্বর লিখুন" 
                    className="h-16 pl-12 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <Label className="font-black text-slate-700 ml-1 text-base">বিস্তারিত ঠিকানা</Label>
                  <Button 
                    onClick={getCurrentLocation} 
                    type="button"
                    variant="outline" 
                    className="h-12 rounded-2xl gap-2 font-black text-sm text-primary border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
                  >
                    <LocateFixed className="w-5 h-5" /> জিপিএস লোকেশন দিন
                  </Button>
                </div>
                
                <div className="relative group">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    placeholder="গ্রাম, রাস্তা বা বাসার বিস্তারিত নম্বর..." 
                    className="h-16 pl-12 rounded-2xl bg-slate-50 border-none shadow-inner font-bold text-lg" 
                  />
                </div>

                {location && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-black flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> 
                      লোকেশন পাওয়া গেছে!
                    </div>
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">LIVE GPS</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-xl bg-slate-900 p-8 text-white">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-primary">
                <Truck className="w-7 h-7" /> পেমেন্ট পদ্ধতি
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 mt-4">
              <div className="p-6 border-2 border-primary/30 rounded-2xl bg-primary/5 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg md:text-xl">ক্যাশ অন ডেলিভারি (COD)</h4>
                  <p className="text-slate-400 text-sm font-medium">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।</p>
                </div>
                <div className="w-8 h-8 rounded-full border-4 border-primary bg-primary flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-none shadow-2xl bg-white p-8 sticky top-24">
            <CardHeader className="px-0 pt-0 border-b pb-4 mb-4">
              <CardTitle className="text-xl font-black">অর্ডার সামারি</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 relative overflow-hidden shrink-0 shadow-md">
                  <img src={product?.imageUrls[0]} alt="" className="object-cover w-full h-full" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-base truncate leading-tight">{product?.name}</h4>
                  <p className="text-sm font-bold text-slate-400 mt-1">পরিমাণ: {initialQty}</p>
                  {variant && <p className="text-xs font-black text-primary uppercase mt-1">বিকল্প: {variant}</p>}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>সাবটোটাল</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>ডেলিভারি চার্জ</span>
                  <span>৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>অ্যাপ চার্জ</span>
                  <span>৳{appCharge}</span>
                </div>
                <div className="flex justify-between text-3xl font-black text-primary pt-6 border-t">
                  <span>সর্বমোট</span>
                  <span>৳{subtotal + deliveryCharge + appCharge}</span>
                </div>
              </div>

              <Button 
                disabled={orderLoading} 
                onClick={handlePlaceOrder}
                className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/30 bg-primary mt-6 transition-all active:scale-95"
              >
                {orderLoading ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <Suspense fallback={<div className="p-20 text-center font-black text-2xl">লোডিং...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}

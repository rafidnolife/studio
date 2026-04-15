
"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { Product } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, CreditCard, Truck, User, Navigation } from 'lucide-react';
import { sendPushNotification } from '@/ai/flows/send-notification-flow';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const bdData: Record<string, string[]> = {
  "ঢাকা": ["ঢাকা উত্তর", "ঢাকা দক্ষিণ", "সাভার", "ধামরাই", "কেরানীগঞ্জ", "নবাবগঞ্জ", "দোহার"],
  "চট্টগ্রাম": ["চট্টগ্রাম সিটি", "হাটহাজারী", "পটিয়া", "রাউজান", "রাঙ্গুনিয়া", "বোয়ালখালী", "আনোয়ারা", "বাঁশখালী", "লোহাগাড়া", "সাতকানিয়া", "সন্দ্বীপ", "ফটিকছড়ি", "মিরসরাই", "সীতাকুণ্ড"],
  "গাজীপুর": ["গাজীপুর সদর", "কালিয়াকৈর", "কালীগঞ্জ", "কাপাসিয়া", "শ্রীপুর"],
  "নারায়ণগঞ্জ": ["নারায়ণগঞ্জ সদর", "বন্দর", "আড়াইহাজার", "রূপগঞ্জ", "সোনারগাঁও"],
  "ঝিনাইদহ": ["ঝিনাইদহ সদর", "কালীগঞ্জ", "কোটচাঁদপুর", "মহেশপুর", "শৈলকুপা", "হরিণাকুণ্ডু"],
  "সিলেট": ["সিলেট সদর", "বিয়ানীবাজার", "বিশ্বনাথ", "দক্ষিণ সুরমা", "ফেঞ্চুগঞ্জ", "গোলাপগঞ্জ", "গোয়াইনঘাট", "জৈন্তাপুর", "কানাইঘাট", "জকিগঞ্জ"],
  "রাজশাহী": ["রাজশাহী সিটি", "পবা", "বাঘমারা", "গোদাগাড়ী", "চারঘাট", "দুর্গাপুর", "বাঘা", "মোহনপুর", "পুঠিয়া", "তানোর"],
  "খুলনা": ["খুলনা সিটি", "বটিয়াঘাটা", "দাকোপ", "ডুমুরিয়া", "দিঘলিয়া", "কয়রা", "পাইকগাছা", "ফুলতলা", "রূপসা", "তেরখাদা"],
  "বরিশাল": ["বরিশাল সিটি", "বাকেরগঞ্জ", "বাবুগঞ্জ", "বানারীপাড়া", "গৌরনদী", "হিজলা", "মেহেন্দিগঞ্জ", "মুলাদী", "উজিরপুর"],
  "রংপুর": ["রংপুর সদর", "বদরগঞ্জ", "গঙ্গাচড়া", "কাউনিয়া", "মিঠাপুকুর", "পীরগঞ্জ", "তারাগঞ্জ"],
  "ময়মনসিংহ": ["ময়মনসিংহ সদর", "ভালুকা", "গফরগাঁও", "গৌরীপুর", "হালুয়াঘাট", "ঈশ্বরগঞ্জ", "মুক্তাগাছা", "নন্দাইল", "ফুলপুর", "ত্রিশাল"],
  "কুমিল্লা": ["কুমিল্লা সিটি", "বরুড়া", "ব্রাহ্মণপাড়া", "বুড়িচং", "চান্দিনা", "চৌদ্দগ্রাম", "দাউদকান্দি", "দেবিদ্বার", "হোমনা", "লাকসাম", "মুরাদনগর", "নাঙ্গলকোট", "তিতাস"],
  "ব্রাহ্মণবাড়িয়া": ["ব্রাহ্মণবাড়িয়া সদর", "আশুগঞ্জ", "বাঞ্ছারামপুর", "কসবা", "নবীনগর", "নাসিরনগর", "সরাইল", "আখাউড়া"],
  "নোয়াখালী": ["নোয়াখালী সদর", "বেগমগঞ্জ", "চাটখিল", "কোম্পানীগঞ্জ", "হাতিয়া", "সেনবাগ", "সোনাইমুড়ী", "সুবর্ণচর"],
  "ফেনী": ["ফেনী সদর", "ছাগলনাইয়া", "দাগনভূঁঞা", "পরশুরাম", "সোনাগাজী", "ফুলগাজী"],
  "চাঁদপুর": ["চাঁদপুর সদর", "ফরিদগঞ্জ", "হাজীগঞ্জ", "হাইদরগঞ্জ", "কচুয়া", "মতলব উত্তর", "মতলব দক্ষিণ", "শাহরাস্তি"],
  "লক্ষ্মীপুর": ["লক্ষ্মীপুর সদর", "রায়পুর", "রামগঞ্জ", "রামগতি", "কমলনগর"],
  "কক্সবাজার": ["কক্সবাজার সদর", "চকোরিয়া", "কুতুবদিয়া", "মহেশখালী", "রামু", "টেকনাফ", "উখিয়া", "পেকুয়া"],
  "হবিগঞ্জ": ["হবিগঞ্জ সদর", "আজমিরীগঞ্জ", "বাহুবল", "বানিয়াচং", "চুনারুঘাট", "লাখাই", "মাধবপুর", "নবীগঞ্জ"],
  "মৌলভীবাজার": ["মৌলভীবাজার সদর", "বড়লেখা", "কমলগঞ্জ", "কুলাউড়া", "রাজনগর", "শ্রীমঙ্গল", "জুড়ী"],
  "সুনামগঞ্জ": ["সুনামগঞ্জ সদর", "বিশ্বম্ভরপুর", "ছাতক", "দিরাই", "ধর্মপাশা", "দোয়ারাবাজার", "জগন্নাথপুর", "জামালগঞ্জ", "শাল্লা", "তাহিরপুর"],
  "বাগেরহাট": ["বাগেরহাট সদর", "চিতলমারী", "ফকিরহাট", "কচুয়া", "মোল্লাহাট", "মোংলা", "মোড়েলগঞ্জ", "রামপাল", "শরণখোলা"],
  "যশোর": ["যশোর সদর", "অভয়নগর", "বাঘেরপাড়া", "চৌগাছা", "ঝিকরগাছা", "কেশবপুর", "মণিরামপুর", "শার্শা"],
  "কুষ্টিয়া": ["কুষ্টিয়া সদর", "ভেড়ামারা", "দৌলতপুর", "খোকসা", "কুমারখালী", "মিরপুর"],
  "মাগুরা": ["মাগুরা সদর", "মহম্মদপুর", "শালিখা", "শ্রীপুর"],
  "মেহেরপুর": ["মেহেরপুর সদর", "গাংনী", "মুজিবনগর"],
  "নড়াইল": ["নড়াইল সদর", "কালিয়া", "লোহাগড়া"],
  "সাতক্ষীরা": ["সাতক্ষীরা সদর", "আশাশুনি", "দেবহাটা", "কলারোয়া", "কালীগঞ্জ", "শ্যামনগর", "তালা"],
  "চুয়াডাঙ্গা": ["চুয়াডাঙ্গা সদর", "আলমডাঙ্গা", "দামুড়হুদা", "জীবননগর"],
  "বগুড়া": ["বগুড়া সদর", "আদমদীঘি", "ধুনট", "দুপচাঁচিয়া", "গাবতলী", "কাহালu", "নন্দীগ্রাম", "সারিয়াকান্দি", "শেরপুর", "শিবগঞ্জ", "সোনাতলা"],
  "জয়পুরহাট": ["জয়পুরহাট সদর", "আক্কেলপুর", "কালাই", "ক্ষেতলাল", "পাঁচবিবি"],
  "নওগাঁ": ["নওগাঁ সদর", "আত্রাই", "বদলগাছী", "ধামইরহাট", "মান্দা", "মহাদেবপুর", "নিয়ামতপুর", "পত্নীতলা", "পোরশা", "রানীনগর", "সাপাহার"],
  "নাটোর": ["নাটোর সদর", "বাগাতিপাড়া", "বড়াইগ্রাম", "গুরুদাসপুর", "লালপুর", "সিংড়া"],
  "পাবনা": ["পাবনা সদর", "আটঘরিয়া", "বেড়া", "ভাঙ্গুড়া", "চাটমোহর", "ফরিদপুর", "ঈশ্বরদী", "সাথিয়া", "সুজানগর"],
  "সিরাজগঞ্জ": ["সিরাজগঞ্জ সদর", "বেলকুچی", "চৌহালী", "কামারখন্দ", "কাজীপুর", "রায়গঞ্জ", "শাহজাদপুর", "তাড়াশ", "উল্লাপাড়া"],
  "দিনাজপুর": ["দিনাজপুর সদর", "বিরামপুর", "বীরগঞ্জ", "বিরল", "বোচাগঞ্জ", "চিরিরবন্দর", "ফুলবাড়ী", "ঘোড়াঘাট", "হাকিমপুর", "কাহারোল", "খানসামা", "নবাবগঞ্জ", "পার্বতীপুর"],
  "গাইবান্ধা": ["গাইবান্ধা সদর", "ফুলছড়ি", "গোবিন্দগঞ্জ", "পলাশবাড়ী", "সাদুল্লাপুর", "সাঘাটা", "সুন্দরগঞ্জ"],
  "কুড়িগ্রাম": ["কুড়িগ্রাম সদর", "ভুরুঙ্গামারী", "চিলমারী", "ফুলবাড়ী", "নাগেশ্বরী", "রাজারহাট", "রাজিবপুর", "রৌমারী", "উলিপুর"],
  "লালমনিরহাট": ["লালমনিরহাট সদর", "আদিতমারী", "হাতীবান্ধা", "কালীগঞ্জ", "পাটগ্রাম"],
  "নীলফামারী": ["নীলফামারী সদর", "ডিমলা", "ডোমার", "জলঢাকা", "কিশোরগঞ্জ", "সৈয়দপুর"],
  "পঞ্চগড়": ["পঞ্চগড় সদর", "আটোয়ারী", "বোদা", "দেবীগঞ্জ", "তেঁতুলিয়া"],
  "ঠাকুরগাঁও": ["ঠাকুরগাঁও সদর", "বালিয়াডাঙ্গী", "হরিপুর", "পীরগঞ্জ", "রানীশংকৈল"],
  "বরগুনা": ["বরগুনা সদর", "আমতলী", "বামনা", "বেতাগী", "পাথরঘাটা", "তালতলী"],
  "ভোলা": ["ভোলা সদর", "বোরহানউদ্দিন", "চরফ্যাশন", "দৌলতখান", "লালমোহন", "মনপুরা", "তজুমদ্দিন"],
  "ঝালকাঠি": ["ঝালকাঠি সদর", "কাঁঠালিয়া", "নলছিটি", "রাজাপুর"],
  "পটুয়াখালী": ["পটুয়াখালী সদর", "বাউফল", "দশমিনা", "গলাচিপা", "কলাপাড়া", "মির্জাগঞ্জ", "রাঙ্গাবালী"],
  "পিরোজপুর": ["পিরোজপুর সদর", "ভাণ্ডারিয়া", "কাউখালী", "মঠবাড়িয়া", "নাজিরপুর", "নেছারাবাদ", "জিয়ানগর"],
  "ফরিদপুর": ["ফরিদপুর সদর", "আলফাডাঙ্গা", "ভাঙ্গা", "বোয়ালমারী", "চরভদ্রাসন", "মধুখালী", "নগরকান্দা", "সদরপুর", "সালথা"],
  "গোপালগঞ্জ": ["গোপালগঞ্জ সদর", "কাশিয়ানী", "কোটালীপাড়া", "মুকসুদপুর", "টুঙ্গিপাড়া"],
  "কিশোরগঞ্জ": ["কিশোরগঞ্জ সদর", "অষ্টগ্রাম", "বাজিতপুর", "ভৈরব", "হোসেনপুর", "ইটনা", "করিমগঞ্জ", "কটিয়াদী", "কুলিয়ারচর", "মিঠামইন", "নিকলী", "পাকুন্দিয়া", "তাড়াইল"],
  "মাদারীপুর": ["মাদারীপুর সদর", "কালকিনি", "রাজৈর", "শিবচর"],
  "মানিকগঞ্জ": ["মানিকগঞ্জ সদর", "দৌলতপুর", "ঘিওরে", "হরিরামপুর", "সাটুরিয়া", "শিবালয়", "সিংগাইর"],
  "মুন্সীগঞ্জ": ["মুন্সীগঞ্জ সদর", "গজারিয়া", "লৌহজং", "সিরাজদিখান", "শ্রীনগর", "টংগিবাড়ী"],
  "রাজবাড়ী": ["রাজবাড়ী সদর", "বালিয়াকান্দি", "গোয়ালন্দ", "পাংশা", "কালুখালী"],
  "শরীয়তপুর": ["শরীয়তপুর সদর", "ভেদরগঞ্জ", "ডামুড্যা", "গোসাইরহাট", "নড়িয়া", "জাজিরা"],
  "টাঙ্গাইল": ["টাঙ্গাইল সদর", "বাসাইল", "ভূঞাপুর", "দেলদুয়ার", "ঘাটাইল", "গোপালপুর", "কালিহাতী", "মধুপুর", "মির্জাপুর", "নাগরপুর", "সখীপুর", "ধনবাড়ী"],
  "নেত্রকোণা": ["নেত্রকোণা সদর", "আটপাড়া", "বারহাট্টা", "দুর্গাপুর", "খালিয়াজুরী", "কলমাকান্দা", "কেন্দুয়া", "মদন", "মোহনগঞ্জ", "পূর্বধলা"],
  "শেরপুর": ["শেরপুর সদর", "ঝিনাইগাতী", "নকলা", "নালিতাবাড়ী", "শ্রীবরদী"],
  "জামালপুর": ["জামালপুর সদর", "বকশীগঞ্জ", "দেওয়ানগঞ্জ", "ইসলামপুর", "মাদারগঞ্জ", "মেলান্দহ", "সরিষাবাড়ী"],
  "বান্দরবান": ["বান্দরবান সদর", "আলীকদম", "লামা", "নাইক্ষ্যংছড়ি", "রোয়াংছড়ি", "রুমা", "থানচি"],
  "খাগড়াছড়ি": ["খাগড়াছড়ি সদর", "দীঘিনালা", "লক্ষ্মীছড়ি", "মহালছড়ি", "মানিকছড়ি", "মাটিরাঙ্গা", "পানছড়ি", "রামগড়"],
  "রাঙ্গামাটি": ["রাঙ্গামাটি সদর", "বাঘাইছড়ি", "বরকল", "কাউখালী", "বিলাইছড়ি", "কাপ্তাই", "জুরাছড়ি", "লংগদু", "নানিয়ারচর", "রাজস্থলী"]
};

const districts = Object.keys(bdData).sort();

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const productId = searchParams.get('productId');
  const initialQty = Number(searchParams.get('qty')) || 1;
  const variant = searchParams.get('variant');
  const color = searchParams.get('color');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('');
  const [address, setAddress] = useState('');

  const upazilas = useMemo(() => {
    return selectedDistrict ? bdData[selectedDistrict] || [] : [];
  }, [selectedDistrict]);

  const deliveryCharge = useMemo(() => {
    if (!selectedDistrict) return 0;
    return selectedDistrict === 'ঢাকা' ? 70 : 120;
  }, [selectedDistrict]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      setCustomerName(user.displayName || '');
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

  const handlePlaceOrder = () => {
    if (!customerName || !phoneNumber || !selectedDistrict || !selectedUpazila || !address) {
      toast({ variant: "destructive", title: "তথ্য অসম্পূর্ণ", description: "অনুগ্রহ করে সব তথ্য সঠিক ভাবে পূরণ করুন।" });
      return;
    }

    setOrderLoading(true);
    const subtotal = (product?.discountPrice || product?.price || 0) * initialQty;
    const total = subtotal + deliveryCharge;

    const orderData = {
      userId: user?.uid,
      customerName,
      items: [{
        id: product?.id,
        name: product?.name,
        price: product?.discountPrice || product?.price,
        qty: initialQty,
        variant: variant || null,
        color: color || null
      }],
      subtotal,
      deliveryCharge,
      totalAmount: total,
      phoneNumber,
      location: {
        district: selectedDistrict,
        upazila: selectedUpazila,
        address: address
      },
      status: 'pending',
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, 'orders'), orderData)
      .then(() => {
        toast({ title: "অর্ডার সফল", description: "আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই কল দেওয়া হবে।" });
        router.push('/orders');
        
        // Notify Admins in Real-time for Phones
        const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
        getDocs(adminQuery).then(snap => {
          snap.forEach(adminDoc => {
            sendPushNotification({
              recipientId: adminDoc.id,
              title: 'নতুন অর্ডার এসেছে! 🔔',
              body: `${customerName} (৳${total}) একটি নতুন অর্ডার করেছেন।`
            });
          });
        });
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
          <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6 md:p-10">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-black">
                <Truck className="text-primary" /> ডেলিভারি তথ্য
              </CardTitle>
              <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">সারা বাংলাদেশে ক্যাশ অন ডেলিভারি</p>
            </CardHeader>
            <CardContent className="px-0 space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700 ml-1">ফোন নম্বর</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input 
                        value={phoneNumber} 
                        onChange={e => setPhoneNumber(e.target.value)} 
                        placeholder="আপনার ফোন নম্বর লিখুন" 
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700 ml-1">কাস্টমারের নাম</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input 
                        value={customerName} 
                        onChange={e => setCustomerName(e.target.value)} 
                        placeholder="আপনার নাম লিখুন" 
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700 ml-1">জেলা সিলেক্ট করুন</Label>
                    <Select onValueChange={(val) => { setSelectedDistrict(val); setSelectedUpazila(''); }} value={selectedDistrict}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold">
                        <SelectValue placeholder="জেলা বেছে নিন" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-2xl">
                        {districts.map(d => <SelectItem key={d} value={d} className="font-bold">{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700 ml-1">থানা/উপজেলা সিলেক্ট করুন</Label>
                    <Select disabled={!selectedDistrict} onValueChange={setSelectedUpazila} value={selectedUpazila}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold">
                        <SelectValue placeholder="থানা বেছে নিন" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-2xl">
                        {upazilas.map(u => <SelectItem key={u} value={u} className="font-bold">{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-slate-700 ml-1">বিস্তারিত ডেলিভারি ঠিকানা</Label>
                  <div className="relative group">
                    <Navigation className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <textarea 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      placeholder="গ্রাম, রাস্তা বা বাসার বিস্তারিত নম্বর..." 
                      className="w-full min-h-[100px] pl-12 pt-4 rounded-2xl bg-slate-50 border-none shadow-inner font-bold resize-none focus:ring-2 ring-primary/20 outline-none" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-xl bg-slate-900 p-8 text-white">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-primary">
                <CreditCard className="w-7 h-7" /> পেমেন্ট পদ্ধতি
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 mt-4">
              <div className="p-6 border-2 border-primary/30 rounded-2xl bg-primary/5 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg">ক্যাশ অন ডেলিভারি (COD)</h4>
                  <p className="text-slate-400 text-sm">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
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
                  {color && <p className="text-xs font-black text-emerald-500 uppercase mt-1">রঙ: {color}</p>}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>সাবটোটাল</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>ডেলিভারি চার্জ</span>
                  <span>৳{deliveryCharge || '0'}</span>
                </div>
                <div className="flex justify-between text-3xl font-black text-primary pt-6 border-t">
                  <span>সর্বমোট</span>
                  <span>৳{subtotal + deliveryCharge}</span>
                </div>
              </div>

              <Button 
                disabled={orderLoading || !selectedDistrict} 
                onClick={handlePlaceOrder}
                className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/30 bg-primary mt-6 transition-all active:scale-95"
              >
                {orderLoading ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
              </Button>
              <p className="text-[10px] text-center font-black text-slate-400 uppercase tracking-widest">নিরাপদ ও বিশ্বস্ত শপিং</p>
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

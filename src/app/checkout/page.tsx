
"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
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
import { MapPin, Phone, CreditCard, Truck, User, Navigation, ChevronDown } from 'lucide-react';
import { sendPushNotification } from '@/ai/flows/send-notification-flow';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Simplified Bangladesh Location Data (Districts and placeholder Upazilas)
const bdData: Record<string, string[]> = {
  "Dhaka": ["Dhaka North", "Dhaka South", "Savar", "Dhamrai", "Keraniganj", "Nawabganj", "Dohar"],
  "Chittagong": ["Chittagong City", "Hathazari", "Patiya", "Raozan", "Rangunia", "Boalkhali", "Anwara", "Banshkhali", "Lohagara", "Satkania", "Sandwip", "Fatikchhari", "Mirsharai", "Sitakunda"],
  "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
  "Narayanganj": ["Narayanganj Sadar", "Bandar", "Araihazar", "Rupganj", "Sonargaon"],
  "Jhenaidah": ["Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa", "Harinakunda"],
  "Sylhet": ["Sylhet Sadar", "Beanibazar", "Bishwanath", "Dakshin Surma", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Zakiganj"],
  "Rajshahi": ["Rajshahi City", "Paba", "Bagmara", "Godagari", "Charghat", "Durgapur", "Bagha", "Mohanpur", "Puthia", "Tanore"],
  "Khulna": ["Khulna City", "Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada"],
  "Barisal": ["Barisal City", "Bakerganj", "Babuganj", "Banaripara", "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"],
  "Rangpur": ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
  "Mymensingh": ["Mymensingh Sadar", "Bhaluka", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail", "Phulpur", "Trishal"],
  "Comilla": ["Comilla City", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Titas"],
  "Brahmanbaria": ["Brahmanbaria Sadar", "Ashuganj", "Bancharampur", "Kasba", "Nabinagar", "Nasirnagar", "Sarail", "Akhaura"],
  "Noakhali": ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Sonaimuri", "Subarnachar"],
  "Feni": ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"],
  "Chandpur": ["Chandpur Sadar", "Faridganj", "Hajiganj", "Hayderganj", "Kachua", "Matlab North", "Matlab South", "Shahrasti"],
  "Lakshmipur": ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"],
  "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Maheshkhali", "Ramu", "Teknaf", "Ukhia", "Pekua"],
  "Habiganj": ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj"],
  "Moulvibazar": ["Moulvibazar Sadar", "Barlekha", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal", "Juri"],
  "Sunamganj": ["Sunamganj Sadar", "Bishwambharpur", "Chhatak", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur"],
  "Bagerhat": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
  "Jessore": ["Jessore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
  "Kushtia": ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Mirpur"],
  "Magura": ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
  "Meherpur": ["Meherpur Sadar", "Gangni", "Mujibnagar"],
  "Narail": ["Narail Sadar", "Kalia", "Lohagara"],
  "Satkhira": ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"],
  "Chuadanga": ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
  "Bogura": ["Bogura Sadar", "Adamdighi", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Sherpur", "Shibganj", "Sonatola"],
  "Joypurhat": ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"],
  "Naogaon": ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mahadevpur", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
  "Natore": ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Singra"],
  "Pabna": ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"],
  "Sirajganj": ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Tarash", "Ullapara"],
  "Dinajpur": ["Dinajpur Sadar", "Birampur", "Birganj", "Birol", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
  "Gaibandha": ["Gaibandha Sadar", "Phulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
  "Kurigram": ["Kurigram Sadar", "Bhurungamari", "Chilmari", "Phulbari", "Nageshwari", "Rajarhat", "Rajibpur", "Roumari", "Ulipur"],
  "Lalmonirhat": ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"],
  "Nilphamari": ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"],
  "Panchagarh": ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],
  "Thakurgaon": ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"],
  "Barguna": ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali"],
  "Bhola": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
  "Jhalokati": ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  "Patuakhali": ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali"],
  "Pirojpur": ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"],
  "Faridpur": ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
  "Gopalganj": ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
  "Kishoreganj": ["Kishoreganj Sadar", "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"],
  "Madaripur": ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"],
  "Manikganj": ["Manikganj Sadar", "Daulatpur", "Ghiror", "Harirampur", "Saturia", "Shivalaya", "Singair"],
  "Munshiganj": ["Munshiganj Sadar", "Gazaria", "Lohajang", "Sirajdikhan", "Sreenagar", "Tongibari"],
  "Rajbari": ["Rajbari Sadar", "Baliakandi", "Goalandaghat", "Pangsha", "Kalukhali"],
  "Shariatpur": ["Shariatpur Sadar", "Bhedarganj", "Damudya", "Gosairhat", "Naria", "Zajira"],
  "Tangail": ["Tangail Sadar", "Basail", "Bhuapur", "Delduar", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Dhanbari"],
  "Netrokona": ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Purbadhala"],
  "Sherpur": ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"],
  "Jamalpur": ["Jamalpur Sadar", "Bakshiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"],
  "Bandarban": ["Bandarban Sadar", "Ali Kadam", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"],
  "Khagrachhari": ["Khagrachhari Sadar", "Dighinala", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"],
  "Rangamati": ["Rangamati Sadar", "Baghaichhari", "Barkal", "Kawkhali", "Belaichhari", "Kaptai", "Jurachhari", "Langadu", "Naniarchar", "Rajasthali"]
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
    return selectedDistrict === 'Dhaka' ? 70 : 120;
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
        variant: variant || null
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
        
        // Notify Admins
        const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
        getDocs(adminQuery).then(snap => {
          snap.forEach(adminDoc => {
            const adminData = adminDoc.data();
            if (adminData.fcmToken) {
              sendPushNotification({
                recipientToken: adminData.fcmToken,
                title: 'নতুন অর্ডার এসেছে! 🔔',
                body: `${customerName} (৳${total}) একটি নতুন অর্ডার করেছেন।`
              });
            }
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700 ml-1">জেলা সিলেক্ট করুন</Label>
                    <Select onValueChange={(val) => { setSelectedDistrict(val); setSelectedUpazila(''); }}>
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

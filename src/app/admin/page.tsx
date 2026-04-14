
"use client";

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { collection, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Settings, Users, Save, Package, ShoppingCart, CheckCircle, XCircle, MapPin, LocateFixed, Activity, LayoutDashboard, ExternalLink, ZoomIn } from 'lucide-react';
import { Product } from '@/components/product/product-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState({
    heroTitle: 'সেরা পণ্যের সেরা বাজার',
    heroSubtitle: 'সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন ঝামেলাহীন কেনাকাটায়।',
    whatsappNumber: '01797958686'
  });
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    description: '',
    category: '',
    stock: '',
    isFeatured: false,
    imageUrls: ['']
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const pSnapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(pSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);

      const uSnapshot = await getDocs(collection(db, 'users'));
      setCustomers(uSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      const oSnapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(oSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      const sSnap = await getDoc(doc(db, 'settings', 'site'));
      if (sSnap.exists()) setSiteSettings(sSnap.data() as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user, db]);

  const updateOrderStatus = async (orderId: string, status: 'confirmed' | 'cancelled') => {
    const orderRef = doc(db, 'orders', orderId);
    try {
      await updateDoc(orderRef, { status });
      toast({ title: `অর্ডার ${status === 'confirmed' ? 'কনফার্ম' : 'ক্যানসেল'} হয়েছে` });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      ...formData,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      stock: Number(formData.stock),
      imageUrls: formData.imageUrls.filter(u => u.trim() !== ''),
      updatedAt: serverTimestamp(),
    };

    if (!editingProduct) data.createdAt = serverTimestamp();

    const action = editingProduct 
      ? updateDoc(doc(db, 'products', editingProduct.id), data) 
      : addDoc(collection(db, 'products'), data);

    action.then(() => {
      toast({ title: 'সফলভাবে সেভ হয়েছে' });
      setProductDialogOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', discountPrice: '', description: '', category: '', stock: '', isFeatured: false, imageUrls: [''] });
      fetchData();
    }).catch(err => {
      console.error(err);
      toast({ variant: 'destructive', title: 'ব্যর্থ হয়েছে' });
    });
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে পণ্যটি মুছে ফেলতে চান?')) return;
    
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: 'পণ্যটি মুছে ফেলা হয়েছে' });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'মুছে ফেলা সম্ভব হয়নি' });
    }
  };

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'site'), siteSettings, { merge: true });
      toast({ title: 'সাইট সেটিংস আপডেট করা হয়েছে' });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'সেটিংস সেভ করতে সমস্যা হয়েছে' });
    }
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen pb-24 md:pb-12 overflow-x-hidden bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">অ্যাডমিন <span className="text-primary">প্যানেল</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">সবকিছুর পূর্ণ নিয়ন্ত্রণ আপনার হাতে</p>
          </div>
          <div className="flex gap-4">
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl h-14 px-8 bg-primary font-black text-lg text-white shadow-xl shadow-primary/20 transition-all hover:scale-105">
                  <Plus className="mr-2 w-5 h-5" /> নতুন পণ্য যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">পণ্যের বিস্তারিত তথ্য</DialogTitle>
                  <DialogDescription className="font-bold text-slate-400">সঠিক তথ্য দিয়ে ইনভেন্টরি আপডেট করুন।</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold">পণ্যের নাম</Label>
                      <Input placeholder="নাম" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-xl h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold">মূল্য (৳)</Label>
                        <Input type="number" placeholder="৳" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">ক্যাটাগরি</Label>
                        <Input placeholder="ক্যাটাগরি" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required className="rounded-xl h-12" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">ছবি ইউআরএল (HD)</Label>
                      <Input placeholder="https://..." value={formData.imageUrls[0]} onChange={e => setFormData({...formData, imageUrls: [e.target.value]})} required className="rounded-xl h-12" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold">বিবরণ</Label>
                      <Textarea placeholder="পণ্যের বিস্তারিত বিবরণ..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl min-h-[120px]" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="space-y-0.5">
                        <Label className="font-black">স্পেশাল কালেকশন</Label>
                        <p className="text-[10px] text-slate-400 font-bold">হোম পেজে হাইলাইট হবে</p>
                      </div>
                      <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                    </div>
                    <Button type="submit" className="w-full h-16 rounded-2xl font-black text-xl shadow-lg">পণ্য সেভ করুন</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-white/60 glass p-1.5 rounded-full h-20 flex overflow-x-auto scrollbar-hide border border-white/40 shadow-xl w-full max-w-4xl mx-auto">
            <TabsTrigger value="orders" className="rounded-full flex-1 font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
              <ShoppingCart className="w-4 h-4" /> অর্ডারসমূহ
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-full flex-1 font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
              <Package className="w-4 h-4" /> পণ্য তালিকা
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-full flex-1 font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
              <Users className="w-4 h-4" /> কাস্টমার
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full flex-1 font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
              <Settings className="w-4 h-4" /> সাইট সেটিংস
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white/80 glass">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-b border-slate-100">
                      <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">অর্ডার ও লোকেশন</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">ফোন নম্বর</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">মোট মূল্য</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">অবস্থা</TableHead>
                      <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-20 text-center font-bold text-slate-400">কোনো অর্ডার পাওয়া যায়নি</TableCell>
                      </TableRow>
                    ) : orders.map(o => (
                      <TableRow key={o.id} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="py-6">
                          <div className="space-y-2">
                            <span className="font-black text-slate-900 block text-sm md:text-base">
                              {o.items?.map((i: any) => `${i.name} (${i.qty})`).join(', ') || 'পণ্য নেই'}
                            </span>
                            <div className="space-y-1.5">
                              <p className="text-xs text-slate-500 font-bold flex items-start gap-2 max-w-xs">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> 
                                {o.location?.address}
                              </p>
                              {o.location?.lat && (
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLocation(o.location);
                                    setMapDialogOpen(true);
                                  }}
                                  className="h-9 rounded-full gap-2 font-black text-[10px] text-primary border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                  <ZoomIn className="w-3.5 h-3.5" /> অ্যাপে ম্যাপ দেখুন
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-slate-600 text-sm">{o.phoneNumber}</TableCell>
                        <TableCell className="font-black text-base md:text-lg text-primary">৳{o.totalAmount}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "font-black text-[10px] px-3 py-1 rounded-full border-none shadow-sm uppercase", 
                            o.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                            o.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 
                            'bg-red-100 text-red-600'
                          )}>
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {o.status === 'pending' ? (
                              <>
                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-emerald-500 hover:bg-emerald-50" onClick={() => updateOrderStatus(o.id, 'confirmed')}><CheckCircle className="w-6 h-6" /></Button>
                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-red-500 hover:bg-red-50" onClick={() => updateOrderStatus(o.id, 'cancelled')}><XCircle className="w-6 h-6" /></Button>
                              </>
                            ) : (
                              <Badge variant="outline" className="rounded-full text-[9px] uppercase font-black opacity-50">COMPLETED</Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white/80 glass">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black py-6">পণ্য</TableHead>
                    <TableHead className="font-black">ক্যাটাগরি</TableHead>
                    <TableHead className="font-black">মূল্য</TableHead>
                    <TableHead className="text-right font-black">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id} className="hover:bg-slate-50/80 transition-all">
                      <TableCell className="py-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img src={p.imageUrls[0]} alt="" className="object-cover w-full h-full" />
                        </div>
                        <span className="font-black text-slate-900 text-sm md:text-base">{p.name}</span>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="rounded-full font-bold text-[10px]">{p.category}</Badge></TableCell>
                      <TableCell className="font-black text-base md:text-lg text-primary">৳{p.discountPrice || p.price}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => { setEditingProduct(p); setFormData(p as any); setProductDialogOpen(true); }}><Pencil className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-red-500 hover:bg-red-50" onClick={() => deleteProduct(p.id)}><Trash2 className="w-5 h-5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
             <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white/80 glass">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black py-6">নাম</TableHead>
                    <TableHead className="font-black">ফোন নম্বর</TableHead>
                    <TableHead className="font-black">রোল</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="py-6 font-bold">{c.name || 'নাম নেই'}</TableCell>
                      <TableCell className="font-mono">{c.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge className={c.role === 'admin' ? 'bg-primary' : 'bg-slate-200 text-slate-700 border-none'}>
                          {c.role === 'admin' ? 'অ্যাডমিন' : 'ক্রেতা'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="rounded-[2.5rem] border-none shadow-2xl p-6 md:p-10 bg-white/80 glass space-y-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-4 border-b pb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">সাইট কাস্টমাইজেশন</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">পুরো ওয়েবসাইট সাজান আপনার মতো করে</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="font-black">হিরো টাইটেল (Home Headline)</Label>
                  <Input value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} className="rounded-xl h-14 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black">হিরো সাব-টাইটেল (Description)</Label>
                  <Textarea value={siteSettings.heroSubtitle} onChange={e => setSiteSettings({...siteSettings, heroSubtitle: e.target.value})} className="rounded-xl min-h-[100px] font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black">হোয়াটসঅ্যাপ নম্বর (Contact)</Label>
                  <Input value={siteSettings.whatsappNumber} onChange={e => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})} className="rounded-xl h-14 font-bold" />
                </div>
                <Button onClick={saveSettings} className="h-16 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 bg-primary">
                  <Save className="w-5 h-5" /> পরিবর্তন সেভ করুন
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Improved Interactive Map Dialog */}
        <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
          <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-white">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                <LocateFixed className="text-primary w-6 h-6" /> কাস্টমারের লাইভ লোকেশন
              </DialogTitle>
              <DialogDescription className="font-bold text-slate-500 mt-1">
                ঠিকানা: {selectedLocation?.address}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-grow relative bg-slate-50">
              {selectedLocation && (
                <iframe
                  title="Interactive Customer Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=17&output=embed`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              )}
              <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                 <Button 
                    className="rounded-full shadow-2xl font-black gap-2 h-14 px-8 bg-white text-slate-900 hover:bg-slate-50 border border-slate-200"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedLocation?.lat},${selectedLocation?.lng}`, '_blank')}
                  >
                    <ExternalLink className="w-5 h-5 text-primary" /> গুগল ম্যাপস অ্যাপে দেখুন
                  </Button>
              </div>
            </div>
            <DialogFooter className="p-6 flex flex-col md:flex-row justify-between items-center bg-slate-50 border-t gap-4">
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GPS COORDINATES</p>
                <p className="font-mono text-xs font-bold text-primary">
                  LAT: {selectedLocation?.lat.toFixed(6)}, LNG: {selectedLocation?.lng.toFixed(6)}
                </p>
              </div>
              <Button 
                variant="ghost" 
                className="rounded-full font-black text-slate-500 hover:text-slate-900"
                onClick={() => setMapDialogOpen(false)}
              >
                বন্ধ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
    
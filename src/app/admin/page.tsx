
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
import { Plus, Pencil, Trash2, Save, Package, ShoppingCart, CheckCircle, XCircle, Activity, DollarSign, Users, PackageCheck, Image as ImageIcon, Check } from 'lucide-react';
import { Product } from '@/components/product/product-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { sendPushNotification } from '@/ai/flows/send-notification-flow';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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
    whatsappNumber: '01797958686',
    apkUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    description: '',
    category: '',
    stock: '',
    isFeatured: false,
    imageUrls: [''],
    mainImageIndex: 0,
    unit: 'Size',
    variants: '',
    colors: ''
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
      if (sSnap.exists()) {
        const data = sSnap.data();
        setSiteSettings({
          heroTitle: data.heroTitle || '',
          heroSubtitle: data.heroSubtitle || '',
          whatsappNumber: data.whatsappNumber || '',
          apkUrl: data.apkUrl || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user, db]);

  const updateOrderStatus = (orderId: string, customerId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    const orderRef = doc(db, 'orders', orderId);
    updateDoc(orderRef, { status })
      .then(async () => {
        let title = '';
        let body = '';
        
        if (status === 'confirmed') {
          title = 'অর্ডার কনফার্ম হয়েছে! ✅';
          body = 'আপনার অর্ডারটি কনফার্ম করা হয়েছে। খুব দ্রুতই আপনার পণ্যটি হাতে পেয়ে যাবেন।';
        } else if (status === 'completed') {
          title = 'অর্ডার সফল হয়েছে! 📦';
          body = 'আপনার অর্ডারটি সফলভাবে পৌঁছে দেওয়া হয়েছে। আমাদের সাথে থাকার জন্য ধন্যবাদ।';
        } else if (status === 'cancelled') {
          title = 'অর্ডার বাতিল হয়েছে ❌';
          body = 'দুঃখিত, আপনার অর্ডারটি কোনো কারণে বাতিল করা হয়েছে। বিস্তারিত জানতে যোগাযোগ করুন।';
        }

        toast({ title: title });
        fetchData();
        
        if (customerId) {
          sendPushNotification({
            recipientId: customerId,
            title: title,
            body: body
          });
        }
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: orderRef.path,
          operation: 'update',
          requestResourceData: { status },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const deleteOrder = (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই অর্ডারটি মুছে ফেলতে চান?')) return;
    const orderRef = doc(db, 'orders', id);
    deleteDoc(orderRef)
      .then(() => {
        toast({ title: 'অর্ডারটি মুছে ফেলা হয়েছে' });
        setOrders(prev => prev.filter(o => o.id !== id));
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: orderRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrls = formData.imageUrls.map(u => u.trim()).filter(u => u !== '');
    if (cleanUrls.length === 0) {
      toast({ variant: 'destructive', title: 'ছবি যোগ করুন', description: 'অন্তত একটি ছবির লিঙ্ক দিন।' });
      return;
    }

    const data: any = {
      name: formData.name,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      description: formData.description,
      category: formData.category,
      stock: Number(formData.stock),
      isFeatured: formData.isFeatured,
      imageUrls: cleanUrls,
      mainImageIndex: formData.mainImageIndex >= cleanUrls.length ? 0 : formData.mainImageIndex,
      unit: formData.unit,
      variants: formData.variants.split(',').map(v => v.trim()).filter(v => v !== ''),
      colors: formData.colors.split(',').map(v => v.trim()).filter(v => v !== ''),
      updatedAt: serverTimestamp(),
    };

    if (!editingProduct) data.createdAt = serverTimestamp();

    if (editingProduct) {
      const pRef = doc(db, 'products', editingProduct.id);
      updateDoc(pRef, data)
        .then(() => {
          toast({ title: 'সফলভাবে আপডেট হয়েছে' });
          setProductDialogOpen(false);
          setEditingProduct(null);
          resetForm();
          fetchData();
        })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: pRef.path,
            operation: 'update',
            requestResourceData: data,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      addDoc(collection(db, 'products'), data)
        .then(() => {
          toast({ title: 'সফলভাবে যুক্ত হয়েছে' });
          setProductDialogOpen(false);
          resetForm();
          fetchData();
        })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: 'products',
            operation: 'create',
            requestResourceData: data,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      discountPrice: '',
      description: '',
      category: '',
      stock: '',
      isFeatured: false,
      imageUrls: [''],
      mainImageIndex: 0,
      unit: 'Size',
      variants: '',
      colors: ''
    });
  };

  const addImageUrl = () => {
    setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] });
  };

  const updateImageUrl = (index: number, value: string) => {
    const urls = [...formData.imageUrls];
    urls[index] = value;
    setFormData({ ...formData, imageUrls: urls });
  };

  const removeImageUrl = (index: number) => {
    if (formData.imageUrls.length <= 1) return;
    const urls = [...formData.imageUrls];
    urls.splice(index, 1);
    let newMainIndex = formData.mainImageIndex;
    if (formData.mainImageIndex === index) newMainIndex = 0;
    else if (formData.mainImageIndex > index) newMainIndex--;
    setFormData({ ...formData, imageUrls: urls, mainImageIndex: newMainIndex });
  };

  const deleteProduct = (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে পণ্যটি মুছে ফেলতে চান?')) return;
    const pRef = doc(db, 'products', id);
    deleteDoc(pRef)
      .then(() => {
        toast({ title: 'পণ্যটি মুছে ফেলা হয়েছে' });
        setProducts(prev => prev.filter(p => p.id !== id));
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: pRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const saveSettings = () => {
    const sRef = doc(db, 'settings', 'site');
    setDoc(sRef, siteSettings, { merge: true })
      .then(() => {
        toast({ title: 'সাইট সেটিংস আপডেট করা হয়েছে' });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: sRef.path,
          operation: 'write',
          requestResourceData: siteSettings,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const stats = {
    totalSales: orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + (o.totalAmount || 0), 0),
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalProducts: products.length
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">অ্যাডমিন <span className="text-primary">প্যানেল</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">সবকিছুর পূর্ণ নিয়ন্ত্রণ আপনার হাতে</p>
          </div>
          <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if(!open) { setEditingProduct(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 md:h-14 px-8 bg-primary font-black text-white shadow-xl hover:scale-105">
                <Plus className="mr-2 w-5 h-5" /> নতুন পণ্য
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl">
              <DialogHeader className="p-8 bg-slate-50 rounded-t-[2rem]">
                <DialogTitle className="text-3xl font-black text-slate-900">পণ্যের বিস্তারিত তথ্য</DialogTitle>
                <DialogDescription className="font-bold text-slate-500">সঠিক তথ্য ও ছবি দিয়ে ইনভেন্টরি আপডেট করুন।</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 ml-1">পণ্যের নাম</Label>
                      <Input placeholder="পণ্যের নাম লিখুন" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner font-bold" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label className="font-black text-slate-700 ml-1">মূল্য (৳)</Label>
                        <Input type="number" placeholder="৳" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner font-bold" />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black text-slate-700 ml-1">ক্যাটাগরি</Label>
                        <Input placeholder="যেমন: ফ্যাশন" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner font-bold" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 ml-1">পণ্যের বিবরণ</Label>
                      <Textarea placeholder="পণ্যের গুণাগুণ লিখুন..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-2xl min-h-[140px] bg-slate-50 border-none shadow-inner font-bold p-5" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label className="font-black text-slate-700 ml-1">ভেরিয়েন্ট ইউনিট</Label>
                        <Input placeholder="যেমন: Size" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner font-bold" />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black text-slate-700 ml-1">স্টক পরিমাণ</Label>
                        <Input type="number" placeholder="Qty" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner font-bold" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 ml-1">ভেরিয়েন্টসমূহ (কমা দিয়ে লিখুন)</Label>
                      <Input placeholder="M, L, XL" value={formData.variants} onChange={e => setFormData({...formData, variants: e.target.value})} className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner font-bold" />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 ml-1">কালারসমূহ (কমা দিয়ে লিখুন)</Label>
                      <Input placeholder="Red, Black, Blue" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner font-bold" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-black text-slate-700 ml-1">পণ্যের ছবিসমূহ (URL)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addImageUrl} className="rounded-full font-black text-[10px] h-8 px-4 border-primary text-primary"><Plus className="w-3.5 h-3.5 mr-1" /> নতুন ছবি</Button>
                      </div>
                      
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {formData.imageUrls.map((url, idx) => (
                          <Card key={idx} className={cn("p-4 rounded-3xl border-2 transition-all", formData.mainImageIndex === idx ? "border-primary bg-primary/5" : "border-slate-100 bg-white")}>
                            <div className="flex gap-4 items-start">
                              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border overflow-hidden relative group">
                                {url ? (
                                  <img src={url} alt="" className="object-cover w-full h-full" />
                                ) : (
                                  <ImageIcon className="text-slate-300" />
                                )}
                                {formData.mainImageIndex === idx && (
                                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <Check className="text-white w-8 h-8 drop-shadow-lg" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow space-y-2">
                                <Input placeholder="ছবির ইউআরএল দিন" value={url} onChange={e => updateImageUrl(idx, e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none shadow-inner text-xs font-bold" />
                                <div className="flex items-center gap-2">
                                  <Button type="button" variant={formData.mainImageIndex === idx ? "default" : "outline"} className="h-8 rounded-full text-[9px] font-black flex-1" onClick={() => setFormData({...formData, mainImageIndex: idx})}>
                                    {formData.mainImageIndex === idx ? "হোমপেজে শো করবে" : "Set as Card Image"}
                                  </Button>
                                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeImageUrl(idx)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl shadow-inner">
                      <div className="space-y-1">
                        <Label className="font-black text-slate-800">স্পেশাল কালেকশন</Label>
                        <p className="text-[10px] font-bold text-slate-500">এটি হোমপেজের উপরে ট্রেন্ডিং সেকশনে শো করবে।</p>
                      </div>
                      <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-3xl font-black text-xl shadow-2xl shadow-primary/30 bg-primary">পণ্য সেভ করুন</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'সফল বিক্রি', value: `৳${stats.totalSales}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'মোট অর্ডার', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'ক্রেতা', value: stats.totalCustomers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'পণ্য', value: stats.totalProducts, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <Card key={i} className="p-6 rounded-[1.5rem] border-none shadow-lg flex flex-col items-center text-center gap-3 transition-transform hover:scale-105">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-white/80 p-1 rounded-full h-16 flex overflow-x-auto border shadow-xl w-full max-w-3xl mx-auto">
            <TabsTrigger value="orders" className="rounded-full flex-1 font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white">অর্ডার</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full flex-1 font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white">পণ্য</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-full flex-1 font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white">ক্রেতা</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full flex-1 font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white">সেটিংস</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="rounded-[2rem] border-none shadow-2xl overflow-hidden bg-white/80">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black py-6">ক্রেতা ও অর্ডার</TableHead>
                    <TableHead className="font-black">ঠিকানা</TableHead>
                    <TableHead className="font-black">মূল্য</TableHead>
                    <TableHead className="font-black">অবস্থা</TableHead>
                    <TableHead className="text-right font-black">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(o => (
                    <TableRow key={o.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="py-6">
                        <div className="space-y-1">
                          <span className="font-black text-slate-900 block">{o.customerName || 'ক্রেতা'}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{o.phoneNumber}</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {o.items?.map((i: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-[8px] font-black uppercase py-0 px-2 rounded-md">
                                {i.name} ({i.qty}) {i.variant ? `[${i.variant}]` : ''} {i.color ? `[${i.color}]` : ''}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-700">{o.location?.district}, {o.location?.upazila}</p>
                          <p className="text-[10px] text-slate-500 max-w-[200px] truncate">{o.location?.address}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-lg text-primary">৳{o.totalAmount}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "font-black text-[10px] px-3 py-1 rounded-full border-none", 
                          o.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                          o.status === 'confirmed' ? 'bg-blue-100 text-blue-600' : 
                          o.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        )}>
                          {o.status === 'pending' ? 'পেন্ডিং' : o.status === 'confirmed' ? 'কনফার্মড' : o.status === 'completed' ? 'সফল' : 'বাতিল'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {o.status === 'pending' && (
                            <>
                              <Button size="icon" variant="ghost" className="h-10 w-10 text-blue-500" onClick={() => updateOrderStatus(o.id, o.userId, 'confirmed')} title="কনফার্ম করুন"><CheckCircle className="w-5 h-5" /></Button>
                              <Button size="icon" variant="ghost" className="h-10 w-10 text-red-500" onClick={() => updateOrderStatus(o.id, o.userId, 'cancelled')} title="বাতিল করুন"><XCircle className="w-5 h-5" /></Button>
                            </>
                          )}
                          {o.status === 'confirmed' && (
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-emerald-500" onClick={() => updateOrderStatus(o.id, o.userId, 'completed')} title="কম্প্লিট করুন"><PackageCheck className="w-5 h-5" /></Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-red-500" onClick={() => deleteOrder(o.id)} title="ডিলিট"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="rounded-[2rem] border-none shadow-2xl overflow-hidden bg-white/80">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black py-6">পণ্য</TableHead>
                    <TableHead className="font-black">ক্যাটাগরি</TableHead>
                    <TableHead className="font-black">মূল্য</TableHead>
                    <TableHead className="font-black">স্টক</TableHead>
                    <TableHead className="text-right font-black">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id} className="hover:bg-slate-50 transition-all">
                      <TableCell className="py-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border">
                          <img src={p.imageUrls[p.mainImageIndex || 0] || p.imageUrls[0]} alt="" className="object-cover w-full h-full" />
                        </div>
                        <span className="font-black text-slate-900">{p.name}</span>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="rounded-full font-bold">{p.category}</Badge></TableCell>
                      <TableCell className="font-black text-lg text-primary">৳{p.discountPrice || p.price}</TableCell>
                      <TableCell className="font-bold text-slate-500">{p.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-primary" onClick={() => { 
                            setEditingProduct(p); 
                            setFormData({ 
                              name: p.name || '',
                              price: p.price?.toString() || '',
                              discountPrice: p.discountPrice?.toString() || '',
                              description: p.description || '',
                              category: p.category || '',
                              stock: p.stock?.toString() || '',
                              isFeatured: p.isFeatured || false,
                              imageUrls: p.imageUrls || [''],
                              mainImageIndex: p.mainImageIndex || 0,
                              unit: p.unit || 'Size',
                              variants: p.variants?.join(', ') || '',
                              colors: p.colors?.join(', ') || ''
                            }); 
                            setProductDialogOpen(true); 
                          }}><Pencil className="w-5 h-5" /></Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500" onClick={() => deleteProduct(p.id)}><Trash2 className="w-5 h-5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
             <Card className="rounded-[2rem] border-none shadow-2xl overflow-hidden bg-white/80">
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
                      <TableCell className="font-mono text-slate-600">{c.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge className={cn("font-black uppercase", c.role === 'admin' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700')}>
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
            <Card className="rounded-[2rem] border-none shadow-2xl p-10 bg-white/80 max-w-3xl mx-auto space-y-8">
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
                  <Label className="font-black">হিরো টাইটেল</Label>
                  <input value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} className="rounded-xl h-14 font-bold w-full border border-input bg-background px-3" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black">হোয়াটসঅ্যাপ নম্বর</Label>
                  <input value={siteSettings.whatsappNumber} onChange={e => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})} className="rounded-xl h-14 font-bold w-full border border-input bg-background px-3" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black">অ্যাপ ডাউনলোড ইউআরএল (APK Link)</Label>
                  <input value={siteSettings.apkUrl} onChange={e => setSiteSettings({...siteSettings, apkUrl: e.target.value})} className="rounded-xl h-14 font-mono text-xs w-full border border-input bg-background px-3" />
                </div>
                <Button onClick={saveSettings} className="h-16 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 bg-primary">
                  <Save className="w-5 h-5" /> পরিবর্তন সেভ করুন
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

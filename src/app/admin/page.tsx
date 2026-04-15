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
import { Plus, Pencil, Trash2, Save, Package, ShoppingCart, CheckCircle, Activity, DollarSign, Users, Image as ImageIcon, MapPin, Phone, User as UserIcon } from 'lucide-react';
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
    <div className="min-h-screen pb-20 bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">অ্যাডমিন <span className="text-primary">প্যানেল</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px]">পূর্ণ নিয়ন্ত্রণ আপনার হাতে</p>
          </div>
          <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if(!open) { setEditingProduct(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl h-9 px-4 bg-primary font-black text-white shadow-lg hover:scale-105 transition-transform text-[10px]">
                <Plus className="mr-1 w-3 h-3" /> নতুন পণ্য
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
              <DialogHeader className="p-4 bg-slate-50 rounded-t-3xl">
                <DialogTitle className="text-lg font-black text-slate-900">পণ্যের বিস্তারিত তথ্য</DialogTitle>
                <DialogDescription className="font-bold text-slate-500 text-[10px]">সঠিক তথ্য ও ছবি দিয়ে ইনভেন্টরি আপডেট করুন।</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="font-black text-slate-700 text-[10px]">পণ্যের নাম</Label>
                      <Input placeholder="পণ্যের নাম লিখুন" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-xl h-10 bg-slate-50 border-none shadow-inner font-bold text-xs" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="font-black text-slate-700 text-[10px]">মূল্য (৳)</Label>
                        <Input type="number" placeholder="৳" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="rounded-xl h-10 bg-slate-50 border-none shadow-inner font-bold text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-black text-slate-700 text-[10px]">ক্যাটাগরি</Label>
                        <Input placeholder="যেমন: ফ্যাশন" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required className="rounded-xl h-10 bg-slate-50 border-none shadow-inner font-bold text-xs" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-black text-slate-700 text-[10px]">পণ্যের বিবরণ</Label>
                      <Textarea placeholder="পণ্যের গুণাগুণ লিখুন..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl min-h-[80px] bg-slate-50 border-none shadow-inner font-bold p-3 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="font-black text-slate-700 text-[10px]">ভেরিয়েন্ট ইউনিট</Label>
                        <Input placeholder="যেমন: Size" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="rounded-xl h-10 bg-slate-50 border-none shadow-inner font-bold text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-black text-slate-700 text-[10px]">স্টক পরিমাণ</Label>
                        <Input type="number" placeholder="Qty" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required className="rounded-xl h-10 bg-slate-50 border-none shadow-inner font-bold text-xs" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-black text-slate-700 text-[10px]">পণ্যের ছবিসমূহ (URL)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addImageUrl} className="rounded-full font-black text-[8px] h-6 px-2 border-primary text-primary"><Plus className="w-2 h-2 mr-1" /> নতুন ছবি</Button>
                      </div>
                      
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-hide">
                        {formData.imageUrls.map((url, idx) => (
                          <Card key={idx} className={cn("p-2 rounded-xl border transition-all", formData.mainImageIndex === idx ? "border-primary bg-primary/5" : "border-slate-100 bg-white")}>
                            <div className="flex gap-2 items-start">
                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border overflow-hidden relative">
                                {url ? (
                                  <img src={url} alt="" className="object-cover w-full h-full" />
                                ) : (
                                  <ImageIcon className="text-slate-300 w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-grow space-y-1">
                                <Input placeholder="ছবির ইউআরএল দিন" value={url} onChange={e => updateImageUrl(idx, e.target.value)} className="h-7 rounded-lg bg-slate-50 border-none shadow-inner text-[9px] font-bold" />
                                <div className="flex items-center gap-1">
                                  <Button type="button" variant={formData.mainImageIndex === idx ? "default" : "outline"} className="h-6 rounded-full text-[7px] font-black flex-1" onClick={() => setFormData({...formData, mainImageIndex: idx})}>
                                    {formData.mainImageIndex === idx ? "হোমপেজে শো করবে" : "Set as Card Image"}
                                  </Button>
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeImageUrl(idx)}><Trash2 className="w-3 h-3" /></Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl shadow-inner">
                      <Label className="font-black text-slate-800 text-[10px]">স্পেশাল কালেকশন</Label>
                      <Switch className="scale-75" checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                    </div>

                    <Button type="submit" className="w-full h-10 rounded-xl font-black text-sm shadow-lg bg-primary">পণ্য সেভ করুন</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'সফল বিক্রি', value: `৳${stats.totalSales}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'মোট অর্ডার', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'ক্রেতা', value: stats.totalCustomers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'পণ্য', value: stats.totalProducts, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <Card key={i} className="p-3 rounded-xl border-none shadow-sm flex flex-col items-center text-center gap-1">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-sm font-black text-slate-900">{stat.value}</h3>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="bg-white/80 p-0.5 rounded-full h-10 flex border shadow-sm w-full max-w-lg mx-auto glass">
            <TabsTrigger value="orders" className="rounded-full flex-1 font-black h-full text-[9px] data-[state=active]:bg-primary data-[state=active]:text-white uppercase">অর্ডার</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full flex-1 font-black h-full text-[9px] data-[state=active]:bg-primary data-[state=active]:text-white uppercase">পণ্য</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-full flex-1 font-black h-full text-[9px] data-[state=active]:bg-primary data-[state=active]:text-white uppercase">ক্রেতা</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full flex-1 font-black h-full text-[9px] data-[state=active]:bg-primary data-[state=active]:text-white uppercase">সেটিংস</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="rounded-2xl border-none shadow-lg overflow-hidden bg-white/80 glass">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black py-3 text-[9px]">ক্রেতা তথ্য</TableHead>
                    <TableHead className="font-black text-[9px]">পণ্য ও বিবরণ</TableHead>
                    <TableHead className="font-black text-[9px]">ডেলিভারি ঠিকানা</TableHead>
                    <TableHead className="font-black text-[9px]">মূল্য ও অবস্থা</TableHead>
                    <TableHead className="text-right font-black text-[9px]">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(o => (
                    <TableRow key={o.id} className="hover:bg-primary/5 transition-colors items-start">
                      <TableCell className="py-3 align-top min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                             <UserIcon className="w-3 h-3 text-slate-400" />
                             <span className="font-black text-slate-900 block text-[10px]">{o.customerName || 'ক্রেতা'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <Phone className="w-3 h-3 text-primary" />
                             <span className="text-[9px] text-slate-600 font-bold">{o.phoneNumber}</span>
                          </div>
                          <div className="pt-1 text-[7px] text-slate-400 font-black uppercase">
                            {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString('bn-BD') : 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-2">
                          {o.items?.map((i: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-black text-[9px] text-slate-800 leading-tight">{i.name}</span>
                                <span className="font-black text-[9px] text-primary whitespace-nowrap">x {i.qty}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {i.variant && (
                                  <Badge variant="outline" className="text-[7px] font-black uppercase py-0 px-1 rounded-md bg-white border-primary/20 text-primary">
                                    {i.variant}
                                  </Badge>
                                )}
                                {i.color && (
                                  <Badge variant="outline" className="text-[7px] font-black uppercase py-0 px-1 rounded-md bg-white border-emerald-200 text-emerald-600">
                                    {i.color}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-900 font-black text-[9px]">
                            <MapPin className="w-3 h-3 text-red-500" />
                            {o.location?.district}
                          </div>
                          <div className="text-[8px] font-bold text-slate-600 pl-4">
                            উপজেলা: {o.location?.upazila || 'N/A'}
                          </div>
                          <div className="text-[8px] text-slate-500 font-medium pl-4 max-w-[150px] leading-relaxed">
                            {o.location?.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-2">
                          <div className="space-y-0.5">
                            <div className="text-[8px] text-slate-400 font-black uppercase">Total Amount</div>
                            <div className="font-black text-xs text-primary">৳{o.totalAmount}</div>
                          </div>
                          <Badge className={cn(
                            "font-black text-[7px] px-2 py-0.5 rounded-full border-none shadow-sm block w-fit", 
                            o.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                            o.status === 'confirmed' ? 'bg-blue-100 text-blue-600' : 
                            o.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          )}>
                            {o.status === 'pending' ? 'পেন্ডিং' : o.status === 'confirmed' ? 'নিশ্চিত' : o.status === 'completed' ? 'সফল' : 'বাতিল'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <div className="flex justify-end gap-1">
                          {o.status === 'pending' && (
                            <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg text-blue-500 border-blue-200 hover:bg-blue-50" onClick={() => updateOrderStatus(o.id, o.userId, 'confirmed')}>
                               <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg text-slate-400 border-slate-200 hover:bg-slate-50" onClick={() => deleteOrder(o.id)}>
                             <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="rounded-2xl border-none shadow-lg overflow-hidden bg-white/80 glass">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black py-3 text-[9px]">পণ্য</TableHead>
                    <TableHead className="font-black text-[9px]">মূল্য</TableHead>
                    <TableHead className="font-black text-[9px]">স্টক</TableHead>
                    <TableHead className="text-right font-black text-[9px]">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="py-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border">
                          <img src={p.imageUrls[p.mainImageIndex || 0] || p.imageUrls[0]} alt="" className="object-cover w-full h-full" />
                        </div>
                        <span className="font-black text-slate-900 text-[10px]">{p.name}</span>
                      </TableCell>
                      <TableCell className="font-black text-xs text-primary">৳{p.discountPrice || p.price}</TableCell>
                      <TableCell className="font-bold text-slate-500 text-[9px]">{p.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { 
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
                          }}><Pencil className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteProduct(p.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="rounded-2xl border-none shadow-lg overflow-hidden bg-white/80 glass">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black py-3 text-[9px]">নাম</TableHead>
                    <TableHead className="font-black text-[9px]">ফোন নম্বর</TableHead>
                    <TableHead className="font-black text-[9px]">রোল</TableHead>
                    <TableHead className="font-black text-[9px]">যোগদানের তারিখ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="py-3">
                        <span className="font-black text-slate-900 text-[10px]">{c.name || 'নাম নেই'}</span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-500 text-[9px]">{c.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn(
                          "font-black text-[7px] px-1.5 py-0 rounded-full border-none",
                          c.role === 'admin' ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                        )}>
                          {c.role === 'admin' ? 'অ্যাডমিন' : 'ক্রেতা'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-[8px] font-bold">
                        {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('bn-BD') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="rounded-2xl border-none shadow-lg p-5 bg-white/80 glass max-w-xl mx-auto space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Activity className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-black text-slate-900">সাইট কাস্টমাইজেশন</h2>
              </div>
              
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label className="font-black text-[9px]">হিরো টাইটেল</Label>
                  <input value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} className="rounded-lg h-9 font-bold w-full border px-3 text-[10px]" />
                </div>
                <div className="space-y-1">
                  <Label className="font-black text-[9px]">হোয়াটসঅ্যাপ নম্বর</Label>
                  <input value={siteSettings.whatsappNumber} onChange={e => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})} className="rounded-lg h-9 font-bold w-full border px-3 text-[10px]" />
                </div>
                <div className="space-y-1">
                  <Label className="font-black text-[9px]">APK Link</Label>
                  <input value={siteSettings.apkUrl} onChange={e => setSiteSettings({...siteSettings, apkUrl: e.target.value})} className="rounded-lg h-9 font-mono w-full border px-3 text-[9px]" />
                </div>
                <Button onClick={saveSettings} className="h-10 rounded-xl font-black text-xs gap-2 shadow-lg bg-primary mt-2">
                  <Save className="w-3 h-3" /> পরিবর্তন সেভ করুন
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
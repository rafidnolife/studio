
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
import { Plus, Pencil, Trash2, Settings, Users, Save, Package, ShoppingCart, CheckCircle, XCircle, MapPin, Activity, DollarSign } from 'lucide-react';
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
    unit: '',
    variants: ''
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

  const updateOrderStatus = (orderId: string, customerId: string, status: 'confirmed' | 'cancelled') => {
    const orderRef = doc(db, 'orders', orderId);
    updateDoc(orderRef, { status })
      .then(async () => {
        toast({ title: `অর্ডার ${status === 'confirmed' ? 'কনফার্ম' : 'ক্যানসেল'} হয়েছে` });
        fetchData();
        
        const customerSnap = await getDoc(doc(db, 'users', customerId));
        if (customerSnap.exists()) {
          const customerData = customerSnap.data();
          if (customerData.fcmToken) {
            sendPushNotification({
              recipientToken: customerData.fcmToken,
              title: `অর্ডার ${status === 'confirmed' ? 'নিশ্চিত' : 'বাতিল'} হয়েছে 🔔`,
              body: `আপনার অর্ডারটি এখন ${status === 'confirmed' ? 'কনফার্ম' : 'বাতিল'} করা হয়েছে। ধন্যবাদ।`
            });
          }
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
    const data: any = {
      name: formData.name,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      description: formData.description,
      category: formData.category,
      stock: Number(formData.stock),
      isFeatured: formData.isFeatured,
      imageUrls: formData.imageUrls.filter(u => u.trim() !== ''),
      unit: formData.unit,
      variants: formData.variants.split(',').map(v => v.trim()).filter(v => v !== ''),
      updatedAt: serverTimestamp(),
    };

    if (!editingProduct) data.createdAt = serverTimestamp();

    if (editingProduct) {
      const pRef = doc(db, 'products', editingProduct.id);
      updateDoc(pRef, data)
        .then(() => {
          toast({ title: 'সফলভাবে সেভ হয়েছে' });
          setProductDialogOpen(false);
          setEditingProduct(null);
          setFormData({ name: '', price: '', discountPrice: '', description: '', category: '', stock: '', isFeatured: false, imageUrls: [''], unit: '', variants: '' });
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
          toast({ title: 'সফলভাবে সেভ হয়েছে' });
          setProductDialogOpen(false);
          setFormData({ name: '', price: '', discountPrice: '', description: '', category: '', stock: '', isFeatured: false, imageUrls: [''], unit: '', variants: '' });
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
    totalSales: orders.filter(o => o.status === 'confirmed').reduce((acc, o) => acc + (o.totalAmount || 0), 0),
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
          <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 md:h-14 px-8 bg-primary font-black text-white shadow-xl hover:scale-105">
                <Plus className="mr-2 w-5 h-5" /> নতুন পণ্য
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">পণ্যের বিস্তারিত তথ্য</DialogTitle>
                <DialogDescription>সঠিক তথ্য দিয়ে ইনভেন্টরি আপডেট করুন।</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">পণ্যের নাম</Label>
                    <Input placeholder="নাম" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-xl h-12" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">মূল্য (৳)</Label>
                      <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">ক্যাটাগরি</Label>
                      <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required className="rounded-xl h-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">ছবি ইউআরএল</Label>
                    <Input value={formData.imageUrls[0]} onChange={e => setFormData({...formData, imageUrls: [e.target.value]})} className="rounded-xl h-12" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">ইউনিট (যেমন: সাইজ)</Label>
                      <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">ভেরিয়েন্ট (M, L, XL)</Label>
                      <Input value={formData.variants} onChange={e => setFormData({...formData, variants: e.target.value})} className="rounded-xl h-12" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">বিবরণ</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl min-h-[120px]" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <Label className="font-black">স্পেশাল কালেকশন</Label>
                    <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black text-xl">পণ্য সেভ করুন</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'মোট বিক্রি', value: `৳${stats.totalSales}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
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
                          <p className="text-xs font-bold text-primary mt-1">
                            {o.items?.map((i: any) => `${i.name} (${i.qty})`).join(', ')}
                          </p>
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
                          o.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        )}>{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {o.status === 'pending' && (
                            <>
                              <Button size="icon" variant="ghost" className="h-10 w-10 text-emerald-500" onClick={() => updateOrderStatus(o.id, o.userId, 'confirmed')}><CheckCircle className="w-5 h-5" /></Button>
                              <Button size="icon" variant="ghost" className="h-10 w-10 text-red-500" onClick={() => updateOrderStatus(o.id, o.userId, 'cancelled')}><XCircle className="w-5 h-5" /></Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-red-500" onClick={() => deleteOrder(o.id)}><Trash2 className="w-4 h-4" /></Button>
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
                    <TableHead className="text-right font-black">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id} className="hover:bg-slate-50 transition-all">
                      <TableCell className="py-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border">
                          <img src={p.imageUrls[0]} alt="" className="object-cover w-full h-full" />
                        </div>
                        <span className="font-black text-slate-900">{p.name}</span>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="rounded-full font-bold">{p.category}</Badge></TableCell>
                      <TableCell className="font-black text-lg text-primary">৳{p.discountPrice || p.price}</TableCell>
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
                              unit: p.unit || '',
                              variants: p.variants?.join(', ') || ''
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
                  <Input value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} className="rounded-xl h-14 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black">হোয়াটসঅ্যাপ নম্বর</Label>
                  <Input value={siteSettings.whatsappNumber} onChange={e => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})} className="rounded-xl h-14 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black">অ্যাপ ডাউনলোড ইউআরএল (APK Link)</Label>
                  <Input value={siteSettings.apkUrl} onChange={e => setSiteSettings({...siteSettings, apkUrl: e.target.value})} className="rounded-xl h-14 font-mono text-xs" />
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

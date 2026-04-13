
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Settings, ShoppingBag, Users, Star, Save, Phone, Eye, EyeOff, Sparkles, TrendingUp, Package, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Product } from '@/components/product/product-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState({
    heroTitle: 'সেরা পণ্যের সেরা বাজার',
    heroSubtitle: 'সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন ঝামেলাহীন কেনাকাটায়।',
    whatsappNumber: '01797958686'
  });
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

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
    setLoading(true);
    try {
      const pQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const pSnapshot = await getDocs(pQuery);
      setProducts(pSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);

      const uSnapshot = await getDocs(collection(db, 'users'));
      setCustomers(uSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

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

  const handleSaveSettings = () => {
    const data = {
      ...siteSettings,
      whatsappNumber: siteSettings.whatsappNumber.replace(/\D/g, '')
    };
    setDoc(doc(db, 'settings', 'site'), data)
      .then(() => toast({ title: 'সেটিংস আপডেট হয়েছে' }))
      .catch(() => toast({ variant: 'destructive', title: 'ত্রুটি' }));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      stock: Number(formData.stock),
      imageUrls: formData.imageUrls.filter(u => u.trim() !== ''),
      updatedAt: serverTimestamp(),
      createdAt: editingProduct ? undefined : serverTimestamp(),
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
        toast({ title: 'পণ্য আপডেট সফল' });
      } else {
        await addDoc(collection(db, 'products'), data);
        toast({ title: 'নতুন পণ্য যোগ করা হয়েছে' });
      }
      setProductDialogOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', discountPrice: '', description: '', category: '', stock: '', isFeatured: false, imageUrls: [''] });
      fetchData();
    } catch (err) {
      toast({ variant: 'destructive', title: 'ব্যর্থ হয়েছে' });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?')) return;
    await deleteDoc(doc(db, 'products', id));
    fetchData();
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
              কন্ট্রোল <span className="text-primary">সেন্টার</span>
              <Badge className="rounded-full bg-primary/10 text-primary border-none text-[10px] py-0">ADMIN</Badge>
            </h1>
            <p className="text-slate-500 font-medium">ওয়েবসাইটের সবকিছু এক জায়গা থেকে পরিচালনা করুন।</p>
          </div>
          <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl px-6 h-12 bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all font-bold">
                <Plus className="mr-2 h-5 w-5" /> নতুন পণ্য যোগ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">পণ্যের বিস্তারিত তথ্য</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">পণ্যের নাম</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">মূল্য (৳)</Label>
                      <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">ডিসকাউন্ট মূল্য</Label>
                      <Input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">ক্যাটাগরি</Label>
                      <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">স্টক পরিমাণ</Label>
                      <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">ইমেজ ইউআরএল (Image URL)</Label>
                    <Input 
                      value={formData.imageUrls[0]} 
                      onChange={e => setFormData({...formData, imageUrls: [e.target.value]})} 
                      className="h-12 rounded-xl bg-slate-50 border-slate-200" 
                      placeholder="https://..." 
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Switch checked={formData.isFeatured} onCheckedChange={checked => setFormData({...formData, isFeatured: checked})} />
                    <Label className="font-bold text-slate-700">হোম পেজে হাইলাইট করুন</Label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">ইমেজ প্রিভিউ</Label>
                    <div className="aspect-square rounded-3xl overflow-hidden bg-white border-2 border-dashed border-slate-200 flex items-center justify-center relative">
                      {formData.imageUrls[0] ? (
                        <ImageWithFallback 
                          src={formData.imageUrls[0]} 
                          alt="Preview" 
                          fill 
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="text-center text-slate-400">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-xs font-bold uppercase tracking-widest px-4">লিঙ্ক দিলে এখানে প্রিভিউ দেখাবে</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">পণ্যের বিস্তারিত বিবরণ</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[150px] rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20">পণ্য সেভ করুন</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">মোট পণ্য</p>
              <h4 className="text-2xl font-black">{products.length}</h4>
            </div>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">হাইলাইটেড</p>
              <h4 className="text-2xl font-black">{products.filter(p => p.isFeatured).length}</h4>
            </div>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">মোট ইউজার</p>
              <h4 className="text-2xl font-black">{customers.length}</h4>
            </div>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm bg-primary text-white p-6 flex items-center gap-5 shadow-lg shadow-primary/20">
            <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-bold uppercase tracking-wider">Shop Status</p>
              <h4 className="text-xl font-black">Active & Live</h4>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white border p-1.5 rounded-[1.5rem] h-14 shadow-sm inline-flex">
            <TabsTrigger value="products" className="rounded-xl gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">
              পণ্য ব্যবস্থাপনা
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-xl gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">
              কাস্টমার লিস্ট
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">
              সাইট সেটিংস
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="py-5 px-6 font-black text-slate-700 uppercase tracking-widest text-[10px]">পণ্য</TableHead>
                      <TableHead className="font-black text-slate-700 uppercase tracking-widest text-[10px]">ক্যাটাগরি</TableHead>
                      <TableHead className="font-black text-slate-700 uppercase tracking-widest text-[10px]">মূল্য</TableHead>
                      <TableHead className="font-black text-slate-700 uppercase tracking-widest text-[10px]">স্টক</TableHead>
                      <TableHead className="text-center font-black text-slate-700 uppercase tracking-widest text-[10px]">হাইলাইট</TableHead>
                      <TableHead className="text-right px-6 font-black text-slate-700 uppercase tracking-widest text-[10px]">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-slate-100 flex-shrink-0">
                              <ImageWithFallback src={p.imageUrls[0]} alt={p.name} fill className="object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                              <span className={cn("text-[9px] font-black uppercase tracking-tighter", p.stock > 0 ? "text-emerald-500" : "text-red-500")}>
                                {p.stock > 0 ? 'Available' : 'Sold Out'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="rounded-full px-3 py-0 border-slate-200 text-slate-500 font-bold">{p.category}</Badge></TableCell>
                        <TableCell className="font-black text-slate-900 whitespace-nowrap">৳{p.discountPrice || p.price}</TableCell>
                        <TableCell className="font-bold text-slate-600">{p.stock}</TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("rounded-xl", p.isFeatured ? "text-amber-500 bg-amber-50" : "text-slate-300")}
                            onClick={async () => {
                              await updateDoc(doc(db, 'products', p.id), { isFeatured: !p.isFeatured });
                              fetchData();
                            }}
                          >
                            <Star className={cn("w-5 h-5", p.isFeatured && "fill-current")} />
                          </Button>
                        </TableCell>
                        <TableCell className="text-right px-6 space-x-1 whitespace-nowrap">
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-50 hover:text-emerald-600" onClick={() => { setEditingProduct(p); setFormData(p as any); setProductDialogOpen(true); }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => deleteProduct(p.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="py-5 px-6 font-black text-slate-700">কাস্টমার নাম</TableHead>
                      <TableHead className="font-black text-slate-700">ফোন নাম্বার</TableHead>
                      <TableHead className="font-black text-slate-700">পাসওয়ার্ড</TableHead>
                      <TableHead className="text-right px-6 font-black text-slate-700">ইউজার রোল</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="py-5 px-6 font-bold text-slate-900">{c.name || 'Anonymous'}</TableCell>
                        <TableCell className="font-mono text-slate-600">{c.phoneNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                              {showPasswords[c.id] ? c.password : '••••••••'}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => setShowPasswords(prev => ({ ...prev, [c.id]: !prev[c.id] }))}>
                              {showPasswords[c.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Badge className={c.role === 'admin' ? 'bg-primary border-none font-black px-4' : 'bg-slate-100 text-slate-600 border-none px-4 font-bold'}>
                            {c.role === 'admin' ? 'অ্যাডমিন' : 'কাস্টমার'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b pb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">সাইট কাস্টমাইজেশন</h3>
                      <p className="text-slate-500 font-medium text-sm">ওয়েবসাইটের মূল তথ্য পরিবর্তন করুন।</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">হোম পেজ হেডলাইন (Hero Title)</Label>
                      <Input value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-200 text-lg font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">হোম পেজ সাব-টাইটেল</Label>
                      <Textarea value={siteSettings.heroSubtitle} onChange={e => setSiteSettings({...siteSettings, heroSubtitle: e.target.value})} className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-200 font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">অর্ডার নেওয়ার হোয়াটসঅ্যাপ নাম্বার (Country code সহ)</Label>
                      <Input placeholder="017xxxxxxxx" value={siteSettings.whatsappNumber} onChange={e => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-mono font-bold" />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveSettings} className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/30 gap-3">
                    <Save className="w-6 h-6" /> পরিবর্তন সেভ করুন
                  </Button>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-primary relative z-10"><Sparkles className="w-5 h-5" /> কুইক টিপস</h3>
                <div className="space-y-6 text-slate-300 text-sm leading-relaxed relative z-10 font-medium">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-primary shrink-0">১</div>
                    <p>পণ্যের <b>ডিসকাউন্ট প্রাইস</b> যোগ করলে কার্ডে সুন্দর ডিসকাউন্ট ব্যাজ দেখাবে।</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-primary shrink-0">২</div>
                    <p>ইমেজ প্রিভিউ দেখে নিশ্চিত হয়ে <b>Save</b> বাটনে ক্লিক করুন।</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-primary shrink-0">৩</div>
                    <p>সবসময় সরাসরি ইমেজের <b>Public URL</b> ব্যবহার করার চেষ্টা করুন।</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

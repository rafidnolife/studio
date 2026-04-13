
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
import { Plus, Pencil, Trash2, Settings, ShoppingBag, Users, Star, Save, Phone, Eye, EyeOff, Sparkles, TrendingUp, Package, Image as ImageIcon, CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Product } from '@/components/product/product-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
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
    <div className="min-h-screen pb-24 md:pb-12 bg-slate-50/30 overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
              অ্যাডমিন <span className="text-primary">প্যানেল</span>
              <Badge className="rounded-full bg-primary/10 text-primary border-none text-[10px] py-1 px-4 font-black">ROOT</Badge>
            </h1>
            <p className="text-slate-500 font-bold text-sm md:text-base">দোকান এক্সপ্রেসের পূর্ণ নিয়ন্ত্রণ এখানে।</p>
          </div>
          <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 bg-primary shadow-2xl shadow-primary/20 hover:scale-105 transition-all font-black text-lg">
                <Plus className="mr-2 h-6 w-6" /> নতুন পণ্য যোগ
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto rounded-[2rem] md:rounded-[3rem] border-none shadow-2xl p-6 md:p-10">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight">পণ্যের তথ্য দিন</DialogTitle>
                <DialogDescription className="font-bold text-slate-500">সঠিক তথ্য দিয়ে ইনভেন্টরি আপডেট রাখুন।</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700 ml-1">পণ্যের নাম</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white text-lg font-bold" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1">মূল্য (৳)</Label>
                      <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-lg font-bold" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1">ডিসকাউন্ট মূল্য</Label>
                      <Input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-lg font-bold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1">ক্যাটাগরি</Label>
                      <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1">স্টক</Label>
                      <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700 ml-1">ছবি লিঙ্ক (Image URL)</Label>
                    <Input 
                      value={formData.imageUrls[0]} 
                      onChange={e => setFormData({...formData, imageUrls: [e.target.value]})} 
                      className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" 
                      placeholder="https://..." 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700 ml-1">লাইভ প্রিভিউ</Label>
                    <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative">
                      {formData.imageUrls[0] ? (
                        <ImageWithFallback 
                          src={formData.imageUrls[0]} 
                          alt="Preview" 
                          fill 
                          className="object-contain p-6"
                        />
                      ) : (
                        <div className="text-center p-8 space-y-4">
                          <ImageIcon className="w-12 h-12 mx-auto text-slate-300 animate-pulse" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ছবি দেখতে লিঙ্ক দিন</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700 ml-1">বিস্তারিত বিবরণ</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[140px] rounded-2xl bg-slate-50 border-slate-100 font-medium" />
                  </div>
                  <div className="flex items-center space-x-4 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                    <Switch checked={formData.isFeatured} onCheckedChange={checked => setFormData({...formData, isFeatured: checked})} />
                    <Label className="font-black text-slate-700">হোম পেজে স্পেশাল রাখুন</Label>
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-primary/20">সংরক্ষণ করুন</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
          {[
            { label: 'মোট পণ্য', value: products.length, icon: Package, color: 'emerald' },
            { label: 'স্পেশাল', value: products.filter(p => p.isFeatured).length, icon: Star, color: 'amber' },
            { label: 'ইউজার', value: customers.length, icon: Users, color: 'blue' },
            { label: 'স্ট্যাটাস', value: 'Live', icon: TrendingUp, color: 'primary' }
          ].map((stat, i) => (
            <Card key={i} className="rounded-[2rem] border-none shadow-xl bg-white p-5 md:p-8 hover:scale-[1.02] transition-all">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", 
                  stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                  stat.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-500' : 'bg-primary/10 text-primary'
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                  <h4 className="text-2xl font-black text-slate-900">{stat.value}</h4>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white/60 glass border p-1.5 rounded-[2rem] h-16 flex overflow-x-auto scrollbar-hide">
            <TabsTrigger value="products" className="rounded-[1.5rem] gap-2 px-8 flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-sm uppercase tracking-tighter">
              পণ্যসমূহ
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-[1.5rem] gap-2 px-8 flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-sm uppercase tracking-tighter">
              ইউজার লিস্ট
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-[1.5rem] gap-2 px-8 flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-sm uppercase tracking-tighter">
              সেটিংস
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto scrollbar-hide">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-none">
                      <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">পণ্য</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">ক্যাটাগরি</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">মূল্য</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">স্টক</TableHead>
                      <TableHead className="text-right px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id} className="hover:bg-slate-50/50 border-slate-50">
                        <TableCell className="py-5 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden relative bg-slate-100 shrink-0 shadow-sm">
                              <ImageWithFallback src={p.imageUrls[0]} alt={p.name} fill className="object-cover" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-black text-slate-900 line-clamp-1">{p.name}</span>
                              <div className="flex gap-2">
                                {p.isFeatured && <Badge className="bg-amber-50 text-amber-500 border-none text-[8px] px-2 py-0 font-black">SPECIAL</Badge>}
                                {p.stock <= 0 && <Badge className="bg-red-50 text-red-500 border-none text-[8px] px-2 py-0 font-black">OUT</Badge>}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="rounded-full px-4 py-1 border-slate-200 text-slate-500 font-bold uppercase text-[10px]">{p.category}</Badge></TableCell>
                        <TableCell className="font-black text-slate-900">৳{p.discountPrice || p.price}</TableCell>
                        <TableCell className="font-bold text-slate-600">{p.stock}</TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary h-10 w-10" onClick={() => { setEditingProduct(p); setFormData(p as any); setProductDialogOpen(true); }}>
                              <Pencil className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-600 h-10 w-10" onClick={() => deleteProduct(p.id)}>
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto scrollbar-hide">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-none">
                      <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">কাস্টমার</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">ফোন নম্বর</TableHead>
                      <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">পাসওয়ার্ড</TableHead>
                      <TableHead className="text-right px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">রোল</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map(c => (
                      <TableRow key={c.id} className="border-slate-50">
                        <TableCell className="py-6 px-8 font-black text-slate-900">{c.name || 'নতুন ইউজার'}</TableCell>
                        <TableCell className="font-mono font-bold text-slate-500 tracking-tighter">{c.phoneNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-sm bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 font-bold min-w-[120px] text-center">
                              {showPasswords[c.id] ? c.password : '••••••••'}
                            </span>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100" onClick={() => setShowPasswords(prev => ({ ...prev, [c.id]: !prev[c.id] }))}>
                              {showPasswords[c.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <Badge className={c.role === 'admin' ? 'bg-primary border-none font-black px-6 py-1 text-[10px]' : 'bg-slate-100 text-slate-500 border-none px-6 py-1 font-black text-[10px]'}>
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
              <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-2xl bg-white p-8 md:p-12">
                <div className="space-y-10">
                  <div className="flex items-center gap-6 border-b pb-8 border-slate-100">
                    <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                      <Settings className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-slate-900">সাইট কাস্টমাইজ</h3>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Manage your global site configuration</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1">হোম পেজ হেডলাইন</Label>
                      <Input value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white text-xl font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1">হোম পেজ সাব-টাইটেল</Label>
                      <Textarea value={siteSettings.heroSubtitle} onChange={e => setSiteSettings({...siteSettings, heroSubtitle: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 text-lg font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1">অর্ডার হোয়াটসঅ্যাপ নম্বর</Label>
                      <Input placeholder="017xxxxxxxx" value={siteSettings.whatsappNumber} onChange={e => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-mono text-xl font-black" />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveSettings} className="w-full h-20 rounded-[2rem] text-2xl font-black shadow-2xl shadow-primary/30 gap-4">
                    <Save className="w-8 h-8" /> পরিবর্তন সেভ করুন
                  </Button>
                </div>
              </Card>

              <Card className="rounded-[3rem] border-none shadow-2xl bg-slate-900 p-10 text-white relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[100px] -mr-24 -mt-24"></div>
                <div className="relative z-10 space-y-8">
                  <h3 className="text-2xl font-black flex items-center gap-3 text-primary"><Sparkles className="w-7 h-7" /> অ্যাডমিন গাইড</h3>
                  <div className="space-y-8">
                    <div className="flex gap-6">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-primary shrink-0 text-xl shadow-lg">১</div>
                      <p className="font-bold text-slate-300 text-lg leading-snug">পণ্যের ছবি এইচডি হওয়ার জন্য অরিজিনাল ইউআরএল ব্যবহার করুন।</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-primary shrink-0 text-xl shadow-lg">২</div>
                      <p className="font-bold text-slate-300 text-lg leading-snug">স্টক জিরো হয়ে গেলে পণ্যটি অটোমেটিক "Sold Out" দেখাবে।</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-primary shrink-0 text-xl shadow-lg">৩</div>
                      <p className="font-bold text-slate-300 text-lg leading-snug">কাস্টমারের ফোন ও পাসওয়ার্ড দেখার জন্য আইকনটি ক্লিক করুন।</p>
                    </div>
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

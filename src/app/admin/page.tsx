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
import { Plus, Pencil, Trash2, Settings, ShoppingBag, Users, LayoutDashboard, Star, Save, Phone, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Product } from '@/components/product/product-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

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
    setDoc(doc(db, 'settings', 'site'), siteSettings)
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

  const toggleFeatured = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        isFeatured: !product.isFeatured,
        updatedAt: serverTimestamp()
      });
      fetchData();
      toast({ title: product.isFeatured ? 'হাইলাইট থেকে সরানো হয়েছে' : 'হাইলাইট করা হয়েছে' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'ত্রুটি ঘটেছে' });
    }
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
              কন্ট্রোল <span className="text-primary">প্যানেল</span>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase">Admin Only</Badge>
            </h1>
            <p className="text-slate-500 font-medium">আপনার অনলাইন দোকানের প্রতিটি তথ্য এখান থেকে পরিচালনা করুন।</p>
          </div>
          <div className="flex gap-4">
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl px-8 h-14 bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all font-bold">
                  <Plus className="mr-2 h-5 w-5" /> নতুন পণ্য যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">পণ্যের বিস্তারিত তথ্য দিন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProductSubmit} className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>পণ্যের নাম</Label>
                      <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label>ক্যাটাগরি</Label>
                      <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="h-12 rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label>মূল্য (৳)</Label>
                      <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="h-12 rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label>ডিসকাউন্ট মূল্য (৳ - ঐচ্ছিক)</Label>
                      <Input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>স্টক পরিমাণ</Label>
                      <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="h-12 rounded-xl" required />
                    </div>
                    <div className="flex items-center space-x-3 pt-8 bg-slate-50 p-4 rounded-2xl">
                      <Switch checked={formData.isFeatured} onCheckedChange={checked => setFormData({...formData, isFeatured: checked})} />
                      <Label className="font-bold text-slate-700">হোম পেজে হাইলাইট করুন (Featured)</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ইমেজ ইউআরএল (Image URL)</Label>
                    <Input value={formData.imageUrls[0]} onChange={e => setFormData({...formData, imageUrls: [e.target.value]})} className="h-12 rounded-xl" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>পণ্যের বিস্তারিত বিবরণ</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[120px] rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold">পণ্য সেভ করুন</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6 flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">মোট পণ্য</p>
              <h4 className="text-3xl font-black">{products.length}</h4>
            </div>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6 flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <Star className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">হাইলাইটেড</p>
              <h4 className="text-3xl font-black">{products.filter(p => p.isFeatured).length}</h4>
            </div>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6 flex items-center gap-5">
            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">মোট ইউজার</p>
              <h4 className="text-3xl font-black">{customers.length}</h4>
            </div>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm bg-primary/10 p-6 flex items-center gap-5 border-2 border-primary/20">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-primary font-bold uppercase tracking-wider">Active Shop</p>
              <h4 className="text-lg font-black">Dokaan Express</h4>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white border p-1.5 rounded-[2rem] h-16 shadow-sm inline-flex">
            <TabsTrigger value="products" className="rounded-[1.5rem] gap-2 px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">
              পণ্য ব্যবস্থাপনা
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-[1.5rem] gap-2 px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">
              কাস্টমার লিস্ট
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-[1.5rem] gap-2 px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">
              সাইট কাস্টমাইজ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="py-6 px-8">পণ্যের নাম ও অবস্থা</TableHead>
                    <TableHead>ক্যাটাগরি</TableHead>
                    <TableHead>মূল্য</TableHead>
                    <TableHead>স্টক</TableHead>
                    <TableHead className="text-center">হাইলাইট</TableHead>
                    <TableHead className="text-right px-8">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id} className="group hover:bg-slate-50 transition-colors">
                      <TableCell className="py-6 px-8">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900 text-base">{p.name}</span>
                          <div className="flex items-center gap-2">
                             <div className={cn("w-2 h-2 rounded-full", p.stock > 0 ? "bg-green-500" : "bg-red-500")} />
                             <span className="text-[10px] font-bold text-slate-400 uppercase">{p.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="rounded-full px-4 py-0.5 border-slate-200">{p.category}</Badge></TableCell>
                      <TableCell className="font-black text-slate-900">৳{p.discountPrice || p.price}</TableCell>
                      <TableCell className="font-bold text-slate-600">{p.stock}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("rounded-xl transition-all", p.isFeatured ? "text-amber-500 bg-amber-50" : "text-slate-300")}
                          onClick={() => toggleFeatured(p)}
                        >
                          <Star className={cn("w-5 h-5", p.isFeatured && "fill-current")} />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right px-8 space-x-1">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-blue-50 hover:text-blue-600" onClick={() => { setEditingProduct(p); setFormData(p as any); setProductDialogOpen(true); }}>
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
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="py-6 px-8">কাস্টমার নাম</TableHead>
                    <TableHead>ফোন নাম্বার</TableHead>
                    <TableHead>পাসওয়ার্ড</TableHead>
                    <TableHead className="text-right px-8">রোল</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="py-6 px-8 font-bold">{c.name || 'অজানা'}</TableCell>
                      <TableCell className="font-mono text-slate-600">{c.phoneNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded-lg">
                            {showPasswords[c.id] ? c.password : '••••••••'}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPasswords(prev => ({ ...prev, [c.id]: !prev[c.id] }))}>
                            {showPasswords[c.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Badge className={c.role === 'admin' ? 'bg-primary' : 'bg-slate-200 text-slate-700'}>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white p-10">
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b pb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">সাইট কাস্টমাইজেশন</h3>
                      <p className="text-slate-500 font-medium">ওয়েবসাইটের মূল লেখা এবং তথ্য এখান থেকে পরিবর্তন করুন।</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">হোম পেজ হেডলাইন (Hero Title)</Label>
                      <Input value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} className="h-14 rounded-2xl text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">হোম পেজ সাব-টাইটেল</Label>
                      <Textarea value={siteSettings.heroSubtitle} onChange={e => setSiteSettings({...siteSettings, heroSubtitle: e.target.value})} className="min-h-[100px] rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">অর্ডার নেওয়ার হোয়াটসঅ্যাপ নাম্বার</Label>
                      <Input value={siteSettings.whatsappNumber} onChange={e => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})} className="h-14 rounded-2xl font-mono" />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveSettings} className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/30 gap-3">
                    <Save className="w-6 h-6" /> সব পরিবর্তন সেভ করুন
                  </Button>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 p-10 text-white">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-primary"><Sparkles className="w-5 h-5" /> কুইক টিপস</h3>
                <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
                  <p>১. নতুন পণ্য যোগ করার সময় <b>High Quality</b> ইমেজ ইউআরএল ব্যবহার করুন।</p>
                  <p>২. যে পণ্যগুলো বেশি বিক্রি করতে চান, সেগুলোকে <b>Featured</b> মার্ক করে দিন।</p>
                  <p>৩. হোয়াটসঅ্যাপ নাম্বারটি সঠিক ফরমেটে (উদাঃ 017...) দিন যাতে কাস্টমার সরাসরি মেসেজ করতে পারে।</p>
                  <div className="pt-6 border-t border-slate-800">
                    <p className="font-bold text-slate-200 mb-2">সাপোর্ট প্রয়োজন?</p>
                    <p>সিস্টেম সংক্রান্ত যেকোনো সমস্যায় অ্যাডমিন প্যানেল চেক করুন।</p>
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

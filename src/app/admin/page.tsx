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
import { Plus, Pencil, Trash2, Settings, ShoppingBag, Users, LayoutDashboard, Star, Save, Phone, Eye, EyeOff } from 'lucide-react';
import { Product } from '@/components/product/product-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

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

  const togglePassword = (uid: string) => {
    setShowPasswords(prev => ({ ...prev, [uid]: !prev[uid] }));
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">অ্যাডমিন <span className="text-primary">ড্যাশবোর্ড</span></h1>
            <p className="text-slate-500 font-medium">আপনার দোকানের সব কার্যক্রম এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchData} variant="outline" className="rounded-2xl border-2 hover:bg-slate-50">রিফ্রেশ করুন</Button>
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl px-6 bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  <Plus className="mr-2 h-5 w-5" /> নতুন পণ্য যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">পণ্যের তথ্য দিন</DialogTitle>
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
                      <Label>ডিসকাউন্ট মূল্য (ঐচ্ছিক)</Label>
                      <Input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>স্টক পরিমাণ</Label>
                      <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="h-12 rounded-xl" required />
                    </div>
                    <div className="flex items-center space-x-3 pt-8">
                      <Switch checked={formData.isFeatured} onCheckedChange={checked => setFormData({...formData, isFeatured: checked})} />
                      <Label className="font-bold text-slate-700">হোম পেজে হাইলাইট করুন (Featured)</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ইমেজ ইউআরএল (Image URL)</Label>
                    <Input value={formData.imageUrls[0]} onChange={e => setFormData({...formData, imageUrls: [e.target.value]})} className="h-12 rounded-xl" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>পণ্যের বর্ণনা</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[120px] rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold">সেভ করুন</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white border p-1.5 rounded-[2rem] h-16 shadow-sm flex overflow-x-auto scrollbar-hide max-w-fit">
            <TabsTrigger value="products" className="rounded-[1.5rem] gap-2 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <ShoppingBag className="w-5 h-5" /> পণ্য ব্যবস্থাপনা
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-[1.5rem] gap-2 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Users className="w-5 h-5" /> কাস্টমার লিস্ট
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-[1.5rem] gap-2 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Settings className="w-5 h-5" /> সাইট সেটিংস
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="py-6 px-8">পণ্যের নাম</TableHead>
                      <TableHead>ক্যাটাগরি</TableHead>
                      <TableHead>মূল্য</TableHead>
                      <TableHead>স্টক</TableHead>
                      <TableHead>অবস্থা</TableHead>
                      <TableHead className="text-right px-8">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="py-5 px-8 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            {p.name}
                            {p.isFeatured && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 h-5 text-[10px]"><Star className="w-3 h-3 mr-1 fill-current" /> Featured</Badge>}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="rounded-full px-3">{p.category}</Badge></TableCell>
                        <TableCell className="font-bold">৳{p.discountPrice || p.price}</TableCell>
                        <TableCell>{p.stock > 0 ? p.stock : <span className="text-destructive font-bold">আউট অফ স্টক</span>}</TableCell>
                        <TableCell>
                          <div className={`w-3 h-3 rounded-full ${p.stock > 0 ? 'bg-green-500' : 'bg-red-500'} shadow-sm animate-pulse`} />
                        </TableCell>
                        <TableCell className="text-right px-8 space-x-2">
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-blue-50 hover:text-blue-600" onClick={() => { setEditingProduct(p); setFormData(p as any); setProductDialogOpen(true); }}>
                            <Pencil className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => deleteProduct(p.id)}>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="py-6 px-8">কাস্টমার নাম</TableHead>
                      <TableHead>ফোন নাম্বার</TableHead>
                      <TableHead>পাসওয়ার্ড</TableHead>
                      <TableHead>রোল</TableHead>
                      <TableHead className="text-right px-8">রেজিস্ট্রেশন তারিখ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map(c => (
                      <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="py-5 px-8 font-bold text-slate-900">{c.name || 'অজানা'}</TableCell>
                        <TableCell className="font-medium text-slate-600">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" /> {c.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm">{showPasswords[c.id] ? c.password : '••••••••'}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePassword(c.id)}>
                              {showPasswords[c.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={c.role === 'admin' ? 'bg-primary' : 'bg-slate-200 text-slate-700 hover:bg-slate-200'}>
                            {c.role === 'admin' ? 'অ্যাডমিন' : 'ক্রেতা'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8 text-slate-500 text-sm">
                          {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('bn-BD') : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white p-10">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b pb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">ওয়েবসাইট কাস্টমাইজেশন</h3>
                      <p className="text-slate-500">হোম পেজের লেখা এবং তথ্য পরিবর্তন করুন।</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">হেডলাইন (Hero Title)</Label>
                      <Input value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} className="h-14 rounded-2xl text-lg border-2 focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">সাব-টাইটেল (Hero Subtitle)</Label>
                      <Textarea value={siteSettings.heroSubtitle} onChange={e => setSiteSettings({...siteSettings, heroSubtitle: e.target.value})} className="min-h-[100px] rounded-2xl border-2 focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">অর্ডার হোয়াটসঅ্যাপ নাম্বার</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input value={siteSettings.whatsappNumber} onChange={e => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})} className="pl-12 h-14 rounded-2xl border-2 focus:border-primary transition-all" />
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveSettings} className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/30 gap-3">
                    <Save className="w-6 h-6" /> পরিবর্তনগুলো সেভ করুন
                  </Button>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-primary" /> পরিসংখ্যান</h3>
                <div className="space-y-6">
                  <div className="p-6 rounded-[2rem] bg-slate-50 border flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">মোট পণ্য</p>
                      <h4 className="text-3xl font-black text-slate-900">{products.length}</h4>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-slate-50 border flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">মোট কাস্টমার</p>
                      <h4 className="text-3xl font-black text-slate-900">{customers.length}</h4>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-500" />
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
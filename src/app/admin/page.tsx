
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X, PlusCircle, LayoutDashboard, Users, Settings, ShoppingBag, Search } from 'lucide-react';
import { Product } from '@/components/product/product-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
      // Products
      const pQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const pSnapshot = await getDocs(pQuery);
      setProducts(pSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);

      // Customers
      const uSnapshot = await getDocs(collection(db, 'users'));
      setCustomers(uSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      // Settings
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
      .then(() => toast({ title: 'সফল', description: 'সাইট সেটিংস আপডেট হয়েছে।' }))
      .catch(() => toast({ variant: 'destructive', title: 'ত্রুটি', description: 'সেটিংস আপডেট করা সম্ভব হয়নি।' }));
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
        toast({ title: 'আপডেট সফল' });
      } else {
        await addDoc(collection(db, 'products'), data);
        toast({ title: 'সফল', description: 'নতুন পণ্য যোগ হয়েছে।' });
      }
      setProductDialogOpen(false);
      fetchData();
    } catch (err) {
      toast({ variant: 'destructive', title: 'ব্যর্থ' });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('নিশ্চিত?')) return;
    await deleteDoc(doc(db, 'products', id));
    fetchData();
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-foreground">অ্যাডমিন <span className="text-primary">প্যানেল</span></h1>
          <Button onClick={fetchData} variant="outline" className="rounded-full">রিফ্রেশ করুন</Button>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white p-2 rounded-3xl h-16 shadow-sm border w-full md:w-fit overflow-x-auto">
            <TabsTrigger value="products" className="rounded-2xl gap-2 px-6"><ShoppingBag className="w-4 h-4" /> পণ্য তালিকা</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-2xl gap-2 px-6"><Users className="w-4 h-4" /> কাস্টমার তথ্য</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-2xl gap-2 px-6"><Settings className="w-4 h-4" /> সাইট সেটিংস</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-white">
                <CardTitle>পণ্য ব্যবস্থাপনা ({products.length})</CardTitle>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full shadow-lg"><Plus className="mr-2" /> নতুন পণ্য</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
                    <DialogHeader><DialogTitle>পণ্য যোগ/এডিট</DialogTitle></DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>নাম</Label>
                          <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                          <Label>ক্যাটাগরি</Label>
                          <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>মূল্য</Label>
                          <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                          <Label>ডিসকাউন্ট মূল্য</Label>
                          <Input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 py-2">
                        <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} id="feat" />
                        <Label htmlFor="feat">হাইলাইট পণ্যে দেখান (Featured)</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>বর্ণনা</Label>
                        <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>
                      <Button type="submit" className="w-full h-12 rounded-xl">সেভ করুন</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>নাম</TableHead>
                      <TableHead>ক্যাটাগরি</TableHead>
                      <TableHead>মূল্য</TableHead>
                      <TableHead>স্টক</TableHead>
                      <TableHead className="text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold">{p.name} {p.isFeatured && <span className="text-[10px] bg-yellow-100 px-2 rounded-full">⭐</span>}</TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell>৳{p.discountPrice || p.price}</TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setFormData(p as any); setProductDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
              <CardHeader className="border-b"><CardTitle>নিবন্ধিত কাস্টমার ({customers.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>নাম</TableHead>
                      <TableHead>ফোন নাম্বার</TableHead>
                      <TableHead>পাসওয়ার্ড</TableHead>
                      <TableHead>রোল</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold">{c.name || 'N/A'}</TableCell>
                        <TableCell>{c.phoneNumber}</TableCell>
                        <TableCell className="font-mono text-xs">{c.password}</TableCell>
                        <TableCell><span className={`px-3 py-1 rounded-full text-[10px] ${c.role === 'admin' ? 'bg-primary text-white' : 'bg-muted'}`}>{c.role}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="rounded-[2rem] border-none shadow-xl bg-white p-8">
              <div className="space-y-6 max-w-2xl">
                <h3 className="text-2xl font-bold">ওয়েবসাইট কাস্টমাইজেশন</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>হেডলাইন (Hero Title)</Label>
                    <Input value={siteSettings.heroTitle} onChange={e => setSiteSettings({...siteSettings, heroTitle: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>সাব-টাইটেল (Hero Subtitle)</Label>
                    <Textarea value={siteSettings.heroSubtitle} onChange={e => setSiteSettings({...siteSettings, heroSubtitle: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>হোয়াটসঅ্যাপ অর্ডার নাম্বার</Label>
                    <Input value={siteSettings.whatsappNumber} onChange={e => setSiteSettings({...siteSettings, whatsappNumber: e.target.value})} />
                  </div>
                </div>
                <Button onClick={handleSaveSettings} className="w-full h-14 rounded-2xl text-lg font-bold">সেটিংস সেভ করুন</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

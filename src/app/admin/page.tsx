
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
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
import { Plus, Pencil, Trash2, Settings, Users, Star, Save, Eye, EyeOff, Sparkles, TrendingUp, Package, Image as ImageIcon, ShoppingCart, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { Product } from '@/components/product/product-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
      toast({ title: 'সফল' });
      setProductDialogOpen(false);
      fetchData();
    });
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen pb-24 md:pb-12 overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">অ্যাডমিন <span className="text-primary">প্যানেল</span></h1>
          <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 bg-primary font-black text-lg text-white">
                <Plus className="mr-2" /> নতুন পণ্য
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
              <DialogHeader><DialogTitle>পণ্যের তথ্য</DialogTitle></DialogHeader>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                <div className="space-y-4">
                  <Input placeholder="নাম" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  <Input type="number" placeholder="মূল্য" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  <Input placeholder="ক্যাটাগরি" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                  <Input placeholder="ছবি ইউআরএল" value={formData.imageUrls[0]} onChange={e => setFormData({...formData, imageUrls: [e.target.value]})} required />
                </div>
                <div className="space-y-4">
                  <Textarea placeholder="বিবরণ" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                    <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                    <Label className="font-bold">স্পেশাল পণ্য</Label>
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-xl font-black">সেভ করুন</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-white/60 glass p-1 rounded-full h-16 flex overflow-x-auto">
            <TabsTrigger value="orders" className="rounded-full px-8 font-black">অর্ডারসমূহ</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full px-8 font-black">পণ্যসমূহ</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-full px-8 font-black">ইউজারসমূহ</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
              <Table>
                <TableHeader><TableRow><TableHead>অর্ডার তথ্য</TableHead><TableHead>কাস্টমার</TableHead><TableHead>মোট মূল্য</TableHead><TableHead>অবস্থা</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
                <TableBody>
                  {orders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-bold">
                        {o.items.map((i: any) => `${i.name} (${i.qty})`).join(', ')}
                        <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3" /> {o.location.address}</p>
                      </TableCell>
                      <TableCell className="font-mono">{o.phoneNumber}</TableCell>
                      <TableCell className="font-black">৳{o.totalAmount}</TableCell>
                      <TableCell>
                        <Badge className={cn("font-black", o.status === 'pending' ? 'bg-amber-100 text-amber-600' : o.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {o.status === 'pending' && (
                          <>
                            <Button size="icon" variant="ghost" className="text-emerald-500" onClick={() => updateOrderStatus(o.id, 'confirmed')}><CheckCircle /></Button>
                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => updateOrderStatus(o.id, 'cancelled')}><XCircle /></Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
              <Table>
                <TableHeader><TableRow><TableHead>পণ্য</TableHead><TableHead>ক্যাটাগরি</TableHead><TableHead>মূল্য</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-black">{p.name}</TableCell>
                      <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                      <TableCell className="font-black">৳{p.discountPrice || p.price}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setFormData(p as any); setProductDialogOpen(true); }}><Pencil /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={async () => { if(confirm('মুছে ফেলবেন?')){ await deleteDoc(doc(db, 'products', p.id)); fetchData(); } }}><Trash2 /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
          <TabsContent value="customers">
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
              <Table>
                <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>ফোন</TableHead><TableHead className="text-right">রোল</TableHead></TableRow></TableHeader>
                <TableBody>
                  {customers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-black">{c.name}</TableCell>
                      <TableCell className="font-mono">{c.phoneNumber}</TableCell>
                      <TableCell className="text-right"><Badge>{c.role}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

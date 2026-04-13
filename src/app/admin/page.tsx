"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X, PlusCircle } from 'lucide-react';
import { Product } from '@/components/product/product-card';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    description: '',
    category: '',
    stock: '',
    imageUrls: ['']
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      discountPrice: '',
      description: '',
      category: '',
      stock: '',
      imageUrls: ['']
    });
    setEditingProduct(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrls: newUrls }));
  };

  const addImageUrlField = () => {
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const removeImageUrlField = (index: number) => {
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, imageUrls: newUrls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        name: formData.name,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        description: formData.description,
        category: formData.category,
        stock: Number(formData.stock),
        imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), dataToSave);
        toast({ title: 'আপডেট সফল', description: 'পণ্যটি সফলভাবে আপডেট করা হয়েছে।' });
      } else {
        await addDoc(collection(db, 'products'), dataToSave);
        toast({ title: 'সফল', description: 'নতুন পণ্য যোগ করা হয়েছে।' });
      }
      
      setOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন।' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এটি ডিলিট করতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: 'মুছে ফেলা হয়েছে', description: 'পণ্যটি সফলভাবে ডিলিট করা হয়েছে।' });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() || '',
      description: product.description || '',
      category: product.category,
      stock: product.stock.toString(),
      imageUrls: product.imageUrls.length > 0 ? product.imageUrls : ['']
    });
    setOpen(true);
  };

  if (authLoading || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                নতুন পণ্য যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'পণ্য এডিট করুন' : 'নতুন পণ্য যোগ করুন'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">পণ্যের নাম</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">মূল্য (টাকা)</Label>
                      <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPrice">ডিসকাউন্ট মূল্য (ঐচ্ছিক)</Label>
                      <Input id="discountPrice" name="discountPrice" type="number" value={formData.discountPrice} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">ক্যাটাগরি</Label>
                      <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">স্টক</Label>
                      <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">পণ্যের বিবরণ</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} />
                  </div>
                  <div className="space-y-3">
                    <Label>ছবির লিঙ্কসমূহ (External Image URLs)</Label>
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          value={url} 
                          onChange={(e) => handleImageUrlChange(i, e.target.value)} 
                          required={i === 0}
                        />
                        {formData.imageUrls.length > 1 && (
                          <Button type="button" variant="outline" size="icon" onClick={() => removeImageUrlField(i)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={addImageUrlField}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      আরেকটি লিঙ্ক যোগ করুন
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-lg">
                  {editingProduct ? 'আপডেট করুন' : 'সেভ করুন'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle>পণ্য তালিকা ({products.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">এখনো কোনো পণ্য যোগ করা হয়নি।</TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold">৳{p.discountPrice || p.price}</span>
                            {p.discountPrice && <span className="text-[10px] line-through text-muted-foreground">৳{p.price}</span>}
                          </div>
                        </TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(p)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-white" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';
import { Product as ProductInterface } from '@/components/product/product-card';
interface Product extends ProductInterface {
    description?: string;
}
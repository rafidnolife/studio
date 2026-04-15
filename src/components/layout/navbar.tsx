
"use client";

import Link from 'next/link';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Home, ShoppingBag, User, ShieldCheck, Heart, LogIn, Package, LogOut, Sparkles, Download } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export function Navbar() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [apkUrl, setApkUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;
      
      // If we are within 100px of the bottom
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!db) return;
    getDoc(doc(db, 'settings', 'site')).then(s => {
      if (s.exists()) setApkUrl(s.data().apkUrl || null);
    });
  }, [db]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navItems = [
    { name: 'হোম', href: '/', icon: Home },
    { name: 'সব পণ্য', href: '/products', icon: ShoppingBag },
  ];

  if (user) {
    navItems.push({ name: 'অর্ডার', href: '/orders', icon: Package });
    navItems.push({ name: 'প্রোফাইল', href: '/profile', icon: User });
  }

  if (user?.role === 'admin') {
    navItems.push({ name: 'অ্যাডমিন', href: '/admin', icon: ShieldCheck });
  }

  return (
    <>
      <nav className={cn(
        "sticky top-0 z-50 w-full transition-all duration-700",
        scrolled ? "bg-white/95 backdrop-blur-2xl shadow-xl h-14 md:h-16" : "bg-white/40 h-16 md:h-20"
      )}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            {!loading && user ? (
              <div className="flex items-center gap-2 md:gap-3 bg-white/80 glass px-3 md:px-5 py-1.5 md:py-2.5 rounded-full shadow-lg border border-primary/10 transition-all hover:scale-105">
                <div className="w-5 h-5 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <Sparkles className="w-3 md:w-5 h-3 md:h-5 animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[6px] md:text-[8px] font-black text-primary uppercase tracking-widest">স্বাগতম</span>
                  <span className="font-black text-[9px] md:text-sm text-slate-900 tracking-tighter truncate max-w-[60px] sm:max-w-[80px]">
                    {user.displayName?.split(' ')[0]} <span className="text-primary">!</span>
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-7 h-7 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm md:text-xl shadow-lg">
                  ড
                </div>
                <div className="flex flex-col leading-none hidden sm:flex">
                  <span className="font-black text-sm md:text-lg tracking-tighter text-slate-900 uppercase">
                    DOKAAN <span className="text-primary">EXPRESS</span>
                  </span>
                  <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Premium Shop</span>
                </div>
              </>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-all hover:text-primary relative group",
                  pathname === item.href ? "text-primary" : "text-slate-500"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-[2px] bg-primary rounded-full transition-all duration-500",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {apkUrl && (
              <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 md:h-10 md:w-10 hover:bg-primary/5 text-primary hidden sm:flex" asChild>
                <a href={apkUrl} target="_blank" rel="noopener noreferrer" title="ডাউনলোড অ্যাপ">
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 md:h-10 md:w-10 hover:bg-red-50 hover:text-red-500" asChild>
              <Link href="/wishlist">
                <Heart className={cn("w-4 h-4 md:w-5 md:h-5", pathname === '/wishlist' && "fill-red-500 text-red-500")} />
              </Link>
            </Button>
            {!loading && !user ? (
              <Button className="rounded-xl px-4 md:px-6 h-8 md:h-10 font-black text-[9px] md:text-xs shadow-lg bg-primary uppercase tracking-widest" asChild>
                <Link href="/login">LOGIN</Link>
              </Button>
            ) : user ? (
              <Button variant="ghost" onClick={handleLogout} className="rounded-full h-8 w-8 md:h-10 md:w-auto md:px-4 font-black text-red-500 hover:bg-red-50 group">
                <LogOut className="w-4 h-4 md:mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline text-[9px] md:text-xs">Logout</span>
              </Button>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Dynamic Mobile Bottom Navigation Bar - Lower z-index so Sheets can appear over it */}
      <div className={cn(
        "md:hidden fixed left-6 right-6 h-14 glass border-white/50 shadow-2xl rounded-2xl px-6 flex justify-between items-center z-40 transition-all duration-500",
        isAtBottom ? "bottom-20" : "bottom-4"
      )}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-all duration-300",
              pathname === item.href ? "text-primary scale-110" : "text-slate-400"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[7px] font-black uppercase tracking-tighter">{item.name}</span>
          </Link>
        ))}
        {apkUrl && (
          <a
            href={apkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 text-primary animate-pulse"
          >
            <Download className="w-5 h-5" />
            <span className="text-[7px] font-black uppercase tracking-tighter">App</span>
          </a>
        )}
      </div>
    </>
  );
}

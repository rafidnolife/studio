
"use client";

import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Home, ShoppingBag, User, ShieldCheck, Heart, LogIn, Package, LogOut, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';

export function Navbar() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-700",
      scrolled ? "bg-white/95 backdrop-blur-2xl shadow-2xl h-20" : "bg-white/40 h-28"
    )}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          {!loading && user ? (
            <div className="flex items-center gap-2 md:gap-4 bg-white/80 glass px-4 md:px-7 py-2 md:py-3.5 rounded-full shadow-2xl border border-primary/20 transition-all hover:scale-105 hover:bg-white active:scale-95">
              <div className="w-8 h-8 md:w-11 md:h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 shadow-inner">
                <Sparkles className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em]">স্বাগতম</span>
                <span className="font-black text-xs md:text-xl text-slate-900 tracking-tighter truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                  {user.displayName?.split(' ')[0]} <span className="text-primary">!</span>
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl md:text-3xl shadow-2xl shadow-primary/30 group-hover:rotate-12 transition-transform">
                ড
              </div>
              <div className="flex flex-col leading-none hidden sm:flex">
                <span className="font-black text-lg md:text-2xl tracking-tighter text-slate-900 uppercase">
                  DOKAAN <span className="text-primary">EXPRESS</span>
                </span>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Luxury Shop</span>
              </div>
            </>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[12px] font-black uppercase tracking-widest transition-all hover:text-primary relative group",
                pathname === item.href ? "text-primary" : "text-slate-500"
              )}
            >
              {item.name}
              <span className={cn(
                "absolute -bottom-2 left-0 h-[4px] bg-primary rounded-full transition-all duration-700",
                pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-5 shrink-0">
          <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 md:h-14 md:w-14 hover:bg-red-50 hover:text-red-500 shadow-sm" asChild>
            <Link href="/wishlist">
              <Heart className={cn("w-5 h-5 md:w-7 md:h-7", pathname === '/wishlist' && "fill-red-500 text-red-500")} />
            </Link>
          </Button>
          {!loading && !user ? (
            <Button className="rounded-[1.25rem] md:rounded-[1.5rem] px-6 md:px-10 h-10 md:h-14 font-black text-xs md:text-sm shadow-2xl shadow-primary/30 uppercase tracking-[0.2em] bg-primary transition-all active:scale-95" asChild>
              <Link href="/login">LOGIN</Link>
            </Button>
          ) : user ? (
            <Button variant="ghost" onClick={handleLogout} className="rounded-full h-10 w-10 md:h-14 md:w-auto md:px-8 font-black text-red-500 hover:bg-red-50 group">
               <LogOut className="w-5 h-5 md:mr-2 group-hover:-translate-x-1 transition-transform" />
               <span className="hidden md:inline">Logout</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Optimized Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 h-18 glass border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] px-8 flex justify-between items-center z-50 animate-in slide-in-from-bottom-10 duration-700">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-500",
              pathname === item.href ? "text-primary scale-125 -translate-y-1" : "text-slate-400"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[7px] font-black uppercase tracking-tighter">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

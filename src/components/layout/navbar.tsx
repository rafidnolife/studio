
"use client";

import Link from 'next/link';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Home, ShoppingBag, User, ShieldCheck, Heart, LogIn, Sparkles, Package } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'হোম', href: '/', icon: Home },
    { name: 'সব পণ্য', href: '/products', icon: ShoppingBag },
  ];

  if (user) {
    navItems.push({ name: 'আমার অর্ডার', href: '/orders', icon: Package });
    navItems.push({ name: 'প্রোফাইল', href: '/profile', icon: User });
  }

  if (user?.role === 'admin') {
    navItems.push({ name: 'অ্যাডমিন', href: '/admin', icon: ShieldCheck });
  }

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-500",
      scrolled ? "bg-white/90 backdrop-blur-xl shadow-xl h-20" : "bg-white/40 h-28"
    )}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20">
            ড
          </div>
          <div className="flex flex-col leading-none hidden sm:flex">
            <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">
              DOKAAN <span className="text-primary">EXPRESS</span>
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jhenaidah Luxury</span>
          </div>
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
                "absolute -bottom-2 left-0 h-[3px] bg-primary rounded-full transition-all duration-500",
                pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12" asChild>
            <Link href="/wishlist">
              <Heart className="w-6 h-6 text-slate-400" />
            </Link>
          </Button>
          {!loading && !user ? (
            <Button className="rounded-2xl px-8 h-12 font-black text-sm shadow-xl shadow-primary/20 uppercase tracking-widest" asChild>
              <Link href="/login">LOGIN</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3 bg-white/60 glass px-4 py-2 rounded-full border border-primary/10">
              <User className="w-5 h-5 text-primary" />
              <span className="font-black text-xs text-slate-900 hidden lg:inline">{user?.displayName || user?.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden fixed bottom-6 left-6 right-6 h-20 glass border shadow-2xl rounded-[2.5rem] px-8 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5",
              pathname === item.href ? "text-primary scale-110" : "text-slate-400"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

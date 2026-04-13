
"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Home, ShoppingBag, User, ShieldCheck, Heart, LogIn, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, loading } = useAuth();
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
    { name: 'প্রোফাইল', href: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'অ্যাডমিন', href: '/admin', icon: ShieldCheck });
  }

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-500",
      scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg h-16" : "bg-white/40 h-24"
    )}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {user ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> স্বাগতম
              </span>
              <span className="font-black text-lg md:text-xl text-slate-900 tracking-tighter truncate max-w-[150px] md:max-w-[250px]">
                {user.displayName || user.phoneNumber}
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-[1rem] md:rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-all duration-500">
                ড
              </div>
              <div className="flex flex-col leading-none hidden sm:flex">
                <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-900 uppercase">
                  DOKAAN <span className="text-primary">EXPRESS</span>
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Luxury Shopping</span>
              </div>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[13px] font-black uppercase tracking-widest transition-all hover:text-primary relative group",
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
          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-red-50 hover:text-red-500 h-10 w-10 md:h-12 md:w-12" asChild>
            <Link href="/wishlist">
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </Button>
          {!loading && !user ? (
            <Button className="rounded-2xl px-6 md:px-8 h-10 md:h-12 font-black text-xs md:text-sm shadow-xl shadow-primary/20 uppercase tracking-widest" asChild>
              <Link href="/login">
                <LogIn className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                LOGIN
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="icon" className="rounded-2xl border-2 h-10 w-10 md:h-12 md:w-12 hover:bg-slate-50 border-slate-100" asChild>
              <Link href="/profile">
                <User className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 h-18 glass border shadow-2xl rounded-[2.5rem] px-8 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              pathname === item.href ? "text-primary scale-110" : "text-slate-400"
            )}
          >
            <item.icon className={cn("w-6 h-6", pathname === item.href ? "stroke-[3px]" : "stroke-2")} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

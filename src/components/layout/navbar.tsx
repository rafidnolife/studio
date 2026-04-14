
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
      "sticky top-0 z-50 w-full transition-all duration-500",
      scrolled ? "bg-white/90 backdrop-blur-xl shadow-xl h-20" : "bg-white/40 h-28"
    )}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {!loading && user ? (
            <div className="flex items-center gap-2 md:gap-3 bg-white/60 glass px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg border border-primary/10 transition-all hover:scale-105">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 shadow-inner">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">স্বাগতম</span>
                <span className="font-black text-sm md:text-xl text-slate-900 tracking-tighter truncate max-w-[100px] md:max-w-none">
                  {user.displayName?.split(' ')[0]} <span className="text-primary">!</span>
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-xl shadow-primary/20 group-hover:rotate-12 transition-transform">
                ড
              </div>
              <div className="flex flex-col leading-none hidden sm:flex">
                <span className="font-black text-lg md:text-2xl tracking-tighter text-slate-900 uppercase">
                  DOKAAN <span className="text-primary">EXPRESS</span>
                </span>
                <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Jhenaidah Luxury</span>
              </div>
            </>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-8">
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
          <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 md:h-12 md:w-12 hover:bg-red-50 hover:text-red-500" asChild>
            <Link href="/wishlist">
              <Heart className={cn("w-5 h-5 md:w-6 md:h-6", pathname === '/wishlist' && "fill-red-500 text-red-500")} />
            </Link>
          </Button>
          {!loading && !user ? (
            <Button className="rounded-2xl px-6 md:px-8 h-10 md:h-12 font-black text-xs md:text-sm shadow-xl shadow-primary/20 uppercase tracking-widest bg-primary" asChild>
              <Link href="/login">LOGIN</Link>
            </Button>
          ) : user ? (
            <Button variant="ghost" onClick={handleLogout} className="rounded-full h-10 w-10 md:h-12 md:w-auto md:px-6 font-black text-red-500 hover:bg-red-50">
               <LogOut className="w-5 h-5 md:mr-2" />
               <span className="hidden md:inline">Logout</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 glass border shadow-2xl rounded-[2rem] px-6 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              pathname === item.href ? "text-primary scale-110" : "text-slate-400"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

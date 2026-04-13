"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Home, ShoppingBag, User, ShieldCheck, Heart, LogIn } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'হোম', href: '/', icon: Home },
    { name: 'পণ্য', href: '/products', icon: ShoppingBag },
    { name: 'প্রোফাইল', href: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'অ্যাডমিন', href: '/admin', icon: ShieldCheck });
  }

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
            ড
          </div>
          <div className="flex flex-col leading-none hidden sm:flex">
            <span className="font-black text-2xl tracking-tighter text-slate-900">
              দোকান <span className="text-primary">এক্সপ্রেস</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Shopping</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-black uppercase tracking-widest transition-all hover:text-primary relative group ${
                pathname === item.href ? 'text-primary' : 'text-slate-500'
              }`}
            >
              {item.name}
              <span className={`absolute -bottom-2 left-0 w-0 h-1 bg-primary rounded-full transition-all group-hover:w-full ${pathname === item.href ? 'w-full' : ''}`} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors" asChild>
            <Link href="/wishlist">
              <Heart className="w-6 h-6" />
            </Link>
          </Button>
          {!loading && !user ? (
            <Button className="rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20" asChild>
              <Link href="/login">
                <LogIn className="w-5 h-5 mr-2" />
                লগইন
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="icon" className="rounded-2xl border-2 w-12 h-12 hover:bg-slate-50 transition-all" asChild>
              <Link href="/profile">
                <User className="w-6 h-6 text-slate-600" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 h-18 bg-white/80 backdrop-blur-2xl border shadow-2xl rounded-[2.5rem] px-8 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all ${
              pathname === item.href ? 'text-primary scale-110' : 'text-slate-400'
            }`}
          >
            <item.icon className={`w-6 h-6 ${pathname === item.href ? 'stroke-[3px]' : 'stroke-2'}`} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
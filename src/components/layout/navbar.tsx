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
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
            ড
          </div>
          <span className="font-headline font-bold text-xl tracking-tight hidden sm:block">
            দোকান <span className="text-primary">এক্সপ্রেস</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/wishlist">
              <Heart className="w-5 h-5" />
            </Link>
          </Button>
          {!loading && !user ? (
            <Button variant="default" className="rounded-full px-6" asChild>
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                লগইন
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="icon" className="rounded-full" asChild>
              <Link href="/profile">
                <User className="w-5 h-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === item.href ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
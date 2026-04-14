
import type { Metadata } from 'next';
import { Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { NotificationHandler } from '@/components/notifications/notification-handler';

const bengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'দোকান এক্সপ্রেস (Dokan Express) | Rafid Online Shop',
    template: '%s | Dokan Express'
  },
  description: 'দোকান এক্সপ্রেস (Dokan Express) - ঝিনাইদহের সেরা অনলাইন শপ। Rafid Online Shop এ পান প্রিমিয়াম কোয়ালিটির পণ্য সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে। Dokan Express Jhenaidah এ আপনাকে স্বাগতম।',
  keywords: ['দোকান এক্সপ্রেস', 'Dokan Express', 'Rafid Online Shop', 'Dokan Express jhenaidah', 'Online Shop Bangladesh', 'E-commerce Jhenaidah', 'ঝিনাইদহ অনলাইন শপ'],
  authors: [{ name: 'Rafid' }],
  creator: 'Rafid',
  publisher: 'Rafid Online Shop',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: 'https://dokan-express.com',
    title: 'দোকান এক্সপ্রেস (Dokan Express) | Rafid Online Shop',
    description: 'ঝিনাইদহের বিশ্বস্ত অনলাইন শপ। প্রিমিয়াম পণ্য কিনুন সাশ্রয়ী মূল্যে সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে।',
    siteName: 'Dokan Express',
    images: [
      {
        url: 'https://picsum.photos/seed/dokaan-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'Dokan Express Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'দোকান এক্সপ্রেস (Dokan Express) | Rafid Online Shop',
    description: 'ঝিনাইদহের সেরা অনলাইন শপ। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।',
    images: ['https://picsum.photos/seed/dokaan-og/1200/630'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={bengali.variable}>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <FirebaseClientProvider>
          <NotificationHandler />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

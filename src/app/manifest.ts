
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'দোকান এক্সপ্রেস (Dokan Express)',
    short_name: 'Dokan Express',
    description: 'ঝিনাইদহের সেরা অনলাইন শপ। প্রিমিয়াম পণ্য কিনুন সাশ্রয়ী মূল্যে।',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10B981',
    icons: [
      {
        src: 'https://picsum.photos/seed/dokaan/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/dokaan/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}

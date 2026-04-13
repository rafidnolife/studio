# **App Name**: দোকান এক্সপ্রেস (Dokaan Express)

## Core Features:

- WhatsApp Order Tool: Generate an encoded WhatsApp message for users to place orders directly, containing product name, quantity, and price. This tool facilitates a streamlined ordering process without an in-app checkout.
- Firebase Phone OTP Authentication: Secure user login and registration using Firebase Authentication via phone number OTP, with a fully localized Bangla user interface including 'ফোন নাম্বার লিখুন' and 'ওটিপি যাচাই করুন'.
- Dynamic Product Display: Efficiently display products from Firestore with features like live search (debounced), filtering, and infinite scrolling. Product details (নাম, মূল্য, ডিসকাউন্ট মূল্য, বিবরণ) are shown on dedicated 'পণ্য বিস্তারিত' pages with an 'অর্ডার করুন' action.
- Admin Product Management Dashboard: A secure 'অ্যাডমিন ড্যাশবোর্ড' accessible only to admins (based on phone number) for managing product inventory. Features include adding new products (with external image URL input), editing existing products, and deleting products.
- Optimized External Image Handling: Manage and display product images fetched from external URLs (CDN, Imgur, etc.) with performance optimizations including lazy loading, low-quality image placeholder blur, broken image fallback, and responsive sizing.
- Personalized User Experience: Client-side features using localStorage for a personalized experience, including a user-specific 'প্রোফাইল' page, a 'Wishlist' (ভালো লাগা পণ্য), and 'Recently viewed' products (সম্প্রতি দেখা পণ্য).
- Responsive Bangla UI & Performance Features: The entire application UI is in Bangla (e.g., 'হোম', 'পণ্য তালিকা', 'অ্যাডমিন ড্যাশবোর্ড') and is built to be fast, lightweight, and responsive across devices, featuring a dark mode, toast notifications, and skeleton loading.

## Style Guidelines:

- Color Anchor: 'Clean, Fresh, Modern E-commerce'. Scheme: Light. Primary color: A fresh and inviting green, #5FAD39 (HSL: 140, 50%, 45%).
- Background color: A subtle, desaturated light green, #F4F6F3 (HSL: 140, 15%, 96%).
- Accent color: A vibrant yellow-green for highlights and calls-to-action, #C8E052 (HSL: 110, 70%, 60%).
- Headline and Body Font: 'Noto Sans Bengali' (sans-serif) for clean readability in Bengali across all UI elements, as explicitly requested.
- Utilize simple, clean, and minimal icons that align with a modern, fast UI aesthetic, similar to those found in Tailwind CSS kits.
- Employ a clean, minimal, and highly responsive design framework based on Tailwind CSS to ensure optimal display and functionality across various screen sizes and devices.
- Keep animations low and subtle to prioritize application performance and maintain a fast-loading user experience.
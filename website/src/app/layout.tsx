import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Sora,
  Unbounded,
  Outfit,
  Syne,
  Playfair_Display,
  Bebas_Neue,
  Fraunces,
  Oswald,
  Cormorant_Garamond,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingTelegram } from "@/components/layout/floating-telegram";
import { SiteBackground } from "@/components/shared/site-background";
import { BackgroundSwitcher } from "@/components/shared/background-switcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

/* Almashinadigan fonlar uchun qo'shimcha display shriftlar */
const sora = Sora({ variable: "--font-display-sora", subsets: ["latin"] });
const unbounded = Unbounded({ variable: "--font-display-unbounded", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-display-outfit", subsets: ["latin"] });
const syne = Syne({ variable: "--font-display-syne", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-display-playfair", subsets: ["latin"] });
const bebas = Bebas_Neue({ variable: "--font-display-bebas", weight: "400", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-display-fraunces", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-display-oswald", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ variable: "--font-display-cormorant", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AAA — Premium Crypto Trading Academy",
  description: "Professional kripto savdo akademiyasi va signal platformasi. Trading Haqiqati kursi va AT_analysis signallari. CRYPTO | SPOT | STOCKS",
  keywords: ["AAA", "crypto", "trading", "academy", "signals", "kripto", "savdo", "Trading Haqiqati", "AT_analysis", "Bitcoin", "Ethereum", "Solana", "Toncoin"],
  authors: [{ name: "ABDULLOH" }],
  creator: "ABDULLOH",
  publisher: "AAA",
  icons: {
    icon: "/aaa-logo.png",
    shortcut: "/aaa-logo.png",
    apple: "/aaa-logo.png",
  },
  openGraph: {
    title: "AAA — Premium Crypto Trading Academy",
    description: "Professional kripto savdo akademiyasi va signal platformasi. CRYPTO | SPOT | STOCKS",
    url: "https://aaa-trading.academy",
    siteName: "AAA Trading Academy",
    type: "website",
    locale: "uz_UZ",
    images: [
      {
        url: "/aaa-logo.png",
        width: 1342,
        height: 894,
        alt: "AAA — Premium Crypto Trading Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AAA — Premium Crypto Trading Academy",
    description: "Professional kripto savdo akademiyasi va signal platformasi. CRYPTO | SPOT | STOCKS",
    images: ["/aaa-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://aaa-trading.academy"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Tungi/kunduzgi rejim — tizim sozlamasiga qarab (foydalanuvchi tanlagan bo'lsa, o'sha qo'llanadi) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=null;try{saved=localStorage.getItem('aaa-theme')}catch(e){}var m=window.matchMedia('(prefers-color-scheme: dark)');function apply(){var dark=saved==='dark'?true:saved==='light'?false:m.matches;document.documentElement.classList.toggle('dark',dark)}apply();if(!saved){if(m.addEventListener){m.addEventListener('change',apply)}else if(m.addListener){m.addListener(apply)}}}catch(e){}})()`,
          }}
        />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f4f6fa" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#05070e" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta property="og:image" content="/aaa-logo.png" />
        <meta property="og:locale" content="uz_UZ" />
        <link rel="icon" type="image/png" href="/aaa-logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${sora.variable} ${unbounded.variable} ${outfit.variable} ${syne.variable} ${playfair.variable} ${bebas.variable} ${fraunces.variable} ${oswald.variable} ${cormorant.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <SiteBackground />
        <Navbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
        <FloatingTelegram />
        <BackgroundSwitcher />
        <Toaster />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingTelegram } from "@/components/layout/floating-telegram";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { PatternBorder, SidePattern } from "@/components/shared/oriental-pattern";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    url: "https://atanalysis.serveirc.com",
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
  metadataBase: new URL("https://atanalysis.serveirc.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('aaa-theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#040303" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f7f5f0" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta property="og:image" content="/aaa-logo.png" />
        <meta property="og:locale" content="uz_UZ" />
        <link rel="icon" type="image/png" href="/aaa-logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen transition-colors duration-300`}
      >
        <Navbar />
        {/* Side ornamental pattern borders (desktop) */}
        <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden 2xl:block w-9">
          <SidePattern className="h-full" />
        </div>
        <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-40 hidden 2xl:block w-9">
          <SidePattern className="h-full -scale-x-100" />
        </div>
        <main className="min-h-screen pt-16">
          {/* Top ornamental pattern border */}
          <PatternBorder className="relative z-10" />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          {/* Bottom ornamental pattern border */}
          <PatternBorder className="relative z-10 rotate-180 -mt-px" />
        </main>
        <Footer />
        <FloatingTelegram />
        <Toaster />
      </body>
    </html>
  );
}
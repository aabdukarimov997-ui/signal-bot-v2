import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      // HTML sahifalari edge/CDN'da 1 yil cache'lanib qolmasin.
      // Next.js statik sahifalarga s-maxage=31536000 qo'yadi — bu Railway edge'da
      // eski build'ning HTML'ini yil bo'yi xizmat qildirishi mumkin.
      // Faqat sahifa HTML'iga no-cache, statik assetlar (_next/static) immutable qoladi.
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, max-age=0, must-revalidate" }],
      },
      {
        source: "/:path((?!_next/static|_next/image).*)",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, max-age=0, must-revalidate" }],
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

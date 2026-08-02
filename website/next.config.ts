import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  reactStrictMode: false,
  // HTML sahifalari edge/CDN'da 1 yil cache'lanib qolmasin.
  // Next.js statik sahifalarga s-maxage=31536000 qo'yadi — bu Railway edge'da
  // eski build'ning HTML'ini yil bo'yi xizmat qildirishi mumkin.
  // Faqat sahifa HTML'iga no-cache, statik assetlar (_next/static) immutable qoladi.
  async headers() {
    return [
      // Root (/) — deep-link (/?page=pay&type=signal&tariff=...) aynan shu HTML'da
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, max-age=0, must-revalidate" }],
      },
      {
        source: "/:path((?!_next/static|_next/image).*)",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;

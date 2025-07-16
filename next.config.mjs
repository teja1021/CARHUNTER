/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vgctdgjmlnafwapymefu.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https", 
        hostname: "images.clerk.dev",
      },
    ],
    domains: [
      "vgctdgjmlnafwapymefu.supabase.co",
      "img.clerk.com",
      "images.clerk.dev",
      // add other domains if needed
    ],
  },

  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://roadsidecoder.created.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "auieyynwtskqhewkcutw.supabase.co",
        port: "",
        pathname:
          "/storage/v1/object/public/product-images/**",
        search: "",
      },
    ],
  },
}

export default nextConfig
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@aws-sdk/client-s3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "commondatastorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "robohash.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "snappostmedia.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.adobe.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Add Solana externals via function (safe for Next.js + Webpack schema)
    config.externals = [
      ...(config.externals || []),
      ({ request }, callback) => {
        if (
          [
            "@solana/kit",
            "@solana-program/memo",
            "@solana-program/system",
            "@solana-program/token",
          ].includes(request || "")
        ) {
          return callback(null, `commonjs ${request}`);
        }
        callback();
      },
    ];

    return config;
  },
};

export default nextConfig;

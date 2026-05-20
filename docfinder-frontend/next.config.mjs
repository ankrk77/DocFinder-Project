/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ESLint errors skip karo
  },
  typescript: {
    ignoreBuildErrors: true, // TypeScript errors skip karo
  },
  // Build time par pages ko database API call karne se rokne ke liye
  output: 'standalone', 
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
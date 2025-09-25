/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, 
  transpilePackages: [
    "expo",
    "expo-router",
    "expo-modules-core",
    "expo-linking",
    "expo-web-browser",
    "react-native",
    "react-native-web",
    "react-native-safe-area-context",
    "@clerk/clerk-expo"
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
    };
    return config;
  },
};

module.exports = nextConfig;

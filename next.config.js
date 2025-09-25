/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "expo",
    "expo-router",
    "react-native",
    "react-native-web",
    "@clerk/clerk-expo"
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",   // RN → RN Web
    };
    return config;
  },
};

module.exports = nextConfig;

"use client";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function HomePage() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    // 로그인 안된 경우 → 로그인 페이지로
    return <Redirect href="/(auth)/sign-in" />;
  }

  // 로그인된 경우 → index.jsx 페이지로
  return <Redirect href="/sign-in" />;
}

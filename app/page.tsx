"use client";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function HomePage() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/" />;
}

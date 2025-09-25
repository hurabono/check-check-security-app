"use client";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, type Href } from "expo-router";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;

  const authed = "/(tabs)" as Href;          
  const signIn = "/(auth)/sign-in" as Href;

  return <Redirect href={isSignedIn ? authed : signIn} />;
}

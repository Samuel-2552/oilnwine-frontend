"use client";

import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { accessToken, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
    }
  }, [accessToken, useState]);

  if (!accessToken) return <div>Redirecting...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the protected dashboard!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

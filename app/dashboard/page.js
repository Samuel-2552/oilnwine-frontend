"use client";

import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { accessToken, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
    }else {
      setLoading(false); // Stop the loading state once accessToken is set
    }
  }, [accessToken, router]);

  if (loading) return <div>Redirecting...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the protected dashboard!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

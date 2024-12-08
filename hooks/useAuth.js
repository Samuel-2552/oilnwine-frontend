import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Refresh tokens
  const refreshTokens = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      setAccessToken(response.data.access_token);
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  };

  useEffect(() => {
    if (refreshToken) {
      const interval = setInterval(refreshTokens, 3 * 60 * 1000); // Refresh every 3 minutes
      return () => clearInterval(interval);
    }
  }, [refreshToken]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
  };

  return { accessToken, login, logout };
};

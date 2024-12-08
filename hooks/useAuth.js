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
      logout();  // Logout if refresh fails
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
  
      // Check if the error is a network error or server is unreachable
      if (error.response) {
        // Handle errors from the server (e.g., invalid credentials)
        throw new Error("Invalid credentials or server error.");
      } else if (error.request) {
        // Handle case where the request was made but no response was received
        throw new Error("Server not reachable. Please try again later.");
      } else {
        // Other errors
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
  };

  return { accessToken, login, logout };
};

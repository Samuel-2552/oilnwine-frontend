import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Refresh tokens
  const refreshTokens = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
      setAccessToken(response.data.access_token);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout(); // Logout if refresh fails
    }
  };

  useEffect(() => {
    // Check if accessToken and refreshToken are stored in localStorage on initial load
    const storedAccessToken = localStorage.getItem("access_token");
    const storedRefreshToken = localStorage.getItem("refresh_token");
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }
    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }

    // Start the token refresh interval if refreshToken exists
    if (storedRefreshToken) {
      const interval = setInterval(refreshTokens, 3 * 60 * 1000); // Refresh every 3 minutes
      return () => clearInterval(interval);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      
      const { access_token, refresh_token } = response.data;
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("Invalid email or password. Please try again.");
        } else if (error.response.status === 400) {
          throw new Error(error.response.data.message); // Error message from the backend
        } else {
          throw new Error(
            "An error occurred while logging in. Please try again later."
          );
        }
      } else {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }
    }

    return { login };
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  return { accessToken, login, logout };
};

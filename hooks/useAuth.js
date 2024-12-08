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
    if (refreshToken) {
      const interval = setInterval(refreshTokens, 3 * 60 * 1000); // Refresh every 3 minutes
      return () => clearInterval(interval);
    }
  }, [refreshToken]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
      const { access_token, refresh_token } = response.data;
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
  };

  return { accessToken, login, logout };
};



"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        clearAuthData();
      }
    }
    setLoading(false);
  };

  const clearAuthData = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const login = async (email: string, password: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api";
      
      const response = await axios.post(`${API_URL}/auth/login`, { 
        email: email.trim().toLowerCase(), 
        password 
      }, {
        timeout: 10000,
      });

      const { token: authToken, ...userData } = response.data;

      if (!authToken || !userData._id) {
        throw new Error("Invalid response from server");
      }

      setUser(userData);
      setToken(authToken);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);

      toast.success("Logged in successfully");
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api";
      
      const response = await axios.post(`${API_URL}/auth/register`, { 
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password 
      }, {
        timeout: 10000,
      });

      const { token: authToken, ...userData } = response.data;

      if (!authToken || !userData._id) {
        throw new Error("Invalid response from server");
      }

      setUser(userData);
      setToken(authToken);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);

      toast.success("Registration successful");
    } catch (error) {
      console.error("Register error:", error);
      
      let errorMessage = "Registration failed";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
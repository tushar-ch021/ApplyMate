import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("applymate_token"));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem("applymate_token");
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        // Clear broken token
        logout();
      }
    } catch (error) {
      console.error("Auth context refresh error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      if (res.success && res.data) {
        localStorage.setItem("applymate_token", res.data.token);
        setToken(res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
        });
        return res.data;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authAPI.register(name, email, password);
      if (res.success && res.data) {
        localStorage.setItem("applymate_token", res.data.token);
        setToken(res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
        });
        return res.data;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("applymate_token");
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

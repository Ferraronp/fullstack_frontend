import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import API from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    const res = await axios.post("http://backend:8000/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    await fetchMe();
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      await API.post("/auth/logout", { refresh_token: refreshToken });
    } catch {
      // игнорируем ошибки — всё равно чистим сессию
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

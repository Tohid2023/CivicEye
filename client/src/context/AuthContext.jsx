import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("civiceye_token");
    const savedUser = localStorage.getItem("civiceye_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setAuthUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = (tokenValue, userData) => {
    localStorage.setItem("civiceye_token", tokenValue);
    localStorage.setItem("civiceye_user", JSON.stringify(userData));

    setToken(tokenValue);
    setAuthUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("civiceye_token");
    localStorage.removeItem("civiceye_user");
    localStorage.removeItem("selected_issue_id");
    localStorage.removeItem("selected_booking_id");

    setToken(null);
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
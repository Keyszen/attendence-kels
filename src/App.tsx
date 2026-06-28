/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { EmployeeDashboard } from "./pages/EmployeeDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Basic auth persistence using localStorage
    const saved = localStorage.getItem("auth_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("auth_user");
      }
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <Login onLogin={handleLogin} />
            ) : user.role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/employee" replace />
            )
          }
        />

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/employee"
          element={
            user?.role === "employee" ? (
              <EmployeeDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

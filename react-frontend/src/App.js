import { Routes, Route, Link } from "react-router-dom";
import { Home } from "./Home";
import { Landing } from "./Landing";
import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import { getJwtToken } from "./context/AuthProvider";
import { NavLink } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
import { AuthProvider } from "./context/AuthProvider";
import { Registration } from "./Registration";

export const AuthContext = React.createContext(null);  // we will use this in other components

const App = () => {
    return (
    <AuthProvider>
      <Navigation />
      <h1>React Router</h1>
      <Routes>
        <Route index element={<Home />} />
        <Route path="landing" element={
          <ProtectedRoute><Landing /></ProtectedRoute>} />
        <Route path="home" element={ <Home />} />
        <Route path="register" element={ <Registration/>} />
        <Route path="*" element={<p>There's nothing here: 404!</p>} />
      </Routes>
    </AuthProvider>
  );
};

const Navigation = () => {
  const { value } = useAuth();
  return (
  <nav>
    <NavLink to="/home">Home</NavLink>
    <NavLink to="/landing">Landing</NavLink>
    <NavLink to="/register">Register</NavLink>
    {value.isAuthenticated  && (
    <button type="button" onClick={value.onLogout}>
      Sign Out
   </button> )}
  </nav>
  )
};

export default App;
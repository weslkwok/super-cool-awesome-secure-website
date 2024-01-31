import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({});

// Short duration JWT token (1 hour)
export function getJwtToken() {
  return sessionStorage.getItem("jwt")
}

export function setJwtToken(token) {
  sessionStorage.setItem("jwt", token)
}

// Longer duration refresh token (1 day)
export function getRefreshToken() {
  return sessionStorage.getItem("refreshToken")
}

export function setRefreshToken(token) {
  sessionStorage.setItem("refreshToken", token)
}

export const AuthProvider = ({ children }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check the sessionStorage when the app initializes
    const jwt = sessionStorage.getItem('jwt');
    if (jwt) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

    const navigate = useNavigate();
  
    const handleLogin = async () => {
      setIsAuthenticated(true);
      navigate("/landing");
    };
  

  const handleLogout = () => {
    setJwtToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    navigate("/home")
  };

  const value = {
    isAuthenticated,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return (
    <AuthContext.Provider value={{ value }}>
      {children}
    </AuthContext.Provider>
  );
};

// give callers access to the context
export const useAuth = () => useContext(AuthContext);
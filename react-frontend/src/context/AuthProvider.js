import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({});

// Short duration JWT token (1 hour)
export function getJwtToken() {
  return localStorage.getItem("google_token");
}

// Longer duration refresh token (1 day)
export function getRefreshToken() {
  return sessionStorage.getItem("refreshToken")
}

export function setRefreshToken(token) {
  sessionStorage.setItem("refreshToken", token)
}

export function setJwtToken(token) {
  localStorage.setItem("google_token", token);
}

export const AuthProvider = ({ children }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check the sessionStorage when the app initializes
    const token = getJwtToken();
    console.log('useEffect');
    console.log(token);
    if (!(token == null) || (token === 'INVALID_TOKEN')) {
      setIsAuthenticated(false);
      console.log('setting the token to false...');
      console.log(value.isAuthenticated);

    } else {
      console.log('true token??')
      console.log(token);
      setIsAuthenticated(true);
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
    navigate("/home");
    window.location.reload(); 
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
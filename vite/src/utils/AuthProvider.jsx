import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { apiUrl } from "@/utils/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      verifyToken(token);
      decodeToken(token);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${apiUrl}/auth`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        Cookies.remove("token");
      }
    } catch (error) {
      setIsAuthenticated(false);
      Cookies.remove("token");
    } finally {
      setLoading(false);
    }
  };

  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token); 
      const { id, email, role, username, verified } = decoded; 

      setIsAuthenticated(true);
      setUser({ id, email, role, username, verified });
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      Cookies.remove("token");
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    Cookies.set("token", token);
    decodeToken(token); 
  };

  const logout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    setUser(null);
  };


  if (loading) {
    return <div></div>; 
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

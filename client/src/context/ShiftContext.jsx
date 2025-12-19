import { createContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  });

  const navigate = useNavigate();

  // Login Function
  const login = async (email, password) => {
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };
// 3. Register Function (Updated)
  const register = async (name, email, password, role) => { // <-- Added role here
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role, // <-- Send role to backend
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration Failed", error);
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
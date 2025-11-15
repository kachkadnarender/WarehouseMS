import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = '/api/auth'; // Uses Vite proxy

  const login = async (username, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    const data = res.data;

    // ADD THIS CHECK
    if (!data.token || data.token === "Invalid credentials") {
      return { success: false, error: 'Invalid credentials' };
    }

    localStorage.setItem('token', data.token);
    setUser({ username: data.username, role: data.role });
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Invalid credentials' };
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You can validate token with backend later
      setUser({ username: 'admin', role: 'ADMIN' }); // mock
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
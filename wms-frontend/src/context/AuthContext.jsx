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

      // Ensure we have a token
      if (!data.token) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Store token + user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // Set React state
      setUser({ username: data.username, role: data.role });

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (token && username && role) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ username, role });
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

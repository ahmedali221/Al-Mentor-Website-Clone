import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if token is valid
      axios.get('https://al-mentor-database-production.up.railway.app/api/auth/check', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.data.message === "Authenticated") {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('https://al-mentor-database-production.up.railway.app/api/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        const userResponse = await axios.get('https://al-mentor-database-production.up.railway.app/api/auth/check', {
          headers: {
            Authorization: `Bearer ${response.data.token}`
          }
        });
        if (userResponse.data.user) {
          setUser(userResponse.data.user);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 
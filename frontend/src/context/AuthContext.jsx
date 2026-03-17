import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sz_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('sz_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('sz_token', jwtToken);
    localStorage.setItem('sz_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sz_token');
    localStorage.removeItem('sz_user');
  };

  const isAuthenticated = !!token && !!user;
  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout,
      isAuthenticated, isOwner, isAdmin, isUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;

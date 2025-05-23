import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Criar contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provedor de autenticação
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se o utilizador está autenticado ao carregar a aplicação
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authService.login(email, password);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      setError(error.error || 'Falha na autenticação');
      throw error;
    }
  };

  // Função de registo
  const register = async (username, email, password) => {
    try {
      setError(null);
      const data = await authService.register(username, email, password);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      setError(error.error || 'Falha no registo');
      throw error;
    }
  };

  // Função de logout
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Função para atualizar perfil
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const data = await authService.updateProfile(userData);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      setError(error.error || 'Falha ao atualizar perfil');
      throw error;
    }
  };

  // Valor do contexto
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: authService.isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

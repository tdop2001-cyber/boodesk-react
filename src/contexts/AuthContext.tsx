import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se há um usuário logado no localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('boodesk_user');
        const token = localStorage.getItem('boodesk_token');
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        localStorage.removeItem('boodesk_user');
        localStorage.removeItem('boodesk_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular chamada à API - em produção, isso seria uma chamada real
      const response = await mockLoginAPI(credentials);
      
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Salvar no localStorage
        localStorage.setItem('boodesk_user', JSON.stringify(userData));
        localStorage.setItem('boodesk_token', 'mock-token-' + Date.now());
        
        return true;
      } else {
        setError(response.error || 'Erro no login');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular chamada à API - em produção, isso seria uma chamada real
      const response = await mockRegisterAPI(data);
      
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Salvar no localStorage
        localStorage.setItem('boodesk_user', JSON.stringify(userData));
        localStorage.setItem('boodesk_token', 'mock-token-' + Date.now());
        
        return true;
      } else {
        setError(response.error || 'Erro no registro');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('boodesk_user');
    localStorage.removeItem('boodesk_token');
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Mock API functions - em produção, estas seriam chamadas reais para o backend
const mockLoginAPI = async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Usuários padrão do sistema (baseado no app23a.py)
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@boodesk.com',
      password_hash: 'admin123',
      role: 'admin' as const,
      cargo: 'Administrador',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      username: 'user',
      email: 'user@boodesk.com',
      password_hash: 'user123',
      role: 'user' as const,
      cargo: 'Usuário',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      username: 'manager',
      email: 'manager@boodesk.com',
      password_hash: 'manager123',
      role: 'manager' as const,
      cargo: 'Gerente',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const user = defaultUsers.find(
    u => u.username === credentials.username && u.password_hash === credentials.password
  );

  if (user) {
    return {
      success: true,
      data: {
        ...user,
        is_authenticated: true,
        login_time: new Date().toISOString(),
      },
    };
  } else {
    return {
      success: false,
      error: 'Usuário ou senha incorretos',
    };
  }
};

const mockRegisterAPI = async (data: RegisterData): Promise<ApiResponse<User>> => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Verificar se o usuário já existe
  const existingUsers = ['admin', 'user', 'manager'];
  if (existingUsers.includes(data.username)) {
    return {
      success: false,
      error: 'Usuário já existe',
    };
  }

  // Criar novo usuário
  const newUser: User = {
    id: Date.now(),
    username: data.username,
    email: data.email,
    password_hash: data.password,
    role: data.role,
    cargo: data.cargo,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_id: data.member_id,
    is_authenticated: true,
    login_time: new Date().toISOString(),
  };

  return {
    success: true,
    data: newUser,
  };
};


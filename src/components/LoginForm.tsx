import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';
import { Eye, EyeOff, User, Lock, LogIn, X } from 'lucide-react';

interface LoginFormProps {
  onClose?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose, onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: 'admin',
    password: 'admin123'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const success = await login(credentials);
    if (success && onClose) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red/10 to-brand-green/10 dark:from-brand-red/20 dark:to-brand-green/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="card-hover animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-brand-gray dark:text-gray-50 mb-2">
              Sistema Boodesk
            </h1>
            <p className="text-brand-gray/70 dark:text-gray-300">
              Faça login para continuar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de usuário */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-brand-gray dark:text-gray-50 mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-brand-gray/50 dark:text-gray-300" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            {/* Campo de senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-gray dark:text-gray-50 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-brand-gray/50 dark:text-gray-300" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-brand-gray/50 hover:text-brand-gray" />
                  ) : (
                    <Eye className="h-5 w-5 text-brand-gray/50 hover:text-brand-gray" />
                  )}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-brand-red-light/10 border border-brand-red-light/20 rounded-lg p-3">
                <p className="text-brand-red text-sm">{error}</p>
              </div>
            )}

            {/* Botões */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
              </button>

              {onSwitchToRegister && (
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="btn-outline w-full py-3"
                >
                  Criar nova conta
                </button>
              )}
            </div>
          </form>



          {/* Botão fechar */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-brand-gray/50 hover:text-brand-gray transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-brand-gray/50">
            © 2024 Sistema Boodesk. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;


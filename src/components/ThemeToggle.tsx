import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'select';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'button', className = '' }) => {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  if (variant === 'select') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <label className="text-sm font-medium text-brand-gray dark:text-gray-50">
          Tema:
        </label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
          className="px-3 py-1.5 text-sm border border-brand-light-gray dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-50"
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="auto">Automático</option>
        </select>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Botão Tema Claro */}
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'light'
            ? 'bg-brand-red text-white'
            : 'text-brand-gray dark:text-gray-50 hover:bg-brand-light-gray dark:hover:bg-gray-700'
        }`}
        title="Tema Claro"
      >
        <Sun className="w-4 h-4" />
      </button>

      {/* Botão Tema Automático */}
      <button
        onClick={() => setTheme('auto')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'auto'
            ? 'bg-brand-red text-white'
            : 'text-brand-gray dark:text-gray-50 hover:bg-brand-light-gray dark:hover:bg-gray-700'
        }`}
        title="Tema Automático"
      >
        <Monitor className="w-4 h-4" />
      </button>

      {/* Botão Tema Escuro */}
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'bg-brand-red text-white'
            : 'text-brand-gray dark:text-gray-50 hover:bg-brand-light-gray dark:hover:bg-gray-700'
        }`}
        title="Tema Escuro"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ThemeToggle;

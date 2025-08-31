import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import Meetings from './pages/Meetings';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import MyActivities from './pages/MyActivities';
import FileManager from './pages/FileManager';
import Calendar from './pages/Calendar';
import AllCards from './pages/AllCards';
import DatabaseSetup from './components/DatabaseSetup';
import { Menu } from 'lucide-react';

// Componente de rota protegida
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-light-gray/30 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray dark:text-gray-50">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente de layout principal
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-brand-light-gray/30 dark:bg-gray-900">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg">
            <Sidebar isCollapsed={false} onToggle={toggleMobileMenu} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-brand-light-gray dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-brand-light-gray dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6 text-brand-gray dark:text-gray-50" />
            </button>
            <h1 className="text-lg font-bold text-brand-gray dark:text-gray-50">Boodesk</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Componente de rotas da aplicação
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rota de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginForm />
          )
        } 
      />

      {/* Rotas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota para quadros Kanban */}
      <Route
        path="/boards"
        element={
          <ProtectedRoute>
            <MainLayout>
              <KanbanBoard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

                    {/* Rota para reuniões */}
              <Route
                path="/meetings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Meetings />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

      {/* Rota para Pomodoro */}
      <Route
        path="/pomodoro"
        element={
          <ProtectedRoute>
            <MainLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-brand-gray mb-6">Pomodoro</h1>
                <div className="card">
                  <p className="text-brand-gray/70">Funcionalidade de Pomodoro em desenvolvimento...</p>
                </div>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota para atividades */}
      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyActivities />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota para calendário */}
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Calendar />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota para todos os cards */}
      <Route
        path="/all-cards"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AllCards />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota para gerenciador de arquivos */}
      <Route
        path="/files"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FileManager />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota para configuração do banco */}
      <Route
        path="/database-setup"
        element={
          <ProtectedRoute>
            <DatabaseSetup />
          </ProtectedRoute>
        }
      />

      {/* Rota para chat */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Chat />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota para relatórios */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-brand-gray mb-6">Relatórios</h1>
                <div className="card">
                  <p className="text-brand-gray/70">Funcionalidade de relatórios em desenvolvimento...</p>
                </div>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota para usuários */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <MainLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-brand-gray mb-6">Gerenciamento de Usuários</h1>
                <div className="card">
                  <p className="text-brand-gray/70">Funcionalidade de gerenciamento de usuários em desenvolvimento...</p>
                </div>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />



      {/* Rota para configurações */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota para perfil */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota padrão - redireciona para dashboard */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />

      {/* Rota 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-brand-light-gray/30 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-brand-gray dark:text-gray-50 mb-4">404</h1>
              <p className="text-brand-gray/70 dark:text-gray-300 mb-6">Página não encontrada</p>
              <button 
                onClick={() => window.history.back()}
                className="btn-primary"
              >
                Voltar
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

// Componente principal da aplicação
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <PermissionProvider>
            <SettingsProvider>
              <Router>
                <AppRoutes />
              </Router>
            </SettingsProvider>
          </PermissionProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

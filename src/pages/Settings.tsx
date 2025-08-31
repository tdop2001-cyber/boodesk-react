import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../services/database';
import {
  Settings as SettingsIcon,
  Grid,
  FileText,
  Palette,
  Users,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  X,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Check,
  AlertCircle
} from 'lucide-react';

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  const { cardSettings, updateCardSettings } = useSettings();
  const { showSuccessPopup, showPopup } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('boards');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Estados para configurações de quadros
  const [boardSettings, setBoardSettings] = useState({
    defaultColumns: ['A Fazer', 'Em Progresso', 'Concluído'],
    autoSave: true,
    showCardCount: true,
    showColumnWIP: false,
    maxCardsPerColumn: 0,
    allowCardDuplication: true,
    enableTimeTracking: false,
    defaultBoardTemplate: 'project'
  });



  // Estados para gerenciar tags personalizadas
  const [newTagName, setNewTagName] = useState('');
  const [newTagType, setNewTagType] = useState('category');
  const [editingTagId, setEditingTagId] = useState<number | null>(null);

  // Estados para configurações visuais
  const [visualSettings, setVisualSettings] = useState({
    theme: 'light' as 'light' | 'dark' | 'auto',
    cardStyle: 'rounded',
    colorScheme: 'brand',
    showAvatars: true,
    compactMode: false,
    showGridLines: true,
    animationSpeed: 'normal'
  });

  // Atualizar visualSettings quando o tema mudar
  useEffect(() => {
    setVisualSettings(prev => ({
      ...prev,
      theme: theme
    }));
  }, [theme]);

  // Estados para configurações de usuário
  const [userSettings, setUserSettings] = useState({
    email: 'usuario@exemplo.com',
    name: 'Usuário Exemplo',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    notifications: {
      cardAssigned: true,
      dueDateReminder: true,
      boardUpdates: false,
      mentions: true
    }
  });

  // Estados para gerenciar usuários
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    cargo: '',
    is_active: true
  });

  const tabs = [
    { id: 'boards', label: 'Quadros', icon: Grid },
    { id: 'cards', label: 'Cards', icon: FileText },
    { id: 'visual', label: 'Visual', icon: Palette },
    { id: 'user', label: 'Usuário', icon: Users },
    { id: 'users', label: 'Gerenciar Usuários', icon: Users },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'data', label: 'Dados', icon: Database }
  ];

  const handleSaveSettings = async () => {
    if (!user?.id) {
      showPopup({
        title: 'Erro',
        message: 'Usuário não autenticado. Faça login novamente.'
      });
      return;
    }

    try {
      // Preparar todas as configurações para salvar
      const allSettings = {
        boardSettings,
        cardSettings,
        visualSettings,
        userSettings
      };

      console.log('Salvando configurações para usuário ID:', user.id);
      console.log('Configurações:', allSettings);
      
      // Salvar no banco de dados
      const success = await db.saveUserSettings(user.id, allSettings);
      
      if (success) {
        // Atualizar configurações locais
        updateCardSettings(cardSettings);
        
        // Atualizar tema se necessário
        if (visualSettings.theme !== theme) {
          setTheme(visualSettings.theme);
        }
        
        showSuccessPopup(
          'Configurações Salvas!',
          'Suas configurações foram salvas com sucesso e estão ativas.'
        );
      } else {
        throw new Error('Falha ao salvar configurações - método retornou false');
      }
    } catch (error) {
      console.error('Erro detalhado ao salvar configurações:', error);
      console.error('User ID:', user.id);
      console.error('User object:', user);
      
      let errorMessage = 'Não foi possível salvar as configurações.';
      
      if (error instanceof Error && error.message) {
        errorMessage += ` Erro: ${error.message}`;
      }
      
      showPopup({
        title: 'Erro ao Salvar',
        message: errorMessage
      });
    }
  };

  // Função para carregar configurações do banco de dados
  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      const savedSettings = await db.getUserSettings(user.id);
      
      if (savedSettings.boardSettings) {
        setBoardSettings(savedSettings.boardSettings);
      }
      
      if (savedSettings.cardSettings) {
        updateCardSettings(savedSettings.cardSettings);
      }
      
      if (savedSettings.visualSettings) {
        setVisualSettings(savedSettings.visualSettings);
        // Atualizar tema se necessário
        if (savedSettings.visualSettings.theme && savedSettings.visualSettings.theme !== theme) {
          setTheme(savedSettings.visualSettings.theme);
        }
      }
      
      if (savedSettings.userSettings) {
        setUserSettings(savedSettings.userSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Carregar configurações quando o componente montar
  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  // Funções para gerenciar usuários
  const loadUsers = async () => {
    try {
      // Aqui você carregaria os usuários do banco de dados
      // const usersData = await db.getUsers();
      // setUsers(usersData);
      
      // Por enquanto, usar dados mockados
      setUsers([
        { id: 1, username: 'admin', email: 'admin@exemplo.com', role: 'admin', cargo: 'Administrador', is_active: true },
        { id: 2, username: 'gerente', email: 'gerente@exemplo.com', role: 'manager', cargo: 'Gerente de Projetos', is_active: true },
        { id: 3, username: 'usuario', email: 'usuario@exemplo.com', role: 'user', cargo: 'Desenvolvedor', is_active: true }
      ]);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      showPopup({
        title: 'Erro',
        message: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return;
    }

    try {
      // Aqui você criaria o usuário no banco de dados
      // const createdUser = await db.createUser(newUser);
      
      // Por enquanto, simular criação
      const createdUser = {
        id: Date.now(),
        ...newUser
      };
      
      setUsers([...users, createdUser]);
      setShowCreateUserModal(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'user',
        cargo: '',
        is_active: true
      });
      
      showSuccessPopup(
        'Usuário Criado!',
        'Usuário criado com sucesso.'
      );
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      showPopup({
        title: 'Erro',
        message: 'Não foi possível criar o usuário.'
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      // Aqui você atualizaria o usuário no banco de dados
      // await db.updateUser(selectedUser.id, selectedUser);
      
      // Por enquanto, simular atualização
      setUsers(users.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
      setShowEditUserModal(false);
      setSelectedUser(null);
      
      showSuccessPopup(
        'Usuário Atualizado!',
        'Usuário atualizado com sucesso.'
      );
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showPopup({
        title: 'Erro',
        message: 'Não foi possível atualizar o usuário.'
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    showPopup({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        try {
          // Aqui você excluiria o usuário do banco de dados
          // await db.deleteUser(userId);
          
          // Por enquanto, simular exclusão
          setUsers(users.filter(user => user.id !== userId));
          
          showSuccessPopup(
            'Usuário Excluído!',
            'Usuário excluído com sucesso.'
          );
        } catch (error) {
          console.error('Erro ao excluir usuário:', error);
          showPopup({
            title: 'Erro',
            message: 'Não foi possível excluir o usuário.'
          });
        }
      }
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'user': return 'Usuário';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'user': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Carregar usuários quando a aba for selecionada
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const handleResetSettings = () => {
    showPopup({
      title: 'Redefinir Configurações',
      message: 'Tem certeza que deseja redefinir todas as configurações para os valores padrão? Esta ação não pode ser desfeita.',
      confirmText: 'Redefinir',
      cancelText: 'Cancelar',
      onConfirm: () => {
      setBoardSettings({
        defaultColumns: ['A Fazer', 'Em Progresso', 'Concluído'],
        autoSave: true,
        showCardCount: true,
        showColumnWIP: false,
        maxCardsPerColumn: 0,
        allowCardDuplication: true,
        enableTimeTracking: false,
        defaultBoardTemplate: 'project'
      });
        
        // Mostrar popup de sucesso após redefinir
        setTimeout(() => {
          showSuccessPopup(
            'Configurações Redefinidas!',
            'Todas as configurações foram redefinidas para os valores padrão.'
          );
        }, 300);
      },
      onCancel: () => {}
    });
  };

  const handleExportData = () => {
    const data = {
      boardSettings,
      cardSettings,
      visualSettings,
      userSettings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  // Funções para gerenciar tags personalizadas
  const addCustomTag = () => {
    if (!newTagName.trim()) {
      showSuccessPopup(
        'Campo Obrigatório',
        'Por favor, insira um nome para a tag.'
      );
      return;
    }

    const newTag = {
      id: Date.now(),
      name: newTagName.trim(),
      type: newTagType
    };

    updateCardSettings({
      customTags: [...cardSettings.customTags, newTag]
    });

    // Limpar campos
    setNewTagName('');
    setNewTagType('category');
  };

  const editCustomTag = (tagId: number) => {
    const tag = cardSettings.customTags.find(t => t.id === tagId);
    if (tag) {
      setNewTagName(tag.name);
      setNewTagType(tag.type);
      setEditingTagId(tagId);
    }
  };

  const updateCustomTag = () => {
    if (!newTagName.trim() || editingTagId === null) {
      showSuccessPopup(
        'Campo Obrigatório',
        'Por favor, insira um nome para a tag.'
      );
      return;
    }

    updateCardSettings({
      customTags: cardSettings.customTags.map(tag =>
        tag.id === editingTagId
          ? { ...tag, name: newTagName.trim(), type: newTagType }
          : tag
      )
    });

    // Limpar campos
    setNewTagName('');
    setNewTagType('category');
    setEditingTagId(null);
  };

  const deleteCustomTag = (tagId: number) => {
    const tag = cardSettings.customTags.find(t => t.id === tagId);
    if (tag) {
      showPopup({
        title: 'Excluir Tag',
        message: `Tem certeza que deseja excluir a tag "${tag.name}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        onConfirm: () => {
          updateCardSettings({
      customTags: cardSettings.customTags.filter(tag => tag.id !== tagId)
          });
          
          // Mostrar popup de sucesso
          setTimeout(() => {
            showSuccessPopup(
              'Tag Excluída!',
              'A tag foi excluída com sucesso.'
            );
          }, 300);
        },
        onCancel: () => {}
    });
    }
  };

  const cancelEdit = () => {
    setNewTagName('');
    setNewTagType('category');
    setEditingTagId(null);
  };

  return (
    <div className="min-h-screen bg-brand-light-gray/30 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-brand-light-gray dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-gray dark:text-gray-50">Configurações</h1>
              <p className="text-brand-gray/60 dark:text-gray-300 mt-1">Personalize sua experiência no Kanban</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 text-brand-gray/70 dark:text-gray-300 hover:text-brand-gray dark:hover:text-gray-50 border border-brand-light-gray dark:border-gray-600 rounded-xl hover:bg-brand-light-gray/30 dark:hover:bg-gray-700/30 transition-colors"
              >
                Redefinir
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-brand-red text-white rounded-xl hover:bg-brand-red-dark transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de navegação */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-brand-light-gray dark:border-gray-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brand-red text-white'
                          : 'text-brand-gray dark:text-gray-50 hover:bg-brand-light-gray/30 dark:hover:bg-gray-700/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-brand-light-gray dark:border-gray-700 p-6">
              {/* Configurações de Quadros */}
              {activeTab === 'boards' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-gray mb-4">Configurações de Quadros</h2>
                    
                    {/* Colunas padrão */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-gray mb-2">
                          Colunas Padrão para Novos Quadros
                        </label>
                        <div className="space-y-2">
                          {boardSettings.defaultColumns.map((column, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={column}
                                onChange={(e) => {
                                  const newColumns = [...boardSettings.defaultColumns];
                                  newColumns[index] = e.target.value;
                                  setBoardSettings({...boardSettings, defaultColumns: newColumns});
                                }}
                                className="flex-1 p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                              />
                              {boardSettings.defaultColumns.length > 2 && (
                                <button
                                  onClick={() => {
                                    const newColumns = boardSettings.defaultColumns.filter((_, i) => i !== index);
                                    setBoardSettings({...boardSettings, defaultColumns: newColumns});
                                  }}
                                  className="p-2 text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              setBoardSettings({
                                ...boardSettings,
                                defaultColumns: [...boardSettings.defaultColumns, `Coluna ${boardSettings.defaultColumns.length + 1}`]
                              });
                            }}
                            className="flex items-center space-x-2 text-brand-blue hover:text-brand-blue-dark transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Adicionar Coluna</span>
                          </button>
                        </div>
                      </div>

                      {/* Outras configurações */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-brand-gray">Salvamento Automático</label>
                              <p className="text-xs text-brand-gray/60">Salvar alterações automaticamente</p>
                            </div>
                            <button
                              onClick={() => setBoardSettings({...boardSettings, autoSave: !boardSettings.autoSave})}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                boardSettings.autoSave ? 'bg-brand-red' : 'bg-brand-light-gray'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                boardSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-brand-gray">Mostrar Contagem de Cards</label>
                              <p className="text-xs text-brand-gray/60">Exibir número de cards por coluna</p>
                            </div>
                            <button
                              onClick={() => setBoardSettings({...boardSettings, showCardCount: !boardSettings.showCardCount})}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                boardSettings.showCardCount ? 'bg-brand-red' : 'bg-brand-light-gray'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                boardSettings.showCardCount ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-brand-gray">Permitir Duplicação</label>
                              <p className="text-xs text-brand-gray/60">Duplicar cards existentes</p>
                            </div>
                            <button
                              onClick={() => setBoardSettings({...boardSettings, allowCardDuplication: !boardSettings.allowCardDuplication})}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                boardSettings.allowCardDuplication ? 'bg-brand-red' : 'bg-brand-light-gray'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                boardSettings.allowCardDuplication ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-brand-gray">Rastreamento de Tempo</label>
                              <p className="text-xs text-brand-gray/60">Cronômetro para cards</p>
                            </div>
                            <button
                              onClick={() => setBoardSettings({...boardSettings, enableTimeTracking: !boardSettings.enableTimeTracking})}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                boardSettings.enableTimeTracking ? 'bg-brand-red' : 'bg-brand-light-gray'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                boardSettings.enableTimeTracking ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                             {/* Configurações de Cards */}
               {activeTab === 'cards' && (
                 <div className="space-y-8">
                   <div>
                     <h2 className="text-xl font-bold text-brand-gray mb-6">Configurações de Cards</h2>
                     
                     {/* Seção: Configurações Básicas */}
                     <div className="bg-brand-light-gray/20 rounded-xl p-6 mb-6">
                       <h3 className="text-lg font-semibold text-brand-gray mb-4 flex items-center">
                         <span className="w-2 h-2 bg-brand-blue rounded-full mr-3"></span>
                         Configurações Básicas
                       </h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4">
                           <div>
                             <label className="block text-sm font-medium text-brand-gray mb-2">
                               Status Padrão
                             </label>
                             <input
                               type="text"
                               value={cardSettings.defaultStatus}
                                                               onChange={(e) => updateCardSettings({defaultStatus: e.target.value})}
                               className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                               placeholder="Ex: A Fazer"
                             />
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-brand-gray mb-2">
                               Máximo de Tags por Card
                             </label>
                             <input
                               type="number"
                               value={cardSettings.maxTagsPerCard}
                                                               onChange={(e) => updateCardSettings({maxTagsPerCard: parseInt(e.target.value) || 5})}
                               className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                               min="1"
                               max="10"
                             />
                           </div>
                         </div>

                         <div className="space-y-4">
                           <div className="flex items-center justify-between">
                             <div>
                               <label className="text-sm font-medium text-brand-gray">Mostrar Data de Vencimento</label>
                             </div>
                             <button
                                                               onClick={() => updateCardSettings({showDueDate: !cardSettings.showDueDate})}
                               className={`w-12 h-6 rounded-full transition-colors ${
                                 cardSettings.showDueDate ? 'bg-brand-red' : 'bg-brand-light-gray'
                               }`}
                             >
                               <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                 cardSettings.showDueDate ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                             </button>
                           </div>

                           <div className="flex items-center justify-between">
                             <div>
                               <label className="text-sm font-medium text-brand-gray">Mostrar Responsável</label>
                             </div>
                             <button
                                                               onClick={() => updateCardSettings({showAssignee: !cardSettings.showAssignee})}
                               className={`w-12 h-6 rounded-full transition-colors ${
                                 cardSettings.showAssignee ? 'bg-brand-red' : 'bg-brand-light-gray'
                               }`}
                             >
                               <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                 cardSettings.showAssignee ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                             </button>
                           </div>

                           <div className="flex items-center justify-between">
                             <div>
                               <label className="text-sm font-medium text-brand-gray">Mostrar Tags</label>
                             </div>
                             <button
                                                               onClick={() => updateCardSettings({showTags: !cardSettings.showTags})}
                               className={`w-12 h-6 rounded-full transition-colors ${
                                 cardSettings.showTags ? 'bg-brand-red' : 'bg-brand-light-gray'
                               }`}
                             >
                               <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                 cardSettings.showTags ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                             </button>
                           </div>

                           <div className="flex items-center justify-between">
                             <div>
                               <label className="text-sm font-medium text-brand-gray">Permitir Comentários</label>
                             </div>
                             <button
                                                               onClick={() => updateCardSettings({allowComments: !cardSettings.allowComments})}
                               className={`w-12 h-6 rounded-full transition-colors ${
                                 cardSettings.allowComments ? 'bg-brand-red' : 'bg-brand-light-gray'
                               }`}
                             >
                               <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                 cardSettings.allowComments ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                             </button>
                           </div>
                         </div>
                       </div>
                     </div>

                                           {/* Seção: Prioridades */}
                      <div className="bg-brand-light-gray/20 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-brand-gray mb-4 flex items-center">
                          <span className="w-2 h-2 bg-brand-red rounded-full mr-3"></span>
                          Prioridades
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-brand-gray mb-2">
                              Prioridade Padrão
                            </label>
                            <select
                              value={cardSettings.defaultPriority}
                              onChange={(e) => updateCardSettings({defaultPriority: e.target.value as any})}
                              className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            >
                              <option value="low">Baixa</option>
                              <option value="medium">Normal</option>
                              <option value="high">Alta</option>
                              <option value="critical">Crítica</option>
                            </select>
                          </div>
                        </div>

                        {/* Cores das Prioridades */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-brand-gray mb-4">
                            Cores das Prioridades
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-brand-gray mb-2">
                                Crítica
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={cardSettings.priorityColors.critical}
                                                                     onChange={(e) => updateCardSettings({
                                     priorityColors: {...cardSettings.priorityColors, critical: e.target.value}
                                   })}
                                  className="w-12 h-10 border border-brand-light-gray rounded-lg cursor-pointer"
                                />
                                <span className="text-sm text-brand-gray/70">{cardSettings.priorityColors.critical}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-brand-gray mb-2">
                                Alta
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={cardSettings.priorityColors.high}
                                                                     onChange={(e) => updateCardSettings({
                                     priorityColors: {...cardSettings.priorityColors, high: e.target.value}
                                   })}
                                  className="w-12 h-10 border border-brand-light-gray rounded-lg cursor-pointer"
                                />
                                <span className="text-sm text-brand-gray/70">{cardSettings.priorityColors.high}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-brand-gray mb-2">
                                Normal
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={cardSettings.priorityColors.medium}
                                                                     onChange={(e) => updateCardSettings({
                                     priorityColors: {...cardSettings.priorityColors, medium: e.target.value}
                                   })}
                                  className="w-12 h-10 border border-brand-light-gray rounded-lg cursor-pointer"
                                />
                                <span className="text-sm text-brand-gray/70">{cardSettings.priorityColors.medium}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-brand-gray mb-2">
                                Baixa
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={cardSettings.priorityColors.low}
                                                                     onChange={(e) => updateCardSettings({
                                     priorityColors: {...cardSettings.priorityColors, low: e.target.value}
                                   })}
                                  className="w-12 h-10 border border-brand-light-gray rounded-lg cursor-pointer"
                                />
                                <span className="text-sm text-brand-gray/70">{cardSettings.priorityColors.low}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Preview das Prioridades */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-brand-gray mb-2">
                            Preview das Prioridades
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <span 
                              className="px-3 py-1 text-xs rounded-full text-white font-medium"
                              style={{ backgroundColor: cardSettings.priorityColors.critical }}
                            >
                              Crítica
                            </span>
                            <span 
                              className="px-3 py-1 text-xs rounded-full text-white font-medium"
                              style={{ backgroundColor: cardSettings.priorityColors.high }}
                            >
                              Alta
                            </span>
                            <span 
                              className="px-3 py-1 text-xs rounded-full text-white font-medium"
                              style={{ backgroundColor: cardSettings.priorityColors.medium }}
                            >
                              Normal
                            </span>
                            <span 
                              className="px-3 py-1 text-xs rounded-full text-white font-medium"
                              style={{ backgroundColor: cardSettings.priorityColors.low }}
                            >
                              Baixa
                            </span>
                          </div>
                        </div>
                      </div>

                                           

                                           {/* Seção: Tags Personalizadas */}
                      <div className="bg-brand-light-gray/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-brand-gray mb-4 flex items-center">
                          <span className="w-2 h-2 bg-brand-purple rounded-full mr-3"></span>
                          Tags Personalizadas
                        </h3>
                        
                        {/* Formulário para adicionar/editar tag */}
                        <div className="bg-brand-light-gray/30 rounded-xl p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                              <label className="block text-sm font-medium text-brand-gray mb-2">
                                Nome da Tag
                              </label>
                              <input
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="Ex: Urgente, Bug, Feature"
                                className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                              />
                            </div>



                            <div>
                              <label className="block text-sm font-medium text-brand-gray mb-2">
                                Tipo
                              </label>
                              <select
                                value={newTagType}
                                onChange={(e) => setNewTagType(e.target.value)}
                                className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                              >
                                <option value="priority">Prioridade</option>
                                <option value="category">Categoria</option>
                                <option value="status">Status</option>
                                <option value="custom">Personalizada</option>
                              </select>
                            </div>

                            <div className="flex space-x-2">
                              {editingTagId === null ? (
                                <button
                                  onClick={addCustomTag}
                                  className="flex-1 px-4 py-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark transition-colors flex items-center justify-center space-x-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Adicionar</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={updateCustomTag}
                                    className="flex-1 px-4 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green-dark transition-colors"
                                  >
                                    Atualizar
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="px-4 py-3 border border-brand-light-gray text-brand-gray rounded-xl hover:bg-brand-light-gray/30 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                       {/* Lista de tags personalizadas */}
                       <div className="space-y-2">
                         <label className="block text-sm font-medium text-brand-gray mb-2">
                           Tags Cadastradas ({cardSettings.customTags.length})
                         </label>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                           {cardSettings.customTags.map((tag) => (
                             <div
                               key={tag.id}
                               className="flex items-center justify-between p-3 border border-brand-light-gray rounded-xl hover:bg-brand-light-gray/10 transition-colors"
                             >
                               <div className="flex items-center space-x-3">
                                 <div>
                                   <span className="text-sm font-medium text-brand-gray">{tag.name}</span>
                                   <div className="text-xs text-brand-gray/60 capitalize">{tag.type}</div>
                                 </div>
                               </div>
                               <div className="flex items-center space-x-1">
                                 <button
                                   onClick={() => editCustomTag(tag.id)}
                                   className="p-1 text-brand-blue hover:bg-brand-blue/10 rounded transition-colors"
                                   title="Editar tag"
                                 >
                                   <SettingsIcon className="w-4 h-4" />
                                 </button>
                                 <button
                                   onClick={() => deleteCustomTag(tag.id)}
                                   className="p-1 text-brand-red hover:bg-brand-red/10 rounded transition-colors"
                                   title="Excluir tag"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               </div>
                             </div>
                           ))}
                         </div>
                         
                         {cardSettings.customTags.length === 0 && (
                           <div className="text-center py-8 text-brand-gray/60">
                             <p>Nenhuma tag personalizada cadastrada</p>
                             <p className="text-sm">Adicione tags para organizar melhor seus cards</p>
                           </div>
                         )}
                       </div>

                       {/* Preview das tags personalizadas */}
                       {cardSettings.customTags.length > 0 && (
                         <div className="mt-4">
                           <label className="block text-sm font-medium text-brand-gray mb-2">
                             Preview das Tags Personalizadas
                           </label>
                           <div className="flex flex-wrap gap-2">
                             {cardSettings.customTags.map((tag) => (
                               <span 
                                 key={tag.id}
                                 className="px-3 py-1 text-xs rounded-full bg-brand-light-gray text-brand-gray font-medium"
                               >
                                 {tag.name}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               )}

              {/* Configurações Visuais */}
              {activeTab === 'visual' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-gray dark:text-gray-50 mb-4">Configurações Visuais</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-brand-gray dark:text-gray-50 mb-2">
                            Tema
                          </label>
                          <select
                            value={visualSettings.theme}
                            onChange={(e) => setVisualSettings({...visualSettings, theme: e.target.value as 'light' | 'dark' | 'auto'})}
                            className="w-full p-3 border border-brand-light-gray dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-50"
                          >
                            <option value="light">Claro</option>
                            <option value="dark">Escuro</option>
                            <option value="auto">Automático</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-brand-gray dark:text-gray-50 mb-2">
                            Estilo dos Cards
                          </label>
                          <select
                            value={visualSettings.cardStyle}
                            onChange={(e) => setVisualSettings({...visualSettings, cardStyle: e.target.value})}
                            className="w-full p-3 border border-brand-light-gray dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-50"
                          >
                            <option value="rounded">Arredondado</option>
                            <option value="sharp">Pontiagudo</option>
                            <option value="minimal">Minimalista</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-brand-gray dark:text-gray-50 mb-2">
                            Velocidade das Animações
                          </label>
                          <select
                            value={visualSettings.animationSpeed}
                            onChange={(e) => setVisualSettings({...visualSettings, animationSpeed: e.target.value})}
                            className="w-full p-3 border border-brand-light-gray dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-50"
                          >
                            <option value="slow">Lenta</option>
                            <option value="normal">Normal</option>
                            <option value="fast">Rápida</option>
                            <option value="none">Sem animações</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-brand-gray dark:text-gray-50">Mostrar Avatares</label>
                          </div>
                          <button
                            onClick={() => setVisualSettings({...visualSettings, showAvatars: !visualSettings.showAvatars})}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              visualSettings.showAvatars ? 'bg-brand-red' : 'bg-brand-light-gray dark:bg-gray-600'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              visualSettings.showAvatars ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-brand-gray dark:text-gray-50">Modo Compacto</label>
                          </div>
                          <button
                            onClick={() => setVisualSettings({...visualSettings, compactMode: !visualSettings.compactMode})}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              visualSettings.compactMode ? 'bg-brand-red' : 'bg-brand-light-gray dark:bg-gray-600'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              visualSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-brand-gray dark:text-gray-50">Linhas da Grade</label>
                          </div>
                          <button
                            onClick={() => setVisualSettings({...visualSettings, showGridLines: !visualSettings.showGridLines})}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              visualSettings.showGridLines ? 'bg-brand-red' : 'bg-brand-light-gray'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              visualSettings.showGridLines ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configurações de Usuário */}
              {activeTab === 'user' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-gray mb-4">Configurações de Usuário</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-brand-gray mb-2">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={userSettings.name}
                            onChange={(e) => setUserSettings({...userSettings, name: e.target.value})}
                            className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-brand-gray mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={userSettings.email}
                            onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                            className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-brand-gray mb-2">
                            Fuso Horário
                          </label>
                          <select
                            value={userSettings.timezone}
                            onChange={(e) => setUserSettings({...userSettings, timezone: e.target.value})}
                            className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                          >
                            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                            <option value="America/New_York">Nova York (GMT-5)</option>
                            <option value="Europe/London">Londres (GMT+0)</option>
                            <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-brand-gray mb-2">
                            Idioma
                          </label>
                          <select
                            value={userSettings.language}
                            onChange={(e) => setUserSettings({...userSettings, language: e.target.value})}
                            className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                          >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                            <option value="fr-FR">Français</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configurações de Notificações */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-gray mb-4">Configurações de Notificações</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-brand-light-gray rounded-xl">
                        <div>
                          <label className="text-sm font-medium text-brand-gray">Card Atribuído</label>
                          <p className="text-xs text-brand-gray/60">Quando um card for atribuído a você</p>
                        </div>
                        <button
                          onClick={() => setUserSettings({
                            ...userSettings,
                            notifications: {
                              ...userSettings.notifications,
                              cardAssigned: !userSettings.notifications.cardAssigned
                            }
                          })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            userSettings.notifications.cardAssigned ? 'bg-brand-red' : 'bg-brand-light-gray'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            userSettings.notifications.cardAssigned ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-brand-light-gray rounded-xl">
                        <div>
                          <label className="text-sm font-medium text-brand-gray">Lembrete de Data de Vencimento</label>
                          <p className="text-xs text-brand-gray/60">24h antes do vencimento</p>
                        </div>
                        <button
                          onClick={() => setUserSettings({
                            ...userSettings,
                            notifications: {
                              ...userSettings.notifications,
                              dueDateReminder: !userSettings.notifications.dueDateReminder
                            }
                          })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            userSettings.notifications.dueDateReminder ? 'bg-brand-red' : 'bg-brand-light-gray'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            userSettings.notifications.dueDateReminder ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-brand-light-gray rounded-xl">
                        <div>
                          <label className="text-sm font-medium text-brand-gray">Atualizações do Quadro</label>
                          <p className="text-xs text-brand-gray/60">Quando o quadro for modificado</p>
                        </div>
                        <button
                          onClick={() => setUserSettings({
                            ...userSettings,
                            notifications: {
                              ...userSettings.notifications,
                              boardUpdates: !userSettings.notifications.boardUpdates
                            }
                          })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            userSettings.notifications.boardUpdates ? 'bg-brand-red' : 'bg-brand-light-gray'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            userSettings.notifications.boardUpdates ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-brand-light-gray rounded-xl">
                        <div>
                          <label className="text-sm font-medium text-brand-gray">Menções</label>
                          <p className="text-xs text-brand-gray/60">Quando você for mencionado em comentários</p>
                        </div>
                        <button
                          onClick={() => setUserSettings({
                            ...userSettings,
                            notifications: {
                              ...userSettings.notifications,
                              mentions: !userSettings.notifications.mentions
                            }
                          })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            userSettings.notifications.mentions ? 'bg-brand-red' : 'bg-brand-light-gray'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            userSettings.notifications.mentions ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gerenciamento de Usuários */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-brand-gray">Gerenciamento de Usuários</h2>
                      <button
                        onClick={() => {
                          setNewUser({
                            username: '',
                            email: '',
                            password: '',
                            role: 'user',
                            cargo: '',
                            is_active: true
                          });
                          setShowCreateUserModal(true);
                        }}
                        className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Novo Usuário</span>
                      </button>
                    </div>

                    <div className="bg-white rounded-xl border border-brand-light-gray overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-brand-light-gray/30">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                                Usuário
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                                Cargo
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                                Função
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-brand-light-gray">
                            {users.map((user) => (
                              <tr key={user.id} className="hover:bg-brand-light-gray/10">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-brand-red/10 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-brand-red">
                                        {user.username.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-brand-gray">
                                        {user.username}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray">
                                  {user.cargo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {user.is_active ? 'Ativo' : 'Inativo'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setShowEditUserModal(true);
                                      }}
                                      className="text-brand-blue hover:text-brand-blue-dark"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="text-brand-red hover:text-brand-red-dark"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configurações de Segurança */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-gray mb-4">Configurações de Segurança</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 border border-brand-light-gray rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-brand-gray">Autenticação de Dois Fatores</h3>
                            <p className="text-sm text-brand-gray/60">Adicione uma camada extra de segurança</p>
                          </div>
                          <button className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors">
                            Configurar
                          </button>
                        </div>
                      </div>

                      <div className="p-4 border border-brand-light-gray rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-brand-gray">Sessões Ativas</h3>
                            <p className="text-sm text-brand-gray/60">Gerencie suas sessões de login</p>
                          </div>
                          <button className="px-4 py-2 border border-brand-light-gray text-brand-gray rounded-lg hover:bg-brand-light-gray/30 transition-colors">
                            Ver Sessões
                          </button>
                        </div>
                      </div>

                      <div className="p-4 border border-brand-light-gray rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-brand-gray">Alterar Senha</h3>
                            <p className="text-sm text-brand-gray/60">Atualize sua senha regularmente</p>
                          </div>
                          <button className="px-4 py-2 border border-brand-light-gray text-brand-gray rounded-lg hover:bg-brand-light-gray/30 transition-colors">
                            Alterar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configurações de Dados */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-gray mb-4">Gerenciamento de Dados</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-brand-light-gray rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <Download className="w-5 h-5 text-brand-blue" />
                          <h3 className="font-medium text-brand-gray">Exportar Dados</h3>
                        </div>
                        <p className="text-sm text-brand-gray/60 mb-4">
                          Faça backup de todos os seus quadros, cards e configurações
                        </p>
                        <button
                          onClick={() => setShowExportModal(true)}
                          className="w-full px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                        >
                          Exportar
                        </button>
                      </div>

                      <div className="p-4 border border-brand-light-gray rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <Upload className="w-5 h-5 text-brand-green" />
                          <h3 className="font-medium text-brand-gray">Importar Dados</h3>
                        </div>
                        <p className="text-sm text-brand-gray/60 mb-4">
                          Restaure dados de um backup anterior
                        </p>
                        <button
                          onClick={() => setShowImportModal(true)}
                          className="w-full px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
                        >
                          Importar
                        </button>
                      </div>

                      <div className="p-4 border border-brand-light-gray rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <Trash2 className="w-5 h-5 text-brand-red" />
                          <h3 className="font-medium text-brand-gray">Excluir Conta</h3>
                        </div>
                        <p className="text-sm text-brand-gray/60 mb-4">
                          Exclua permanentemente sua conta e todos os dados
                        </p>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors"
                        >
                          Excluir Conta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Exportação */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-brand-gray">Exportar Dados</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-brand-gray/60">
                  Todos os seus dados serão exportados em formato JSON, incluindo:
                </p>
                <ul className="text-sm text-brand-gray/60 space-y-1">
                  <li>• Todos os quadros e cards</li>
                  <li>• Configurações personalizadas</li>
                  <li>• Templates criados</li>
                  <li>• Histórico de atividades</li>
                </ul>
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExportData}
                    className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                  >
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-gray">Excluir Conta</h3>
                  <p className="text-sm text-brand-gray/60">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-brand-gray/60">
                  Tem certeza que deseja excluir sua conta? Todos os dados serão perdidos permanentemente.
                </p>
                
                <div className="p-3 bg-brand-red/5 border border-brand-red/20 rounded-lg">
                  <p className="text-sm text-brand-red">
                    <strong>Atenção:</strong> Esta ação excluirá todos os seus quadros, cards, configurações e dados pessoais.
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      showSuccessPopup(
                        'Funcionalidade em Desenvolvimento',
                        'A funcionalidade de exclusão de conta será implementada em breve.'
                      );
                      setShowDeleteModal(false);
                    }}
                    className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors"
                  >
                    Excluir Conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Usuário */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-gray">Criar Novo Usuário</h2>
                <button
                  onClick={() => setShowCreateUserModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Nome de Usuário *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Digite o nome de usuário"
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Digite o email"
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Senha *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Digite a senha"
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Cargo</label>
                  <input
                    type="text"
                    value={newUser.cargo}
                    onChange={(e) => setNewUser({...newUser, cargo: e.target.value})}
                    placeholder="Digite o cargo"
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Função</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'manager' | 'user'})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    <option value="user">Usuário</option>
                    <option value="manager">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={newUser.is_active}
                    onChange={(e) => setNewUser({...newUser, is_active: e.target.checked})}
                    className="w-4 h-4 text-brand-red border-brand-light-gray rounded focus:ring-brand-red"
                  />
                  <label htmlFor="is_active" className="text-sm text-brand-gray">
                    Usuário ativo
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 border border-brand-light-gray text-brand-gray rounded-lg hover:bg-brand-light-gray/30 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors"
                >
                  Criar Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-gray">Editar Usuário</h2>
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Nome de Usuário</label>
                  <input
                    type="text"
                    value={selectedUser.username}
                    onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Cargo</label>
                  <input
                    type="text"
                    value={selectedUser.cargo}
                    onChange={(e) => setSelectedUser({...selectedUser, cargo: e.target.value})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Função</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as 'admin' | 'manager' | 'user'})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    <option value="user">Usuário</option>
                    <option value="manager">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={selectedUser.is_active}
                    onChange={(e) => setSelectedUser({...selectedUser, is_active: e.target.checked})}
                    className="w-4 h-4 text-brand-red border-brand-light-gray rounded focus:ring-brand-red"
                  />
                  <label htmlFor="edit_is_active" className="text-sm text-brand-gray">
                    Usuário ativo
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 border border-brand-light-gray text-brand-gray rounded-lg hover:bg-brand-light-gray/30 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditUser}
                  className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

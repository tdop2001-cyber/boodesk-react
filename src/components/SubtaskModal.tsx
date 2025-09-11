import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../services/database';
import {
  X,
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Edit3,
  Trash2,
  Save,
  Users,
  FileText,
  Target,
  Flag,
  Timer,
  Star,
  Zap,
  Shield,
  TrendingUp,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';

interface SubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtask?: any;
  onUpdate?: (updatedSubtask: any) => void;
  onDelete?: (subtaskId: string) => void;
  onSubmit?: (data: any) => Promise<void>;
  cardId?: number;
  currentUserId?: number;
  cardMembers?: string[];
}

const SubtaskModal: React.FC<SubtaskModalProps> = ({
  isOpen,
  onClose,
  subtask,
  onUpdate,
  onDelete,
  onSubmit,
  cardId,
  currentUserId,
  cardMembers
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubtask, setEditedSubtask] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [newSubtaskMembers, setNewSubtaskMembers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Determinar se é modo de criação ou edição
  const isCreateMode = !subtask && onSubmit;

  // Inicializar dados editáveis quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      if (subtask) {
        // Modo de edição - carregar dados completos do banco
        loadSubtaskDetails();
        setIsEditing(false);
      } else if (isCreateMode) {
        // Modo de criação
        setEditedSubtask({
          title: '',
          description: '',
          priority: 'medium',
          status: 'pending',
          due_date: '',
          estimated_time: '',
          actual_time: '',
          tags: [],
          category: '',
          importance: 'normal'
        });
        setNewSubtaskMembers(cardMembers || []);
        setIsEditing(true);
      }
    }
  }, [isOpen, subtask, isCreateMode, cardMembers]);

  // Carregar detalhes completos da subtarefa do banco
  const loadSubtaskDetails = async () => {
    if (!subtask?.id) return;
    
    try {
      setLoading(true);
      // Buscar dados atualizados da subtarefa
      const subtaskData = await db.getSubtaskById(subtask.id);
      
      if (subtaskData) {
        setEditedSubtask({
          title: subtaskData.title || '',
          description: subtaskData.description || '',
          priority: subtaskData.priority || 'medium',
          status: subtaskData.status || 'pending',
          due_date: subtaskData.due_date || '',
          estimated_time: subtaskData.estimated_time || '',
          actual_time: subtaskData.actual_time || '',
          tags: subtaskData.tags || [],
          category: subtaskData.category || '',
          importance: subtaskData.importance || 'normal',
          created_at: subtaskData.created_at,
          updated_at: subtaskData.updated_at
        });
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da subtarefa:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar',
        message: 'Não foi possível carregar os detalhes da subtarefa.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar membros da subtarefa
  useEffect(() => {
    if (isOpen && subtask?.members) {
      loadMembers();
    }
  }, [isOpen, subtask]);

  // Carregar usuários no modo de criação
  useEffect(() => {
    if (isOpen && isCreateMode) {
      loadUsers();
    }
  }, [isOpen, isCreateMode]);

  const loadMembers = async () => {
    try {
      if (subtask.members && subtask.members.length > 0) {
        const membersData = await db.getUsersByIds(subtask.members);
        setMembers(membersData);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await db.getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isCreateMode && onSubmit) {
        // Modo de criação
        const data = {
          ...editedSubtask,
          members: newSubtaskMembers
        };
        await onSubmit(data);
        onClose();
      } else if (subtask?.id) {
        // Modo de edição
        const success = await db.updateSubtask(subtask.id, editedSubtask);
        
        if (success) {
          addToast({
            type: 'success',
            title: 'Subtarefa atualizada',
            message: 'As informações da subtarefa foram salvas com sucesso!'
          });
          
          setIsEditing(false);
          onUpdate?.(editedSubtask);
        } else {
          addToast({
            type: 'error',
            title: 'Erro ao atualizar',
            message: 'Não foi possível salvar as alterações.'
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar subtarefa:', error);
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Ocorreu um erro ao salvar as alterações.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!subtask?.id) return;

    const confirmed = window.confirm('Tem certeza que deseja excluir esta subtarefa?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const success = await db.deleteSubtask(subtask.id);
      
      if (success) {
        addToast({
          type: 'success',
          title: 'Subtarefa excluída',
          message: 'A subtarefa foi removida com sucesso!'
        });
        
        onDelete?.(subtask.id);
        onClose();
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao excluir',
          message: 'Não foi possível excluir a subtarefa.'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir subtarefa:', error);
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        message: 'Ocorreu um erro ao excluir a subtarefa.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções de formatação
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatDateOnly = (dateString: string | undefined | null): string => {
    if (!dateString) return 'Sem data definida';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Funções de estilo
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': return { 
        color: 'text-red-600 bg-red-50 border-red-200', 
        icon: AlertCircle, 
        label: 'Alta' 
      };
      case 'medium': return { 
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
        icon: Flag, 
        label: 'Média' 
      };
      case 'low': return { 
        color: 'text-green-600 bg-green-50 border-green-200', 
        icon: CheckCircle, 
        label: 'Baixa' 
      };
      default: return { 
        color: 'text-gray-600 bg-gray-50 border-gray-200', 
        icon: Flag, 
        label: 'Normal' 
      };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { 
        color: 'text-green-600 bg-green-50 border-green-200', 
        icon: CheckCircle, 
        label: 'Concluída' 
      };
      case 'in_progress': return { 
        color: 'text-blue-600 bg-blue-50 border-blue-200', 
        icon: Timer, 
        label: 'Em Progresso' 
      };
      case 'pending': return { 
        color: 'text-gray-600 bg-gray-50 border-gray-200', 
        icon: Clock, 
        label: 'Pendente' 
      };
      default: return { 
        color: 'text-gray-600 bg-gray-50 border-gray-200', 
        icon: Clock, 
        label: 'Pendente' 
      };
    }
  };

  const getImportanceConfig = (importance: string) => {
    switch (importance) {
      case 'critical': return { 
        color: 'text-red-600 bg-red-50 border-red-200', 
        icon: AlertCircle, 
        label: 'Crítica' 
      };
      case 'high': return { 
        color: 'text-orange-600 bg-orange-50 border-orange-200', 
        icon: TrendingUp, 
        label: 'Alta' 
      };
      case 'normal': return { 
        color: 'text-blue-600 bg-blue-50 border-blue-200', 
        icon: Star, 
        label: 'Normal' 
      };
      case 'low': return { 
        color: 'text-gray-600 bg-gray-50 border-gray-200', 
        icon: Shield, 
        label: 'Baixa' 
      };
      default: return { 
        color: 'text-gray-600 bg-gray-50 border-gray-200', 
        icon: Star, 
        label: 'Normal' 
      };
    }
  };

  if (!isOpen) return null;

  const priorityConfig = getPriorityConfig(editedSubtask.priority || 'medium');
  const statusConfig = getStatusConfig(editedSubtask.status || 'pending');
  const importanceConfig = getImportanceConfig(editedSubtask.importance || 'normal');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header Moderno */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isCreateMode ? 'Criar Nova Subtarefa' : isEditing ? 'Editar Subtarefa' : 'Detalhes da Subtarefa'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isCreateMode ? 'Adicione uma nova subtarefa ao projeto' : 'Gerencie os detalhes da subtarefa'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && !isCreateMode && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                  title="Editar subtarefa"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Título */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Título da Subtarefa
                </label>
                {(isEditing || isCreateMode) ? (
                  <input
                    type="text"
                    value={editedSubtask.title}
                    onChange={(e) => setEditedSubtask({...editedSubtask, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                    placeholder="Digite o título da subtarefa..."
                  />
                ) : (
                  <h3 className="text-xl font-bold text-gray-900">{editedSubtask.title || 'Sem título'}</h3>
                )}
              </div>

              {/* Descrição */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Descrição
                </label>
                {(isEditing || isCreateMode) ? (
                  <textarea
                    value={editedSubtask.description}
                    onChange={(e) => setEditedSubtask({...editedSubtask, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Descreva os detalhes da subtarefa..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {editedSubtask.description || 'Sem descrição'}
                  </p>
                )}
              </div>

              {/* Status e Prioridade - Layout em Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <statusConfig.icon className="w-4 h-4 inline mr-2" />
                    Status
                  </label>
                  {(isEditing || isCreateMode) ? (
                    <select
                      value={editedSubtask.status}
                      onChange={(e) => setEditedSubtask({...editedSubtask, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em Progresso</option>
                      <option value="completed">Concluída</option>
                    </select>
                  ) : (
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                      <statusConfig.icon className="w-4 h-4 mr-2" />
                      {statusConfig.label}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <priorityConfig.icon className="w-4 h-4 inline mr-2" />
                    Prioridade
                  </label>
                  {(isEditing || isCreateMode) ? (
                    <select
                      value={editedSubtask.priority}
                      onChange={(e) => setEditedSubtask({...editedSubtask, priority: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  ) : (
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${priorityConfig.color}`}>
                      <priorityConfig.icon className="w-4 h-4 mr-2" />
                      {priorityConfig.label}
                    </div>
                  )}
                </div>
              </div>

              {/* Importância e Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <importanceConfig.icon className="w-4 h-4 inline mr-2" />
                    Importância
                  </label>
                  {(isEditing || isCreateMode) ? (
                    <select
                      value={editedSubtask.importance}
                      onChange={(e) => setEditedSubtask({...editedSubtask, importance: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  ) : (
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${importanceConfig.color}`}>
                      <importanceConfig.icon className="w-4 h-4 mr-2" />
                      {importanceConfig.label}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Categoria
                  </label>
                  {(isEditing || isCreateMode) ? (
                    <input
                      type="text"
                      value={editedSubtask.category}
                      onChange={(e) => setEditedSubtask({...editedSubtask, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Frontend, Backend, Design..."
                    />
                  ) : (
                    <p className="text-gray-700 font-medium">{editedSubtask.category || 'Sem categoria'}</p>
                  )}
                </div>
              </div>

              {/* Datas e Tempos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Data de Vencimento
                  </label>
                  {(isEditing || isCreateMode) ? (
                    <input
                      type="date"
                      value={editedSubtask.due_date}
                      onChange={(e) => setEditedSubtask({...editedSubtask, due_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-700 font-medium">
                      {formatDateOnly(editedSubtask.due_date)}
                    </p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Timer className="w-4 h-4 inline mr-2" />
                    Tempo Estimado
                  </label>
                  {(isEditing || isCreateMode) ? (
                    <input
                      type="text"
                      value={editedSubtask.estimated_time}
                      onChange={(e) => setEditedSubtask({...editedSubtask, estimated_time: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 2h, 30min, 120min"
                    />
                  ) : (
                    <p className="text-gray-700 font-medium">{editedSubtask.estimated_time || 'Não definido'}</p>
                  )}
                </div>
              </div>

              {/* Tempo Real */}
              {editedSubtask.actual_time && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Tempo Real
                  </label>
                  <p className="text-gray-700 font-medium">{editedSubtask.actual_time}</p>
                </div>
              )}

              {/* Membros */}
              {members.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />
                    Membros da Subtarefa
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 bg-blue-50 rounded-full px-4 py-2 border border-blue-200">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {(member.nome_completo || member.username || member.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {member.nome_completo || member.username || member.email}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seleção de Membros - Modo de Criação */}
              {isCreateMode && allUsers.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />
                    Membros da Subtarefa
                  </label>
                  <div className="space-y-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {allUsers.map((user) => (
                      <label key={user.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={newSubtaskMembers.includes(user.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSubtaskMembers([...newSubtaskMembers, user.id.toString()]);
                            } else {
                              setNewSubtaskMembers(newSubtaskMembers.filter(id => id !== user.id.toString()));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {(user.nome_completo || user.username || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.nome_completo || user.username || user.email}
                            </div>
                            <div className="text-xs text-gray-500">{user.cargo || 'Sem cargo'}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selecione os membros que terão acesso a esta subtarefa. Se nenhum for selecionado, apenas você terá acesso.
                  </p>
                </div>
              )}

              {/* Informações de Criação */}
              {!isCreateMode && editedSubtask && (
                <div className="bg-gray-50 rounded-xl p-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Criado em:</span>
                      <p className="text-gray-600 mt-1">{formatDate(editedSubtask.created_at)}</p>
                    </div>
                    {editedSubtask.updated_at && (
                      <div>
                        <span className="font-semibold text-gray-700">Atualizado em:</span>
                        <p className="text-gray-600 mt-1">{formatDate(editedSubtask.updated_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Moderno */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            {!isEditing && !isCreateMode && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {(isEditing || isCreateMode) && (
              <>
                <button
                  onClick={() => {
                    if (isCreateMode) {
                      onClose();
                    } else {
                      setIsEditing(false);
                    }
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? (isCreateMode ? 'Criando...' : 'Salvando...') : (isCreateMode ? 'Criar Subtarefa' : 'Salvar Alterações')}</span>
                </button>
              </>
            )}
            {!isEditing && !isCreateMode && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtaskModal;
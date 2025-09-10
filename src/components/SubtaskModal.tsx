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
  Timer
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
  
  // Determinar se é modo de criação ou edição
  const isCreateMode = !subtask && onSubmit;

  // Inicializar dados editáveis quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      if (subtask) {
        // Modo de edição
        setEditedSubtask({
          title: subtask.title || '',
          description: subtask.description || '',
          priority: subtask.priority || 'medium',
          status: subtask.status || 'pending',
          due_date: subtask.due_date || '',
          estimated_time: subtask.estimated_time || '',
          actual_time: subtask.actual_time || '',
          tags: subtask.tags || [],
          category: subtask.category || '',
          importance: subtask.importance || 'normal'
        });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Progresso';
      case 'pending': return 'Pendente';
      default: return 'Pendente';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImportanceText = (importance: string) => {
    switch (importance) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  if (!isOpen || !subtask) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isCreateMode ? 'Criar Nova Subtarefa' : isEditing ? 'Editar Subtarefa' : 'Detalhes da Subtarefa'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && !isCreateMode && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Editar subtarefa"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              {(isEditing || isCreateMode) ? (
                <input
                  type="text"
                  value={editedSubtask.title}
                  onChange={(e) => setEditedSubtask({...editedSubtask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título da subtarefa"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{subtask.title}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              {(isEditing || isCreateMode) ? (
                <textarea
                  value={editedSubtask.description}
                  onChange={(e) => setEditedSubtask({...editedSubtask, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição da subtarefa"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {subtask.description || 'Sem descrição'}
                </p>
              )}
            </div>

            {/* Status e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                {(isEditing || isCreateMode) ? (
                  <select
                    value={editedSubtask.status}
                    onChange={(e) => setEditedSubtask({...editedSubtask, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="completed">Concluída</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subtask.status)}`}>
                    {getStatusText(subtask.status)}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                {(isEditing || isCreateMode) ? (
                  <select
                    value={editedSubtask.priority}
                    onChange={(e) => setEditedSubtask({...editedSubtask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(subtask.priority)}`}>
                    {getPriorityText(subtask.priority)}
                  </span>
                )}
              </div>
            </div>

            {/* Importância e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importância
                </label>
                {(isEditing || isCreateMode) ? (
                  <select
                    value={editedSubtask.importance}
                    onChange={(e) => setEditedSubtask({...editedSubtask, importance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImportanceColor(subtask.importance)}`}>
                    {getImportanceText(subtask.importance)}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                {(isEditing || isCreateMode) ? (
                  <input
                    type="text"
                    value={editedSubtask.category}
                    onChange={(e) => setEditedSubtask({...editedSubtask, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Categoria"
                  />
                ) : (
                  <p className="text-gray-700">{subtask.category || 'Sem categoria'}</p>
                )}
              </div>
            </div>

            {/* Datas e Tempos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data de Vencimento
                </label>
                {(isEditing || isCreateMode) ? (
                  <input
                    type="date"
                    value={editedSubtask.due_date}
                    onChange={(e) => setEditedSubtask({...editedSubtask, due_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">
                    {subtask.due_date ? new Date(subtask.due_date).toLocaleDateString('pt-BR') : 'Sem data definida'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Timer className="w-4 h-4 inline mr-1" />
                  Tempo Estimado
                </label>
                {(isEditing || isCreateMode) ? (
                  <input
                    type="text"
                    value={editedSubtask.estimated_time}
                    onChange={(e) => setEditedSubtask({...editedSubtask, estimated_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 2h, 30min"
                  />
                ) : (
                  <p className="text-gray-700">{subtask.estimated_time || 'Não definido'}</p>
                )}
              </div>
            </div>

            {/* Tempo Real */}
            {subtask.actual_time && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Tempo Real
                </label>
                <p className="text-gray-700">{subtask.actual_time}</p>
              </div>
            )}

            {/* Membros */}
            {members.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Membros
                </label>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {(member.nome_completo || member.username || member.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700">
                        {member.nome_completo || member.username || member.email}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seleção de Membros - Modo de Criação */}
            {isCreateMode && allUsers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Membros da Subtarefa
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {allUsers.map((user) => (
                    <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {(user.nome_completo || user.username || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">
                          {user.nome_completo || user.username || user.email}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {subtask.tags && subtask.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {subtask.tags.map((tag: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Informações de Criação */}
            {!isCreateMode && subtask && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Criado em:</span>
                    <p>{new Date(subtask.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  {subtask.updated_at && (
                    <div>
                      <span className="font-medium">Atualizado em:</span>
                      <p>{new Date(subtask.updated_at).toLocaleString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            {!isEditing && !isCreateMode && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
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
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? (isCreateMode ? 'Criando...' : 'Salvando...') : (isCreateMode ? 'Criar' : 'Salvar')}</span>
                </button>
              </>
            )}
            {!isEditing && !isCreateMode && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-md transition-colors"
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
import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Flag,
  MessageSquare,
  Paperclip,
  AlertCircle,
  Star,
  Target,
  Users,
  Tag,
  Kanban
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { db } from '../services/database';
import { useAuth } from '../contexts/AuthContext';


// Interface compatível com o banco de dados
export interface Subtask {
  id: string | number;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  // Novos campos
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  description?: string;
  tags?: string[];
  estimatedTime?: number; // em minutos
  actualTime?: number; // em minutos
  attachments?: string[];
  comments?: SubtaskComment[];
  importance?: 'low' | 'normal' | 'high' | 'critical';
  category?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  members?: number[]; // IDs dos usuários membros da subtarefa
  // Campos do banco
  card_id?: string;
  status?: string;
  due_date?: string;
  estimated_time?: string;
  actual_time?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface SubtaskComment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

interface SubtaskManagerProps {
  subtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  cardId?: number; // ID do card para salvar no banco
  showSubtasks?: boolean; // Controla se deve mostrar as subtarefas ou apenas detalhes
}

const SubtaskManager: React.FC<SubtaskManagerProps> = ({
  subtasks,
  onSubtasksChange,
  isExpanded = false,
  onToggleExpanded,
  cardId,
  showSubtasks = true
}) => {
  const { addToast } = useToast();
  const { getPriorityColor, getPriorityTextColor } = useSettings();
  const { user } = useAuth();

  const getPriorityLabel = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Normal';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [showKanban, setShowKanban] = useState(false);
  const [selectedSubtaskForKanban, setSelectedSubtaskForKanban] = useState<Subtask | null>(null);
  const [showInlineKanban, setShowInlineKanban] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  // Estados para criação/edição detalhada
  const [detailForm, setDetailForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    importance: 'normal' as 'low' | 'normal' | 'high' | 'critical',
    category: '',
    estimatedTime: '',
    tags: [] as string[],
    recurrence: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    members: [] as number[]
  });

  // Carregar usuários disponíveis
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await db.getUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };
    loadUsers();
  }, []);

  const completedCount = subtasks.filter(subtask => subtask.completed).length;
  const totalCount = subtasks.length;

  // Salvar subtarefa no banco de dados
  const saveSubtaskToDatabase = async (subtaskData: Partial<Subtask>): Promise<Subtask | null> => {
    console.log('=== SUBTASKMANAGER: saveSubtaskToDatabase ===');
    console.log('cardId:', cardId);
    console.log('subtaskData recebido:', subtaskData);
    console.log('user:', user);
    
    if (!cardId || typeof cardId !== 'number') {
      console.error('Card ID não fornecido ou inválido para salvar subtarefa:', cardId);
      return null;
    }

    try {
      const newSubtaskData = {
        card_id: cardId,
        title: subtaskData.title || '',
        description: subtaskData.description || 'Sem descrição',
        priority: subtaskData.priority || 'medium',
        due_date: subtaskData.dueDate || undefined,
        members: [user?.id?.toString() || '1'],
        created_by: user?.id || 1
      };

      console.log('newSubtaskData a ser enviado:', newSubtaskData);
      
      // Validar campos obrigatórios
      if (!newSubtaskData.title || !newSubtaskData.card_id || !newSubtaskData.description) {
        console.error('Campos obrigatórios não preenchidos:', {
          title: newSubtaskData.title,
          card_id: newSubtaskData.card_id,
          description: newSubtaskData.description
        });
        return null;
      }
      
      const savedSubtask = await db.createSubtask(newSubtaskData);
      
      // Converter para o formato local
      if (savedSubtask) {
        return {
          id: savedSubtask.id,
          title: savedSubtask.title,
          completed: savedSubtask.completed,
          createdAt: new Date(savedSubtask.created_at),
          description: savedSubtask.description,
          priority: savedSubtask.priority as 'low' | 'medium' | 'high',
          importance: savedSubtask.importance as 'low' | 'normal' | 'high' | 'critical',
          category: savedSubtask.category,
          dueDate: savedSubtask.due_date || undefined,
          estimatedTime: savedSubtask.estimated_time ? parseInt(savedSubtask.estimated_time) : undefined,
          actualTime: savedSubtask.actual_time ? parseInt(savedSubtask.actual_time) : undefined,
          tags: savedSubtask.tags || [],
          card_id: savedSubtask.card_id,
          status: savedSubtask.status,
          due_date: savedSubtask.due_date || undefined,
          estimated_time: savedSubtask.estimated_time,
          actual_time: savedSubtask.actual_time,
          user_id: savedSubtask.user_id,
          created_at: savedSubtask.created_at,
          updated_at: savedSubtask.updated_at
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao salvar subtarefa no banco:', error);
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar a subtarefa no banco de dados.'
      });
      return null;
    }
  };

  const addSubtask = async () => {
    if (!newSubtaskTitle.trim()) {
      addToast({
        type: 'warning',
        title: 'Título obrigatório',
        message: 'Digite um título para a subtarefa'
      });
      return;
    }

    const newSubtask: Subtask = {
      id: `temp-${Date.now()}`, // ID temporário
      title: newSubtaskTitle.trim(),
      completed: false,
      createdAt: new Date()
    };

    // Adicionar ao estado local primeiro
    onSubtasksChange([...subtasks, newSubtask]);
    setNewSubtaskTitle('');

    // Salvar no banco de dados
    if (cardId) {
      const savedSubtask = await saveSubtaskToDatabase(newSubtask);
      if (savedSubtask) {
        // Atualizar o ID temporário com o ID real do banco
        const updatedSubtasks = subtasks.map(subtask => 
          subtask.id === newSubtask.id ? { ...subtask, id: savedSubtask.id } : subtask
        );
        onSubtasksChange(updatedSubtasks);
        
        addToast({
          type: 'success',
          title: 'Subtarefa criada',
          message: 'Nova subtarefa criada e salva com sucesso!'
        });
      }
    } else {
      addToast({
        type: 'success',
        title: 'Subtarefa adicionada',
        message: 'Nova subtarefa criada com sucesso'
      });
    }
  };

  const addDetailedSubtask = async () => {
    if (!detailForm.title.trim()) {
      addToast({
        type: 'warning',
        title: 'Título obrigatório',
        message: 'Digite um título para a subtarefa'
      });
      return;
    }

    const newSubtask: Subtask = {
      id: `temp-${Date.now()}`, // ID temporário
      title: detailForm.title.trim(),
      description: detailForm.description,
      completed: false,
      createdAt: new Date(),
      dueDate: detailForm.dueDate || undefined,
      priority: detailForm.priority,
      assignedTo: detailForm.assignedTo || undefined,
      importance: detailForm.importance,
      category: detailForm.category || undefined,
      estimatedTime: detailForm.estimatedTime ? parseInt(detailForm.estimatedTime) : undefined,
      tags: detailForm.tags,
      members: detailForm.members,
      recurrence: detailForm.recurrence,
      attachments: [],
      comments: []
    };

    // Adicionar ao estado local primeiro
    onSubtasksChange([...subtasks, newSubtask]);
    resetDetailForm();
    setShowDetailModal(null);

    // Salvar no banco de dados
    if (cardId) {
      const savedSubtask = await saveSubtaskToDatabase(newSubtask);
      if (savedSubtask) {
        // Atualizar o ID temporário com o ID real do banco
        const updatedSubtasks = subtasks.map(subtask => 
          subtask.id === newSubtask.id ? { ...subtask, id: savedSubtask.id } : subtask
        );
        onSubtasksChange(updatedSubtasks);
        
        addToast({
          type: 'success',
          title: 'Subtarefa detalhada criada',
          message: 'Nova subtarefa com todas as informações foi criada e salva!'
        });
      }
    } else {
      addToast({
        type: 'success',
        title: 'Subtarefa detalhada criada',
        message: 'Nova subtarefa com todas as informações foi criada'
      });
    }
  };

  const resetDetailForm = () => {
    setDetailForm({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      assignedTo: '',
      importance: 'normal',
      category: '',
      estimatedTime: '',
      tags: [],
      recurrence: 'none',
      members: []
    });
  };

  const openDetailModal = (subtask?: Subtask) => {
    if (subtask) {
      setSelectedSubtask(subtask);
      setDetailForm({
        title: subtask.title,
        description: subtask.description || '',
        dueDate: subtask.dueDate || '',
        priority: subtask.priority || 'medium',
        assignedTo: subtask.assignedTo || '',
        importance: subtask.importance || 'normal',
        category: subtask.category || '',
        estimatedTime: subtask.estimatedTime?.toString() || '',
        tags: subtask.tags || [],
        recurrence: subtask.recurrence || 'none',
        members: subtask.members || []
      });
    } else {
      setSelectedSubtask(null);
      resetDetailForm();
    }
    setShowDetailModal('detail');
  };

  const saveSubtaskDetails = async () => {
    if (!selectedSubtask) return;

    const updatedSubtask: Subtask = {
      ...selectedSubtask,
      title: detailForm.title,
      description: detailForm.description,
      dueDate: detailForm.dueDate || undefined,
      priority: detailForm.priority,
      assignedTo: detailForm.assignedTo || undefined,
      importance: detailForm.importance,
      category: detailForm.category || undefined,
      estimatedTime: detailForm.estimatedTime ? parseInt(detailForm.estimatedTime) : undefined,
      tags: detailForm.tags,
      members: detailForm.members,
      recurrence: detailForm.recurrence,
      updated_at: new Date().toISOString()
    };

    // Salvar no banco de dados
    if (cardId && typeof selectedSubtask.id === 'number') {
      const updateData = {
        title: updatedSubtask.title,
        description: updatedSubtask.description,
        due_date: updatedSubtask.dueDate,
        priority: updatedSubtask.priority,
        importance: updatedSubtask.importance,
        category: updatedSubtask.category,
        estimated_time: updatedSubtask.estimatedTime?.toString(),
        tags: updatedSubtask.tags,
        updated_at: updatedSubtask.updated_at
      };

      const success = await db.updateSubtask(selectedSubtask.id, updateData);
      if (success) {
        const updatedSubtasks = subtasks.map(subtask => 
          subtask.id === selectedSubtask.id ? updatedSubtask : subtask
        );
        onSubtasksChange(updatedSubtasks);
        setShowDetailModal(null);
        setSelectedSubtask(null);
        
        addToast({
          type: 'success',
          title: 'Subtarefa atualizada',
          message: 'Detalhes da subtarefa foram salvos no banco de dados'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao salvar',
          message: 'Não foi possível salvar os detalhes no banco de dados'
        });
      }
    } else {
      const updatedSubtasks = subtasks.map(subtask => 
        subtask.id === selectedSubtask.id ? updatedSubtask : subtask
      );
      onSubtasksChange(updatedSubtasks);
      setShowDetailModal(null);
      setSelectedSubtask(null);
      
      addToast({
        type: 'success',
        title: 'Subtarefa atualizada',
        message: 'Detalhes da subtarefa foram salvos com sucesso'
      });
    }
  };

  const toggleSubtask = async (id: string) => {
    try {
      const updatedSubtasks = subtasks.map(subtask => {
        if (subtask.id.toString() === id) {
          const updatedSubtask: Subtask = {
            ...subtask,
            completed: !subtask.completed,
            completedAt: !subtask.completed ? new Date() : undefined
          };

          // Salvar no banco de dados
          if (cardId && typeof subtask.id === 'number') {
            db.updateSubtask(subtask.id, {
              status: updatedSubtask.completed ? 'completed' : 'todo'
            }).catch(error => {
              console.error('Erro ao salvar subtarefa:', error);
              addToast({
                type: 'error',
                title: 'Erro ao salvar',
                message: 'Não foi possível salvar a alteração da subtarefa.'
              });
            });
          }

          return updatedSubtask;
        }
        return subtask;
      });

      onSubtasksChange(updatedSubtasks);
      
      const subtask = subtasks.find(s => s.id.toString() === id);
      if (subtask) {
        addToast({
          type: 'success',
          title: !subtask.completed ? 'Subtarefa concluída' : 'Subtarefa reaberta',
          message: !subtask.completed ? 'Parabéns! Subtarefa marcada como concluída.' : 'Subtarefa reaberta para edição.'
        });
      }
    } catch (error) {
      console.error('Erro ao alternar subtarefa:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível alterar o status da subtarefa.'
      });
    }
  };

  const deleteSubtask = async (id: string) => {
    // Excluir do banco de dados se for um ID numérico
    if (cardId) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        try {
          await db.deleteSubtask(numericId);
        } catch (error) {
          console.error('Erro ao excluir subtarefa do banco:', error);
        }
      }
    }

    // Remover do estado local
    const updatedSubtasks = subtasks.filter(subtask => subtask.id.toString() !== id);
    onSubtasksChange(updatedSubtasks);
    
    addToast({
      type: 'success',
      title: 'Subtarefa excluída',
      message: 'Subtarefa foi removida com sucesso'
    });
  };

  const startEditing = (subtask: Subtask) => {
    setEditingId(subtask.id.toString()); // Ensure it's a string for comparison
    setEditingTitle(subtask.title);
  };

  const saveEdit = async () => {
    if (!editingTitle.trim()) {
      addToast({
        type: 'warning',
        title: 'Título obrigatório',
        message: 'Digite um título para a subtarefa'
      });
      return;
    }

    const updatedSubtask: Subtask = {
      ...subtasks.find(s => s.id.toString() === editingId)!, // Find the original subtask
      title: editingTitle.trim(),
      updated_at: new Date().toISOString()
    };

    // Salvar no banco de dados
    if (cardId && typeof updatedSubtask.id === 'number') {
      const updateData = {
        title: updatedSubtask.title,
        updated_at: updatedSubtask.updated_at
      };

      const success = await db.updateSubtask(updatedSubtask.id, updateData);
      if (success) {
        const updatedSubtasks = subtasks.map(subtask => 
          subtask.id === updatedSubtask.id ? updatedSubtask : subtask
        );
        onSubtasksChange(updatedSubtasks);
        setEditingId(null);
        setEditingTitle('');
        
        addToast({
          type: 'success',
          title: 'Subtarefa atualizada',
          message: 'Título da subtarefa foi atualizado no banco de dados'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao salvar',
          message: 'Não foi possível salvar a alteração no banco de dados'
        });
      }
    } else {
      const updatedSubtasks = subtasks.map(subtask => 
        subtask.id === updatedSubtask.id ? updatedSubtask : subtask
      );
      onSubtasksChange(updatedSubtasks);
      setEditingId(null);
      setEditingTitle('');
      
      addToast({
        type: 'success',
        title: 'Subtarefa atualizada',
        message: 'Título da subtarefa foi atualizado'
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };



  const getImportanceColor = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Função para alternar entre lista e kanban inline
  const toggleInlineKanban = () => {
    setShowInlineKanban(!showInlineKanban);
  };

  // Função para abrir o kanban de uma subtarefa específica
  const openSubtaskKanban = (subtask: Subtask) => {
    setSelectedSubtaskForKanban(subtask);
    setShowKanban(true);
  };

  // Função para fechar o kanban
  const closeSubtaskKanban = () => {
    setShowKanban(false);
    setSelectedSubtaskForKanban(null);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className="p-1 rounded-lg hover:bg-brand-light-gray/30 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-brand-gray" />
              ) : (
                <ChevronRight className="w-4 h-4 text-brand-gray" />
              )}
            </button>
          )}
          <h4 className="text-sm font-medium text-brand-gray">Subtarefas</h4>
          <span className="text-xs text-brand-gray/60">
            {completedCount}/{totalCount} concluídas
          </span>
        </div>
        
        {totalCount > 0 && (
          <div className="w-16 h-2 bg-brand-light-gray rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-green transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        )}
      </div>

      {isExpanded && showSubtasks && (
        <>
          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-brand-gray/60">
                <span>Progresso</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-brand-light-gray rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-green to-brand-blue transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Toggle entre Lista e Kanban */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-brand-light-gray/30 rounded-lg p-1">
              <button
                onClick={() => setShowInlineKanban(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  !showInlineKanban
                    ? 'bg-white text-brand-gray shadow-sm'
                    : 'text-brand-gray/60 hover:text-brand-gray'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setShowInlineKanban(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  showInlineKanban
                    ? 'bg-white text-brand-gray shadow-sm'
                    : 'text-brand-gray/60 hover:text-brand-gray'
                }`}
              >
                Kanban
              </button>
            </div>
            
            {/* Informação sobre o modo Lista */}
            {!showInlineKanban && (
              <div className="text-xs text-brand-gray/60 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                💡 Clique em "Abrir Kanban" em cada subtarefa para gerenciar seu fluxo
              </div>
            )}
            
            {/* Botão para adicionar subtarefa */}
            <button
              onClick={() => openDetailModal()}
              className="flex items-center space-x-2 px-3 py-1.5 bg-brand-blue text-white text-xs rounded-lg hover:bg-brand-blue-dark transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Adicionar</span>
            </button>
          </div>

          {/* Conteúdo baseado no modo de visualização */}
          {!showInlineKanban ? (
            /* Lista de Subtarefas */
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={`flex items-start space-x-3 p-5 rounded-xl border-2 transition-all duration-200 ${
                     subtask.completed 
                       ? 'bg-green-50' 
                       : 'bg-white'
                   }`}
                  style={{
                    borderColor: subtask.completed 
                      ? '#22C55E' // green-500
                      : getPriorityColor(subtask.priority ? subtask.priority : 'medium')
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSubtask(subtask.id.toString())}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors mt-0.5"
                  >
                    {subtask.completed ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5 text-brand-gray/60" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {editingId === subtask.id.toString() ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                        className="w-full p-2 text-sm border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        autoFocus
                      />
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${
                            subtask.completed 
                              ? 'text-green-700 line-through' 
                              : 'text-brand-gray'
                          }`}>
                            {subtask.title}
                          </p>
                          
                          {/* Botão para abrir kanban da subtarefa */}
                          <button
                            onClick={() => openSubtaskKanban(subtask)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
                            title="Abrir Kanban da Subtarefa"
                          >
                            <Kanban className="w-3 h-3" />
                            <span>Abrir Kanban</span>
                          </button>
                        </div>
                        
                        {/* Subtask Details - Layout Organizado */}
                        <div className="mt-3 space-y-3">
                          {/* Primeira linha: Prioridade, Importância e Prazo */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {subtask.priority && (
                                <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  <div 
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: getPriorityColor(subtask.priority) }}
                                  />
                                  {getPriorityLabel(subtask.priority)}
                                </span>
                              )}
                              {subtask.importance && subtask.importance !== 'normal' && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImportanceColor(subtask.importance)}`}>
                                  {subtask.importance}
                                </span>
                              )}
                            </div>
                            {subtask.dueDate && (
                              <div className={`flex items-center gap-1 text-xs ${
                                isOverdue(subtask.dueDate) ? 'text-red-500' : 'text-brand-gray/60'
                              }`}>
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(subtask.dueDate).toLocaleDateString('pt-BR')}</span>
                                {isOverdue(subtask.dueDate) && <AlertCircle className="w-3 h-3" />}
                              </div>
                            )}
                          </div>

                          {/* Segunda linha: Responsável e Tempo */}
                          {(subtask.assignedTo || subtask.estimatedTime) && (
                            <div className="flex items-center justify-between">
                              {subtask.assignedTo && (
                                <div className="flex items-center gap-1 text-xs text-brand-gray/60">
                                  <User className="w-3 h-3" />
                                  <span className="truncate max-w-24">{subtask.assignedTo}</span>
                                </div>
                              )}
                              {subtask.estimatedTime && (
                                <div className="flex items-center gap-1 text-xs text-brand-gray/60">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(subtask.estimatedTime)}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Terceira linha: Categoria e Tags */}
                          {(subtask.category || (subtask.tags && subtask.tags.length > 0)) && (
                            <div className="flex flex-col gap-2">
                              {subtask.category && (
                                <div className="flex items-center gap-1 text-xs text-brand-gray/60">
                                  <Tag className="w-3 h-3" />
                                  <span className="truncate max-w-32">{subtask.category}</span>
                                </div>
                              )}
                              {subtask.tags && subtask.tags.length > 0 && (
                                <div className="text-xs text-brand-gray/60">
                                  <span className="bg-gray-100 px-2 py-1 rounded inline-block">
                                    {subtask.tags.join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Quarta linha: Comentários e Anexos */}
                          {((subtask.comments && subtask.comments.length > 0) || (subtask.attachments && subtask.attachments.length > 0)) && (
                            <div className="flex items-center gap-3 text-xs text-brand-gray/60">
                              {subtask.comments && subtask.comments.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{subtask.comments.length}</span>
                                </div>
                              )}
                              {subtask.attachments && subtask.attachments.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" />
                                  <span>{subtask.attachments.length}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-start space-x-1 mt-0.5">
                    {editingId === subtask.id.toString() ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-1 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Save className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 rounded-lg hover:bg-brand-light-gray/30 transition-colors"
                        >
                          <X className="w-4 h-4 text-brand-gray" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openDetailModal(subtask)}
                          className="p-1 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Editar detalhes"
                        >
                          <Target className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => startEditing(subtask)}
                          className="p-1 rounded-lg hover:bg-brand-light-gray/30 transition-colors"
                          title="Editar título"
                        >
                          <Edit className="w-4 h-4 text-brand-gray/60" />
                        </button>
                        <button
                          onClick={() => deleteSubtask(subtask.id.toString())}
                          className="p-1 rounded-lg hover:bg-red-100 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Kanban Inline */
            <div className="text-center py-8 text-brand-gray/60">
              <Kanban className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Kanban inline não implementado ainda</p>
            </div>
          )}
        </>
      )}

      {/* Quando não mostrar subtarefas, exibir apenas informações básicas */}
      {isExpanded && !showSubtasks && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-brand-gray">Informações das Subtarefas</h4>
            <span className="text-xs text-brand-gray/60 bg-white px-2 py-1 rounded-full">
              {completedCount}/{totalCount} concluídas
            </span>
          </div>
          
          {totalCount > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-brand-gray/60">
                <span>Progresso</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-brand-light-gray rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-green to-brand-blue transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="text-xs text-brand-gray/60 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            💡 As subtarefas são gerenciadas no modo Kanban da lista principal de atividades
          </div>
        </div>
      )}

      {/* Kanban Modal para Subtarefa Específica */}
      {showKanban && selectedSubtaskForKanban && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Kanban className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-brand-gray">
                      Kanban da Subtarefa: {selectedSubtaskForKanban.title}
                    </h3>
                    <p className="text-sm text-brand-gray/60">
                      Gerencie o fluxo de trabalho desta subtarefa
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeSubtaskKanban}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-brand-gray">
                  {selectedSubtask ? 'Editar Subtarefa' : 'Nova Subtarefa Detalhada'}
                </h3>
                <button
                  onClick={() => setShowDetailModal(null)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Título *</label>
                  <input
                    type="text"
                    value={detailForm.title}
                    onChange={(e) => setDetailForm({...detailForm, title: e.target.value})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="Digite o título da subtarefa"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Descrição</label>
                  <textarea
                    value={detailForm.description}
                    onChange={(e) => setDetailForm({...detailForm, description: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="Descreva a subtarefa..."
                  />
                </div>

                {/* Due Date and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Prazo</label>
                    <input
                      type="date"
                      value={detailForm.dueDate}
                      onChange={(e) => setDetailForm({...detailForm, dueDate: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Prioridade</label>
                    <select
                      value={detailForm.priority}
                      onChange={(e) => setDetailForm({...detailForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>

                {/* Assigned To and Importance */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Delegar para</label>
                    <select
                      value={detailForm.assignedTo}
                      onChange={(e) => setDetailForm({...detailForm, assignedTo: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green"
                    >
                      <option value="">Selecionar responsável...</option>
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.username}>
                          {user.username} - {user.cargo || 'Sem cargo'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seleção de Membros */}
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Membros (opcional)</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-brand-light-gray rounded-xl p-3">
                      {availableUsers.map((user) => (
                        <label key={user.id} className="flex items-center space-x-3 cursor-pointer hover:bg-brand-light-gray/30 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={detailForm.members.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDetailForm({
                                  ...detailForm,
                                  members: [...detailForm.members, user.id]
                                });
                              } else {
                                setDetailForm({
                                  ...detailForm,
                                  members: detailForm.members.filter(id => id !== user.id)
                                });
                              }
                            }}
                            className="w-4 h-4 text-brand-green border-brand-light-gray rounded focus:ring-brand-green focus:ring-2"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {user.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-brand-gray">{user.username}</div>
                              <div className="text-xs text-brand-gray/60">{user.cargo || 'Sem cargo'}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                      {availableUsers.length === 0 && (
                        <div className="text-sm text-brand-gray/60 text-center py-4">
                          Nenhum usuário disponível
                        </div>
                      )}
                    </div>
                    {detailForm.members.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {detailForm.members.map((memberId) => {
                          const member = availableUsers.find(u => u.id === memberId);
                          return member ? (
                            <span
                              key={memberId}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-brand-green/10 text-brand-green text-xs rounded-full"
                            >
                              <span>{member.username}</span>
                              <button
                                onClick={() => {
                                  setDetailForm({
                                    ...detailForm,
                                    members: detailForm.members.filter(id => id !== memberId)
                                  });
                                }}
                                className="ml-1 hover:text-brand-red"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Importância</label>
                    <select
                      value={detailForm.importance}
                      onChange={(e) => setDetailForm({...detailForm, importance: e.target.value as 'low' | 'normal' | 'high' | 'critical'})}
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <option value="low">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>

                {/* Category and Estimated Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Categoria</label>
                    <input
                      type="text"
                      value={detailForm.category}
                      onChange={(e) => setDetailForm({...detailForm, category: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      placeholder="Ex: Frontend, Backend, Design..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Tempo Estimado (min)</label>
                    <input
                      type="number"
                      value={detailForm.estimatedTime}
                      onChange={(e) => setDetailForm({...detailForm, estimatedTime: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      placeholder="Ex: 120"
                    />
                  </div>
                </div>

                {/* Recurrence */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Recorrência</label>
                  <select
                    value={detailForm.recurrence}
                    onChange={(e) => setDetailForm({...detailForm, recurrence: e.target.value as 'none' | 'daily' | 'weekly' | 'monthly'})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="none">Nenhuma</option>
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="monthly">Mensalmente</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Tags</label>
                  <input
                    type="text"
                    value={detailForm.tags.join(', ')}
                    onChange={(e) => setDetailForm({...detailForm, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="Ex: bug, feature, urgent (separadas por vírgula)"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-brand-light-gray">
                <button
                  onClick={() => setShowDetailModal(null)}
                  className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 border border-brand-light-gray rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={selectedSubtask ? saveSubtaskDetails : addDetailedSubtask}
                  className="px-6 py-2 bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{selectedSubtask ? 'Salvar' : 'Criar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtaskManager;

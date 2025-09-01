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
  Tag
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
  cardId?: string; // ID do card para salvar no banco
}

const SubtaskManager: React.FC<SubtaskManagerProps> = ({
  subtasks,
  onSubtasksChange,
  isExpanded = false,
  onToggleExpanded,
  cardId
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
    recurrence: 'none' as 'none' | 'daily' | 'weekly' | 'monthly'
  });

  // Mock de membros disponíveis
  const availableMembers = [
    { id: '1', name: 'João Silva', avatar: 'JS', role: 'Desenvolvedor' },
    { id: '2', name: 'Maria Santos', avatar: 'MS', role: 'Designer' },
    { id: '3', name: 'Pedro Costa', avatar: 'PC', role: 'Analista' },
    { id: '4', name: 'Ana Oliveira', avatar: 'AO', role: 'Testador' }
  ];

  const completedCount = subtasks.filter(subtask => subtask.completed).length;
  const totalCount = subtasks.length;

  // Salvar subtarefa no banco de dados
  const saveSubtaskToDatabase = async (subtaskData: Partial<Subtask>): Promise<Subtask | null> => {
    if (!cardId) {
      console.error('Card ID não fornecido para salvar subtarefa');
      return null;
    }

    try {
      const newSubtaskData = {
        card_id: cardId,
        title: subtaskData.title || '',
        description: subtaskData.description || '',
        status: subtaskData.completed ? 'completed' : 'pending',
        priority: subtaskData.priority || 'medium',
        importance: subtaskData.importance || 'normal',
        category: subtaskData.category || 'Geral',
        due_date: subtaskData.dueDate || undefined,
        estimated_time: (subtaskData.estimatedTime || 0).toString(),
        actual_time: (subtaskData.actualTime || 0).toString(),
        tags: subtaskData.tags || [],
        completed: subtaskData.completed || false,
        user_id: user?.id || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

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
          dueDate: savedSubtask.due_date,
          estimatedTime: savedSubtask.estimated_time ? parseInt(savedSubtask.estimated_time) : undefined,
          actualTime: savedSubtask.actual_time ? parseInt(savedSubtask.actual_time) : undefined,
          tags: savedSubtask.tags || [],
          card_id: savedSubtask.card_id,
          status: savedSubtask.status,
          due_date: savedSubtask.due_date,
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
      recurrence: 'none'
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
        recurrence: subtask.recurrence || 'none'
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
      recurrence: detailForm.recurrence
    };

    // Salvar no banco de dados
    if (cardId) {
      const savedSubtask = await saveSubtaskToDatabase(updatedSubtask);
      if (savedSubtask) {
        const updatedSubtasks = subtasks.map(subtask => 
          subtask.id === selectedSubtask.id ? { ...subtask, id: savedSubtask.id } : subtask
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
    const updatedSubtasks = subtasks.map(subtask => {
      if (subtask.id.toString() === id) {
        const updatedSubtask: Subtask = {
          ...subtask,
          completed: !subtask.completed,
          completedAt: !subtask.completed ? new Date() : undefined
        };

        // Salvar no banco de dados
        if (cardId) {
          saveSubtaskToDatabase(updatedSubtask).catch(error => {
            console.error('Erro ao salvar subtarefa:', error);
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
        title: subtask.completed ? 'Subtarefa concluída' : 'Subtarefa reaberta',
        message: subtask.completed ? 'Parabéns! Subtarefa marcada como concluída.' : 'Subtarefa reaberta para edição.'
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
    if (cardId) {
      const savedSubtask = await saveSubtaskToDatabase(updatedSubtask);
      if (savedSubtask) {
        const updatedSubtasks = subtasks.map(subtask => 
          subtask.id === updatedSubtask.id ? { ...subtask, id: savedSubtask.id } : subtask
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

      {isExpanded && (
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

          {/* Subtasks List */}
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
                      <p className={`text-sm ${
                        subtask.completed 
                          ? 'text-green-700 line-through' 
                          : 'text-brand-gray'
                      }`}>
                        {subtask.title}
                      </p>
                      
                                             {/* Subtask Details - Layout Organizado */}
                       <div className="mt-3 space-y-3">
                        {/* Primeira linha: Prioridade, Importância e Prazo */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {subtask.priority && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border`}
                                    style={{ 
                                      backgroundColor: getPriorityColor(subtask.priority),
                                      color: getPriorityTextColor(subtask.priority)
                                    }}>
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

          {/* Add New Subtask */}
          <div className="space-y-3">
            {/* Add Subtask Button */}
            <button
              onClick={() => openDetailModal()}
              className="w-full flex items-center justify-center space-x-2 p-3 border border-dashed border-brand-blue text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Adicionar Subtarefa</span>
            </button>
          </div>
        </>
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
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <option value="">Selecionar membro...</option>
                      {availableMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
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

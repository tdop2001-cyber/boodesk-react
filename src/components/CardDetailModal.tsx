import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Calendar, 
  Users, 
  Tag, 
  Flag, 
  CheckSquare, 
  Square,
  Plus,
  Minus,
  Edit,
  MessageSquare,
  Paperclip,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Activity,
  AlertCircle,
  Star,
  Target,
  FolderOpen,
  Link,
  Archive,
  Copy,
  Share2
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { usePermissions } from '../contexts/PermissionContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
// Temporariamente comentar para debug
// import { useSync } from '../contexts/SyncContext';
import { Card, Column, User as UserType } from '../types';
import SubtaskManager, { Subtask } from './SubtaskManager';
import AvatarGroup from './AvatarGroup';
import UnifiedKanban, { KanbanItem as UnifiedKanbanItem, KanbanColumnDef } from './UnifiedKanban';
import SubtaskModal from './SubtaskModal';
import ArchiveManager from './ArchiveManager';
import TagManager from './TagManager';
import { db, supabase } from '../services/database';

interface CardDetailModalProps {
  card: Card;
  columns: Column[];
  allCards: Card[]; // Todos os cards do quadro atual
  onSave: (updatedCard: Card) => void;
  onDelete: (cardNumericId: number) => void;
  onClose: () => void;
  onSubtaskUpdate?: (cardId: number) => void; // Nova prop para notificar atualizações
}

 
interface CardHistory {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
}

interface CardDependency {
  id: string;
  title: string;
  requiredStatus: string;
  description: string;
}

interface CardMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  columns,
  allCards,
  onSave,
  onDelete,
  onClose,
  onSubtaskUpdate
}) => {
  const { addToast, showPopup } = useToast();
  const { hasPermission } = usePermissions();
  const { cardSettings, getPriorityColor, getPriorityTextColor } = useSettings();
  const { user } = useAuth();
  // Temporariamente comentar para debug
  /*
  const { 
    triggerSubtaskStatusChange, 
    triggerSubtaskUpdate, 
    triggerCardUpdate,
    onCardStatusChange,
    onSubtaskStatusChange,
    onCardUpdate,
    onSubtaskUpdate: onSubtaskUpdateSync
  } = useSync();
  */

  const [editedCard, setEditedCard] = useState<Card>(card);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'history' | 'dependencies'>('details');
  const [subtaskViewMode, setSubtaskViewMode] = useState<'list' | 'kanban'>('list');
  const [showCreateSubtaskModal, setShowCreateSubtaskModal] = useState(false);
  const [showEditSubtaskModal, setShowEditSubtaskModal] = useState(false);
  const [selectedSubtaskForEdit, setSelectedSubtaskForEdit] = useState<any>(null);
  const [showArchiveManager, setShowArchiveManager] = useState(false);
  const [cardTags, setCardTags] = useState<string[]>(card.tags || []);
  const [showArchiveOptions, setShowArchiveOptions] = useState(false);
  const [archiveFolders, setArchiveFolders] = useState<any[]>([]);
  
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState('');
  const [newSubtaskMembers, setNewSubtaskMembers] = useState<string[]>([]);

  const kanbanColumns: KanbanColumnDef[] = [
    {
      id: 'pending',
      title: 'A Fazer',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'in_progress',
      title: 'Em Progresso',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'completed',
      title: 'Concluído',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const handleSubtaskMove = async (itemId: string, newStatus: string) => {
    const subtask = subtasks.find(s => s.id === itemId);
    if (!subtask) return;

    const numericId = parseInt(itemId);
    if (isNaN(numericId)) {
      addToast({ type: 'error', title: 'Erro', message: 'ID da subtarefa é inválido.' });
      return;
    }

    try {
      await db.updateSubtask(numericId, { status: newStatus });

      const updatedSubtasks = subtasks.map(s => 
        s.id === itemId 
          ? { ...s, status: newStatus as 'pending' | 'in_progress' | 'completed', completed: newStatus === 'completed' }
          : s
      );

      setSubtasks(updatedSubtasks);
      addToast({ type: 'success', title: 'Status atualizado', message: `Subtarefa movida para ${newStatus}` });
      if (onSubtaskUpdate && card.id) {
        onSubtaskUpdate(card.id);
      }
      
      // Temporariamente comentar para debug
      /*
      // Disparar eventos de sincronização
      if (card.id && numericId) {
        triggerSubtaskStatusChange(card.id, numericId, newStatus, 'card_modal');
        triggerSubtaskUpdate(card.id, numericId, 'card_modal');
        triggerCardUpdate(card.id, 'card_modal');
        
        console.log('🔄 Sync: Subtask status change triggered from CardDetailModal');
      }
      */
    } catch (error) {
      console.error('Erro ao mover subtarefa:', error);
      addToast({ type: 'error', title: 'Erro ao atualizar', message: 'Não foi possível mover a subtarefa.' });
    }
  };

  // Função para alternar o status de conclusão de uma subtarefa
  const handleToggleSubtask = async (subtaskId: string | number) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    const numericId = typeof subtaskId === 'string' ? parseInt(subtaskId) : subtaskId;
    if (isNaN(numericId)) {
      addToast({ type: 'error', title: 'Erro', message: 'ID da subtarefa é inválido.' });
      return;
    }

    try {
      const newCompleted = !subtask.completed;
      const newStatus = newCompleted ? 'completed' : 'pending';
      
      await db.updateSubtask(numericId, { 
        status: newStatus
      });

      const updatedSubtasks = subtasks.map(s => 
        s.id === subtaskId 
          ? { 
              ...s, 
              completed: newCompleted, 
              status: newStatus as 'pending' | 'in_progress' | 'completed',
              completedAt: newCompleted ? new Date() : undefined
            }
          : s
      );

      setSubtasks(updatedSubtasks);
      
      addToast({ 
        type: 'success', 
        title: newCompleted ? 'Subtarefa concluída' : 'Subtarefa reaberta',
        message: newCompleted ? 'Parabéns! Subtarefa marcada como concluída.' : 'Subtarefa reaberta para edição.'
      });

      if (onSubtaskUpdate && card.id) {
        onSubtaskUpdate(card.id);
      }
        } catch (error) {
      console.error('Erro ao alternar subtarefa:', error);
      addToast({ type: 'error', title: 'Erro ao atualizar', message: 'Não foi possível atualizar a subtarefa.' });
    }
  };

  // Função para editar uma subtarefa
  const handleEditSubtask = (subtaskId: string | number) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    // Abrir modal de edição de subtarefa
    setSelectedSubtaskForEdit(subtask);
    setShowEditSubtaskModal(true);
  };

  // Funções para modal de edição de subtarefas
  const handleCloseEditSubtaskModal = () => {
    setShowEditSubtaskModal(false);
    setSelectedSubtaskForEdit(null);
  };

  const handleUpdateSubtask = async (updatedSubtask: any) => {
    try {
      console.log('Atualizando subtarefa:', updatedSubtask);
      
      // Atualizar a subtarefa na lista local
      setSubtasks(prevSubtasks => 
        prevSubtasks.map(subtask => 
          subtask.id === selectedSubtaskForEdit?.id 
            ? { ...subtask, ...updatedSubtask }
            : subtask
        )
      );

      // Notificar o componente pai sobre a atualização
      onSubtaskUpdate?.(card.id);
      
      addToast({
        type: 'success',
        title: 'Subtarefa atualizada',
        message: 'A subtarefa foi atualizada com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao atualizar subtarefa:', error);
    }
  };

  const handleDeleteSubtaskFromModal = async (subtaskId: string) => {
    try {
      console.log('Excluindo subtarefa do modal:', subtaskId);
      
      // Remover a subtarefa da lista local
      setSubtasks(prevSubtasks => 
        prevSubtasks.filter(subtask => subtask.id !== subtaskId)
      );

      // Notificar o componente pai sobre a atualização
      onSubtaskUpdate?.(card.id);
      
      addToast({
        type: 'success',
        title: 'Subtarefa excluída',
        message: 'A subtarefa foi excluída com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao excluir subtarefa:', error);
    }
  };

  // Função para deletar uma subtarefa
  const handleDeleteSubtask = async (subtaskId: string | number) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    const numericId = typeof subtaskId === 'string' ? parseInt(subtaskId) : subtaskId;
    if (isNaN(numericId)) {
      addToast({ type: 'error', title: 'Erro', message: 'ID da subtarefa é inválido.' });
      return;
    }

    showPopup({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a subtarefa "${subtask.title}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          await db.deleteSubtask(numericId);
          
          const updatedSubtasks = subtasks.filter(s => s.id !== subtaskId);
          setSubtasks(updatedSubtasks);
          
          addToast({ 
            type: 'success', 
            title: 'Subtarefa excluída',
            message: 'A subtarefa foi excluída com sucesso.'
          });

          if (onSubtaskUpdate && card.id) {
            onSubtaskUpdate(card.id);
          }
    } catch (error) {
          console.error('Erro ao deletar subtarefa:', error);
          addToast({ type: 'error', title: 'Erro ao excluir', message: 'Não foi possível excluir a subtarefa.' });
        }
      }
    });
  };

  // Função para criar uma nova subtarefa
  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim()) {
      addToast({ type: 'error', title: 'Erro', message: 'O título da subtarefa é obrigatório.' });
      return;
    }

    if (!card.id) {
      addToast({ type: 'error', title: 'Erro', message: 'ID do card não encontrado.' });
      return;
    }

    try {
      const newSubtask = {
        card_id: card.id,
        title: newSubtaskTitle.trim(),
        description: newSubtaskDescription.trim(),
        priority: newSubtaskPriority,
        due_date: newSubtaskDueDate || undefined,
        members: newSubtaskMembers.length > 0 ? newSubtaskMembers : [user?.id?.toString() || '1'],
        created_by: user?.id || 1
      };

      const createdSubtask = await db.createSubtask(newSubtask);
      
      if (createdSubtask) {
        const subtaskWithId = {
          id: createdSubtask.id || Date.now(),
          title: newSubtask.title,
          description: newSubtask.description,
          priority: newSubtask.priority,
          status: 'pending' as const,
          completed: false,
          createdAt: new Date(),
          importance: newSubtask.priority === 'high' ? 'high' as const : 
                     newSubtask.priority === 'medium' ? 'normal' as const : 'low' as const
        };

        setSubtasks(prev => [...prev, subtaskWithId]);
        
        // Limpar campos
        setNewSubtaskTitle('');
        setNewSubtaskDescription('');
        setNewSubtaskPriority('medium');
        setNewSubtaskDueDate('');
        setNewSubtaskMembers([]);
        setShowCreateSubtaskModal(false);
        
        addToast({ 
          type: 'success', 
          title: 'Subtarefa criada',
          message: 'A subtarefa foi criada com sucesso!'
        });

        if (onSubtaskUpdate && card.id) {
          onSubtaskUpdate(card.id);
        }
      }
    } catch (error) {
      console.error('Erro ao criar subtarefa:', error);
      addToast({ type: 'error', title: 'Erro ao criar', message: 'Não foi possível criar a subtarefa.' });
    }
  };

  // ===== FUNÇÕES DE ARQUIVAMENTO =====

  const handleArchiveCard = async (folderId: number) => {
    try {
      const cardId = card.card_id || card.id;
      if (!cardId) {
        addToast({
          type: 'error',
          title: 'Erro',
          message: 'ID do card não encontrado.'
        });
        return;
      }

      await db.archiveCard(Number(cardId), folderId, user?.id || 1, 'Arquivamento manual');
      
      addToast({
        type: 'success',
        title: 'Card arquivado',
        message: 'Card foi arquivado com sucesso!'
      });

      // Fechar o modal após arquivamento
      onClose();
    } catch (error) {
      console.error('Erro ao arquivar card:', error);
      addToast({
        type: 'error',
        title: 'Erro ao arquivar',
        message: 'Não foi possível arquivar o card.'
      });
    }
  };

  const handleOpenArchiveManager = () => {
    setShowArchiveManager(true);
  };

  const handleCardRestored = (cardId: number) => {
    // Recarregar dados do card se necessário
    console.log('Card restaurado:', cardId);
  };

  // Função para gerenciar tags do card
  const handleTagsChange = async (newTags: string[]) => {
    try {
      setCardTags(newTags);
      
      // Atualizar no banco de dados
      if (card.card_id) {
        try {
          await db.updateCard(card.card_id, { tags: newTags });
        } catch (error) {
          console.error('Erro ao atualizar tags:', error);
          addToast({
            type: 'error',
            title: 'Erro',
            message: 'Não foi possível atualizar as tags'
          });
          return;
        }

        // Atualizar o card local
        const updatedCard = { ...editedCard, tags: newTags };
        setEditedCard(updatedCard);
        onSave(updatedCard);

        addToast({
          type: 'success',
          title: 'Tags atualizadas',
          message: 'Tags do card foram atualizadas com sucesso!'
        });
      }
    } catch (error) {
      console.error('Erro ao gerenciar tags:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível gerenciar as tags'
      });
    }
  };

  // Fechar dropdown de arquivamento quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showArchiveOptions) {
        const target = event.target as HTMLElement;
        if (!target.closest('.archive-dropdown')) {
          setShowArchiveOptions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showArchiveOptions]);

  useEffect(() => {
    const loadCardData = async () => {
      try {
        const cardNumericId = card.card_id || card.id;
        
        if (cardNumericId) {
          const cardSubtasks = await db.getSubtasksForCardByUser(
            Number(cardNumericId), 
            user?.id || 1, 
            String(user?.role || 'member')
          );
          
          const mappedSubtasks = cardSubtasks.map(subtask => {
            let mappedStatus = subtask.status || 'pending';
            if (mappedStatus === 'pending') {
              mappedStatus = 'todo';
            }
            
            return {
          id: (subtask.id || '').toString(),
          title: subtask.title || '',
          description: subtask.description || '',
              completed: subtask.status === 'completed',
          priority: (subtask.priority || 'medium') as 'low' | 'medium' | 'high',
          dueDate: subtask.due_date || undefined,
              estimatedTime: 0,
              actualTime: 0,
              importance: (subtask.importance || 'normal') as 'low' | 'high' | 'normal' | 'critical',
              category: subtask.category || 'Geral',
              tags: [],
              status: mappedStatus as 'pending' | 'in_progress' | 'completed',
          createdAt: subtask.created_at ? new Date(subtask.created_at) : new Date(),
          // Adicionar campos do banco para o modal
          due_date: subtask.due_date || undefined,
          created_at: subtask.created_at,
          updated_at: subtask.updated_at,
          estimated_time: subtask.estimated_time,
          actual_time: subtask.actual_time
            };
          });
        
        setSubtasks(mappedSubtasks);
        }

        const users = await db.getUsers();
        // Filtrar usuários válidos e garantir que tenham nomes apropriados
        const validUsers = users.filter(user => 
          user && 
          user.id && 
          (user.nome_completo || user.username || user.email) &&
          !user.password_hash // Excluir se contém senha no nome
        ).map(user => ({
          ...user,
          // Garantir que o nome seja apropriado
          displayName: user.nome_completo || user.username || user.email,
          // Limpar qualquer string que pareça ser senha/ID
          nome_completo: user.nome_completo && !user.nome_completo.match(/^\d+$|^[a-zA-Z0-9]{8,}$/) ? user.nome_completo : user.username,
          username: user.username && !user.username.match(/^\d+$|^[a-zA-Z0-9]{8,}$/) ? user.username : user.email
        }));
        setAvailableUsers(validUsers);

      } catch (error) {
        console.error('Erro ao carregar dados do card:', error);
      }
    };

    if (card.id) {
      loadCardData();
    }
  }, [card.id, card.card_id]);

  // Carregar pastas de arquivo
  useEffect(() => {
    const loadArchiveFolders = async () => {
      try {
        const folders = await db.getArchiveFolders();
        setArchiveFolders(folders);
      } catch (error) {
        console.error('Erro ao carregar pastas de arquivo:', error);
      }
    };

    loadArchiveFolders();
  }, []);

  // ===== LISTENERS DE SINCRONIZAÇÃO =====
  
  // Temporariamente comentar para debug
  /*
  // Escutar mudanças de status de cards vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onCardStatusChange((cardId, newStatus, source) => {
      if (source !== 'card_modal' && cardId === card.id) { // Evitar loops e atualizar apenas o card atual
        console.log('🔄 Sync: Card status change received in CardDetailModal from', source, { cardId, newStatus });
        
        // Atualizar o card local
        setEditedCard(prevCard => ({
          ...prevCard,
          status: newStatus === 'completed' ? 'done' : 
                 newStatus === 'in_progress' ? 'progress' : 'todo'
        }));
        
    addToast({
          type: 'info',
      title: 'Card atualizado',
          message: `Status do card foi atualizado para "${newStatus}"`
        });
      }
    });

    return unsubscribe;
  }, [onCardStatusChange, card.id, addToast]);

  // Escutar mudanças de status de subtarefas vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onSubtaskStatusChange((cardId, subtaskId, newStatus, source) => {
      if (source !== 'card_modal' && cardId === card.id) { // Evitar loops e atualizar apenas o card atual
        console.log('🔄 Sync: Subtask status change received in CardDetailModal from', source, { cardId, subtaskId, newStatus });
        
        // Atualizar a subtarefa específica
        setSubtasks(prevSubtasks => {
          return prevSubtasks.map(subtask => {
            if (subtask.id === subtaskId.toString()) {
              return { 
                ...subtask, 
                status: newStatus as any, 
                completed: newStatus === 'completed' 
              };
            }
            return subtask;
          });
        });
      }
    });

    return unsubscribe;
  }, [onSubtaskStatusChange, card.id]);

  // Escutar atualizações de cards vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onCardUpdate((cardId, source) => {
      if (source !== 'card_modal' && cardId === card.id) { // Evitar loops e atualizar apenas o card atual
        console.log('🔄 Sync: Card update received in CardDetailModal from', source, { cardId });
        
        // Recarregar dados do card
        const reloadCardData = async () => {
          try {
            const cardNumericId = card.card_id || card.id;
            
            if (cardNumericId) {
              const cardSubtasks = await db.getSubtasksForCardByUser(
                Number(cardNumericId), 
                user?.id || 1, 
                String(user?.role || 'member')
              );
              
              const mappedSubtasks = cardSubtasks.map(subtask => {
                let mappedStatus = subtask.status || 'pending';
                if (mappedStatus === 'pending') {
                  mappedStatus = 'todo';
                }
                
                return {
                  id: (subtask.id || '').toString(),
                  title: subtask.title || '',
                  description: subtask.description || '',
                  completed: subtask.completed || false,
                  priority: (subtask.priority || 'medium') as 'low' | 'medium' | 'high',
                  dueDate: subtask.due_date || '',
                  estimatedTime: 0,
                  actualTime: 0,
                  importance: 'normal' as 'low' | 'high' | 'normal' | 'critical',
                  category: 'Geral',
                  tags: [],
                  status: mappedStatus as 'pending' | 'in_progress' | 'completed',
                  createdAt: new Date()
                };
              });
            
              setSubtasks(mappedSubtasks);
            }
          } catch (error) {
            console.error('Erro ao recarregar dados do card:', error);
          }
        };
        
        reloadCardData();
      }
    });

    return unsubscribe;
  }, [onCardUpdate, card.id, card.card_id, user?.id, user?.role]);

  // Escutar atualizações de subtarefas vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onSubtaskUpdateSync((cardId: number, subtaskId: number, source: string) => {
      if (source !== 'card_modal' && cardId === card.id) { // Evitar loops e atualizar apenas o card atual
        console.log('🔄 Sync: Subtask update received in CardDetailModal from', source, { cardId, subtaskId });
        
        // Recarregar subtarefas do card
        const reloadSubtasks = async () => {
          try {
            const cardNumericId = card.card_id || card.id;
            
            if (cardNumericId) {
              const cardSubtasks = await db.getSubtasksForCardByUser(
                Number(cardNumericId), 
                user?.id || 1, 
                String(user?.role || 'member')
              );
              
              const mappedSubtasks = cardSubtasks.map(subtask => {
                let mappedStatus = subtask.status || 'pending';
                if (mappedStatus === 'pending') {
                  mappedStatus = 'todo';
                }
                
                return {
                  id: (subtask.id || '').toString(),
                  title: subtask.title || '',
                  description: subtask.description || '',
                  completed: subtask.completed || false,
                  priority: (subtask.priority || 'medium') as 'low' | 'medium' | 'high',
                  dueDate: subtask.due_date || '',
                  estimatedTime: 0,
                  actualTime: 0,
                  importance: 'normal' as 'low' | 'high' | 'normal' | 'critical',
                  category: 'Geral',
                  tags: [],
                  status: mappedStatus as 'pending' | 'in_progress' | 'completed',
                  createdAt: new Date()
                };
              });
            
              setSubtasks(mappedSubtasks);
            }
          } catch (error) {
            console.error('Erro ao recarregar subtarefas:', error);
          }
        };
        
        reloadSubtasks();
      }
    });

    return unsubscribe;
  }, [onSubtaskUpdateSync, card.id, card.card_id, user?.id, user?.role]);
  */

  const handleSave = () => {
    const updatedCard = {
      ...editedCard,
      subtasks: subtasks,
    };
    onSave(updatedCard);
    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Card atualizado',
      message: 'As alterações foram salvas com sucesso!'
    });
  };

  const handleDelete = () => {
    showPopup({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.',
      onConfirm: () => {
        onDelete(card.id);
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[98vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-brand-light-gray">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-brand-red/10 rounded-lg">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-brand-red" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-gray">Detalhes do Card</h2>
              <p className="text-xs sm:text-sm text-brand-gray/60">Gerencie todas as informações do card</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
            </button>
            
            {/* Botão de Arquivamento - só aparece se o card estiver concluído */}
            {card.status === 'done' && (
              <div className="relative archive-dropdown">
                <button
                  onClick={() => setShowArchiveOptions(!showArchiveOptions)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  <span>Arquivar</span>
                </button>
                
                {/* Dropdown de opções de arquivamento */}
                {showArchiveOptions && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900">Escolher pasta de arquivo</h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {archiveFolders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => {
                            handleArchiveCard(folder.id);
                            setShowArchiveOptions(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: folder.color }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{folder.name}</div>
                            {folder.description && (
                              <div className="text-xs text-gray-500">{folder.description}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button
                        onClick={handleOpenArchiveManager}
                        className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Gerenciar arquivos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-brand-gray/50 hover:text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6 overflow-y-scroll max-h-[calc(98vh-100px)] sm:max-h-[calc(90vh-120px)] modal-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex space-x-1 bg-brand-light-gray/30 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'details'
                      ? 'bg-white text-brand-gray shadow-sm'
                      : 'text-brand-gray/60 hover:text-brand-gray'
                  }`}
                >
                  Detalhes
                </button>
                <button
                  onClick={() => setActiveTab('subtasks')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'subtasks'
                      ? 'bg-white text-brand-gray shadow-sm'
                      : 'text-brand-gray/60 hover:text-brand-gray'
                  }`}
                >
                  Subtarefas ({subtasks.length})
                </button>
              </div>

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Título</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedCard.title}
                        onChange={(e) => setEditedCard({...editedCard, title: e.target.value})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-brand-gray">{editedCard.title}</h3>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Descrição</label>
                    {isEditing ? (
                      <textarea
                        value={editedCard.description}
                        onChange={(e) => setEditedCard({...editedCard, description: e.target.value})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        rows={4}
                      />
                    ) : (
                      <p className="text-brand-gray/70">{editedCard.description || 'Sem descrição'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Tags</label>
                    <TagManager
                      selectedTags={cardTags}
                      onTagsChange={handleTagsChange}
                      maxTags={10}
                      showCreateTag={true}
                      className="w-full"
                    />
                  </div>
                    </div>
              )}

              {activeTab === 'subtasks' && (
                 <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <div>
                         <h4 className="text-sm font-medium text-brand-gray">Gerenciamento de Subtarefas</h4>
                           <div className="flex items-center space-x-4 mt-2">
                           <div className="flex items-center space-x-1 bg-brand-light-gray/30 rounded-lg p-1">
                             <button
                               onClick={() => setSubtaskViewMode('list')}
                               className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                 subtaskViewMode === 'list' 
                                   ? 'bg-white text-brand-gray shadow-sm' 
                                   : 'text-brand-gray/60 hover:text-brand-gray'
                               }`}
                             >
                               Lista
                             </button>
                             <button
                               onClick={() => setSubtaskViewMode('kanban')}
                               className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                 subtaskViewMode === 'kanban' 
                                   ? 'bg-white text-brand-gray shadow-sm' 
                                   : 'text-brand-gray/60 hover:text-brand-gray'
                               }`}
                             >
                               Kanban
                             </button>
                             </div>
                             <div className="text-xs text-brand-gray/60">
                               {subtasks.filter(s => s.completed).length}/{subtasks.length} concluídas
                             </div>
                           </div>
                           </div>
                           <button
                             onClick={() => setShowCreateSubtaskModal(true)}
                             className="flex items-center space-x-2 px-3 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors text-sm font-medium"
                           >
                             <Plus className="w-4 h-4" />
                             <span>Nova Subtarefa</span>
                           </button>
                       </div>

                       {/* Barra de Progresso */}
                       {subtasks.length > 0 && (
                         <div className="bg-brand-light-gray/20 rounded-lg p-3">
                           <div className="flex items-center justify-between mb-2">
                             <span className="text-sm font-medium text-brand-gray">Progresso das Subtarefas</span>
                             <span className="text-sm text-brand-gray/60">
                               {Math.round((subtasks.filter(s => s.completed).length / subtasks.length) * 100)}%
                           </span>
                         </div>
                           <div className="w-full bg-brand-light-gray/30 rounded-full h-2">
                           <div 
                             className="bg-brand-green h-2 rounded-full transition-all duration-300"
                             style={{ 
                                 width: `${(subtasks.filter(s => s.completed).length / subtasks.length) * 100}%` 
                             }}
                             />
                         </div>
                             </div>
                       )}

                       {/* Formulário de Criação de Subtarefa */}
                       {showCreateSubtaskModal && (
                         <div className="bg-white border border-brand-light-gray/30 rounded-lg p-4 mb-4">
                           <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center space-x-2">
                               <div className="p-2 bg-brand-green/10 rounded-lg">
                                 <Plus className="w-4 h-4 text-brand-green" />
                               </div>
                               <h4 className="text-sm font-semibold text-brand-gray">Nova Subtarefa</h4>
                             </div>
                             <button
                               onClick={() => setShowCreateSubtaskModal(false)}
                               className="p-1 text-brand-gray/60 hover:text-brand-gray transition-colors"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                           
                           <div className="space-y-3">
                             <div>
                               <label className="block text-xs font-medium text-brand-gray mb-1">
                                 Título da Subtarefa *
                               </label>
                               <input
                                 type="text"
                                 value={newSubtaskTitle}
                                 onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                 placeholder="Digite o título da subtarefa..."
                                 className="w-full px-3 py-2 text-sm border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                               />
                             </div>

                             <div>
                               <label className="block text-xs font-medium text-brand-gray mb-1">
                                 Descrição
                               </label>
                               <textarea
                                 value={newSubtaskDescription}
                                 onChange={(e) => setNewSubtaskDescription(e.target.value)}
                                 placeholder="Digite uma descrição (opcional)..."
                                 rows={2}
                                 className="w-full px-3 py-2 text-sm border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                               />
                             </div>

                             <div className="grid grid-cols-2 gap-3">
                               <div>
                                 <label className="block text-xs font-medium text-brand-gray mb-1">
                                   Prioridade
                                 </label>
                                 <select
                                   value={newSubtaskPriority}
                                   onChange={(e) => setNewSubtaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                                   className="w-full px-3 py-2 text-sm border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                 >
                                   <option value="low">Baixa</option>
                                   <option value="medium">Normal</option>
                                   <option value="high">Alta</option>
                                 </select>
                               </div>

                               <div>
                                 <label className="block text-xs font-medium text-brand-gray mb-1">
                                   Data de Vencimento
                                 </label>
                                 <input
                                   type="date"
                                   value={newSubtaskDueDate}
                                   onChange={(e) => setNewSubtaskDueDate(e.target.value)}
                                   className="w-full px-3 py-2 text-sm border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                 />
                               </div>
                             </div>

                             <div>
                               <label className="block text-xs font-medium text-brand-gray mb-1">
                                 Membros da Subtarefa
                               </label>
                               <div className="space-y-1 subtask-modal-scroll" style={{
                                 maxHeight: '120px',
                                 overflowY: 'scroll',
                                 overflowX: 'hidden',
                                 scrollbarWidth: 'thin',
                                 scrollbarColor: '#6b7280 #f3f4f6'
                               }}>
                                 {availableUsers.map((user) => (
                                   <label key={user.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs">
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
                                       className="rounded border-brand-light-gray text-brand-blue focus:ring-brand-blue w-3 h-3"
                                     />
                                     <div className="flex items-center space-x-2">
                                       <div className="w-5 h-5 bg-brand-blue rounded-full flex items-center justify-center text-white text-xs font-medium">
                                         {(user.displayName || user.nome_completo || user.username)?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                       </div>
                                       <span className="text-xs text-brand-gray truncate">
                                         {user.displayName || user.nome_completo || user.username || user.email}
                                       </span>
                                     </div>
                                   </label>
                                 ))}
                               </div>
                             </div>

                             <div className="flex items-center justify-end space-x-2 pt-2">
                               <button
                                 onClick={() => setShowCreateSubtaskModal(false)}
                                 className="px-3 py-1 text-xs text-brand-gray/60 hover:text-brand-gray transition-colors"
                               >
                                 Cancelar
                               </button>
                               <button
                                 onClick={handleCreateSubtask}
                                 className="flex items-center space-x-1 px-3 py-1 bg-brand-green text-white rounded text-xs hover:bg-brand-green/90 transition-colors"
                               >
                                 <Plus className="w-3 h-3" />
                                 <span>Criar</span>
                               </button>
                             </div>
                           </div>
                         </div>
                       )}

                       <div className="space-y-3">
                         {subtasks.length === 0 ? (
                           <div className="text-center py-8 text-brand-gray/60">
                             <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                             <p className="text-sm">Nenhuma subtarefa criada ainda</p>
                             <p className="text-xs">Clique em "Nova Subtarefa" para começar</p>
                           </div>
                         ) : subtaskViewMode === 'kanban' ? (
                           <UnifiedKanban
                             columns={kanbanColumns}
                             items={subtasks.map(s => ({
                              ...s, 
                              id: String(s.id), 
                              importance: s.importance as any,
                              status: s.status || 'pending'
                            }))}
                             onItemMove={handleSubtaskMove}
                             cardId={String(card.id)}
                           />
                         ) : (
                           <div className="space-y-2">
                             {subtasks.map((subtask, index) => (
                               <div key={subtask.id} className="bg-white border border-brand-light-gray/30 rounded-lg p-3 hover:shadow-sm transition-shadow">
                                 <div className="flex items-center space-x-3">
                                   <button
                                     onClick={() => handleToggleSubtask(subtask.id)}
                                     className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                       subtask.completed 
                                         ? 'bg-brand-green border-brand-green text-white' 
                                         : 'border-brand-gray/30 hover:border-brand-green'
                                     }`}
                                   >
                                     {subtask.completed && <CheckSquare className="w-3 h-3" />}
                                   </button>
                                   
                                   <div className="flex-1 min-w-0">
                                     <div className="flex items-center space-x-2">
                                       <h5 className={`text-sm font-medium ${
                                         subtask.completed ? 'line-through text-brand-gray/60' : 'text-brand-gray'
                                       }`}>
                                         {subtask.title}
                                       </h5>
                                       {subtask.priority && (
                                         <span className={`px-2 py-1 text-xs rounded-full ${
                                           subtask.priority === 'high' ? 'bg-red-100 text-red-600' :
                                           subtask.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                           'bg-green-100 text-green-600'
                                         }`}>
                                           {subtask.priority === 'high' ? 'Alta' : 
                                            subtask.priority === 'medium' ? 'Normal' : 'Baixa'}
                                         </span>
                         )}
                       </div>
                                     {subtask.description && (
                                       <p className="text-xs text-brand-gray/60 mt-1">{subtask.description}</p>
                                     )}
                          </div>
                                   
                                   <div className="flex items-center space-x-2">
                                     {subtask.dueDate && (
                                       <span className="text-xs text-brand-gray/60">
                                         {new Date(subtask.dueDate).toLocaleDateString()}
                                       </span>
                                     )}
                        <button
                                       onClick={() => handleEditSubtask(subtask.id)}
                                       className="p-1 text-brand-gray/60 hover:text-brand-blue transition-colors"
                        >
                                       <Edit className="w-4 h-4" />
                        </button>
                                <button
                                       onClick={() => handleDeleteSubtask(subtask.id)}
                                       className="p-1 text-brand-gray/60 hover:text-brand-red transition-colors"
                                >
                                       <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                      </div>
                    </div>
                             ))}
            </div>
                  )}
                </div>
                      </div>
                  )}
              </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <h3 className="text-sm font-medium text-brand-gray mb-4">Informações do Sistema</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-gray/60">ID do Card:</span>
                    <span className="text-brand-gray font-mono">{card.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray/60">Criado em:</span>
                    <span className="text-brand-gray">{new Date(card.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray/60">Última atualização:</span>
                    <span className="text-brand-gray">{new Date(card.updated_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <h3 className="text-sm font-medium text-brand-gray mb-4">Membros</h3>
                <AvatarGroup
                  members={availableUsers.filter(user => editedCard.members?.includes(user.id))}
                  maxVisible={5}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Modal de Edição de Subtarefas */}
      <SubtaskModal
        isOpen={showEditSubtaskModal}
        onClose={handleCloseEditSubtaskModal}
        subtask={selectedSubtaskForEdit}
        onUpdate={handleUpdateSubtask}
        onDelete={handleDeleteSubtaskFromModal}
      />

      <ArchiveManager
        isOpen={showArchiveManager}
        onClose={() => setShowArchiveManager(false)}
        onCardRestored={handleCardRestored}
      />
    </div>
  );
};

export default CardDetailModal;
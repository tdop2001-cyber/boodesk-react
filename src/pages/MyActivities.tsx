import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/header.css';
// Temporariamente comentar para debug
// import { useSync } from '../contexts/SyncContext';

import { Card, Column, User as UserType } from '../types';
import { db } from '../services/database';
import UnifiedKanban, { KanbanItem as UnifiedKanbanItem, KanbanColumnDef } from '../components/UnifiedKanban';
import AvatarGroup from '../components/AvatarGroup';
import SubtaskModal from '../components/SubtaskModal';
import SubtaskList from '../components/SubtaskList';
import {
  Calendar,
  Clock,
  Users,
  Link,
  CheckCircle,
  Circle,
  ArrowRight,
  FileText,
  Edit3,
  Filter,
  Search,
  Eye,
  Target,
  AlertCircle,
  Star,
  Tag,
  User,
  CalendarDays,
  Clock3,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Settings,
  ArrowLeft,
  X,
  List,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  RefreshCw
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'card' | 'subtask' | 'individual_subtask';
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'in_progress';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: string;
  members?: string[];
  dependencies?: string[];
  subtasks?: ActivityItem[];
  parentCardId?: string;
  importance?: string;
  tags?: string[];
  estimatedTime?: string;
  actualTime?: string;
  category?: string;
  recurrence?: string;
  completed?: boolean;
  boardId?: string;
}

interface MyActivitiesProps {}

const MyActivities: React.FC<MyActivitiesProps> = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { addToast } = useToast();
  const { getPriorityColor, getPriorityTextColor } = useSettings();
  // Temporariamente comentar para debug
  /*
  const { 
    triggerCardStatusChange, 
    triggerSubtaskStatusChange, 
    triggerCardUpdate, 
    triggerSubtaskUpdate,
    onCardStatusChange,
    onSubtaskStatusChange,
    onCardUpdate,
    onSubtaskUpdate
  } = useSync();
  */

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [selectedSubtask, setSelectedSubtask] = useState<ActivityItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug: Monitorar mudanças no estado selectedSubtask
  useEffect(() => {
    console.log('Estado selectedSubtask mudou:', selectedSubtask);
  }, [selectedSubtask]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cards' | 'subtasks'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'in_progress'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [selectedCardForKanban, setSelectedCardForKanban] = useState<ActivityItem | null>(null);
  const [filterBoard, setFilterBoard] = useState<string>('all');
  const [groupByBoard, setGroupByBoard] = useState<boolean>(false);
  
  // Estados para modal de subtarefas
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [selectedSubtaskForModal, setSelectedSubtaskForModal] = useState<any>(null);
  const [availableBoards, setAvailableBoards] = useState<{id: string, name: string}[]>([]);
  const [hideEmptyCards, setHideEmptyCards] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [membersCache, setMembersCache] = useState<Map<number, UserType>>(new Map());
  const [sortBy, setSortBy] = useState<'title' | 'dueDate' | 'priority' | 'status' | 'createdAt'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ===== FUNÇÕES DE PERSISTÊNCIA =====
  
  /**
   * Carrega informações dos membros dos cards
   */
  const loadMembersInfo = async (memberIds: number[]) => {
    if (!memberIds || memberIds.length === 0) return;
    
    try {
      // Verificar quais membros já estão no cache
      const missingIds = memberIds.filter(id => !membersCache.has(id));
      
      if (missingIds.length > 0) {
        console.log('MyActivities: Carregando informações dos membros:', missingIds);
        const members = await db.getUsersByIds(missingIds);
        
        // Atualizar o cache
        setMembersCache(prev => {
          const newCache = new Map(prev);
          members.forEach(member => {
            newCache.set(member.id, member);
          });
          return newCache;
        });
        
        console.log('MyActivities: Informações dos membros carregadas:', members);
      }
    } catch (error) {
      console.error('MyActivities: Erro ao carregar informações dos membros:', error);
    }
  };
  
  /**
   * Carrega as preferências do usuário do banco de dados
   */
  const loadUserPreferences = async () => {
    if (!user?.id) {
      console.log('MyActivities: Usuário não logado, não carregando preferências');
      return;
    }
    
    try {
      console.log('MyActivities: 🔄 Carregando preferências do usuário:', user.id);
      const preferences = await db.getUserPreferences(user.id.toString());
      
      console.log('MyActivities: 📥 Preferências recebidas do banco:', preferences);
      
      if (preferences && Object.keys(preferences).length > 0) {
        // Aplica as preferências carregadas
        if (preferences.viewMode) {
          console.log('MyActivities: Aplicando viewMode:', preferences.viewMode);
          setViewMode(preferences.viewMode);
        }
        if (preferences.filterType) {
          console.log('MyActivities: Aplicando filterType:', preferences.filterType);
          setFilterType(preferences.filterType);
        }
        if (preferences.filterStatus) {
          console.log('MyActivities: Aplicando filterStatus:', preferences.filterStatus);
          setFilterStatus(preferences.filterStatus);
        }
        if (preferences.filterPriority) {
          console.log('MyActivities: Aplicando filterPriority:', preferences.filterPriority);
          setFilterPriority(preferences.filterPriority);
        }
        if (preferences.filterBoard) {
          console.log('MyActivities: Aplicando filterBoard:', preferences.filterBoard);
          setFilterBoard(preferences.filterBoard);
        }
        if (preferences.hideEmptyCards !== undefined) {
          console.log('MyActivities: Aplicando hideEmptyCards:', preferences.hideEmptyCards);
          setHideEmptyCards(preferences.hideEmptyCards);
        }
        if (preferences.groupByBoard !== undefined) {
          console.log('MyActivities: Aplicando groupByBoard:', preferences.groupByBoard);
          setGroupByBoard(preferences.groupByBoard);
        }
        if (preferences.showFilters !== undefined) {
          console.log('MyActivities: Aplicando showFilters:', preferences.showFilters);
          setShowFilters(preferences.showFilters);
        }
        if (preferences.showOptions !== undefined) {
          console.log('MyActivities: Aplicando showOptions:', preferences.showOptions);
          setShowOptions(preferences.showOptions);
        }
        if (preferences.sortBy) {
          console.log('MyActivities: Aplicando sortBy:', preferences.sortBy);
          setSortBy(preferences.sortBy);
        }
        if (preferences.sortOrder) {
          console.log('MyActivities: Aplicando sortOrder:', preferences.sortOrder);
          setSortOrder(preferences.sortOrder);
        }
        
        console.log('MyActivities: ✅ Preferências aplicadas com sucesso');
      } else {
        console.log('MyActivities: ℹ️ Nenhuma preferência encontrada, usando valores padrão');
      }
      
      setPreferencesLoaded(true);
      console.log('MyActivities: ✅ Sistema de preferências carregado');
    } catch (error) {
      console.error('MyActivities: ❌ Erro ao carregar preferências:', error);
      setPreferencesLoaded(true); // Continua mesmo com erro
    }
  };

  /**
   * Salva as preferências atuais do usuário no banco de dados
   */
  const saveUserPreferences = async () => {
    if (!user?.id || !preferencesLoaded) return;
    
    try {
      const preferences = {
        viewMode,
        filterType,
        filterStatus,
        filterPriority,
        filterBoard,
        hideEmptyCards,
        groupByBoard,
        showFilters,
        showOptions,
        lastUpdated: new Date().toISOString()
      };
      
      console.log('MyActivities: Salvando preferências do usuário:', preferences);
      await db.saveUserPreferences(user.id.toString(), preferences);
      console.log('MyActivities: Preferências salvas com sucesso');
    } catch (error) {
      console.error('MyActivities: Erro ao salvar preferências:', error);
    }
  };

  /**
   * Salva uma preferência específica com debounce
   */
  const savePreference = async (key: string, value: any) => {
    if (!user?.id) {
      console.log('MyActivities: Usuário não logado, não salvando preferência');
      return;
    }
    
    if (!preferencesLoaded) {
      console.log('MyActivities: Preferências ainda não carregadas, não salvando');
      return;
    }
    
    // Limpa timeout anterior se existir
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Cria novo timeout para salvar após 500ms
    const timeout = setTimeout(async () => {
      try {
        console.log(`MyActivities: 💾 Salvando preferência '${key}':`, value, 'para usuário:', user.id);
        await db.updateUserPreference(user.id.toString(), key, value);
        console.log(`MyActivities: ✅ Preferência '${key}' salva com sucesso:`, value);
      } catch (error) {
        console.error(`MyActivities: ❌ Erro ao salvar preferência '${key}':`, error);
      }
    }, 500);
    
    setSaveTimeout(timeout);
  };

  const getCardStatus = (card: ActivityItem): { status: string; statusLabel: string; statusColor: string; } => {
    if (!card.subtasks || card.subtasks.length === 0) {
      return {
        status: 'no_subtasks',
        statusLabel: 'Sem Subtarefas',
        statusColor: 'bg-gradient-to-r from-red-200 to-red-300 text-red-800 shadow-red-200/25',
      };
    }

    const totalSubtasks = card.subtasks.length;
    const completedSubtasks = card.subtasks.filter(s => s.status === 'completed').length;
    const inProgressSubtasks = card.subtasks.filter(s => s.status === 'in_progress').length;
    const pendingSubtasks = card.subtasks.filter(s => s.status === 'pending').length;

    if (inProgressSubtasks > 0) {
      return {
        status: 'in_progress',
        statusLabel: 'Em Progresso',
        statusColor: 'bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 shadow-blue-200/25',
      };
    }

    if (completedSubtasks === totalSubtasks) {
      return {
        status: 'completed',
        statusLabel: 'Concluído',
        statusColor: 'bg-gradient-to-r from-green-200 to-green-300 text-green-800 shadow-green-200/25',
      };
    }

    if (pendingSubtasks === totalSubtasks) {
      return {
        status: 'pending',
        statusLabel: 'A Fazer',
        statusColor: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 shadow-gray-200/25',
      };
    }

    // Default case (mix of pending and completed)
    return {
      status: 'in_progress',
      statusLabel: 'Em Progresso',
      statusColor: 'bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 shadow-blue-200/25',
    };
  };

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
      color: 'text-[#16704E]',
      bgColor: 'bg-[#16704E]/10',
      borderColor: 'border-[#16704E]/20'
    }
  ];

  const handleItemMove = async (itemId: string, newStatus: string) => {
    console.log('=== HANDLE ITEM MOVE ===');
    console.log('itemId:', itemId, 'type:', typeof itemId);
    console.log('newStatus:', newStatus);
    console.log('activities:', activities);
    
    // Verificar se é um card
    const cardItem = activities.find(a => a.id === itemId);
    console.log('Card encontrado:', cardItem);
    
    // Verificar se é uma subtarefa
    const allSubtasks = activities.flatMap(a => a.subtasks || []);
    console.log('Todas as subtarefas:', allSubtasks);
    console.log('IDs das subtarefas:', allSubtasks.map(s => ({ id: s.id, type: typeof s.id, title: s.title })));
    
    const subtaskItem = allSubtasks.find(s => {
      const matches = s.id === itemId || 
                     String(s.id) === String(itemId) || 
                     parseInt(String(s.id)) === parseInt(String(itemId));
      console.log('Buscando subtarefa:', {
        subId: s.id,
        subIdType: typeof s.id,
        itemId: itemId,
        itemIdType: typeof itemId,
        matches: matches,
        subTitle: s.title
      });
      return matches;
    });
    console.log('Subtarefa encontrada:', subtaskItem);
    
    const item = cardItem || subtaskItem;
    console.log('Item final encontrado:', item);
    
    if (!item) {
      console.log('Item não encontrado!');
      console.log('Tentando buscar com diferentes comparações...');
      
      // Tentar diferentes formas de comparação
      const altItem1 = allSubtasks.find(s => s.id == itemId);
      const altItem2 = allSubtasks.find(s => String(s.id) == String(itemId));
      const altItem3 = allSubtasks.find(s => parseInt(String(s.id)) == parseInt(String(itemId)));
      
      console.log('Tentativa 1 (==):', altItem1);
      console.log('Tentativa 2 (String ==):', altItem2);
      console.log('Tentativa 3 (parseInt ==):', altItem3);
      
      return;
    }

    const numericId = parseInt(itemId);
    console.log('numericId:', numericId);
    
    if (isNaN(numericId)) {
      console.log('ID inválido, tentando usar itemId diretamente:', itemId);
      // Se não conseguir converter para number, usar o ID original
      const directId = itemId;
      console.log('Usando ID direto:', directId);
    }

    try {
      if (item.type === 'card') {
        // Mapear status do Kanban para status do banco de dados
        let dbStatus: 'todo' | 'progress' | 'done' = 'todo';
        if (newStatus === 'pending') {
          dbStatus = 'todo';
        } else if (newStatus === 'in_progress') {
          dbStatus = 'progress';
        } else if (newStatus === 'completed') {
          dbStatus = 'done';
        }
        
        await db.updateCard(String(numericId), { status: dbStatus });
        
        // Temporariamente comentar para debug
        /*
        // Disparar evento de sincronização para mudança de status do card
        triggerCardStatusChange(numericId, newStatus, 'my_activities');
        triggerCardUpdate(numericId, 'my_activities');
        
        console.log('🔄 Sync: Card status change triggered from MyActivities', { cardId: numericId, newStatus, dbStatus });
        */
      } else {
        // Mapear status do Kanban para status do banco de dados
        let dbStatus = newStatus;
        if (newStatus === 'pending') {
          dbStatus = 'todo';
        } else if (newStatus === 'in_progress') {
          dbStatus = 'in_progress';
        } else if (newStatus === 'completed') {
          dbStatus = 'completed';
        }
        
        // Usar o ID correto para a subtarefa
        const subtaskId = isNaN(numericId) ? parseInt(itemId) : numericId;
        
        console.log('Atualizando subtarefa no banco:');
        console.log('- itemId original:', itemId);
        console.log('- numericId:', numericId);
        console.log('- subtaskId final:', subtaskId);
        console.log('- dbStatus:', dbStatus);
        console.log('- item.type:', item.type);
        
        await db.updateSubtask(subtaskId, { status: dbStatus });
        console.log('Subtarefa atualizada no banco com sucesso!');
        
        // Temporariamente comentar para debug
        /*
        // Disparar eventos de sincronização para mudança de status da subtarefa
        if (item.parentCardId) {
          const parentCardId = parseInt(item.parentCardId);
          triggerSubtaskStatusChange(parentCardId, subtaskId, newStatus, 'my_activities');
          triggerSubtaskUpdate(parentCardId, subtaskId, 'my_activities');
          triggerCardUpdate(parentCardId, 'my_activities'); // Atualizar o card pai também
          
          console.log('🔄 Sync: Subtask status change triggered from MyActivities');
        }
        */
      }

      const newActivities = activities.map(act => {
        if (act.id === itemId) {
          return { ...act, status: newStatus as any, completed: newStatus === 'completed' };
        }
        if (act.subtasks) {
          return {
            ...act,
            subtasks: act.subtasks.map(sub => {
              // Comparar IDs de forma mais robusta
              const subIdMatches = sub.id === itemId || 
                                 String(sub.id) === String(itemId) || 
                                 parseInt(String(sub.id)) === parseInt(String(itemId));
              
              console.log('Comparando IDs para atualização:', {
                subId: sub.id,
                subIdType: typeof sub.id,
                itemId: itemId,
                itemIdType: typeof itemId,
                matches: subIdMatches,
                subTitle: sub.title
              });
              
              return subIdMatches 
                ? { ...sub, status: newStatus as any, completed: newStatus === 'completed' }
                : sub;
            })
          };
        }
        return act;
      });

      console.log('Atualizando estado local:');
      console.log('- newActivities:', newActivities);

      setActivities(newActivities);
      
      // Atualizar selectedCardForKanban se estiver selecionado
      if (selectedCardForKanban) {
        const updatedCard = newActivities.find(a => a.id === selectedCardForKanban.id);
        if (updatedCard) {
          setSelectedCardForKanban(updatedCard);
        }
      }
      
      // Atualizar selectedActivity se estiver selecionado
      if (selectedActivity) {
        const updatedActivity = newActivities.find(a => a.id === selectedActivity.id);
        if (updatedActivity) {
          setSelectedActivity(updatedActivity);
        }
      }
      addToast({ type: 'success', title: 'Status atualizado', message: `Item movido para ${newStatus}` });
      console.log('Estado local atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao mover item:', error);
      addToast({ type: 'error', title: 'Erro ao atualizar', message: 'Não foi possível mover o item.' });
    }
  };

  // Funções para modal de subtarefas
  const handleSubtaskClick = async (subtask: any) => {
    console.log('Clique na subtarefa:', subtask);
    
    try {
      // Carregar dados completos da subtarefa se necessário
      const fullSubtask = {
        ...subtask,
        id: subtask.id
      };
      
      setSelectedSubtaskForModal(fullSubtask);
      setShowSubtaskModal(true);
    } catch (error) {
      console.error('Erro ao abrir modal de subtarefa:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível abrir os detalhes da subtarefa.'
      });
    }
  };

  const handleCloseSubtaskModal = () => {
    setShowSubtaskModal(false);
    setSelectedSubtaskForModal(null);
  };

  const handleUpdateSubtask = async (updatedSubtask: any) => {
    try {
      console.log('Atualizando subtarefa:', updatedSubtask);
      
      // Atualizar a subtarefa nas atividades
      setActivities(prevActivities => {
        return prevActivities.map(activity => ({
          ...activity,
          subtasks: activity.subtasks?.map(subtask => 
            subtask.id === selectedSubtaskForModal?.id 
              ? { ...subtask, ...updatedSubtask }
              : subtask
          ) || []
        }));
      });

      // Atualizar o card selecionado para kanban se necessário
      if (selectedCardForKanban) {
        setSelectedCardForKanban(prev => ({
          ...prev!,
          subtasks: prev!.subtasks?.map(subtask => 
            subtask.id === selectedSubtaskForModal?.id 
              ? { ...subtask, ...updatedSubtask }
              : subtask
          ) || []
        }));
      }

      // Atualizar a atividade selecionada se necessário
      if (selectedActivity) {
        setSelectedActivity(prev => ({
          ...prev!,
          subtasks: prev!.subtasks?.map(subtask => 
            subtask.id === selectedSubtaskForModal?.id 
              ? { ...subtask, ...updatedSubtask }
              : subtask
          ) || []
        }));
      }

      // Atualizar a subtarefa selecionada para detalhes
      if (selectedSubtask && selectedSubtask.id === selectedSubtaskForModal?.id) {
        setSelectedSubtask(prev => ({ ...prev!, ...updatedSubtask }));
      }

      // Atualizar a subtarefa selecionada no modal
      setSelectedSubtaskForModal((prev: any) => ({ ...prev, ...updatedSubtask }));
      
      addToast({
        type: 'success',
        title: 'Subtarefa atualizada',
        message: 'A subtarefa foi atualizada com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao atualizar subtarefa:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      console.log('Excluindo subtarefa:', subtaskId);
      
      // Remover a subtarefa das atividades
      setActivities(prevActivities => {
        return prevActivities.map(activity => ({
          ...activity,
          subtasks: activity.subtasks?.filter(subtask => subtask.id !== subtaskId) || []
        }));
      });

      // Atualizar o card selecionado para kanban se necessário
      if (selectedCardForKanban) {
        setSelectedCardForKanban(prev => ({
          ...prev!,
          subtasks: prev!.subtasks?.filter(subtask => subtask.id !== subtaskId) || []
        }));
      }

      // Atualizar a atividade selecionada se necessário
      if (selectedActivity) {
        setSelectedActivity(prev => ({
          ...prev!,
          subtasks: prev!.subtasks?.filter(subtask => subtask.id !== subtaskId) || []
        }));
      }

      // Limpar a subtarefa selecionada para detalhes se for a mesma
      if (selectedSubtask && selectedSubtask.id === subtaskId) {
        setSelectedSubtask(null);
      }
      
      addToast({
        type: 'success',
        title: 'Subtarefa excluída',
        message: 'A subtarefa foi excluída com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao excluir subtarefa:', error);
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;

      console.log('🔄 Carregando atividades...');
      const boards = await db.getBoards(user.id);
      let allCards: any[] = [];
      
      // Carregar quadros disponíveis
      const boardsList = boards.map(board => ({
        id: String(board.board_id || board.id),
        name: board.name
      }));
      setAvailableBoards(boardsList);
      
      for (const board of boards) {
        try {
          const boardCards = await db.getCardsForBoardByUser(
            String(board.board_id || board.id), 
            user?.id || 1, 
            user?.role || 'member'
          );
          if (boardCards && boardCards.length > 0) {
            // Adicionar boardId aos cards
            const cardsWithBoardId = boardCards.map(card => ({
              ...card,
              boardId: String(board.board_id || board.id)
            }));
            allCards = [...allCards, ...cardsWithBoardId];
          }
        } catch (error) {
          console.log(`Board ${board.name} não encontrado ou excluído, pulando...`);
          continue;
        }
      }

      for (const card of allCards) {
        try {
          let cardId = null;
          if (card.id && typeof card.id === 'number') {
            cardId = card.id;
          } else if (card.card_id) {
            cardId = parseInt(card.card_id);
          }
          
          if (!cardId || isNaN(cardId)) {
            card.subtasks = [];
            continue;
          }
          
          const subtasks = await db.getSubtasksForCardByUser(
            cardId, 
            user?.id || 1, 
            user?.role || 'member'
          );
          
          card.subtasks = subtasks;
          console.log(`Subtasks for card '${card.title}':`, subtasks);
        } catch (error) {
          console.error(`Erro ao carregar subtarefas para card "${card.title}":`, error);
          card.subtasks = [];
        }
      }

      const convertedActivities: ActivityItem[] = allCards.map(card => {
        let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
        if (card.importance) {
          const importance = card.importance.toLowerCase();
          if (importance === 'critical' || importance === 'urgent') {
            priority = 'urgent';
          } else if (importance === 'high' || importance === 'alta') {
            priority = 'high';
          } else if (importance === 'medium' || importance === 'normal' || importance === 'média') {
            priority = 'medium';
          } else if (importance === 'low' || importance === 'baixa') {
            priority = 'low';
          }
        }

        // Mapear status do card do banco para status do Kanban
        let cardStatus = 'pending';
        if (card.status === 'todo') {
          cardStatus = 'pending';
        } else if (card.status === 'progress' || card.status === 'in_progress') {
          cardStatus = 'in_progress';
        } else if (card.status === 'done' || card.status === 'completed') {
          cardStatus = 'completed';
        } else {
          cardStatus = card.status || 'pending';
        }

        return {
          id: card.card_id,
          type: 'card',
          title: card.title,
          description: card.description,
          status: cardStatus as 'pending' | 'completed' | 'in_progress',
          priority: priority,
          dueDate: card.due_date,
          completed: cardStatus === 'completed',
          boardId: card.boardId,
          subtasks: card.subtasks?.filter((sub: any) => {
            // Filtrar subtarefas baseado nos membros
            const currentUserId = user?.id?.toString();
            const subtaskMembers = sub.members || [];
            
            // Se não há membros definidos, mostrar para todos (compatibilidade)
            if (!subtaskMembers || subtaskMembers.length === 0) {
              return true;
            }
            
            // Verificar se o usuário atual está nos membros da subtarefa
            const isMember = subtaskMembers.includes(currentUserId) || 
                           subtaskMembers.some((member: any) => 
                             (typeof member === 'object' ? member.id : member) === currentUserId
                           );
            
            console.log('Verificando membros da subtarefa:', {
              subtaskTitle: sub.title,
              subtaskMembers: subtaskMembers,
              currentUserId: currentUserId,
              isMember: isMember
            });
            
            return isMember;
          }).map((sub: any) => {
            // Mapear status do banco para status do Kanban
            let mappedStatus = 'pending';
            if (sub.status === 'todo') {
              mappedStatus = 'pending';
            } else if (sub.status === 'in_progress') {
              mappedStatus = 'in_progress';
            } else if (sub.status === 'completed') {
              mappedStatus = 'completed';
            } else {
              mappedStatus = sub.status || 'pending';
            }
            
            const subtaskId = sub.subtask_id || sub.id;
            console.log('Mapeando subtarefa:', {
              originalId: sub.id,
              subtask_id: sub.subtask_id,
              finalId: subtaskId,
              title: sub.title,
              status: sub.status,
              mappedStatus: mappedStatus
            });
            
            return {
              id: subtaskId,
            type: 'subtask',
            title: sub.title,
            description: sub.description,
              status: mappedStatus,
            priority: sub.priority || 'medium',
            dueDate: sub.due_date,
              completed: sub.status === 'completed',
            parentCardId: card.card_id
            };
          })
        };
      });

      setActivities(convertedActivities);
      console.log(`✅ Atividades carregadas: ${convertedActivities.length} atividades`);
      console.log('Converted Activities:', JSON.stringify(convertedActivities, null, 2));
      
      // Carregar informações dos membros de todos os cards
      const allMemberIds = new Set<number>();
      convertedActivities.forEach(activity => {
        if (activity.members && Array.isArray(activity.members)) {
          activity.members.forEach(memberId => {
            if (typeof memberId === 'number') {
              allMemberIds.add(memberId);
            }
          });
        }
      });
      
      if (allMemberIds.size > 0) {
        await loadMembersInfo(Array.from(allMemberIds));
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar atividades',
        message: 'Não foi possível carregar suas atividades.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUserPreferences().then(() => {
      loadActivities();
      });
    }
  }, [user?.id]);

  // Salva preferências automaticamente quando mudarem
  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('viewMode', viewMode);
    }
  }, [viewMode, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('filterType', filterType);
    }
  }, [filterType, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('filterStatus', filterStatus);
    }
  }, [filterStatus, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('filterPriority', filterPriority);
    }
  }, [filterPriority, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('filterBoard', filterBoard);
    }
  }, [filterBoard, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('hideEmptyCards', hideEmptyCards);
    }
  }, [hideEmptyCards, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('groupByBoard', groupByBoard);
    }
  }, [groupByBoard, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('showFilters', showFilters);
    }
  }, [showFilters, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('showOptions', showOptions);
    }
  }, [showOptions, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('sortBy', sortBy);
    }
  }, [sortBy, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) {
      savePreference('sortOrder', sortOrder);
    }
  }, [sortOrder, preferencesLoaded]);

  // Cleanup do timeout quando componente for desmontado
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // ===== LISTENERS DE SINCRONIZAÇÃO =====
  
  // Temporariamente comentar para debug
  /*
  // Escutar mudanças de status de cards vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onCardStatusChange((cardId, newStatus, source) => {
      if (source !== 'my_activities') { // Evitar loops
        console.log('🔄 Sync: Card status change received in MyActivities from', source, { cardId, newStatus });
        
        // Atualizar o card específico no estado local em vez de recarregar tudo
        setActivities(prevActivities => {
          return prevActivities.map(activity => {
            if (activity.id === cardId.toString()) {
              return { ...activity, status: newStatus as any, completed: newStatus === 'completed' };
            }
            return activity;
          });
        });
        
        addToast({
          type: 'info',
          title: 'Card atualizado',
          message: `Status do card foi atualizado para "${newStatus}"`
        });
      }
    });

    return unsubscribe;
  }, [onCardStatusChange, addToast]);

  // Escutar mudanças de status de subtarefas vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onSubtaskStatusChange((cardId, subtaskId, newStatus, source) => {
      if (source !== 'my_activities') { // Evitar loops
        console.log('🔄 Sync: Subtask status change received in MyActivities from', source, { cardId, subtaskId, newStatus });
        
        // Atualizar a subtarefa específica no estado local
        setActivities(prevActivities => {
          return prevActivities.map(activity => {
        if (activity.subtasks) {
          return {
            ...activity,
                subtasks: activity.subtasks.map(subtask => {
                  if (subtask.id === subtaskId.toString()) {
                    return { ...subtask, status: newStatus as any, completed: newStatus === 'completed' };
                  }
                  return subtask;
                })
          };
        }
        return activity;
          });
        });
      }
    });

    return unsubscribe;
  }, [onSubtaskStatusChange]);

  // Escutar atualizações de cards vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onCardUpdate((cardId, source) => {
      if (source !== 'my_activities') { // Evitar loops
        console.log('🔄 Sync: Card update received in MyActivities from', source, { cardId });
        
        // Recarregar apenas o card específico em vez de todas as atividades
        // Isso evita o mapeamento múltiplo
        const reloadSpecificCard = async () => {
          try {
            const boards = await db.getBoards(user?.id || 1);
            let allCards: any[] = [];
            
            for (const board of boards) {
              const cards = await db.getCardsForBoardByUser(
                String(board.board_id || board.id), 
                user?.id || 1, 
                user?.role || 'member'
              );
              allCards = [...allCards, ...cards];
            }
            
            // Encontrar e atualizar apenas o card específico
            const updatedCard = allCards.find(card => card.id === cardId);
            if (updatedCard) {
              setActivities(prevActivities => {
                return prevActivities.map(activity => {
                  if (activity.id === cardId.toString()) {
        return {
          ...activity,
                      status: updatedCard.status,
                      completed: updatedCard.status === 'completed'
        };
      }
      return activity;
                });
              });
            }
          } catch (error) {
            console.error('Erro ao recarregar card específico:', error);
          }
        };
        
        reloadSpecificCard();
      }
    });

    return unsubscribe;
  }, [onCardUpdate, user?.id, user?.role]);

  // Escutar atualizações de subtarefas vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onSubtaskUpdate((cardId, subtaskId, source) => {
      if (source !== 'my_activities') { // Evitar loops
        console.log('🔄 Sync: Subtask update received in MyActivities from', source, { cardId, subtaskId });
        
        // Recarregar apenas as subtarefas do card específico
        const reloadCardSubtasks = async () => {
          try {
            const subtasks = await db.getSubtasksForCardByUser(cardId, user?.id || 1, user?.role || 'member');
            
            setActivities(prevActivities => {
              return prevActivities.map(activity => {
                if (activity.id === cardId.toString()) {
                  const mappedSubtasks = subtasks.map(subtask => ({
                    id: subtask.id.toString(),
                    type: 'subtask' as const,
                    title: subtask.title,
                    description: subtask.description,
                    status: (subtask.status === 'completed' ? 'completed' : 
                            subtask.status === 'in_progress' ? 'in_progress' : 'pending') as any,
                    priority: (subtask.priority || 'medium') as any,
                    completed: subtask.completed,
                    parentCardId: cardId.toString(),
                    boardId: activity.boardId
                  }));
                  
                  return { ...activity, subtasks: mappedSubtasks };
                }
                return activity;
              });
            });
          } catch (error) {
            console.error('Erro ao recarregar subtarefas do card:', error);
          }
        };
        
        reloadCardSubtasks();
      }
    });

    return unsubscribe;
  }, [onSubtaskUpdate, user?.id, user?.role]);
  */

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (viewMode === 'kanban') {
        matchesType = activity.type === 'card';
    } else if (filterType !== 'all') {
      if (filterType === 'cards') {
        matchesType = activity.type === 'card';
      } else if (filterType === 'subtasks') {
        matchesType = activity.type === 'subtask' || activity.type === 'individual_subtask';
      }
    }
    
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || activity.priority === filterPriority;
    const matchesBoard = filterBoard === 'all' || activity.boardId === filterBoard;
    
    // Filtrar cards sem subtarefas se a opção estiver ativada
    const hasSubtasks = !hideEmptyCards || (activity.subtasks && activity.subtasks.length > 0);
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesBoard && hasSubtasks;
  });

  // Função para ordenar as atividades
  const sortActivities = (activities: ActivityItem[]) => {
    return [...activities].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case 'priority':
          const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'status':
          const statusOrder = { 'completed': 3, 'in_progress': 2, 'pending': 1 };
          aValue = statusOrder[a.status] || 0;
          bValue = statusOrder[b.status] || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.id).getTime(); // Usando ID como proxy para data de criação
          bValue = new Date(b.id).getTime();
          break;
      default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedAndFilteredActivities = sortActivities(filteredActivities);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderActivityItem = (activity: ActivityItem, level: number = 0) => {
    const isExpanded = expandedItems.has(activity.id);
    const hasSubtasks = activity.subtasks && activity.subtasks.length > 0;
    
    const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date();
    const isUrgent = activity.dueDate && new Date(activity.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const isSubtask = activity.type === 'subtask' || activity.type === 'individual_subtask';

    return (
      <div key={activity.id} className={`
        ${level === 0 ? 'mb-4' : 'mb-3'}
        ${isSubtask ? 'ml-6' : ''}
        group
      `}>
        <div 
          className={`
            relative overflow-hidden rounded-xl border transition-all duration-300 ease-in-out
            ${selectedActivity?.id === activity.id 
              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50' 
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50'
            }
            ${isSubtask 
              ? 'border-l-4 border-l-red-400 bg-gradient-to-r from-red-50/50 to-white' 
              : 'border-l-4'
            }
            ${activity.status === 'completed' ? 'opacity-75' : ''}
          `}
          style={!isSubtask ? { borderLeftColor: getPriorityColor(activity.priority) } : {}}
          onClick={() => {
            console.log('Atividade clicada:', activity);
            setSelectedActivity(activity);
            // Se a subtarefa selecionada não pertence a esta atividade, limpar a seleção
            if (selectedSubtask && selectedSubtask.parentCardId !== activity.id) {
              console.log('Limpando subtarefa selecionada pois pertence a outra atividade');
              setSelectedSubtask(null);
            }
          }}
        >
          <div className="relative flex items-center p-5">
            {hasSubtasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(activity.id);
                }}
                className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-110"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}

            <div className={`mr-4 p-2.5 rounded-full shadow-sm ${
              isSubtask 
                ? 'bg-gradient-to-br from-red-100 to-red-200 border border-red-200' 
                : 'bg-gradient-to-br from-[#16704E]/10 to-[#16704E]/20 border border-[#16704E]/20'
            }`}>
              {activity.status === 'completed' ? <CheckCircle className="w-4 h-4 text-[#16704E]" /> : activity.status === 'in_progress' ? <Clock3 className="w-4 h-4 text-orange-500" /> : <Circle className="w-4 h-4 text-red-400" />}
            </div>

            <div className="mr-4">
                             <span className={`
                 px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm
                 ${activity.type === 'card' 
                   ? 'bg-gradient-to-r from-[#16704E] to-[#0F5A3A] text-white border-[#16704E]' 
                   : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600'
                 }
               `}>
                 {activity.type === 'card' ? 'Tarefa' : 'Subtarefa'}
               </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className={`
                  font-bold truncate
                  ${activity.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}
                  ${isSubtask ? 'text-sm' : 'text-lg'}
                  group-hover:text-slate-900 transition-colors duration-200
                `}>
                  {activity.title}
                </h3>
                {hasSubtasks && (
                  <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-semibold border border-slate-200 shadow-sm">
                    {activity.subtasks?.length} subtarefa{activity.subtasks?.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {activity.description && (
                <p className={`text-slate-600 truncate leading-relaxed ${isSubtask ? 'text-xs' : 'text-sm'}`}>
                  {activity.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: getPriorityColor(activity.priority) }}
                  />
                  {activity.priority === 'urgent' ? 'Urgente' :
                   activity.priority === 'high' ? 'Alta' :
                   activity.priority === 'medium' ? 'Normal' :
                   activity.priority === 'low' ? 'Baixa' :
                   'Normal'}
                </span>
              </div>

              {activity.dueDate && (
                <div className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-[#16704E]'}`}>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(activity.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasSubtasks && isExpanded && (
            <div className="bg-gradient-to-br from-red-50 via-slate-50 to-[#16704E]/10 border-t border-red-200/50">
              <div className="px-6 py-4">
                <div className="text-sm font-bold text-red-800 mb-3 flex items-center">
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Subtarefas ({activity.subtasks?.length})
                  </div>
                  <div className="space-y-3">
                    {activity.subtasks?.map(subtask => renderActivityItem(subtask, level + 1))}
                  </div>
                            </div>
                          </div>
                        )}
        </div>
      </div>
    );
  };

  const renderActivityDetails = () => {
    console.log('renderActivityDetails chamado - selectedActivity:', selectedActivity);
    console.log('renderActivityDetails chamado - selectedSubtask:', selectedSubtask);
    
    if (!selectedActivity) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma atividade selecionada</h3>
            <p className="text-gray-600">Clique em uma atividade na lista para ver os detalhes</p>
          </div>
        </div>
      );
    }

    // Se uma subtarefa estiver selecionada, mostrar seus detalhes
    if (selectedSubtask) {
      console.log('Mostrando detalhes da subtarefa:', selectedSubtask);
      return (
        <div className="p-6 space-y-6">
          {/* Botão para voltar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedSubtask(null)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para {selectedActivity.title}</span>
            </button>
          </div>

          {/* Detalhes da Subtarefa */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-red-100">
                  {selectedSubtask.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> : selectedSubtask.status === 'in_progress' ? <Clock3 className="w-4 h-4 text-orange-500" /> : <Circle className="w-4 h-4 text-red-400" />}
                </div>
                <span 
                  className="px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm"
                  style={{ 
                    backgroundColor: getPriorityColor(selectedSubtask.priority),
                    color: getPriorityTextColor(selectedSubtask.priority)
                  }}
                >
                  {selectedSubtask.priority === 'urgent' ? 'Urgente' :
                   selectedSubtask.priority === 'high' ? 'Alta' :
                   selectedSubtask.priority === 'medium' ? 'Normal' :
                   selectedSubtask.priority === 'low' ? 'Baixa' :
                   'Normal'}
                </span>
                <span className="px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm bg-red-100 text-red-800 border-red-300">
                  Subtarefa
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit3 className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ExternalLink className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedSubtask.title}</h2>
          </div>

          {/* Descrição da Subtarefa */}
          {selectedSubtask.description && (
            <div className="bg-gradient-to-r from-slate-50 via-red-50 to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center text-slate-800">
                <div className="p-1.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mr-2">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                Descrição
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {selectedSubtask.description}
              </p>
            </div>
          )}

          {/* Informações Adicionais da Subtarefa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedSubtask.dueDate && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold mb-2 flex items-center text-blue-800">
                  <Calendar className="w-4 h-4 mr-2" />
                  Data de Vencimento
                </h4>
                <p className="text-blue-700">{new Date(selectedSubtask.dueDate).toLocaleDateString('pt-BR')}</p>
              </div>
            )}

            {selectedSubtask.assignedTo && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <h4 className="font-semibold mb-2 flex items-center text-green-800">
                  <User className="w-4 h-4 mr-2" />
                  Responsável
                </h4>
                <p className="text-green-700">{selectedSubtask.assignedTo}</p>
              </div>
            )}

            {selectedSubtask.estimatedTime && (
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <h4 className="font-semibold mb-2 flex items-center text-orange-800">
                  <Clock className="w-4 h-4 mr-2" />
                  Tempo Estimado
                </h4>
                <p className="text-orange-700">{selectedSubtask.estimatedTime} minutos</p>
              </div>
            )}

            {selectedSubtask.tags && selectedSubtask.tags.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <h4 className="font-semibold mb-2 flex items-center text-purple-800">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSubtask.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const newStatus = selectedSubtask.status === 'completed' ? 'pending' : 'completed';
                handleItemMove(String(selectedSubtask.id), newStatus);
                setSelectedSubtask({...selectedSubtask, status: newStatus as any});
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSubtask.status === 'completed' 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {selectedSubtask.status === 'completed' ? 'Marcar como Pendente' : 'Marcar como Concluída'}
            </button>

            <button
              onClick={() => {
                const newStatus = selectedSubtask.status === 'in_progress' ? 'pending' : 'in_progress';
                handleItemMove(String(selectedSubtask.id), newStatus);
                setSelectedSubtask({...selectedSubtask, status: newStatus as any});
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSubtask.status === 'in_progress' 
                  ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {selectedSubtask.status === 'in_progress' ? 'Marcar como Pendente' : 'Marcar como Em Progresso'}
            </button>
          </div>
        </div>
      );
    }

    const isSubtask = selectedActivity.type === 'subtask' || selectedActivity.type === 'individual_subtask';

    return (
      <div className="p-6 space-y-6">
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isSubtask ? 'bg-red-100' : 'bg-[#16704E]/20'}`}>
                {selectedActivity.status === 'completed' ? <CheckCircle className="w-4 h-4 text-[#16704E]" /> : selectedActivity.status === 'in_progress' ? <Clock3 className="w-4 h-4 text-orange-500" /> : <Circle className="w-4 h-4 text-red-400" />}
              </div>
              <span 
                className="px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm"
                style={{ 
                  backgroundColor: getPriorityColor(selectedActivity.priority),
                  color: getPriorityTextColor(selectedActivity.priority)
                }}
              >
                {selectedActivity.priority === 'urgent' ? 'Urgente' :
                 selectedActivity.priority === 'high' ? 'Alta' :
                 selectedActivity.priority === 'medium' ? 'Normal' :
                 selectedActivity.priority === 'low' ? 'Baixa' :
                 'Normal'}
              </span>
                             <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm ${selectedActivity.type === 'card' ? 'bg-[#16704E]/20 text-[#16704E] border-[#16704E]/30' : 'bg-red-100 text-red-800 border-red-300'}`}>
                 {selectedActivity.type === 'card' ? 'Tarefa' : 'Subtarefa'}
               </span>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit3 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ExternalLink className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedActivity.title}</h2>
        </div>

        {selectedActivity.description && (
          <div className="bg-gradient-to-r from-slate-50 via-[#16704E]/10 to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center text-slate-800">
              <div className="p-1.5 bg-gradient-to-br from-[#16704E] to-[#0F5A3A] rounded-lg mr-2">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Descrição
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {selectedActivity.description}
            </p>
          </div>
        )}

        {selectedActivity.subtasks && selectedActivity.subtasks.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subtarefas ({selectedActivity.subtasks.length})</h3>
            </div>
            
            {/* Lista de Subtarefas */}
            <div className="space-y-3">
              {selectedActivity.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    (() => {
                      const isSelected = selectedSubtask && (selectedSubtask as ActivityItem).id && String((selectedSubtask as ActivityItem).id) === String(subtask.id);
                      if (isSelected) return 'bg-purple-100 border-purple-400 shadow-lg';
                      if (subtask.status === 'completed') return 'bg-green-50 border-green-200 hover:bg-green-100';
                      if (subtask.status === 'in_progress') return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
                      return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
                    })()
                  }`}
                  onClick={() => {
                    console.log('Subtarefa clicada:', subtask);
                    console.log('ID da subtarefa:', subtask.id);
                    console.log('Título da subtarefa:', subtask.title);
                    console.log('Status da subtarefa:', subtask.status);
                    
                    // Definir a subtarefa selecionada para exibir detalhes
                    setSelectedSubtask(subtask);
                    console.log('selectedSubtask definido:', subtask);
                    
                    // Abrir modal de subtarefas
                    handleSubtaskClick(subtask);
                  }}
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Checkbox simples */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newStatus = subtask.status === 'completed' ? 'pending' : 'completed';
                        handleItemMove(String(subtask.id), newStatus);
                      }}
                      className={`flex-shrink-0 p-1 rounded transition-colors ${
                        subtask.status === 'completed' 
                          ? 'text-green-600' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                    >
                      {subtask.status === 'completed' ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Título da subtarefa */}
                    <h4 className={`font-medium flex-1 ${
                      subtask.status === 'completed' 
                        ? 'text-green-800 line-through' 
                        : 'text-gray-900'
                    }`}>
                      {subtask.title}
                    </h4>
                    
                    {/* Status simples */}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      subtask.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : subtask.status === 'in_progress'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {subtask.status === 'completed' ? 'Concluída' : 
                       subtask.status === 'in_progress' ? 'Em Progresso' : 'A Fazer'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-light-gray/30 dark:bg-gray-900">
        <div className="text-center">
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
              }
            `
          }} />
          
          <div className="relative mb-6">
            <div>
              <img 
                src="/carregamento.png" 
                alt="Carregando" 
                className="w-24 h-24 mx-auto rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
              <div className="hidden w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                ⚡
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-brand-gray dark:text-gray-50 mb-2">
              Carregando suas atividades...
            </h2>
            <p className="text-brand-gray/70 dark:text-gray-300">
              Organizando suas tarefas e subtarefas
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Cabeçalho com fundo verde escuro e padrão de estrelas */}
      <div className="header-with-stars text-white shadow-xl">
        <div className="header-content max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start h-20">
            {/* Ícone de atividades */}
            <div className="mr-4">
              <img 
                src="/atividades.png" 
                alt="Atividades" 
                className="header-logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {/* Título "Minhas Atividades" */}
            <h1 className="header-title">
              Minhas Atividades
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 border-b border-slate-200 shadow-sm">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4">
          {/* Barra de Busca Discreta */}
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative max-w-xl flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                  placeholder="Buscar atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-1 focus:ring-[#16704E]/30 focus:border-[#16704E]/50 transition-all duration-200 text-sm bg-white/70 backdrop-blur-sm shadow-sm hover:bg-white/80"
                />
              </div>
              <button
                onClick={() => {
                  console.log('🔄 Forçando recarregamento das atividades...');
                  loadActivities();
                }}
                className="px-3 py-2.5 bg-[#16704E] text-white rounded-lg hover:bg-[#0F5A3A] transition-colors duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                title="Recarregar atividades"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Atualizar</span>
              </button>
            </div>
            </div>

          {/* Sistema de Filtros com Botões */}
          <div className="space-y-4">
            {/* Linha de Botões de Filtro */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Indicador de Filtros Ativos */}
              {(filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || filterBoard !== 'all' || hideEmptyCards || groupByBoard) && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-[#16704E] to-[#0F5A3A] rounded-xl text-white shadow-lg shadow-[#16704E]/25">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Filtros Ativos</span>
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setFilterBoard('all');
                      setHideEmptyCards(false);
                      setGroupByBoard(false);
                    }}
                    className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Limpar todos os filtros"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Botão de Filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 ${
                  showFilters || filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || filterBoard !== 'all'
                    ? 'bg-gradient-to-r from-[#16704E] to-[#0F5A3A] text-white shadow-[#16704E]/25' 
                    : 'bg-white/80 text-slate-600 border border-slate-200/60 hover:bg-white hover:border-[#16704E]/30 hover:text-[#16704E]'
                }`}
              >
                <Filter className={`w-4 h-4 transition-colors duration-200 ${
                  showFilters || filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || filterBoard !== 'all'
                    ? 'text-white' 
                    : 'text-slate-500 group-hover:text-[#16704E]'
                }`} />
                <span>Filtros</span>
                {(filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || filterBoard !== 'all') && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>

              {/* Botão de Opções */}
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 ${
                  showOptions || hideEmptyCards || groupByBoard
                    ? 'bg-gradient-to-r from-[#16704E] to-[#0F5A3A] text-white shadow-[#16704E]/25' 
                    : 'bg-white/80 text-slate-600 border border-slate-200/60 hover:bg-white hover:border-[#16704E]/30 hover:text-[#16704E]'
                }`}
              >
                <Settings className={`w-4 h-4 transition-colors duration-200 ${
                  showOptions || hideEmptyCards || groupByBoard
                    ? 'text-white' 
                    : 'text-slate-500 group-hover:text-[#16704E]'
                }`} />
                <span>Opções</span>
                {(hideEmptyCards || groupByBoard) && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>

              {/* Toggle de Visualização Melhorado */}
              <div className="relative flex bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div 
                  className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-[#16704E] to-[#0F5A3A] rounded-lg shadow-lg shadow-[#16704E]/25 transition-all duration-500 ease-out ${
                    viewMode === 'list' ? 'left-1 translate-x-0' : 'left-1 translate-x-full'
                  }`}
                />
                
                <button
                  onClick={() => setViewMode('list')}
                  className={`relative z-10 flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out ${
                    viewMode === 'list' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-slate-600 hover:text-[#16704E] hover:scale-105'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="font-medium">Lista</span>
                </button>
                
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`relative z-10 flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out ${
                    viewMode === 'kanban' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-slate-600 hover:text-[#16704E] hover:scale-105'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="font-medium">Kanban</span>
                </button>
              </div>
            </div>

            {/* Painel de Filtros (Expandível) */}
            {showFilters && (
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 shadow-xl shadow-slate-200/50 animate-in slide-in-from-top-2 duration-300">
                <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-4 py-2.5 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-[#16704E]/30 focus:border-[#16704E]/50 transition-all duration-200 text-sm font-medium appearance-none bg-white/80 backdrop-blur-sm pr-8 shadow-sm hover:bg-white hover:shadow-md"
              >
                      <option value="all">Todos os tipos</option>
                 <option value="cards">Apenas tarefas</option>
                 <option value="subtasks">Apenas subtarefas</option>
              </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-4 py-2.5 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-[#16704E]/30 focus:border-[#16704E]/50 transition-all duration-200 text-sm font-medium appearance-none bg-white/80 backdrop-blur-sm pr-8 shadow-sm hover:bg-white hover:shadow-md"
                    >
                      <option value="all">Todos os status</option>
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em progresso</option>
                      <option value="completed">Concluído</option>
              </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                      className="px-4 py-2.5 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-[#16704E]/30 focus:border-[#16704E]/50 transition-all duration-200 text-sm font-medium appearance-none bg-white/80 backdrop-blur-sm pr-8 shadow-sm hover:bg-white hover:shadow-md"
                    >
                      <option value="all">Todas as prioridades</option>
                      <option value="urgent">Urgente</option>
                      <option value="high">Alta</option>
                      <option value="medium">Normal</option>
                      <option value="low">Baixa</option>
              </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

                  <div className="relative">
                    <select
                      value={filterBoard}
                      onChange={(e) => setFilterBoard(e.target.value)}
                      className="px-4 py-2.5 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-[#16704E]/30 focus:border-[#16704E]/50 transition-all duration-200 text-sm font-medium appearance-none bg-white/80 backdrop-blur-sm pr-8 shadow-sm hover:bg-white hover:shadow-md"
                    >
                      <option value="all">Todos os quadros</option>
                      {availableBoards.map(board => (
                        <option key={board.id} value={board.id}>{board.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-2.5 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-[#16704E]/30 focus:border-[#16704E]/50 transition-all duration-200 text-sm font-medium appearance-none bg-white/80 backdrop-blur-sm pr-8 shadow-sm hover:bg-white hover:shadow-md"
                    >
                      <option value="title">Ordenar por Título</option>
                      <option value="dueDate">Ordenar por Data de Vencimento</option>
                      <option value="priority">Ordenar por Prioridade</option>
                      <option value="status">Ordenar por Status</option>
                      <option value="createdAt">Ordenar por Data de Criação</option>
                    </select>
                    <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>

              <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`px-4 py-2.5 border border-slate-200/60 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-2 ${
                      sortOrder === 'asc' 
                        ? 'bg-gradient-to-r from-[#16704E] to-[#0F5A3A] text-white shadow-[#16704E]/25' 
                        : 'bg-white/80 text-slate-600 hover:bg-white hover:border-[#16704E]/30 hover:text-[#16704E]'
                    }`}
                    title={`Ordenação ${sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}`}
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
              </button>
                </div>
              </div>
            )}

            {/* Painel de Opções (Expandível) */}
            {showOptions && (
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 shadow-xl shadow-slate-200/50 animate-in slide-in-from-top-2 duration-300">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-3 px-4 py-3 border border-slate-200/60 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md transition-all duration-200">
                    <input
                      type="checkbox"
                      id="hideEmptyCards"
                      checked={hideEmptyCards}
                      onChange={(e) => setHideEmptyCards(e.target.checked)}
                      className="w-4 h-4 text-[#16704E] bg-gray-100 border-gray-300 rounded focus:ring-[#16704E] focus:ring-2 transition-all duration-200"
                    />
                    <label htmlFor="hideEmptyCards" className="text-sm font-medium text-slate-700 cursor-pointer hover:text-[#16704E] transition-colors duration-200">
                      Ocultar cards sem subtarefas
                    </label>
                  </div>

              <button
                    onClick={() => setGroupByBoard(!groupByBoard)}
                    className={`px-4 py-2.5 border border-slate-200/60 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-2 ${
                      groupByBoard 
                        ? 'bg-gradient-to-r from-[#16704E] to-[#0F5A3A] text-white shadow-[#16704E]/25' 
                        : 'bg-white/80 text-slate-600 hover:bg-white hover:border-[#16704E]/30 hover:text-[#16704E]'
                    }`}
                    title={groupByBoard ? 'Desagrupar cards' : 'Agrupar cards por quadro'}
                  >
                    <Layers className="w-4 h-4" />
                    {groupByBoard ? 'Agrupado por Quadro' : 'Agrupar por Quadro'}
              </button>
            </div>
          </div>
            )}
          </div>

        </div>
      </div>

      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4">
        {viewMode === 'kanban' ? (
          selectedCardForKanban ? (
            <div>
              <button onClick={() => setSelectedCardForKanban(null)} className="flex items-center mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para a lista de cards
              </button>
              <UnifiedKanban
                columns={kanbanColumns}
                items={selectedCardForKanban.subtasks?.map(s => {
                  const mappedItem = { 
                    ...s, 
                    id: String(s.id),
                    completed: s.status === 'completed', 
                    importance: s.importance as any,
                    estimatedTime: s.estimatedTime ? (typeof s.estimatedTime === 'string' ? parseInt(s.estimatedTime) : s.estimatedTime) : undefined,
                    actualTime: s.actualTime ? (typeof s.actualTime === 'string' ? parseInt(s.actualTime) : s.actualTime) : undefined
                  };
                  console.log('Mapeando subtarefa para UnifiedKanban (card):', {
                    original: s,
                    mapped: mappedItem,
                    originalId: s.id,
                    mappedId: mappedItem.id
                  });
                  return mappedItem;
                }) || []}
                onItemMove={handleItemMove}
              />
            </div>
          ) : (
            <div className="space-y-8">
              {groupByBoard ? (
                <>
                  {/* Resumo do agrupamento */}
                  <div className="bg-gradient-to-r from-[#16704E]/10 to-[#0F5A3A]/10 border border-[#16704E]/20 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <Layers className="w-5 h-5 text-[#16704E]" />
                      <div>
                        <h3 className="font-semibold text-[#16704E]">Agrupado por Quadro</h3>
                        <p className="text-sm text-slate-600">
                          {availableBoards.filter(board => sortedAndFilteredActivities.some(card => card.boardId === board.id)).length} quadro(s) com cards • {sortedAndFilteredActivities.length} card(s) total
                        </p>
                  </div>
                </div>
              </div>
                  
                  {/* Lista de quadros */}
                  {availableBoards.map(board => {
                  const boardCards = sortedAndFilteredActivities.filter(card => card.boardId === board.id);
                  if (boardCards.length === 0) {
                    // Mostrar quadro vazio apenas se não há filtros ativos
                    if (filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || filterBoard !== 'all' || searchTerm) {
                      return null;
                    }
                    
                    return (
                      <div key={board.id} className="space-y-4">
                                  <div className="flex items-center space-x-3">
                          <div className="w-1 h-8 bg-gradient-to-b from-slate-300 to-slate-400 rounded-full"></div>
                          <h2 className="text-xl font-bold text-slate-500">{board.name}</h2>
                          <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            0 cards
                          </span>
                                    </div>
                        <div className="flex items-center justify-center h-32 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <div className="text-center">
                            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum card neste quadro</p>
                                  </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={board.id} className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-[#16704E] to-[#0F5A3A] rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-800">{board.name}</h2>
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          {boardCards.length} {boardCards.length === 1 ? 'card' : 'cards'}
                                    </span>
                                      </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {boardCards.map(card => (
                          <div key={card.id} onClick={() => {
                            console.log('Card clicked:', card);
                            setSelectedCardForKanban(card)
                          }}
                          className="group relative bg-gradient-to-br from-white via-slate-50 to-white rounded-3xl shadow-xl shadow-slate-200/60 cursor-pointer hover:shadow-2xl hover:shadow-slate-300/80 transition-all duration-500 hover:scale-[1.03] border-l-4 overflow-hidden backdrop-blur-sm hover:backdrop-blur-md"
                          style={{ borderLeftColor: getPriorityColor(card.priority) }}
                          >
                            
                            {/* Efeito de brilho no hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            
                            <div className="p-6 relative z-10">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-bold text-xl mb-2 text-slate-800 group-hover:text-slate-900 transition-colors duration-300 leading-tight">{card.title}</h3>
                                <div className="flex items-center space-x-2">
                                  {/* Indicador de subtarefas */}
                                  <div className="flex items-center space-x-1 bg-slate-100 group-hover:bg-slate-200 rounded-full px-2 py-1 transition-colors duration-300">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs font-semibold text-slate-600">{card.subtasks?.length || 0}</span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-sm text-slate-600 mb-4 line-clamp-2 group-hover:text-slate-700 transition-colors duration-300">{card.description}</p>
                              
                              {/* Avatares dos membros */}
                              {card.members && card.members.length > 0 && (
                                <div className="mb-4">
                                  <AvatarGroup 
                                    members={card.members.map(memberId => membersCache.get(typeof memberId === 'string' ? parseInt(memberId) : memberId)).filter(Boolean) as UserType[]}
                                    maxVisible={3}
                                    size="sm"
                                  />
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  {/* Ícone de prioridade */}
                                  <div className={`w-3 h-3 rounded-full ${
                                    card.priority === 'urgent' ? 'bg-red-500' :
                                    card.priority === 'high' ? 'bg-orange-500' :
                                    card.priority === 'medium' ? 'bg-yellow-500' :
                                    card.priority === 'low' ? 'bg-green-500' :
                                    'bg-gray-400'
                                  }`}></div>
                                  <span className="text-xs font-medium text-slate-500">
                              {card.priority === 'urgent' ? 'Urgente' :
                               card.priority === 'high' ? 'Alta' :
                               card.priority === 'medium' ? 'Normal' :
                               card.priority === 'low' ? 'Baixa' :
                               'Normal'}
                    </span>
                  </div>
                                
                                {/* Status tag melhorado */}
                                <span className={`text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all duration-300 group-hover:scale-105 ${getCardStatus(card).statusColor}`}>
                                  {getCardStatus(card).statusLabel}
                                </span>
                              </div>
                            </div>
                            
                            {/* Borda inferior decorativa */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-slate-300 transition-colors duration-300"></div>
                </div>
              ))}
                                      </div>
                                    </div>
                  );
                })}
                </>
              ) : (
                // Não agrupado
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedAndFilteredActivities.map(card => (
                    <div key={card.id} onClick={() => {
                      console.log('Card clicked:', card);
                      setSelectedCardForKanban(card)
                    }}
                    className="group relative bg-gradient-to-br from-white via-slate-50 to-white rounded-3xl shadow-xl shadow-slate-200/60 cursor-pointer hover:shadow-2xl hover:shadow-slate-300/80 transition-all duration-500 hover:scale-[1.03] border-l-4 overflow-hidden backdrop-blur-sm hover:backdrop-blur-md"
                    style={{ borderLeftColor: getPriorityColor(card.priority) }}
                    >
                      
                      {/* Efeito de brilho no hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      
                      <div className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-xl mb-2 text-slate-800 group-hover:text-slate-900 transition-colors duration-300 leading-tight">{card.title}</h3>
                          <div className="flex items-center space-x-2">
                            {/* Indicador de subtarefas */}
                            <div className="flex items-center space-x-1 bg-slate-100 group-hover:bg-slate-200 rounded-full px-2 py-1 transition-colors duration-300">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-semibold text-slate-600">{card.subtasks?.length || 0}</span>
                                            </div>
                                      </div>
                                    </div>

                        <p className="text-sm text-slate-600 mb-4 line-clamp-2 group-hover:text-slate-700 transition-colors duration-300">{card.description}</p>
                        
                        {/* Avatares dos membros */}
                        {card.members && card.members.length > 0 && (
                          <div className="mb-4">
                            <AvatarGroup 
                              members={card.members.map(memberId => membersCache.get(typeof memberId === 'string' ? parseInt(memberId) : memberId)).filter(Boolean) as UserType[]}
                              maxVisible={3}
                              size="sm"
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {/* Tag de importância no estilo kanban */}
                            <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              <div 
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: getPriorityColor(card.priority) }}
                              />
                              {card.priority === 'urgent' ? 'Urgente' :
                               card.priority === 'high' ? 'Alta' :
                               card.priority === 'medium' ? 'Normal' :
                               card.priority === 'low' ? 'Baixa' :
                               'Normal'}
                            </span>
                                            </div>
                          
                          {/* Status tag melhorado */}
                          <span className={`text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all duration-300 group-hover:scale-105 ${getCardStatus(card).statusColor}`}>
                            {getCardStatus(card).statusLabel}
                          </span>
                                          </div>
                                      </div>
                      
                      {/* Borda inferior decorativa */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-slate-300 transition-colors duration-300"></div>
                                    </div>
                  ))}
                                </div>
                              )}
            </div>
          )
        ) : (
          <div className={`grid grid-cols-1 gap-6 lg:grid-cols-5`}>
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-100 via-[#16704E]/10 to-slate-100 p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center">
                      <div className="p-2 bg-gradient-to-br from-[#16704E] to-[#0F5A3A] rounded-lg mr-3 shadow-sm">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      Lista de Atividades
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600 bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1 rounded-full border border-slate-300 shadow-sm">
                      {sortedAndFilteredActivities.length} resultado{sortedAndFilteredActivities.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="max-h-[calc(100vh-350px)] overflow-y-auto p-4 bg-gradient-to-br from-slate-50/50 to-white">
                  <div>
                    {sortedAndFilteredActivities.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-slate-500">
                          <div className="text-center">
                            <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                              <Target className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
                            <p className="text-slate-600">Tente ajustar os filtros ou criar novas atividades</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                        {sortedAndFilteredActivities.map(activity => renderActivityItem(activity))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-xl shadow-xl border border-slate-200 h-[calc(100vh-200px)] overflow-hidden">
                <div className="bg-gradient-to-r from-slate-100 via-red-50 to-slate-100 p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mr-3 shadow-sm">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    Detalhes da Atividade
                  </h2>
                </div>
                <div className="overflow-y-auto h-full bg-gradient-to-br from-slate-50/50 to-white">
                  {renderActivityDetails()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de Subtarefas */}
      <SubtaskModal
        isOpen={showSubtaskModal}
        onClose={handleCloseSubtaskModal}
        subtask={selectedSubtaskForModal}
        onUpdate={handleUpdateSubtask}
        onDelete={handleDeleteSubtask}
      />
    </div>
  );
};

export default MyActivities;
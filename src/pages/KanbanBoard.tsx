import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
// Temporariamente comentar para debug
// import { useSync } from '../contexts/SyncContext';
import ThemeToggle from '../components/ThemeToggle';
import { db } from '../services/database';
import { Board, Card, Column, CardDependency, User as UserType } from '../types';
import AvatarGroup from '../components/AvatarGroup';
import CardDetailModal from '../components/CardDetailModal';
import SubtaskTimeline from '../components/SubtaskTimeline';
import SubtaskModal from '../components/SubtaskModal';
import SubtaskList from '../components/SubtaskList';
import {
  Plus,
  Trash2,
  MessageSquare,
  Paperclip,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Settings,
  Eye,
  Grid,
  List,
  X,
  FolderPlus,
  ArrowLeft,
  Link,
  Users,
  ChevronUp,
  ChevronDown,
  FileText
} from 'lucide-react';

// Interfaces para modelos
interface BoardTemplate {
  id: number;
  name: string;
  description: string;
  columns: string[];
  icon: string;
  color: string;
  category: 'project' | 'task' | 'workflow' | 'custom' | 'development' | 'design' | 'maintenance' | 'marketing' | 'product' | 'hr' | 'support' | 'tasks' | 'sales';
  is_default?: boolean;
}

interface CardTemplate {
  id: number;
  name: string;
  description: string;
  fields: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: string;
    assignee?: number;
    dueDate?: string;
    tags?: string[];
  };
  color: string;
  category: 'task' | 'bug' | 'feature' | 'custom';
}

interface KanbanBoardProps {}

const KanbanBoard: React.FC<KanbanBoardProps> = () => {
  const { user } = useAuth();
  const { addToast, showPopup, showSuccessPopup } = useToast();
  const { getPriorityColor, getPriorityBgColor, getPriorityTextColor, cardSettings } = useSettings();
  // Temporariamente comentar para debug
  // const { 
  //   onCardStatusChange, 
  //   onSubtaskStatusChange, 
  //   onCardUpdate, 
  //   onSubtaskUpdate,
  //   triggerCardStatusChange,
  //   triggerCardUpdate
  // } = useSync();

  const getPriorityLabel = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Normal';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [groupByBoard, setGroupByBoard] = useState(true);
  const [hideCardsWithoutSubtasks, setHideCardsWithoutSubtasks] = useState(false);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [membersCache, setMembersCache] = useState<Map<number, UserType>>(new Map());

  // Estados para modais
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [showBoardTemplatesModal, setShowBoardTemplatesModal] = useState(false);
  const [showCardTemplateModal, setShowCardTemplateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [selectedBoardTemplate, setSelectedBoardTemplate] = useState<BoardTemplate | null>(null);
  const [manualColumns, setManualColumns] = useState<string[]>(['A Fazer', 'Em Progresso', 'Concluído']);
  const [showManualColumns, setShowManualColumns] = useState(false);
  
  // Estado para modal de subtarefas
  const [selectedSubtask, setSelectedSubtask] = useState<any>(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  const [newCardData, setNewCardData] = useState({
    title: '',
    description: '',
    priority: cardSettings.defaultPriority as 'low' | 'medium' | 'high' | 'critical',
    column_id: 1,
    due_date: '',
    members: [user?.id || 1] // Incluir o criador como membro por padrão
  });
  const [selectedCardTemplate, setSelectedCardTemplate] = useState<CardTemplate | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  
  // Estados para criação de templates
  const [showCreateBoardTemplateModal, setShowCreateBoardTemplateModal] = useState(false);
  const [showCreateCardTemplateModal, setShowCreateCardTemplateModal] = useState(false);
  const [showDeleteBoardTemplateModal, setShowDeleteBoardTemplateModal] = useState(false);
  const [showDeleteCardTemplateModal, setShowDeleteCardTemplateModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: number; name: string; type: 'board' | 'card' } | null>(null);
  const [showCardDetailModal, setShowCardDetailModal] = useState(false);

  // Estados para animações de drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [dragOverCard, setDragOverCard] = useState<number | null>(null);
  const [dropAnimation, setDropAnimation] = useState<{ cardId: number; columnId: number } | null>(null);

  // Debug: Monitorar mudanças de estado do modal
  useEffect(() => {
    console.log('Modal state changed:', { showCardDetailModal, selectedCard: selectedCard?.title });
  }, [showCardDetailModal, selectedCard]);

  // Resetar estado de dragging quando o mouse é solto (safety net)
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        console.log('Mouse up detected - resetting drag state');
        setIsDragging(false);
        setDraggedCard(null);
        setDragOverColumn(null);
        setDragOverCard(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);

  const [newBoardTemplate, setNewBoardTemplate] = useState({
    name: '',
    description: '',
    category: 'custom' as 'project' | 'task' | 'workflow' | 'custom',
    icon: 'tarefas',
    color: 'bg-gray-500',
    columns: ['A Fazer', 'Em Progresso', 'Concluído']
  });
  
  // Estados para drag and drop das colunas
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  
  // Estados para drag and drop das abas dos quadros
  const [draggedBoardIndex, setDraggedBoardIndex] = useState<number | null>(null);
  const [isReorderingBoards, setIsReorderingBoards] = useState(false);
  
  const [newCardTemplate, setNewCardTemplate] = useState({
    name: '',
    description: '',
    category: 'custom' as 'task' | 'bug' | 'feature' | 'custom',
    color: 'bg-gray-500',
    fields: {
      title: '',
      description: '',
      priority: cardSettings.defaultPriority as 'low' | 'medium' | 'high' | 'critical',
      status: 'A Fazer'
    }
  });

  // Carregar dados iniciais quando o usuário está disponível
  useEffect(() => {
    if (user?.id) {
      loadKanbanData();
    }
  }, [user?.id]);

  // Carregar usuários disponíveis quando modal de criação de card for aberto
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await db.getUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };

    if (showCreateCardModal) {
      loadUsers();
    }
  }, [showCreateCardModal]);

  // Definir aba ativa quando os quadros são carregados
  useEffect(() => {
    if (boards.length > 0 && activeTab === null) {
      setActiveTab(boards[0].id);
      setCurrentBoard(boards[0]);
      loadBoardData(boards[0]);
    }
  }, [boards]); // Remover activeTab da dependência para evitar loop infinito

  // Recarregar dados quando o board atual muda
  useEffect(() => {
    if (currentBoard && user?.id) {
      console.log('Board atual mudou, recarregando dados:', currentBoard.name);
      loadBoardData(currentBoard);
    }
  }, [currentBoard?.id, user?.id]); // Usar currentBoard?.id para evitar recarregamentos desnecessários

  // ===== LISTENERS DE SINCRONIZAÇÃO =====
  
  // Temporariamente comentar para debug
  /*
  // Escutar mudanças de status de cards vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onCardStatusChange((cardId, newStatus, source) => {
      if (source !== 'kanban_board') { // Evitar loops
        console.log('🔄 Sync: Card status change received from', source, { cardId, newStatus });
        
        // Mapear status para o formato correto do Card
        let mappedStatus: 'todo' | 'progress' | 'done' = 'todo';
        if (newStatus === 'pending') {
          mappedStatus = 'todo';
        } else if (newStatus === 'in_progress') {
          mappedStatus = 'progress';
        } else if (newStatus === 'completed') {
          mappedStatus = 'done';
        }
        
        const finalMappedStatus = mappedStatus as 'todo' | 'progress' | 'done';
        
        // Atualizar o card na lista local
        setCards(prevCards => {
          const updatedCards = prevCards.map(card => {
            if (card.id === cardId) {
              return { ...card, status: finalMappedStatus };
            }
            return card;
          });
          return updatedCards;
        });
        
        // Atualizar o card selecionado se for o mesmo
        if (selectedCard && selectedCard.id === cardId) {
          setSelectedCard(prev => prev ? { ...prev, status: finalMappedStatus } : null);
        }
        
        addToast({
          type: 'info',
          title: 'Card atualizado',
          message: `Status do card foi atualizado para "${newStatus}"`
        });
      }
    });

    return unsubscribe;
  }, [onCardStatusChange, selectedCard, addToast]);

  // Escutar mudanças de status de subtarefas vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onSubtaskStatusChange((cardId, subtaskId, newStatus, source) => {
      if (source !== 'kanban_board') { // Evitar loops
        console.log('🔄 Sync: Subtask status change received from', source, { cardId, subtaskId, newStatus });
        
        // Atualizar as subtarefas do card
        updateCardSubtasks(cardId);
      }
    });

    return unsubscribe;
  }, [onSubtaskStatusChange]);

  // Escutar atualizações de cards vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onCardUpdate((cardId, source) => {
      if (source !== 'kanban_board') { // Evitar loops
        console.log('🔄 Sync: Card update received from', source, { cardId });
        
        // Recarregar o card específico
        updateCardSubtasks(cardId);
      }
    });

    return unsubscribe;
  }, [onCardUpdate]);

  // Escutar atualizações de subtarefas vindas de outros componentes
  useEffect(() => {
    const unsubscribe = onSubtaskUpdate((cardId, subtaskId, source) => {
      if (source !== 'kanban_board') { // Evitar loops
        console.log('🔄 Sync: Subtask update received from', source, { cardId, subtaskId });
        
        // Atualizar as subtarefas do card
        updateCardSubtasks(cardId);
      }
    });

    return unsubscribe;
  }, [onSubtaskUpdate]);
  */

  // Templates de quadros carregados do banco
  const [boardTemplates, setBoardTemplates] = useState<BoardTemplate[]>([]);

  // Templates de cards padrão (serão carregados do banco quando implementado)
  const [cardTemplates, setCardTemplates] = useState<CardTemplate[]>([]);

  // Função para carregar todos os cards (para modo lista)
  const loadAllCards = async () => {
    if (!user) return;
    
    try {
      // Usar type assertion temporariamente
      const allCardsData = await (db as any).getAllCardsForUser(user.id, user.role || 'member');
      console.log('Todos os cards carregados:', allCardsData);
      
      // Carregar informações dos membros
      const allMemberIds = new Set<number>();
      allCardsData.forEach((card: Card) => {
        if (card.members && Array.isArray(card.members)) {
          card.members.forEach(memberId => {
            if (typeof memberId === 'number') {
              allMemberIds.add(memberId);
            } else if (typeof memberId === 'string') {
              allMemberIds.add(parseInt(memberId));
            }
          });
        }
      });

      if (allMemberIds.size > 0) {
        await loadMembersInfo(Array.from(allMemberIds));
      }
      
      setAllCards(allCardsData);
    } catch (error) {
      console.error('Erro ao carregar todos os cards:', error);
    }
  };

  // Função para atualizar um card específico quando suas subtarefas mudarem
  const updateCardSubtasks = async (cardId: number) => {
    try {
      // Debug reduzido para performance
      // console.log('=== ATUALIZANDO SUBTAREFAS DO CARD ===', cardId);
      
      // Recarregar subtarefas do card
      const updatedSubtasks = await db.getSubtasksForCardByUser(cardId, user?.id || 1, user?.role || 'member');
      // console.log('Subtarefas encontradas no banco:', updatedSubtasks);
      
      // Mapear subtarefas para o formato correto
      const mappedSubtasks = updatedSubtasks.map(subtask => ({
        id: subtask.id.toString(),
        title: subtask.title,
        completed: subtask.status === 'completed',
        status: subtask.status || 'pending',
        createdAt: new Date(subtask.created_at),
        dueDate: subtask.due_date,
        priority: subtask.priority as 'low' | 'medium' | 'high',
        assignedTo: 'Usuário',
        importance: subtask.importance as 'normal' | 'low' | 'high' | 'critical',
        category: subtask.category || 'Geral',
        members: []
      }));
      
      console.log('Subtarefas mapeadas:', mappedSubtasks);
      
      // Atualizar o card na lista de cards
      setCards(prevCards => {
        const updatedCards = prevCards.map(card => {
          if (card.id === cardId) {
            // console.log('Atualizando card:', card.title, 'com subtarefas:', mappedSubtasks);
            return { ...card, subtasks: mappedSubtasks };
          }
          return card;
        });
        // console.log('Total de cards atualizados:', updatedCards.length);
        return updatedCards;
      });
      
      // Atualizar o card selecionado se for o mesmo
      if (selectedCard && selectedCard.id === cardId) {
        console.log('Atualizando card selecionado');
        setSelectedCard(prev => 
          prev ? { ...prev, subtasks: mappedSubtasks } : null
        );
      }
      
      // Atualizar o status do card baseado nas subtarefas
      await db.updateCardStatusBasedOnSubtasks(cardId.toString());
      
      // console.log('Card atualizado com novas subtarefas:', mappedSubtasks);
      
      // Mostrar toast de sucesso
      addToast({
        type: 'success',
        title: 'Timeline atualizada',
        message: 'O progresso das subtarefas foi atualizado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao atualizar subtarefas do card:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar',
        message: 'Não foi possível atualizar a timeline das subtarefas.'
      });
    }
  };

  const loadKanbanData = async () => {
    await loadBoards();
    await loadBoardTemplates();
  };

  const loadBoards = async () => {
    try {
      console.log('=== CARREGANDO BOARDS ===');
      console.log('user?.id:', user?.id);
      
      // Carregar boards do Supabase
      const boardsData = await db.getBoards(user?.id);
      console.log('boardsData do banco:', boardsData);
      console.log('Quantidade de boards encontrados:', boardsData.length);
      
      // Mapear para o tipo Board do Kanban
      const mappedBoards: Board[] = boardsData.map(board => ({
        id: board.id,
        board_id: board.board_id, // Incluir board_id
        name: board.name,
        description: board.description,
        created_by: board.owner_id || 1,
        created_at: board.created_at,
        updated_at: board.updated_at,
        is_active: true
      }));
      
      console.log('mappedBoards:', mappedBoards);
      setBoards(mappedBoards);
      
      if (mappedBoards.length > 0) {
        // Se não há board atual, selecionar o primeiro
        if (!currentBoard) {
          const firstBoard = mappedBoards[0];
          console.log('Definindo primeiro board como atual:', firstBoard.name);
          setCurrentBoard(firstBoard);
          await loadBoardData(firstBoard);
        } else {
          // Verificar se o board atual ainda existe na lista
          const boardStillExists = mappedBoards.find(b => b.id === currentBoard.id);
          if (boardStillExists) {
            console.log('Recarregando dados do board atual:', currentBoard.name);
            await loadBoardData(currentBoard);
          } else {
            console.log('Board atual não existe mais, selecionando primeiro:', mappedBoards[0].name);
            setCurrentBoard(mappedBoards[0]);
            await loadBoardData(mappedBoards[0]);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Kanban:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar dados',
        message: 'Não foi possível carregar os dados do quadro Kanban.'
      });
    }
  };

  const loadBoardTemplates = async () => {
    try {
      const templatesData = await db.getBoardTemplates();
      setBoardTemplates(templatesData);
    } catch (error) {
      console.error('Erro ao carregar templates de quadros:', error);
    }
  };

  const loadMembersInfo = async (memberIds: number[]) => {
    if (!memberIds || memberIds.length === 0) return;

    try {
      // Verificar quais membros já estão no cache
      const missingIds = memberIds.filter(id => !membersCache.has(id));

      if (missingIds.length > 0) {
        const members = await db.getUsersByIds(missingIds);

        // Atualizar o cache
        setMembersCache(prev => {
          const newCache = new Map(prev);
          members.forEach(member => {
            newCache.set(member.id, member);
          });
          return newCache;
        });
      }
    } catch (error) {
      console.error('KanbanBoard: Erro ao carregar informações dos membros:', error);
    }
  };

  const loadBoardData = async (board: Board) => {
    try {
      // Debug reduzido para performance
      // console.log('=== INICIANDO CARREGAMENTO DO BOARD ===');
      // console.log('Board:', board.name);
      
      // Verificar se board_id existe
      if (!board.board_id) {
        console.error('Board ID não encontrado para:', board.name);
        return;
      }
      
      // Carregar listas/colunas para o board
      const listsData = await db.getListsForBoard(board.board_id);
      
      // Se não há colunas, criar colunas padrão (apenas para boards antigos)
      if (listsData.length === 0) {
        console.log('Board sem colunas, criando colunas padrão...');
        await db.createDefaultListsIfNeeded(board.board_id);
        // Recarregar as colunas após criar
        const updatedListsData = await db.getListsForBoard(board.board_id);
        listsData.push(...updatedListsData);
      }
      
      // console.log('=== CARREGANDO COLUNAS ===');
      // console.log('listsData do banco:', listsData);
      // console.log('Quantidade de listas encontradas:', listsData.length);
      
      const mappedColumns: Column[] = listsData.map(list => ({
        id: list.id,
        board_id: board.id,
        name: list.name,
        order: list.position,
        color: '#E5E7EB',
        created_at: list.created_at,
        updated_at: list.updated_at
      }));
      
      // console.log('mappedColumns:', mappedColumns);
      setColumns(mappedColumns);
      
      // Carregar cards para o board
      const boardIdForCards = String(board.board_id || board.id);
      // console.log('=== CARREGANDO CARDS ===');
      // console.log('board.board_id:', board.board_id);
      // console.log('board.id:', board.id);
      // console.log('boardIdForCards:', boardIdForCards);
      
      const cardsData = await db.getCardsForBoardByUser(
        boardIdForCards, 
        user?.id || 1, 
        user?.role || 'member'
      );
      // console.log('cardsData do banco:', cardsData);
      // console.log('Quantidade de cards encontrados:', cardsData.length);
      
      // Função auxiliar para obter ID da coluna pelo nome (usando as colunas mapeadas)
      const getColumnIdFromNameLocal = (columnName: string): number => {
        const column = mappedColumns.find(col => col.name === columnName);
        if (column) {
          return column.id;
        }
        
        // Se não encontrou, tentar mapear para colunas padrão
        const defaultMapping: { [key: string]: string } = {
          'A Fazer': 'A Fazer',
          'To Do': 'A Fazer',
          'Pendente': 'A Fazer',
          'Backlog': 'A Fazer',
          'Em Progresso': 'Em Progresso',
          'In Progress': 'Em Progresso',
          'Em Andamento': 'Em Progresso',
          'Desenvolvimento': 'Em Progresso',
          'Concluído': 'Concluído',
          'Done': 'Concluído',
          'Finalizado': 'Concluído',
          'Completo': 'Concluído'
        };
        
        const mappedName = defaultMapping[columnName] || 'A Fazer';
        const defaultColumn = mappedColumns.find(col => col.name === mappedName);
        
        console.warn(`⚠️ Coluna "${columnName}" não encontrada, mapeando para "${mappedName}" (ID: ${defaultColumn?.id || 1})`);
        return defaultColumn?.id || 1;
      };
      
      // Carregar subtarefas para cada card
      const mappedCards: Card[] = await Promise.all(cardsData.map(async (card) => {
        const subtasks = await db.getSubtasksForCardByUser(card.id, user?.id || 1, user?.role || 'member');
        const mappedSubtasks = subtasks.map(subtask => ({
          id: subtask.id.toString(),
          title: subtask.title,
          completed: subtask.status === 'completed',
          status: subtask.status || 'pending',
          createdAt: new Date(subtask.created_at),
          dueDate: subtask.due_date,
          priority: subtask.priority as 'low' | 'medium' | 'high',
          assignedTo: 'Usuário',
          importance: subtask.importance as 'normal' | 'low' | 'high' | 'critical',
          category: subtask.category || 'Geral',
          estimatedTime: parseInt(subtask.estimated_time || '0'),
          tags: subtask.tags || [],
          recurrence: 'none'
        }));

        const columnId = getColumnIdFromNameLocal((card as any).list_name);
        console.log(`Mapeando card "${card.title}" da coluna "${(card as any).list_name}" para column_id: ${columnId}`);
        
        const mappedCard = {
          id: card.id,
          board_id: board.id, // Usar sempre o ID numérico do board
          column_id: columnId, // Mapear list_name para column_id
          title: card.title,
          description: card.description,
          priority: card.importance as 'low' | 'medium' | 'high',
          status: card.status as 'todo' | 'progress' | 'done',
          assigned_to: card.assigned_to,
          created_by: card.created_by || 1,
          created_at: card.created_at,
          updated_at: card.updated_at,
          due_date: card.due_date || undefined,
          members: card.members || [], // Incluir os membros do card
          tags: [],
          attachments: [],
          comments: [],
          dependencies: card.dependencies || [],
          subtasks: mappedSubtasks
        };
        return mappedCard;
      }));
      
      // Filtrar cards para mostrar apenas os do board atual
      console.log('=== DEBUG FILTRO ===');
      console.log('board.id (tipo):', typeof board.id, 'valor:', board.id);
      console.log('mappedCards antes do filtro:', mappedCards);
      mappedCards.forEach((card, index) => {
        console.log(`Card ${index}: board_id=${card.board_id} (tipo: ${typeof card.board_id})`);
      });
      
      const boardCards = mappedCards.filter(card => {
        const cardBoardId = card.board_id;
        const currentBoardId = board.id;
        const currentBoardStringId = board.board_id;
        
        // Comparar com o ID numérico do board
        if (cardBoardId === currentBoardId) return true;
        
        // Comparar com o board_id string se existir
        if (currentBoardStringId) {
          if (typeof currentBoardStringId === 'string') {
            return cardBoardId === parseInt(currentBoardStringId);
          } else if (typeof currentBoardStringId === 'number') {
            return cardBoardId === currentBoardStringId;
          }
        }
        
        return false;
      });
      // console.log('=== RESUMO DO CARREGAMENTO ===');
      // console.log('Total de cards mapeados:', mappedCards.length);
      // console.log('Total de cards filtrados:', boardCards.length);
      // console.log('Board ID para filtro:', board.id);
      // console.log('Cards filtrados:', boardCards);
      // console.log('Cards antes de setCards:', cards);
      setCards(boardCards);
      // console.log('=== CARREGAMENTO CONCLUÍDO ===');
      
      // Carregar informações dos membros
      const allMemberIds = new Set<number>();
        boardCards.forEach(card => {
          if (card.members && Array.isArray(card.members)) {
          card.members.forEach(memberId => {
            if (typeof memberId === 'number') {
              allMemberIds.add(memberId);
            } else if (typeof memberId === 'string') {
              allMemberIds.add(parseInt(memberId));
            }
          });
        }
      });

      if (allMemberIds.size > 0) {
        await loadMembersInfo(Array.from(allMemberIds));
      }
      
      // Verificar se os cards foram definidos corretamente
      setTimeout(() => {
        console.log('Cards após setCards (timeout):', boardCards);
      }, 100);
      

      

      

      

    } catch (error) {
      console.error('Erro ao carregar dados do board:', error);
    }
  };

  // Funções para reordenar quadros
  const handleBoardDragStart = (e: React.DragEvent, boardIndex: number) => {
    setDraggedBoardIndex(boardIndex);
    setIsReorderingBoards(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', boardIndex.toString());
  };

  const handleBoardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleBoardDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedBoardIndex === null || draggedBoardIndex === targetIndex) {
      setDraggedBoardIndex(null);
      setIsReorderingBoards(false);
      return;
    }

    try {
      // Criar nova lista de quadros com a nova ordem
      const newBoards = [...boards];
      const draggedBoard = newBoards[draggedBoardIndex];
      
      // Remover o quadro da posição original
      newBoards.splice(draggedBoardIndex, 1);
      
      // Inserir o quadro na nova posição
      newBoards.splice(targetIndex, 0, draggedBoard);
      
      // Atualizar o estado local
      setBoards(newBoards);
      
      // Salvar a nova ordem no banco de dados
      await saveBoardsOrder(newBoards);
      
      addToast({
        type: 'success',
        title: 'Ordem atualizada',
        message: 'A ordem dos quadros foi atualizada com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao reordenar quadros:', error);
      addToast({
        type: 'error',
        title: 'Erro ao reordenar',
        message: 'Não foi possível atualizar a ordem dos quadros.'
      });
    } finally {
      setDraggedBoardIndex(null);
      setIsReorderingBoards(false);
    }
  };

  const saveBoardsOrder = async (orderedBoards: Board[]) => {
    try {
      if (!user?.id) {
        console.error('Usuário não encontrado para salvar ordem dos quadros');
        return;
      }

      // Extrair os IDs dos quadros na nova ordem
      const boardOrder = orderedBoards.map(board => board.id);
      
      // Salvar a ordem personalizada do usuário
      const success = await db.saveUserBoardOrder(user.id, boardOrder);
      
      if (success) {
        console.log('Ordem dos quadros salva com sucesso para o usuário:', user.id);
      } else {
        console.error('Falha ao salvar ordem dos quadros');
        throw new Error('Falha ao salvar ordem dos quadros');
      }
    } catch (error) {
      console.error('Erro ao salvar ordem dos quadros:', error);
      throw error;
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
      
      setSelectedSubtask(fullSubtask);
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
    setSelectedSubtask(null);
  };

  const handleUpdateSubtask = async (updatedSubtask: any) => {
    try {
      console.log('Atualizando subtarefa:', updatedSubtask);
      
      // Atualizar a subtarefa nos cards
      setCards(prevCards => {
        return prevCards.map(card => ({
          ...card,
          subtasks: card.subtasks?.map(subtask => 
            subtask.id === selectedSubtask?.id 
              ? { ...subtask, ...updatedSubtask }
              : subtask
          ) || []
        }));
      });

      // Atualizar o card selecionado se necessário
      if (selectedCard) {
        setSelectedCard(prev => ({
          ...prev!,
          subtasks: prev!.subtasks?.map(subtask => 
            subtask.id === selectedSubtask?.id 
              ? { ...subtask, ...updatedSubtask }
              : subtask
          ) || []
        }));
      }

      // Atualizar a subtarefa selecionada
      setSelectedSubtask((prev: any) => ({ ...prev, ...updatedSubtask }));
      
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
      
      // Remover a subtarefa dos cards
      setCards(prevCards => {
        return prevCards.map(card => ({
          ...card,
          subtasks: card.subtasks?.filter(subtask => subtask.id !== subtaskId) || []
        }));
      });

      // Atualizar o card selecionado se necessário
      if (selectedCard) {
        setSelectedCard(prev => ({
          ...prev!,
          subtasks: prev!.subtasks?.filter(subtask => subtask.id !== subtaskId) || []
        }));
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

  // Função auxiliar para obter nome da coluna
  const getColumnName = (columnId: number): string => {
    console.log('getColumnName - columnId:', columnId);
    console.log('getColumnName - columns:', columns);
    const column = columns.find(col => col.id === columnId);
    console.log('getColumnName - column encontrada:', column);
    return column?.name || 'A Fazer';
  };

  // Função auxiliar para obter ID da coluna pelo nome
  const getColumnIdFromName = (columnName: string): number => {
    const column = columns.find(col => col.name === columnName);
    return column?.id || 1;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-brand-gray-light/10 text-brand-gray';
      case 'progress': return 'bg-brand-blue-light/10 text-brand-blue';
      case 'review': return 'bg-brand-yellow-light/10 text-brand-yellow';
      case 'done': return 'bg-brand-green-light/10 text-brand-green';
      default: return 'bg-brand-gray-light/10 text-brand-gray';
    }
  };

  const handleDragStart = (e: React.DragEvent, card: Card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
    
    // Adicionar dados ao drag para identificar o card
    e.dataTransfer.setData('text/plain', card.id.toString());
  };

  const handleDragOver = (e: React.DragEvent, targetColumnId?: number) => {
    e.preventDefault();
    
    if (draggedCard && targetColumnId) {
      const moveCheck = canMoveToColumn(draggedCard, targetColumnId);
      e.dataTransfer.dropEffect = moveCheck.canMove ? 'move' : 'none';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();
    
    if (draggedCard && draggedCard.column_id !== targetColumnId) {
      // Verificar se o card pode ser movido para a coluna de destino
      const moveCheck = canMoveToColumn(draggedCard, targetColumnId);
      
      if (!moveCheck.canMove) {
        // Mostrar toast de erro
        addToast({
          type: 'error',
          title: 'Movimento bloqueado',
          message: moveCheck.reason || 'Este card não pode ser movido para esta coluna.'
        });
        setDraggedCard(null);
        return;
      }

      // Obter o nome da coluna de destino
      const targetColumn = columns.find(col => col.id === targetColumnId);
      const newStatus = getStatusFromColumn(targetColumnId);
      
      if (!targetColumn) {
        addToast({
          type: 'error',
          title: 'Erro',
          message: 'Coluna de destino não encontrada.'
        });
        setDraggedCard(null);
        return;
      }

      try {
        console.log('=== MOVENDO CARD ===');
        console.log('draggedCard.id:', draggedCard.id);
        console.log('newStatus:', newStatus);
        console.log('targetColumnId:', targetColumnId);
        console.log('targetColumn.name:', targetColumn.name);
        
        // Atualizar o card no banco de dados
        const success = await db.updateCardById(draggedCard.id, {
          status: newStatus,
          list_name: targetColumn.name
        });
        
        console.log('Resultado da atualização:', success);

        if (success) {
          // Temporariamente comentar para debug
          /*
          // Mapear status do KanbanBoard para formato do MyActivities
          let syncStatus: string = newStatus;
          if (newStatus === 'todo') {
            syncStatus = 'pending';
          } else if (newStatus === 'progress') {
            syncStatus = 'in_progress';
          } else if (newStatus === 'done') {
            syncStatus = 'completed';
          }
          
          // Disparar eventos de sincronização
          // triggerCardStatusChange(draggedCard.id, syncStatus, 'kanban_board');
          // triggerCardUpdate(draggedCard.id, 'kanban_board');
          
          // console.log('🔄 Sync: Card status change triggered from KanbanBoard', { cardId: draggedCard.id, newStatus, syncStatus });
          */
          
          // Recarregar dados do board para garantir consistência
          if (currentBoard) {
            console.log('Recarregando dados do board após mover card...');
            await loadBoardData(currentBoard);
          }
          
          // Mostrar toast de sucesso
          addToast({
            type: 'success',
            title: 'Card movido',
            message: `Card "${draggedCard.title}" movido com sucesso!`
          });
          
          console.log(`Card ${draggedCard.id} movido para coluna ${targetColumnId} (${targetColumn.name})`);
        } else {
          // Se falhou ao salvar no banco, reverter o estado
          addToast({
            type: 'error',
            title: 'Erro ao mover card',
            message: 'Não foi possível salvar a mudança no banco de dados.'
          });
        }
      } catch (error) {
        console.error('Erro ao mover card:', error);
        addToast({
          type: 'error',
          title: 'Erro ao mover card',
          message: 'Ocorreu um erro inesperado ao mover o card.'
        });
      }
    }
    
    setDraggedCard(null);
  };

  const getStatusFromColumn = (columnId: number): 'todo' | 'progress' | 'done' => {
    console.log('getStatusFromColumn - columnId:', columnId);
    console.log('getStatusFromColumn - columns:', columns);
    const column = columns.find(col => col.id === columnId);
    console.log('getStatusFromColumn - column encontrada:', column);
    const status = (() => {
      switch (column?.name) {
        case 'A Fazer': return 'todo';
        case 'Em Progresso': return 'progress';
        case 'Em Revisão': return 'progress';
        case 'Concluído': return 'done';
        default: return 'todo';
      }
    })();
    console.log('getStatusFromColumn - status retornado:', status);
    return status;
  };

  // Função para verificar se as dependências de um card estão concluídas
  const checkDependenciesCompleted = (card: Card): boolean => {
    if (!card.dependencies || card.dependencies.length === 0) {
      return true; // Sem dependências, pode ser movido
    }

    // Type guard para verificar se é array de strings
    const isStringArray = (deps: string[] | CardDependency[]): deps is string[] => {
      return deps.length > 0 && typeof deps[0] === 'string';
    };

    // Type guard para verificar se é array de CardDependency
    const isCardDependencyArray = (deps: string[] | CardDependency[]): deps is CardDependency[] => {
      return deps.length > 0 && typeof deps[0] === 'object' && 'title' in deps[0];
    };

    if (isStringArray(card.dependencies)) {
      // Formato antigo: array de strings
      return card.dependencies.every((dependency: string) => {
        const dependencyCard = cards.find(c => c.title === dependency);
        if (!dependencyCard) return false;

        // Fallback: verificar se está na coluna "Concluído"
        const completedColumn = columns.find(col => col.name === 'Concluído');
        return completedColumn && dependencyCard.column_id === completedColumn.id;
      });
    } else if (isCardDependencyArray(card.dependencies)) {
      // Novo formato: array de objetos CardDependency
      return card.dependencies.every((dependency: CardDependency) => {
        const dependencyCard = cards.find(c => c.title === dependency.title);
        if (!dependencyCard) return false;

        // Se o card tem requiredStatus definido, verificar se está nesse status
        if (dependency.requiredStatus) {
          const requiredColumn = columns.find(col => {
            switch (dependency.requiredStatus) {
              case 'done': return col.name === 'Concluído';
              case 'progress': return col.name === 'Em Progresso';
              case 'review': return col.name === 'Em Revisão';
              case 'todo': return col.name === 'A Fazer';
              default: return false;
            }
          });
          return requiredColumn && dependencyCard.column_id === requiredColumn.id;
        }

        // Fallback: verificar se está na coluna "Concluído"
        const completedColumn = columns.find(col => col.name === 'Concluído');
        return completedColumn && dependencyCard.column_id === completedColumn.id;
      });
    }

    return true; // Fallback caso não seja nenhum dos tipos esperados
  };

  // Função para obter cards que dependem deste card
  const getDependentCards = (card: Card): Card[] => {
    return cards.filter(c => {
      if (!c.dependencies || c.dependencies.length === 0) {
        return false;
      }

      // Type guard para verificar se é array de strings
      const isStringArray = (deps: string[] | CardDependency[]): deps is string[] => {
        return deps.length > 0 && typeof deps[0] === 'string';
      };

      // Type guard para verificar se é array de CardDependency
      const isCardDependencyArray = (deps: string[] | CardDependency[]): deps is CardDependency[] => {
        return deps.length > 0 && typeof deps[0] === 'object' && 'title' in deps[0];
      };
      
      if (isStringArray(c.dependencies)) {
        return c.dependencies.some((dependency: string) => dependency === card.title);
      } else if (isCardDependencyArray(c.dependencies)) {
        return c.dependencies.some((dependency: CardDependency) => dependency.title === card.title);
      }

      return false;
    });
  };

  // Função para verificar se o card pode ser movido para a coluna de destino
  const canMoveToColumn = (card: Card, targetColumnId: number): { canMove: boolean; reason?: string } => {
    const targetColumn = columns.find(col => col.id === targetColumnId);
    
    // Se está movendo para "Concluído", verificar se todas as dependências estão concluídas
    if (targetColumn?.name === 'Concluído') {
      if (!checkDependenciesCompleted(card)) {
        return {
          canMove: false,
          reason: 'Este card possui dependências não concluídas. Conclua as dependências primeiro.'
        };
      }
    }

    // Se está movendo de "Concluído" para outra coluna, verificar se outros cards dependem dele
    const currentColumn = columns.find(col => col.id === card.column_id);
    if (currentColumn?.name === 'Concluído' && targetColumn?.name !== 'Concluído') {
      const dependentCards = getDependentCards(card);
      if (dependentCards.length > 0) {
        return {
          canMove: false,
          reason: `Este card não pode ser movido pois ${dependentCards.length} card(s) dependem dele.`
        };
      }
    }

    return { canMove: true };
  };

  const createCard = (columnId: number) => {
    setNewCardData({
      title: '',
      description: '',
      priority: 'medium',
      column_id: columnId,
      due_date: '',
      members: [user?.id || 1] // Incluir o criador como membro
    });
    setShowCreateCardModal(true);
  };

  const handleCreateCard = async () => {
    console.log('=== INICIANDO CRIAÇÃO DE CARD ===');
    console.log('newCardData:', newCardData);
    console.log('currentBoard:', currentBoard);
    
    if (!newCardData.title.trim()) {
      alert('Por favor, insira um título para o cartão.');
      return;
    }

    if (!currentBoard) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Nenhum quadro selecionado.'
      });
      return;
    }

    try {
      // Criar card no Supabase
      const cardData = {
        card_id: `card-${Date.now()}`,
        board_id: String(currentBoard.board_id || currentBoard.id), // Converter para string
        list_name: getColumnName(newCardData.column_id),
        title: newCardData.title,
        description: newCardData.description,
        status: getStatusFromColumn(newCardData.column_id),
        importance: newCardData.priority,
        due_date: newCardData.due_date || undefined,
        subject: '-',
        goal: '-',
        members: newCardData.members, // Usar os membros selecionados
        creation_date: new Date().toISOString(),
        is_archived: false,
        git_branch: '',
        git_commit: '',
        history: [],
        dependencies: [],
        recurrence: 'Nenhuma',
        user_id: user?.id || 1
      };

      console.log('cardData a ser enviado:', cardData);
      console.log('getColumnName(newCardData.column_id):', getColumnName(newCardData.column_id));
      console.log('getStatusFromColumn(newCardData.column_id):', getStatusFromColumn(newCardData.column_id));

      const createdCard = await db.createCard(cardData);
      
      console.log('createdCard retornado:', createdCard);
      
      if (createdCard) {
        console.log('Card criado com sucesso no banco');
        
        // Adicionar à lista local
        const newCard: Card = {
          id: createdCard.id,
          board_id: 1, // Mapear para ID numérico
          column_id: newCardData.column_id,
          title: createdCard.title,
          description: createdCard.description,
          priority: createdCard.importance as 'low' | 'medium' | 'high',
          status: createdCard.status as 'todo' | 'progress' | 'done',
          created_by: user?.id || 1,
          created_at: createdCard.created_at,
          updated_at: createdCard.updated_at,
          due_date: createdCard.due_date,
          members: createdCard.members || newCardData.members, // Incluir os membros
          tags: [],
          attachments: [],
          comments: []
        };

        console.log('newCard a ser adicionado:', newCard);
        console.log('cards atuais:', cards);
        
        // Adicionar o card à lista local sem recarregar tudo
        setCards(prev => [...prev, newCard]);
        
        addToast({
          type: 'success',
          title: 'Card criado',
          message: 'Card criado com sucesso!'
        });
      } else {
        console.log('ERRO: createdCard é null/undefined');
      }
    } catch (error) {
      console.error('Erro ao criar card:', error);
      console.log('Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        code: (error as any)?.code,
        details: (error as any)?.details
      });
      addToast({
        type: 'error',
        title: 'Erro ao criar card',
        message: 'Não foi possível criar o card.'
      });
    }

    setShowCreateCardModal(false);
    setNewCardData({
      title: '',
      description: '',
      priority: 'medium',
      column_id: 1,
      due_date: '',
      members: [user?.id || 1] // Resetar com o criador como membro
    });
    setSelectedCardTemplate(null);
  };

  const createBoard = async () => {
    if (!newBoardName.trim()) {
      alert('Por favor, insira um nome para o quadro.');
      return;
    }

    // Verificar se já existe um quadro com este nome
    if (boards.some(board => board.name.toLowerCase() === newBoardName.toLowerCase())) {
      alert('Já existe um quadro com este nome.');
      return;
    }

    try {
      // Criar board no Supabase
      const boardData = {
        board_id: `board-${Date.now()}`,
        name: newBoardName,
        description: newBoardDescription,
        owner_id: user?.id || 1,
        color: '#3B82F6'
      };

      const createdBoard = await db.createBoard(boardData);
      
      if (createdBoard) {
        // Mapear para o tipo Board do Kanban
        const newBoard: Board = {
          id: createdBoard.id,
          board_id: createdBoard.board_id,
          name: createdBoard.name,
          description: createdBoard.description,
          created_by: createdBoard.owner_id || 1,
          created_at: createdBoard.created_at,
          updated_at: createdBoard.updated_at,
          is_active: true
        };

        console.log('Template selecionado:', selectedBoardTemplate);
        
        // Criar colunas baseadas no template selecionado ou colunas manuais
        const columnsToCreate = selectedBoardTemplate 
          ? selectedBoardTemplate.columns.map((columnName, index) => ({
              name: columnName,
              position: index + 1
            }))
          : manualColumns.map((columnName, index) => ({
              name: columnName,
              position: index + 1
            }));
            
        console.log('Colunas a serem criadas:', columnsToCreate);

        console.log('Criando colunas no banco de dados...');
        const baseTime = Date.now();
        for (const columnData of columnsToCreate) {
          console.log('Criando coluna:', columnData);
          const createdList = await db.createList({
            list_id: `list-${baseTime}-${columnData.position}`,
            board_id: createdBoard.board_id,
            name: columnData.name,
            position: columnData.position
          });
          console.log('Coluna criada:', createdList);
        }
        console.log('Todas as colunas foram criadas');

        // Atualizar estado local
        setBoards([...boards, newBoard]);
        setCurrentBoard(newBoard);
        
        // Carregar dados do board recém-criado
        await loadBoardData(newBoard);
        
        addToast({
          type: 'success',
          title: 'Quadro criado',
          message: 'Quadro criado com sucesso!'
        });
      }
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      addToast({
        type: 'error',
        title: 'Erro ao criar quadro',
        message: 'Não foi possível criar o quadro.'
      });
    }

    setShowCreateBoardModal(false);
    setNewBoardName('');
    setNewBoardDescription('');
    setSelectedBoardTemplate(null);
  };

  // Funções auxiliares para modelos
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'project':
        return 'Projeto';
      case 'task':
        return 'Tarefa';
      case 'workflow':
        return 'Fluxo de Trabalho';
      case 'custom':
        return 'Personalizado';
      case 'bug':
        return 'Bug';
      case 'feature':
        return 'Funcionalidade';
      case 'development':
        return 'Desenvolvimento';
      case 'design':
        return 'Design';
      case 'maintenance':
        return 'Manutenção';
      case 'marketing':
        return 'Marketing';
      case 'product':
        return 'Produto';
      case 'hr':
        return 'RH';
      case 'support':
        return 'Suporte';
      case 'tasks':
        return 'Tarefas';
      case 'sales':
        return 'Vendas';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project':
        return 'bg-blue-100 text-blue-700';
      case 'task':
        return 'bg-green-100 text-green-700';
      case 'workflow':
        return 'bg-purple-100 text-purple-700';
      case 'custom':
        return 'bg-gray-100 text-gray-700';
      case 'bug':
        return 'bg-red-100 text-red-700';
      case 'feature':
        return 'bg-yellow-100 text-yellow-700';
      case 'development':
        return 'bg-blue-100 text-blue-700';
      case 'design':
        return 'bg-purple-100 text-purple-700';
      case 'maintenance':
        return 'bg-orange-100 text-orange-700';
      case 'marketing':
        return 'bg-green-100 text-green-700';
      case 'product':
        return 'bg-indigo-100 text-indigo-700';
      case 'hr':
        return 'bg-pink-100 text-pink-700';
      case 'support':
        return 'bg-yellow-100 text-yellow-700';
      case 'tasks':
        return 'bg-gray-100 text-gray-700';
      case 'sales':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const createBoardFromTemplate = (template: BoardTemplate) => {
    const newBoard: Board = {
      id: Date.now(),
      name: template.name,
      description: template.description,
      created_by: user?.id || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };

    // Criar colunas baseadas no template
    const newColumns: Column[] = template.columns.map((columnName, index) => ({
      id: Date.now() + index + 1,
      board_id: newBoard.id,
      name: columnName,
      order: index + 1,
      color: '#E5E7EB',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    setBoards([...boards, newBoard]);
    setColumns([...columns, ...newColumns]);
    setCurrentBoard(newBoard);
    setShowBoardTemplatesModal(false);
  };

  const createCardFromTemplate = (template: CardTemplate) => {
    setNewCardData({
      title: template.fields.title,
      description: template.fields.description,
      priority: template.fields.priority,
      column_id: 1, // Primeira coluna por padrão
      due_date: '',
      members: [user?.id || 1] // Incluir o criador como membro
    });
    setShowCardTemplateModal(false);
    setShowCreateCardModal(true);
  };

  const applyBoardTemplate = (template: BoardTemplate) => {
    console.log('Aplicando template:', template);
    console.log('Colunas do template:', template.columns);
    setSelectedBoardTemplate(template);
    setNewBoardName(template.name);
    setNewBoardDescription(template.description);
    
    // Se o template tem colunas definidas, usar elas
    if (template.columns && template.columns.length > 0) {
      setManualColumns(template.columns);
      setShowManualColumns(true);
    }
  };

  const applyCardTemplate = (template: CardTemplate) => {
    setSelectedCardTemplate(template);
    setNewCardData(prev => ({
      ...prev,
      title: template.fields.title,
      description: template.fields.description,
      priority: template.fields.priority
    }));
  };

  const clearBoardTemplate = () => {
    setSelectedBoardTemplate(null);
    setNewBoardName('');
    setNewBoardDescription('');
    setShowManualColumns(false);
    setManualColumns(['A Fazer', 'Em Progresso', 'Concluído']);
  };

  // Funções para gerenciar colunas manuais
  const addManualColumn = () => {
    setManualColumns([...manualColumns, `Nova Coluna ${manualColumns.length + 1}`]);
  };

  const removeManualColumn = (index: number) => {
    if (manualColumns.length > 1) {
      setManualColumns(manualColumns.filter((_, i) => i !== index));
    }
  };

  const updateManualColumn = (index: number, value: string) => {
    const newColumns = [...manualColumns];
    newColumns[index] = value;
    setManualColumns(newColumns);
  };

  const moveManualColumn = (fromIndex: number, toIndex: number) => {
    const newColumns = [...manualColumns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    setManualColumns(newColumns);
  };

  const clearCardTemplate = () => {
    setSelectedCardTemplate(null);
    setNewCardData({
      title: '',
      description: '',
      priority: cardSettings.defaultPriority as 'low' | 'medium' | 'high' | 'critical',
      column_id: newCardData.column_id,
      due_date: newCardData.due_date,
      members: newCardData.members
    });
  };

  // Funções para gerenciar membros
  const handleMemberToggle = (userId: number) => {
    setNewCardData(prev => {
      const isSelected = prev.members.includes(userId);
      if (isSelected) {
        // Não permitir remover o criador do card
        if (userId === user?.id) {
          addToast({
            type: 'warning',
            title: 'Aviso',
            message: 'O criador do card deve sempre ser um membro.'
          });
          return prev;
        }
        return {
          ...prev,
          members: prev.members.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          members: [...prev.members, userId]
        };
      }
    });
  };

  // Funções para criar templates
  const createBoardTemplate = () => {
    if (!newBoardTemplate.name.trim()) {
      alert('Por favor, insira um nome para o template.');
      return;
    }

    if (newBoardTemplate.columns.length < 2) {
      alert('Por favor, adicione pelo menos 2 colunas.');
      return;
    }

    const template: BoardTemplate = {
      id: Date.now(),
      name: newBoardTemplate.name,
      description: newBoardTemplate.description,
      columns: newBoardTemplate.columns,
      icon: newBoardTemplate.icon,
      color: newBoardTemplate.color,
      category: newBoardTemplate.category
    };

    // Adicionar ao array de templates (em uma aplicação real, seria salvo no backend)
    boardTemplates.push(template);
    
    setShowCreateBoardTemplateModal(false);
    setNewBoardTemplate({
      name: '',
      description: '',
      category: 'custom',
      icon: 'tarefas',
      color: 'bg-gray-500',
      columns: ['A Fazer', 'Em Progresso', 'Concluído']
    });
  };

  const createCardTemplate = () => {
    if (!newCardTemplate.name.trim()) {
      alert('Por favor, insira um nome para o template.');
      return;
    }

    if (!newCardTemplate.fields.title.trim()) {
      alert('Por favor, insira um título padrão para o template.');
      return;
    }

    const template: CardTemplate = {
      id: Date.now(),
      name: newCardTemplate.name,
      description: newCardTemplate.description,
      fields: {
        title: newCardTemplate.fields.title,
        description: newCardTemplate.fields.description,
        priority: newCardTemplate.fields.priority,
        status: newCardTemplate.fields.status
      },
      color: newCardTemplate.color,
      category: newCardTemplate.category
    };

    // Adicionar ao array de templates (em uma aplicação real, seria salvo no backend)
    cardTemplates.push(template);
    
    setShowCreateCardTemplateModal(false);
    setNewCardTemplate({
      name: '',
      description: '',
      category: 'custom',
      color: 'bg-gray-500',
      fields: {
        title: '',
        description: '',
        priority: cardSettings.defaultPriority as 'low' | 'medium' | 'high' | 'critical',
        status: 'A Fazer'
      }
    });
  };

  const addColumnToTemplate = () => {
    setNewBoardTemplate(prev => ({
      ...prev,
      columns: [...prev.columns, `Coluna ${prev.columns.length + 1}`]
    }));
  };

  const removeColumnFromTemplate = (index: number) => {
    if (newBoardTemplate.columns.length > 2) {
      setNewBoardTemplate(prev => ({
        ...prev,
        columns: prev.columns.filter((_, i) => i !== index)
      }));
    }
  };

  const updateColumnName = (index: number, name: string) => {
    setNewBoardTemplate(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => i === index ? name : col)
    }));
  };

  // Funções para drag and drop das colunas
  const handleColumnDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumnIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) return;

    setNewBoardTemplate(prev => {
      const newColumns = [...prev.columns];
      const draggedColumn = newColumns[draggedColumnIndex];
      newColumns.splice(draggedColumnIndex, 1);
      newColumns.splice(dropIndex, 0, draggedColumn);
      
      return {
        ...prev,
        columns: newColumns
      };
    });
    
    setDraggedColumnIndex(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnIndex(null);
  };

  // Funções para excluir templates
  const handleDeleteBoardTemplate = (templateId: number, templateName: string) => {
    setTemplateToDelete({ id: templateId, name: templateName, type: 'board' });
    setShowDeleteBoardTemplateModal(true);
  };

  const handleDeleteCardTemplate = (templateId: number, templateName: string) => {
    setTemplateToDelete({ id: templateId, name: templateName, type: 'card' });
    setShowDeleteCardTemplateModal(true);
  };

  const confirmDeleteTemplate = () => {
    if (!templateToDelete) return;

    if (templateToDelete.type === 'board') {
      const templateIndex = boardTemplates.findIndex(t => t.id === templateToDelete.id);
      if (templateIndex !== -1) {
        boardTemplates.splice(templateIndex, 1);
        // Forçar re-render
        setBoardTemplates([...boardTemplates]);
      }
    } else {
      const templateIndex = cardTemplates.findIndex(t => t.id === templateToDelete.id);
      if (templateIndex !== -1) {
        cardTemplates.splice(templateIndex, 1);
        // Forçar re-render
        setCardTemplates([...cardTemplates]);
      }
    }

    setShowDeleteBoardTemplateModal(false);
    setShowDeleteCardTemplateModal(false);
    setTemplateToDelete(null);
  };

  const cancelDeleteTemplate = () => {
    setShowDeleteBoardTemplateModal(false);
    setShowDeleteCardTemplateModal(false);
    setTemplateToDelete(null);
  };

  const confirmDeleteCard = (cardId: number) => {
    const cardToDelete = cards.find(card => card.id === cardId);
    if (cardToDelete) {
      showPopup({
        title: 'Excluir Card',
        message: `Tem certeza que deseja excluir o card "${cardToDelete.title}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        onConfirm: () => deleteCard(cardId),
        onCancel: () => {}
      });
    }
  };

  const deleteCard = async (cardId: number) => {
    try {
      // Encontrar o card para obter o card_id
      const cardToDelete = cards.find(card => card.id === cardId);
      if (!cardToDelete) {
        addToast({
          type: 'error',
          title: 'Erro',
          message: 'Card não encontrado.'
        });
        return;
      }

      // Deletar do Supabase usando o ID numérico
      const success = await db.deleteCardById(cardId);
      
      if (success) {
        // Remover da lista local
        setCards(cards.filter(card => card.id !== cardId));
        setSelectedCard(null);
        
        addToast({
          type: 'success',
          title: 'Card deletado',
          message: 'Card deletado com sucesso!'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao deletar',
          message: 'Não foi possível deletar o card.'
        });
      }
    } catch (error) {
      console.error('Erro ao deletar card:', error);
      addToast({
        type: 'error',
        title: 'Erro ao deletar',
        message: 'Erro inesperado ao deletar o card.'
      });
    }
  };

  const confirmDeleteBoard = (boardId: number) => {
    const boardToDelete = boards.find(board => board.id === boardId);
    if (boardToDelete) {
      showPopup({
        title: 'Excluir Quadro',
        message: `Tem certeza que deseja excluir o quadro "${boardToDelete.name}"? Todos os cards e listas associados também serão removidos permanentemente.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        onConfirm: () => handleDeleteBoard(boardId),
        onCancel: () => {}
      });
    }
  };

    const handleDeleteBoard = async (boardId: number) => {
    try {
      console.log('Iniciando exclusão do board:', boardId);
      
      // Excluir o quadro do banco de dados
      const success = await db.deleteBoard(boardId);
      
      if (!success) {
        throw new Error('Falha ao excluir o quadro do banco de dados');
      }
      
      console.log('Board excluído com sucesso do banco de dados');
      
      // Atualizar estado local diretamente
      const updatedBoards = boards.filter(board => board.id !== boardId);
      setBoards(updatedBoards);
      
      // Se o quadro excluído era o ativo, selecionar o primeiro quadro disponível
      if (activeTab === boardId) {
        if (updatedBoards.length > 0) {
          setActiveTab(updatedBoards[0].id);
          setCurrentBoard(updatedBoards[0]);
          await loadBoardData(updatedBoards[0]);
        } else {
          setActiveTab(null);
          setCurrentBoard(null);
          setColumns([]);
          setCards([]);
        }
      }
      

      
      addToast({
        type: 'success',
        title: 'Quadro excluído',
        message: 'O quadro foi removido permanentemente com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao excluir quadro:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível excluir o quadro. Tente novamente.'
      });
    }
  };



  // Usar allCards no modo lista, cards no modo kanban
  const cardsToFilter = viewMode === 'list' ? allCards : cards;
  
  const filteredCards = cardsToFilter.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (card.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || card.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || card.status === filterStatus;
    const matchesCompleted = showCompleted || card.status !== 'done';
    
    // Filtro para ocultar cards sem subtarefas (apenas no modo lista)
    const hasSubtasks = card.subtasks && card.subtasks.length > 0;
    const matchesSubtasksFilter = viewMode === 'kanban' || !hideCardsWithoutSubtasks || hasSubtasks;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesCompleted && matchesSubtasksFilter;
  });

  // Função para agrupar cards por board
  const getGroupedCards = () => {
    // Se não está no modo lista ou agrupamento está desabilitado, retorna lista simples
    if (viewMode !== 'list' || !groupByBoard) {
      return { 'Todos os Cards': filteredCards };
    }

    const grouped: { [key: string]: Card[] } = {};
    
    filteredCards.forEach(card => {
      const board = boards.find(b => b.id === card.board_id);
      const boardName = board ? board.name : 'Quadro Desconhecido';
      
      if (!grouped[boardName]) {
        grouped[boardName] = [];
      }
      grouped[boardName].push(card);
    });

    return grouped;
  };

  // Componente para exibir card na lista
  const ListCardComponent: React.FC<{ card: Card }> = ({ card }) => {
    const cardSubtasks = card.subtasks || [];
    const completedSubtasks = cardSubtasks.filter(s => s.completed).length;
    const totalSubtasks = cardSubtasks.length;
    
    return (
      <div 
        className="p-4 hover:bg-brand-light-gray/30 dark:hover:bg-gray-700/30 transition-colors border-l-4 cursor-pointer"
        style={{ borderLeftColor: getPriorityColor(card.priority) }}
        onClick={() => setSelectedCard(card)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            {/* Status do card */}
            <div className="flex items-center space-x-2">
              {card.status === 'done' ? (
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ) : (
                <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Tipo e título */}
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-brand-green text-white text-xs font-medium rounded-full">
                Tarefa
              </span>
              <h4 className="font-medium text-brand-gray dark:text-gray-100">{card.title}</h4>
              {totalSubtasks > 0 && (
                <span className="text-xs text-brand-gray/70 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {totalSubtasks} {totalSubtasks === 1 ? 'subtarefa' : 'subtarefas'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Prioridade */}
            <span className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getPriorityColor(card.priority) }}
              />
              {getPriorityLabel(card.priority)}
            </span>
            
            {/* Membros */}
            {card.members && card.members.length > 0 ? (
              <AvatarGroup
                members={card.members.map(memberId => membersCache.get(typeof memberId === 'string' ? parseInt(memberId) : memberId)).filter(Boolean) as UserType[]}
                maxVisible={3}
                size="sm"
              />
            ) : (
              <div className="flex items-center text-gray-400 text-xs">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {card.members ? card.members.length : 0}
              </div>
            )}
            
            {/* Data de vencimento */}
            {card.due_date && (
              <span className="text-xs text-brand-gray/70 dark:text-gray-400 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(card.due_date).toLocaleDateString('pt-BR')}</span>
              </span>
            )}
            
            {/* Botão de visualizar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCard(card);
              }}
              className="p-1 text-brand-gray/50 dark:text-gray-400 hover:text-brand-gray dark:hover:text-gray-100"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Timeline de Subtarefas */}
        {totalSubtasks > 0 && (
          <div className="mt-2">
            <SubtaskTimeline subtasks={cardSubtasks} />
          </div>
        )}
      </div>
    );
  };

  const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
    const { hasPermission } = usePermissions();
    const isOverdue = card.due_date && new Date(card.due_date) < new Date();
    
    // Usar subtarefas reais do card se existirem
    const cardSubtasks = card.subtasks || [];
    
    // Debug: verificar se as subtarefas estão chegando (comentado para performance)
    // if (cardSubtasks.length > 0) {
    //   console.log(`Card "${card.title}" tem ${cardSubtasks.length} subtarefas:`, cardSubtasks);
    // }
    
    // Função para gerar cor do avatar baseada no ID
    const getUserAvatarColor = (userId: number): string => {
      const colors = [
        'from-red-400 to-red-600',
        'from-blue-400 to-blue-600', 
        'from-green-400 to-green-600',
        'from-yellow-400 to-yellow-600',
        'from-purple-400 to-purple-600',
        'from-pink-400 to-pink-600',
        'from-indigo-400 to-indigo-600',
        'from-teal-400 to-teal-600'
      ];
      return colors[userId % colors.length];
    };
    
    return (
      <div
        draggable={hasPermission('card:edit')}
        onDragStart={(e) => handleDragStart(e, card)}
        onClick={() => {
          setSelectedCard(card);
          setShowCardDetailModal(true);
        }}
                className={`card-hover bg-white dark:bg-gray-800 border-2 rounded-xl p-3 mb-2 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-sm relative overflow-hidden ${
          card.dependencies && card.dependencies.length > 0 && !checkDependenciesCompleted(card)
            ? 'border-orange-300 bg-orange-50/30 dark:bg-orange-900/20' 
            : ''
        }`}
        style={{
          borderColor: card.dependencies && card.dependencies.length > 0 && !checkDependenciesCompleted(card)
            ? undefined
                    : '#e5e7eb'
        }}
        title={
          card.dependencies && card.dependencies.length > 0 && !checkDependenciesCompleted(card)
            ? 'Este card possui dependências não concluídas e não pode ser movido para "Concluído"'
            : undefined
        }
      >
                {/* Barra lateral elegante com gradiente - mais fina e arredondada */}
                <div
                  className="absolute left-0 top-0 w-1 h-full shadow-sm"
                  style={{ 
                    background: `linear-gradient(135deg, ${getPriorityColor(card.priority)}, ${getPriorityColor(card.priority)}dd)`,
                    borderTopLeftRadius: '0.75rem',
                    borderBottomLeftRadius: '0.75rem',
                    borderTopRightRadius: '0.25rem',
                    borderBottomRightRadius: '0.25rem'
                  }}
                />
                
                {/* Efeito de brilho sutil no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 rounded-xl" />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-3 pl-1">
          <h3 className="font-medium text-brand-gray dark:text-gray-50 text-sm line-clamp-2 flex-1">
            {card.title}
          </h3>
          <div className="flex items-center space-x-1 ml-2">
            <span 
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ 
                backgroundColor: getPriorityColor(card.priority),
                color: getPriorityTextColor(card.priority)
              }}
            >
              {getPriorityLabel(card.priority)}
            </span>
          </div>
        </div>

        {/* Description */}
        {card.description && (
          <p className="text-xs text-brand-gray/70 dark:text-gray-300 mb-2 line-clamp-2 pl-1">
            {card.description}
          </p>
        )}

        {/* Subtasks Timeline - Versão melhorada */}
        {cardSubtasks && cardSubtasks.length > 0 && (
          <div className="mb-3 pl-1">
            <SubtaskTimeline subtasks={cardSubtasks} compact={true} />
          </div>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 pl-1">
            {/* Em mobile, mostrar apenas 1 tag */}
            <div className="block sm:hidden">
              {card.tags.slice(0, 1).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-brand-light-gray/20 text-brand-gray text-xs rounded-full font-medium border border-brand-light-gray truncate max-w-20">
                  {tag.length > 8 ? tag.substring(0, 8) + '...' : tag}
                </span>
              ))}
              {card.tags.length > 1 && (
                <span className="px-2 py-1 bg-brand-light-gray/20 text-brand-gray text-xs rounded-full font-medium border border-brand-light-gray">
                  +{card.tags.length - 1}
                </span>
              )}
            </div>
            {/* Em desktop, mostrar 2 tags */}
            <div className="hidden sm:flex flex-wrap gap-1">
              {card.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-3 py-1.5 bg-brand-light-gray/20 text-brand-gray text-xs rounded-full font-medium border border-brand-light-gray">
                  {tag}
                </span>
              ))}
              {card.tags.length > 2 && (
                <span className="px-3 py-1.5 bg-brand-light-gray/20 text-brand-gray text-xs rounded-full font-medium border border-brand-light-gray">
                  +{card.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        

        {/* Dependencies Status */}
        {card.dependencies && card.dependencies.length > 0 && (
          <div className="mb-2 p-2 bg-brand-light-gray/20 rounded-lg ml-4 mr-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-brand-gray/70">
                <Link className="w-3 h-3" />
                <span className="hidden sm:inline">Dependências ({card.dependencies.length})</span>
                <span className="sm:hidden">Dep ({card.dependencies.length})</span>
              </div>
              {checkDependenciesCompleted(card) ? (
                <span className="text-green-600 font-medium">✓</span>
              ) : (
                <span className="text-orange-600 font-medium">⏳</span>
              )}
            </div>
            {!checkDependenciesCompleted(card) && (
              <div className="mt-1 text-xs text-brand-gray/60 hidden sm:block">
                {card.dependencies.length} dependência(s) não concluída(s)
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Due Date */}
            {card.due_date && (
              <div className={`flex items-center space-x-1 text-xs ${isOverdue ? 'text-brand-red' : 'text-brand-gray/70'}`}>
                <Clock className="w-3 h-3" />
                <span className="hidden sm:inline">{new Date(card.due_date).toLocaleDateString('pt-BR')}</span>
                <span className="sm:hidden">{new Date(card.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
              </div>
            )}

            {/* Attachments - oculto em mobile */}
            {card.attachments && card.attachments.length > 0 && (
              <div className="hidden sm:flex items-center space-x-1 text-xs text-brand-gray/70">
                <Paperclip className="w-3 h-3" />
                <span>{card.attachments.length}</span>
              </div>
            )}

            {/* Comments - oculto em mobile */}
            {card.comments && card.comments.length > 0 && (
              <div className="hidden sm:flex items-center space-x-1 text-xs text-brand-gray/70">
                <MessageSquare className="w-3 h-3" />
                <span>{card.comments.length}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Member Avatars */}
            {card.members && card.members.length > 0 ? (
              <AvatarGroup
                members={card.members.map(memberId => membersCache.get(typeof memberId === 'string' ? parseInt(memberId) : memberId)).filter(Boolean) as UserType[]}
                maxVisible={3}
                size="sm"
              />
            ) : (
              <div className="flex items-center text-gray-400 text-xs">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {card.members ? card.members.length : 0}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ColumnComponent: React.FC<{ column: Column }> = ({ column }) => {
    const filteredColumnCards = filteredCards.filter(card => card.column_id === column.id);
    
    // Debug: verificar colunas filtradas (comentado para performance)
    // console.log('=== COLUMN COMPONENT DEBUG ===');
    // console.log('Current Board:', currentBoard);
    // console.log('Column:', column);
    // console.log('All columns:', columns);
    // console.log('Filtered cards:', filteredCards);
    // console.log('Cards for this column:', filteredColumnCards);
    // console.log('Column ID:', column.id);
    // console.log('Cards column_ids:', filteredCards.map(c => ({ id: c.id, title: c.title, column_id: c.column_id })));
    
    // Verificar se o card sendo arrastado pode ser movido para esta coluna
    const canDropHere = draggedCard ? canMoveToColumn(draggedCard, column.id).canMove : true;

    return (
      <div
        className={`rounded-lg p-3 min-h-[400px] flex flex-col transition-colors duration-200 ${
          draggedCard && !canDropHere
            ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-400'
            : 'bg-brand-light-gray/30 dark:bg-gray-800/50'
        }`}
        onDragOver={(e) => handleDragOver(e, column.id)}
        onDrop={(e) => handleDrop(e, column.id)}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: column.color }}
            />
            <h3 className={`font-semibold ${draggedCard && !canDropHere ? 'text-red-600 dark:text-red-400' : 'text-brand-gray dark:text-gray-50'}`}>
              {column.name}
            </h3>
            <span className="bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-50 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
              {filteredColumnCards.length}
            </span>
            {draggedCard && !canDropHere && (
              <span className="text-red-500 dark:text-red-400 text-xs font-medium">
                ⚠️ Bloqueado
              </span>
            )}
          </div>
          <button
            onClick={() => createCard(column.id)}
            className="p-1 text-brand-gray/50 dark:text-gray-300 hover:text-brand-gray dark:hover:text-gray-50 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors"
            title="Adicionar cartão"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Cards */}
        <div className="flex-1 space-y-2">
          {filteredColumnCards.map((card) => (
            <CardComponent key={card.id} card={card} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-light-gray/30 dark:bg-gray-900">
      {/* Header com Abas */}
      <div className="bg-white dark:bg-gray-800 border-b border-brand-light-gray dark:border-gray-700">
        {/* Título Principal */}
        <div className="p-6 pb-4">
                  <h1 className="text-2xl font-bold text-brand-gray dark:text-gray-50">Quadros Kanban</h1>
        <p className="text-brand-gray/70 dark:text-gray-300">Gerencie suas tarefas e projetos</p>
        </div>

        {/* Abas dos Quadros */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 flex flex-col justify-center items-center space-y-0.5">
                  <div className="w-1 h-1 bg-brand-gray/40 dark:bg-gray-400/40 rounded-full"></div>
                  <div className="w-1 h-1 bg-brand-gray/40 dark:bg-gray-400/40 rounded-full"></div>
                  <div className="w-1 h-1 bg-brand-gray/40 dark:bg-gray-400/40 rounded-full"></div>
                </div>
                <span className="text-xs text-brand-gray/60 dark:text-gray-400">Arraste as abas para reordenar</span>
              </div>
            </div>
            {/* Botões de debug temporários */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log('=== DEBUG: FORÇANDO RECARREGAMENTO DO BOARD ===');
                  console.log('currentBoard:', currentBoard);
                  console.log('cards atuais:', cards);
                  if (currentBoard) {
                    loadBoardData(currentBoard);
                  }
                }}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                title="Forçar recarregamento do board (debug)"
              >
                🔄 Board
              </button>
              <button
                onClick={() => {
                  console.log('=== DEBUG: FORÇANDO RECARREGAMENTO COMPLETO ===');
                  console.log('Recarregando todos os dados...');
                  loadKanbanData();
                }}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                title="Forçar recarregamento completo (debug)"
              >
                🔄 All
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-1 border-b border-brand-light-gray">
            {boards.map((board, index) => (
              <div
                key={board.id}
                draggable={!isReorderingBoards}
                onDragStart={(e) => handleBoardDragStart(e, index)}
                onDragOver={handleBoardDragOver}
                onDrop={(e) => handleBoardDrop(e, index)}
                className={`flex items-center ${
                  draggedBoardIndex === index ? 'opacity-50 scale-95' : ''
                }`}
              >
                <button
                  onClick={async () => {
                    console.log('=== CLICANDO NA ABA DO BOARD ===');
                    console.log('Board selecionado:', board.name);
                    setActiveTab(board.id);
                    setCurrentBoard(board);
                    await loadBoardData(board);
                  }}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-all duration-200 relative group cursor-move ${
                    activeTab === board.id
                      ? 'bg-white text-brand-gray border-b-2 border-brand-red font-medium'
                      : 'text-brand-gray/70 hover:text-brand-gray hover:bg-brand-light-gray/30'
                  } ${
                    isReorderingBoards ? 'shadow-lg' : ''
                  } ${
                    draggedBoardIndex === index ? 'ring-2 ring-brand-red/50 bg-brand-red/5' : ''
                  } ${
                    draggedBoardIndex !== null && draggedBoardIndex !== index ? 'border-l-2 border-brand-red/30' : ''
                  }`}
                  style={{
                    transform: draggedBoardIndex === index ? 'rotate(2deg) scale(1.05)' : 'none'
                  }}
                  title="Clique para selecionar, arraste para reordenar"
                >
                  {/* Ícone de arrastar */}
                  <div className={`w-3 h-3 transition-opacity cursor-move ${
                    isReorderingBoards ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <div className="w-full h-full flex flex-col justify-center items-center space-y-0.5">
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                    </div>
                  </div>
                  
                  <span className="text-sm font-medium">{board.name}</span>
                  
                  {/* Botão de excluir */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteBoard(board.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 text-brand-red hover:bg-brand-red/10 rounded transition-all duration-200 ${
                      activeTab === board.id ? 'opacity-100' : ''
                    }`}
                    title="Excluir quadro"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              </div>
            ))}
            
            {/* Botão Novo Quadro */}
            <button
              onClick={() => setShowCreateBoardModal(true)}
              className="flex items-center space-x-2 px-4 py-3 text-brand-gray/70 hover:text-brand-gray hover:bg-brand-light-gray/30 rounded-t-lg transition-all duration-200"
              title="Criar novo quadro"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Ações */}
        <div className="p-6 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-gray">
                {currentBoard?.name || 'Selecione um Quadro'}
              </h2>
              <p className="text-sm text-brand-gray/70">
                {currentBoard?.description || 'Escolha um quadro para começar'}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Ferramentas Global */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-brand-light-gray dark:border-gray-700 shadow-sm">
            <div className="flex items-center space-x-4">
              {/* Botões de Ação */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCreateCardModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors"
                  title="Adicionar novo card"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Novo Card</span>
                </button>
                
                <button
                  onClick={() => setShowBoardTemplatesModal(true)}
                  className="p-2 text-brand-gray/60 dark:text-gray-400 hover:bg-brand-light-gray dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Modelos de Quadros"
                >
                  <FolderPlus className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowCardTemplateModal(true)}
                  className="p-2 text-brand-gray/60 dark:text-gray-400 hover:bg-brand-light-gray dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Modelos de Cards"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>

              {/* Separador */}
              <div className="w-px h-6 bg-brand-light-gray dark:bg-gray-600"></div>

              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-gray/50 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cartões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-brand-light-gray dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent w-64 bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Toggle de Tema */}
              <ThemeToggle />

              {/* Filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-brand-blue text-white' : 'bg-brand-light-gray dark:bg-gray-700 text-brand-gray dark:text-gray-300 hover:bg-brand-gray dark:hover:bg-gray-600 hover:text-white'
                }`}
                title="Filtros"
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Modo de Visualização */}
              <div className="flex bg-brand-light-gray dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'kanban' ? 'bg-white dark:bg-gray-600 text-brand-gray dark:text-gray-100 shadow-sm' : 'text-brand-gray/70 dark:text-gray-400 hover:text-brand-gray dark:hover:text-gray-100'
                  }`}
                  title="Visualização Kanban"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setViewMode('list');
                    loadAllCards(); // Carregar todos os cards quando mudar para modo lista
                  }}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-brand-gray dark:text-gray-100 shadow-sm' : 'text-brand-gray/70 dark:text-gray-400 hover:text-brand-gray dark:hover:text-gray-100'
                  }`}
                  title="Visualização Lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Configurações */}
              <button 
                className="p-2 bg-brand-light-gray dark:bg-gray-700 text-brand-gray dark:text-gray-300 rounded-lg hover:bg-brand-gray dark:hover:bg-gray-600 hover:text-white transition-colors"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Painel de Filtros Global */}
        {showFilters && (
          <div className="px-6 pb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-brand-light-gray dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-brand-gray dark:text-gray-100">Filtros Ativos</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-brand-gray/60 dark:text-gray-400 hover:text-brand-gray dark:hover:text-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-6">
                {/* Filtro de Prioridade */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray dark:text-gray-100 mb-1">Prioridade</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-brand-light-gray dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-100"
                  >
                    <option value="all">Todas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>

                {/* Filtro de Status */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray dark:text-gray-100 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-brand-light-gray dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white dark:bg-gray-700 text-brand-gray dark:text-gray-100"
                  >
                    <option value="all">Todos</option>
                    <option value="todo">A Fazer</option>
                    <option value="progress">Em Progresso</option>
                    <option value="review">Em Revisão</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>

                {/* Mostrar Concluídos */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showCompleted"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    className="rounded border-brand-light-gray dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="showCompleted" className="text-sm text-brand-gray dark:text-gray-100">
                    Mostrar concluídos
                  </label>
                </div>

                {/* Limpar Filtros */}
                <button
                  onClick={() => {
                    setFilterPriority('all');
                    setFilterStatus('all');
                    setShowCompleted(false);
                    setSearchTerm('');
                  }}
                  className="px-3 py-2 text-sm text-brand-gray/70 dark:text-gray-400 hover:text-brand-gray dark:hover:text-gray-100 border border-brand-light-gray dark:border-gray-600 rounded-lg hover:bg-brand-light-gray/30 dark:hover:bg-gray-700/30 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

              {/* Main Content */}
        <div className={`p-6 ${viewMode === 'list' ? 'flex' : ''}`}>
          {boards.length === 0 ? (
            /* Estado vazio - sem quadros */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-light-gray dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderPlus className="w-8 h-8 text-brand-gray/50 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-brand-gray dark:text-gray-100 mb-2">Nenhum quadro criado</h3>
              <p className="text-brand-gray/70 dark:text-gray-400 mb-6">Crie seu primeiro quadro para começar a organizar suas tarefas</p>
              <button
                onClick={() => setShowCreateBoardModal(true)}
                className="px-6 py-3 bg-brand-red text-white rounded-xl hover:bg-brand-red-dark transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeiro Quadro</span>
              </button>
            </div>
          ) : viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {columns.filter(col => {
              // Verificar se a coluna pertence ao board atual
              const currentBoardId = currentBoard?.id;
              const currentBoardStringId = currentBoard?.board_id;
              const colBoardId = col.board_id;
              
              // Converter todos para string para comparação segura
              const currentBoardIdStr = String(currentBoardId || '');
              const currentBoardStringIdStr = String(currentBoardStringId || '');
              const colBoardIdStr = String(colBoardId || '');
              
              // Comparar IDs como strings
              const boardIdMatch = 
                colBoardIdStr === currentBoardIdStr || 
                colBoardIdStr === currentBoardStringIdStr;
              
              return boardIdMatch;
            }).map((column) => (
              <ColumnComponent key={column.id} column={column} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-1">
            <div className="p-4 border-b border-brand-light-gray dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-brand-green rounded-full"></div>
                    <h3 className="font-semibold text-brand-gray dark:text-gray-100">Lista de Atividades</h3>
                  </div>
                  <span className="text-sm text-brand-gray/70 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {filteredCards.length} resultados
                      </span>
                </div>
                
                {/* Controles de Agrupamento */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm text-brand-gray dark:text-gray-100">
                    <input
                      type="checkbox"
                      checked={hideCardsWithoutSubtasks}
                      onChange={(e) => setHideCardsWithoutSubtasks(e.target.checked)}
                      className="rounded border-brand-light-gray dark:border-gray-600 text-brand-blue focus:ring-brand-blue"
                    />
                    <span>Ocultar cards sem subtarefas</span>
                  </label>
                  
                  <button
                    onClick={() => setGroupByBoard(!groupByBoard)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      groupByBoard 
                        ? 'bg-gradient-to-r from-brand-green to-brand-blue text-white shadow-sm' 
                        : 'bg-brand-light-gray dark:bg-gray-700 text-brand-gray dark:text-gray-300 hover:bg-brand-gray dark:hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                    </div>
                    <span>Agrupado por Quadro</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {(() => {
                const groupedCards = getGroupedCards();
                const isGrouped = Object.keys(groupedCards).length > 1 || (Object.keys(groupedCards).length === 1 && Object.keys(groupedCards)[0] !== 'Todos os Cards');
                
                return Object.entries(groupedCards).map(([groupName, groupCards]) => (
                  <div key={groupName} className="mb-6">
                    {/* Cabeçalho do grupo - só mostra se estiver agrupado */}
                    {isGrouped && (
                      <div className="px-4 py-3 bg-brand-light-gray/30 dark:bg-gray-700/30 border-l-4 border-brand-green">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-brand-gray dark:text-gray-100">{groupName}</h4>
                          <span className="text-sm text-brand-gray/70 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                            {groupCards.length} {groupCards.length === 1 ? 'card' : 'cards'}
                      </span>
                    </div>
                      </div>
                    )}
                    
                    {/* Cards do grupo */}
                    <div className="divide-y divide-brand-light-gray dark:divide-gray-700">
                      {groupCards.map((card) => (
                        <ListCardComponent key={card.id} card={card} />
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar de Detalhes - Modo Lista */}
      {viewMode === 'list' && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-brand-light-gray dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-brand-light-gray dark:border-gray-700">
                    <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <Eye className="w-2 h-2 text-white" />
              </div>
              <h3 className="font-semibold text-brand-gray dark:text-gray-100">Detalhes</h3>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            {selectedCard ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-brand-gray dark:text-gray-100 mb-2">{selectedCard.title}</h4>
                  {selectedCard.description && (
                    <p className="text-sm text-brand-gray/70 dark:text-gray-400">{selectedCard.description}</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-brand-gray/60 dark:text-gray-500 uppercase tracking-wide">Status</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedCard.status)}`}>
                        {selectedCard.status.toUpperCase()}
                        </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-brand-gray/60 dark:text-gray-500 uppercase tracking-wide">Prioridade</span>
                    <div className="mt-1 flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPriorityColor(selectedCard.priority) }}
                      />
                      <span className="text-sm text-brand-gray dark:text-gray-100">{getPriorityLabel(selectedCard.priority)}</span>
                    </div>
                  </div>
                  
                  {selectedCard.due_date && (
                    <div>
                      <span className="text-xs font-medium text-brand-gray/60 dark:text-gray-500 uppercase tracking-wide">Data de Vencimento</span>
                      <div className="mt-1 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-brand-gray/60 dark:text-gray-500" />
                        <span className="text-sm text-brand-gray dark:text-gray-100">
                          {new Date(selectedCard.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {selectedCard.subtasks && selectedCard.subtasks.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-brand-gray/60 dark:text-gray-500 uppercase tracking-wide">Subtarefas</span>
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-sm text-brand-gray dark:text-gray-100 mb-2">
                          <span>{selectedCard.subtasks.filter(s => s.completed).length} de {selectedCard.subtasks.length} concluídas</span>
                        </div>
                        <div className="w-full h-2 bg-brand-light-gray dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-green to-brand-blue transition-all duration-300"
                            style={{ 
                              width: `${(selectedCard.subtasks.filter(s => s.completed).length / selectedCard.subtasks.length) * 100}%` 
                            }}
                          />
                        </div>
                        {/* Lista de Subtarefas Clicáveis */}
                        <SubtaskList 
                          subtasks={selectedCard.subtasks}
                          onSubtaskClick={handleSubtaskClick}
                          compact={true}
                          className="max-h-48 overflow-y-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-brand-gray/60 dark:text-gray-500">
                <p className="text-sm">Nenhum</p>
                <p className="text-xs mt-1">Clique em um card para ver os detalhes</p>
          </div>
        )}
      </div>
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateBoardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-gray">Criar Novo Quadro</h2>
                <button
                  onClick={() => setShowCreateBoardModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Nome do Quadro</label>
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="Digite o nome do quadro"
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Descrição (opcional)</label>
                    <textarea
                      value={newBoardDescription}
                      onChange={(e) => setNewBoardDescription(e.target.value)}
                      placeholder="Digite uma descrição para o quadro"
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      rows={3}
                    />
                  </div>

                  {/* Opções de Colunas */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-gray">Configuração das Colunas</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setShowManualColumns(!showManualColumns);
                            setSelectedBoardTemplate(null);
                          }}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            showManualColumns 
                              ? 'bg-brand-blue text-white' 
                              : 'bg-brand-light-gray text-brand-gray hover:bg-brand-gray hover:text-white'
                          }`}
                        >
                          Manual
                        </button>
                        <button
                          onClick={() => {
                            setShowManualColumns(false);
                            setSelectedBoardTemplate(null);
                          }}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            !showManualColumns && !selectedBoardTemplate
                              ? 'bg-brand-blue text-white' 
                              : 'bg-brand-light-gray text-brand-gray hover:bg-brand-gray hover:text-white'
                          }`}
                        >
                          Padrão
                        </button>
                      </div>
                    </div>

                    {/* Template Selecionado */}
                    {selectedBoardTemplate && (
                      <div className="p-3 bg-brand-light-gray/30 rounded-xl border border-brand-light-gray">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-brand-gray">Template Selecionado:</span>
                          <button
                            onClick={clearBoardTemplate}
                            className="text-xs text-brand-red hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 ${selectedBoardTemplate.color} rounded flex items-center justify-center text-white text-xs overflow-hidden`}>
                            {selectedBoardTemplate.icon && typeof selectedBoardTemplate.icon === 'string' && !selectedBoardTemplate.icon.startsWith('📝') && !selectedBoardTemplate.icon.startsWith('🐛') && !selectedBoardTemplate.icon.startsWith('✨') ? (
                              <img 
                                src={`/img/icons_template/${selectedBoardTemplate.icon}.png`} 
                                alt={selectedBoardTemplate.icon}
                                className="w-4 h-4 object-contain"
                                onError={(e) => {
                                  console.error(`Erro ao carregar ícone: /img/icons_template/${selectedBoardTemplate.icon}.png`);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>{selectedBoardTemplate.icon}</span>
                            )}
                          </div>
                          <span className="text-sm text-brand-gray">{selectedBoardTemplate.name}</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-brand-gray/70 mb-2">Listas do quadro:</p>
                          <div className="space-y-1">
                            {selectedBoardTemplate.columns.map((column, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                                <span className="text-xs text-brand-gray">{column}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Colunas Manuais */}
                    {showManualColumns && (
                      <div className="p-3 bg-brand-light-gray/30 rounded-xl border border-brand-light-gray">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-brand-gray">Colunas Personalizadas</span>
                          <button
                            onClick={addManualColumn}
                            className="p-1 text-brand-blue hover:bg-brand-blue/10 rounded transition-colors"
                            title="Adicionar coluna"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {manualColumns.map((column, index) => (
                            <div key={index} className="flex items-center space-x-2 group">
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => moveManualColumn(index, Math.max(0, index - 1))}
                                  disabled={index === 0}
                                  className="p-1 text-brand-gray/50 hover:text-brand-gray disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Mover para cima"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => moveManualColumn(index, Math.min(manualColumns.length - 1, index + 1))}
                                  disabled={index === manualColumns.length - 1}
                                  className="p-1 text-brand-gray/50 hover:text-brand-gray disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Mover para baixo"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={column}
                                onChange={(e) => updateManualColumn(index, e.target.value)}
                                className="flex-1 p-2 text-sm border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                placeholder="Nome da coluna"
                              />
                              <button
                                onClick={() => removeManualColumn(index)}
                                disabled={manualColumns.length <= 1}
                                className="p-1 text-brand-red/50 hover:text-brand-red opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Remover coluna"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={() => setShowCreateBoardModal(false)}
                      className="btn-outline"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={createBoard}
                      className="btn-primary"
                    >
                      Criar Quadro
                    </button>
                  </div>
                </div>

                {/* Templates */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-brand-gray">Modelos Disponíveis</h3>
                    <span className="text-xs text-brand-gray/60">Clique para aplicar</span>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {boardTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => applyBoardTemplate(template)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${
                          selectedBoardTemplate?.id === template.id
                            ? 'border-brand-red bg-brand-red/5'
                            : 'border-brand-light-gray hover:border-brand-red/30 hover:bg-brand-light-gray/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${template.color} rounded-lg flex items-center justify-center text-white text-sm overflow-hidden`}>
                            {template.icon && typeof template.icon === 'string' && !template.icon.startsWith('📝') && !template.icon.startsWith('🐛') && !template.icon.startsWith('✨') ? (
                              <img 
                                src={`/img/icons_template/${template.icon}.png`} 
                                alt={template.icon}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  console.error(`Erro ao carregar ícone: /img/icons_template/${template.icon}.png`);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>{template.icon}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-brand-gray">{template.name}</h4>
                            <p className="text-xs text-brand-gray/60">{template.description}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                            {getCategoryLabel(template.category)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.columns.slice(0, 3).map((column, index) => (
                            <span key={index} className="px-2 py-1 bg-brand-light-gray/50 rounded text-xs text-brand-gray/70">
                              {column}
                            </span>
                          ))}
                          {template.columns.length > 3 && (
                            <span className="px-2 py-1 bg-brand-light-gray/50 rounded text-xs text-brand-gray/70">
                              +{template.columns.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Card Modal */}
      {showCreateCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-gray">Criar Novo Cartão</h2>
                <button
                  onClick={() => setShowCreateCardModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Título</label>
                    <input
                      type="text"
                      value={newCardData.title}
                      onChange={(e) => setNewCardData({...newCardData, title: e.target.value})}
                      placeholder="Digite o título do cartão"
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Descrição (opcional)</label>
                    <textarea
                      value={newCardData.description}
                      onChange={(e) => setNewCardData({...newCardData, description: e.target.value})}
                      placeholder="Digite uma descrição para o cartão"
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Prioridade</label>
                      <select
                        value={newCardData.priority}
                        onChange={(e) => setNewCardData({...newCardData, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical'})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Normal</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Data de Vencimento</label>
                      <input
                        type="date"
                        value={newCardData.due_date}
                        onChange={(e) => setNewCardData({...newCardData, due_date: e.target.value})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  {/* Seletor de Membros */}
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">
                      <Users className="inline w-4 h-4 mr-1" />
                      Membros do Card
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-brand-light-gray rounded-xl p-3 bg-white">
                      {availableUsers.map(userItem => (
                        <label key={userItem.id} className="flex items-center gap-3 cursor-pointer hover:bg-brand-light-gray/30 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={newCardData.members.includes(userItem.id)}
                            onChange={() => handleMemberToggle(userItem.id)}
                            className="rounded border-brand-light-gray text-brand-red focus:ring-brand-red"
                          />
                          <div className="flex items-center gap-2">
                            {userItem.avatar_url ? (
                              <img
                                src={userItem.avatar_url}
                                alt={userItem.username}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-semibold">
                                {userItem.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-brand-gray">{userItem.username}</span>
                            {userItem.id === user?.id && (
                              <span className="text-xs bg-brand-red/10 text-brand-red px-2 py-1 rounded-full font-medium">
                                Criador
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-brand-gray/60 mt-1">
                      Selecione os usuários que participarão deste card. O criador sempre será um membro.
                    </p>
                  </div>

                  {/* Template Selecionado */}
                  {selectedCardTemplate && (
                    <div className="p-3 bg-brand-light-gray/30 rounded-xl border border-brand-light-gray">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-brand-gray">Template Selecionado:</span>
                        <button
                          onClick={clearCardTemplate}
                          className="text-xs text-brand-red hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 ${selectedCardTemplate.color} rounded flex items-center justify-center text-white text-xs overflow-hidden`}>
                          {selectedCardTemplate.category === 'bug' ? (
                            <span>🐛</span>
                          ) : selectedCardTemplate.category === 'feature' ? (
                            <span>✨</span>
                          ) : (
                                                         <img 
                               src="/img/icons_template/tarefas.png" 
                               alt="Tarefa"
                               className="w-4 h-4 object-contain"
                             />
                          )}
                        </div>
                        <span className="text-sm text-brand-gray">{selectedCardTemplate.name}</span>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          selectedCardTemplate.fields.priority === 'critical' ? 'bg-red-600 text-white' :
                          selectedCardTemplate.fields.priority === 'high' ? 'bg-red-100 text-red-700' :
                          selectedCardTemplate.fields.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {selectedCardTemplate.fields.priority === 'critical' ? 'Crítica' :
                           selectedCardTemplate.fields.priority === 'high' ? 'Alta' :
                           selectedCardTemplate.fields.priority === 'medium' ? 'Normal' : 'Baixa'}
                        </span>
                        <span className="text-xs text-brand-gray/70">{selectedCardTemplate.fields.status}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={() => setShowCreateCardModal(false)}
                      className="btn-outline"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateCard}
                      className="btn-primary"
                    >
                      Criar Cartão
                    </button>
                  </div>
                </div>

                {/* Templates */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-brand-gray">Modelos Disponíveis</h3>
                    <span className="text-xs text-brand-gray/60">Clique para aplicar</span>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cardTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => applyCardTemplate(template)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${
                          selectedCardTemplate?.id === template.id
                            ? 'border-brand-red bg-brand-red/5'
                            : 'border-brand-light-gray hover:border-brand-red/30 hover:bg-brand-light-gray/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${template.color} rounded-lg flex items-center justify-center text-white text-sm overflow-hidden`}>
                            {template.category === 'bug' ? (
                              <span>🐛</span>
                            ) : template.category === 'feature' ? (
                              <span>✨</span>
                            ) : (
                              <img 
                                src="/img/icons_template/tarefas.png" 
                                alt="Tarefa"
                                className="w-5 h-5 object-contain"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-brand-gray">{template.name}</h4>
                            <p className="text-xs text-brand-gray/60">{template.description}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                            {getCategoryLabel(template.category)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            template.fields.priority === 'critical' ? 'bg-red-600 text-white' :
                            template.fields.priority === 'high' ? 'bg-red-100 text-red-700' :
                            template.fields.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {template.fields.priority === 'critical' ? 'Crítica' :
                             template.fields.priority === 'high' ? 'Alta' :
                             template.fields.priority === 'medium' ? 'Normal' : 'Baixa'}
                          </span>
                          <span className="text-xs text-brand-gray/70">{template.fields.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {showCardDetailModal && selectedCard && (
        <CardDetailModal
          card={selectedCard}
          columns={columns}
          allCards={cards}
          onSave={async (updatedCard) => {
            try {
              // Salvar no banco de dados
              const success = await db.updateCardById(updatedCard.id, {
                title: updatedCard.title,
                description: updatedCard.description,
                priority: updatedCard.priority,
                status: updatedCard.status,
                due_date: updatedCard.due_date,
                importance: updatedCard.importance,
                category: updatedCard.category,
                tags: updatedCard.tags,
                members: updatedCard.members,
                dependencies: updatedCard.dependencies,
                subtasks: updatedCard.subtasks,
                goal: updatedCard.goal,
                recurrence: updatedCard.recurrence,
                git_branch: updatedCard.git_branch,
                git_commit: updatedCard.git_commit,
                git_pr: updatedCard.git_pr
              });

              if (success) {
                // Atualizar o estado local
                setCards(cards.map(card => 
                  card.id === updatedCard.id ? updatedCard : card
                ));
                
                addToast({
                  type: 'success',
                  title: 'Card atualizado',
                  message: 'As alterações foram salvas no banco de dados!'
                });
                
                setShowCardDetailModal(false);
                setSelectedCard(null);
              } else {
                addToast({
                  type: 'error',
                  title: 'Erro ao salvar',
                  message: 'Não foi possível salvar as alterações no banco de dados.'
                });
              }
            } catch (error) {
              console.error('Erro ao salvar card:', error);
              addToast({
                type: 'error',
                title: 'Erro ao salvar',
                message: 'Ocorreu um erro ao salvar as alterações.'
              });
            }
          }}
          onDelete={(cardId) => {
            confirmDeleteCard(cardId);
            setShowCardDetailModal(false);
            setSelectedCard(null);
          }}
          onClose={() => {
            setShowCardDetailModal(false);
            setSelectedCard(null);
          }}
          onSubtaskUpdate={updateCardSubtasks}
        />
      )}

      {/* Board Templates Modal */}
      {showBoardTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 shadow-xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
                              <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-gray">Modelos de Quadros</h2>
                    <p className="text-sm text-brand-gray/60 mt-1">Escolha um modelo para criar um novo quadro</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCreateBoardTemplateModal(true)}
                      className="px-4 py-2 bg-brand-red text-white rounded-xl hover:bg-brand-red-dark transition-colors text-sm"
                    >
                      Criar Template
                    </button>
                    <button
                      onClick={() => setShowBoardTemplatesModal(false)}
                      className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {boardTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-brand-light-gray rounded-xl hover:border-brand-red/30 hover:shadow-md transition-all relative group"
                  >
                    {/* Botão de exclusão */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBoardTemplate(template.id, template.name);
                      }}
                      className="absolute top-2 right-2 p-1 text-brand-red/60 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Conteúdo clicável */}
                    <div
                      onClick={() => createBoardFromTemplate(template)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center text-white text-lg overflow-hidden`}>
                                                      {template.icon && typeof template.icon === 'string' && !template.icon.startsWith('📝') && !template.icon.startsWith('🐛') && !template.icon.startsWith('✨') ? (
                            <img 
                              src={`/img/icons_template/${template.icon}.png`} 
                              alt={template.icon}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                console.error(`Erro ao carregar ícone: /img/icons_template/${template.icon}.png`);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>{template.icon}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-brand-gray">{template.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                            {getCategoryLabel(template.category)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-brand-gray/60 mb-3">{template.description}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-brand-gray">Colunas:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.columns.slice(0, 3).map((column, index) => (
                            <span key={index} className="px-2 py-1 bg-brand-light-gray/50 rounded text-xs text-brand-gray/70">
                              {column}
                            </span>
                          ))}
                          {template.columns.length > 3 && (
                            <span className="px-2 py-1 bg-brand-light-gray/50 rounded text-xs text-brand-gray/70">
                              +{template.columns.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Templates Modal */}
      {showCardTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 shadow-xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
                              <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-gray">Modelos de Cards</h2>
                    <p className="text-sm text-brand-gray/60 mt-1">Escolha um modelo para criar um novo card</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCreateCardTemplateModal(true)}
                      className="px-4 py-2 bg-brand-red text-white rounded-xl hover:bg-brand-red-dark transition-colors text-sm"
                    >
                      Criar Template
                    </button>
                    <button
                      onClick={() => setShowCardTemplateModal(false)}
                      className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {cardTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-brand-light-gray rounded-xl hover:border-brand-red/30 hover:shadow-md transition-all relative group"
                  >
                    {/* Botão de exclusão */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCardTemplate(template.id, template.name);
                      }}
                      className="absolute top-2 right-2 p-1 text-brand-red/60 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Conteúdo clicável */}
                    <div
                      onClick={() => createCardFromTemplate(template)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center text-white text-lg overflow-hidden`}>
                          {template.category === 'bug' ? (
                            <span>🐛</span>
                          ) : template.category === 'feature' ? (
                            <span>✨</span>
                          ) : (
                                                         <img 
                               src="/img/icons_template/tarefas.png" 
                               alt="Tarefa"
                               className="w-6 h-6 object-contain"
                             />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-brand-gray">{template.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                            {getCategoryLabel(template.category)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-brand-gray/60 mb-3">{template.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-brand-gray">Prioridade:</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            template.fields.priority === 'critical' ? 'bg-red-600 text-white' :
                            template.fields.priority === 'high' ? 'bg-red-100 text-red-700' :
                            template.fields.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {template.fields.priority === 'critical' ? 'Crítica' :
                             template.fields.priority === 'high' ? 'Alta' :
                             template.fields.priority === 'medium' ? 'Normal' : 'Baixa'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-brand-gray">Status:</span>
                          <span className="px-2 py-0.5 bg-brand-light-gray/50 rounded text-xs text-brand-gray/70">
                            {template.fields.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Board Template Modal */}
      {showCreateBoardTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-gray">Criar Template de Quadro</h2>
                <button
                  onClick={() => setShowCreateBoardTemplateModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Nome do Template</label>
                    <input
                      type="text"
                      value={newBoardTemplate.name}
                      onChange={(e) => setNewBoardTemplate({...newBoardTemplate, name: e.target.value})}
                      placeholder="Ex: Desenvolvimento de Software"
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Descrição</label>
                    <textarea
                      value={newBoardTemplate.description}
                      onChange={(e) => setNewBoardTemplate({...newBoardTemplate, description: e.target.value})}
                      placeholder="Descreva o propósito deste template"
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Categoria</label>
                      <select
                        value={newBoardTemplate.category}
                        onChange={(e) => setNewBoardTemplate({...newBoardTemplate, category: e.target.value as any})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="project">Projeto</option>
                        <option value="task">Tarefa</option>
                        <option value="workflow">Fluxo de Trabalho</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Cor</label>
                      <select
                        value={newBoardTemplate.color}
                        onChange={(e) => setNewBoardTemplate({...newBoardTemplate, color: e.target.value})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="bg-blue-500">Azul</option>
                        <option value="bg-green-500">Verde</option>
                        <option value="bg-purple-500">Roxo</option>
                        <option value="bg-pink-500">Rosa</option>
                        <option value="bg-yellow-500">Amarelo</option>
                        <option value="bg-indigo-500">Índigo</option>
                        <option value="bg-red-500">Vermelho</option>
                        <option value="bg-gray-500">Cinza</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Ícone</label>
                    <select
                      value={newBoardTemplate.icon}
                      onChange={(e) => setNewBoardTemplate({...newBoardTemplate, icon: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <option value="desenvolvimento">Desenvolvimento</option>
                      <option value="marketing">Marketing</option>
                      <option value="suporte">Suporte</option>
                      <option value="design">Design</option>
                      <option value="vendas">Vendas</option>
                      <option value="rh">RH</option>
                      <option value="tarefas">Tarefa</option>
                      <option value="projeto">Projeto</option>
                      <option value="produto">Produto</option>
                      <option value="manutencao">Manutenção</option>
                    </select>
                  </div>
                </div>

                {/* Colunas em formato Kanban */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-brand-gray">Colunas do Quadro</label>
                    <button
                      onClick={addColumnToTemplate}
                      className="px-3 py-1 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors text-sm"
                    >
                      + Adicionar Coluna
                    </button>
                  </div>

                  {/* Visualização Kanban das colunas */}
                  <div className="bg-brand-light-gray/20 rounded-xl p-4">
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {newBoardTemplate.columns.map((column, index) => (
                        <div 
                          key={index} 
                          className="flex-shrink-0 w-48"
                          draggable
                          onDragStart={(e) => handleColumnDragStart(e, index)}
                          onDragOver={handleColumnDragOver}
                          onDrop={(e) => handleColumnDrop(e, index)}
                          onDragEnd={handleColumnDragEnd}
                        >
                          <div className={`bg-white rounded-xl shadow-sm border border-brand-light-gray transition-all duration-200 ${
                            draggedColumnIndex === index ? 'opacity-50 scale-95' : ''
                          } ${draggedColumnIndex !== null && draggedColumnIndex !== index ? 'hover:border-brand-blue/30' : ''}`}>
                            {/* Header da coluna */}
                            <div className="p-3 border-b border-brand-light-gray/50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 flex-1">
                                  <div className="w-2 h-2 bg-brand-gray/30 rounded-full cursor-move hover:bg-brand-gray/50 transition-colors"></div>
                                  <input
                                    type="text"
                                    value={column}
                                    onChange={(e) => updateColumnName(index, e.target.value)}
                                    className="flex-1 font-medium text-brand-gray bg-transparent border-none outline-none focus:ring-0 text-sm"
                                    placeholder={`Coluna ${index + 1}`}
                                  />
                                </div>
                                {newBoardTemplate.columns.length > 2 && (
                                  <button
                                    onClick={() => removeColumnFromTemplate(index)}
                                    className="ml-2 p-1 text-brand-red/60 hover:text-brand-red hover:bg-brand-red/10 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-brand-gray/60">0 cards</span>
                                <div className="w-6 h-6 bg-brand-light-gray/50 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-brand-gray/60">+</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Área de cards da coluna */}
                            <div className="p-2 min-h-[120px] bg-brand-light-gray/10">
                              <div className="text-center py-8">
                                <div className="w-8 h-8 mx-auto mb-2 bg-brand-light-gray/30 rounded-lg flex items-center justify-center">
                                                                   <img 
                                   src="/img/icons_template/tarefas.png" 
                                   alt="Tarefa"
                                   className="w-6 h-6 opacity-40"
                                 />
                                </div>
                                <p className="text-xs text-brand-gray/40">Cards aparecerão aqui</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Indicador de scroll e drag */}
                    <div className="text-center mt-2">
                      <span className="text-xs text-brand-gray/40">
                        {newBoardTemplate.columns.length > 3 ? '← Arraste para ver mais colunas →' : '← Arraste as colunas para reordenar →'}
                      </span>
                    </div>
                  </div>

                  {/* Lista simples para edição rápida */}
                  <div className="bg-brand-light-gray/10 rounded-lg p-3">
                    <h4 className="text-xs font-medium text-brand-gray mb-2">Edição Rápida das Colunas:</h4>
                    <div className="space-y-2">
                      {newBoardTemplate.columns.map((column, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-xs text-brand-gray/60 w-6">#{index + 1}</span>
                          <input
                            type="text"
                            value={column}
                            onChange={(e) => updateColumnName(index, e.target.value)}
                            className="flex-1 p-2 text-xs border border-brand-light-gray/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue bg-white"
                            placeholder={`Nome da coluna ${index + 1}`}
                          />
                          {newBoardTemplate.columns.length > 2 && (
                            <button
                              onClick={() => removeColumnFromTemplate(index)}
                              className="p-1 text-brand-red/60 hover:text-brand-red hover:bg-brand-red/10 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview em formato Kanban */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-brand-gray">Preview do Template</h3>
                  
                  {/* Header do preview */}
                  <div className="p-4 bg-brand-light-gray/30 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-8 h-8 ${newBoardTemplate.color} rounded-lg flex items-center justify-center text-white text-sm overflow-hidden`}>
                                                    {newBoardTemplate.icon && typeof newBoardTemplate.icon === 'string' && !newBoardTemplate.icon.startsWith('📝') && !newBoardTemplate.icon.startsWith('🐛') && !newBoardTemplate.icon.startsWith('✨') ? (
                          <img 
                            src={`/img/icons_template/${newBoardTemplate.icon}.png`} 
                            alt={newBoardTemplate.icon}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              console.error(`Erro ao carregar ícone: /img/icons_template/${newBoardTemplate.icon}.png`);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>📝</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-brand-gray">{newBoardTemplate.name || 'Nome do Template'}</p>
                        <p className="text-xs text-brand-gray/60">{newBoardTemplate.description || 'Descrição do template'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue text-xs rounded-full">
                        {newBoardTemplate.category === 'project' ? 'Projeto' :
                         newBoardTemplate.category === 'task' ? 'Tarefa' :
                         newBoardTemplate.category === 'workflow' ? 'Fluxo de Trabalho' : 'Personalizado'}
                      </span>
                      <span className="px-2 py-1 bg-brand-gray/10 text-brand-gray text-xs rounded-full">
                        {newBoardTemplate.columns.length} colunas
                      </span>
                    </div>
                  </div>

                  {/* Preview Kanban */}
                  <div className="bg-brand-light-gray/10 rounded-xl p-3">
                    <div className="flex space-x-3 overflow-x-auto">
                      {newBoardTemplate.columns.map((column, index) => (
                        <div key={index} className="flex-shrink-0 w-32">
                          <div className="bg-white rounded-lg shadow-sm border border-brand-light-gray/50">
                            <div className="p-2 border-b border-brand-light-gray/30">
                              <p className="text-xs font-medium text-brand-gray truncate">{column}</p>
                              <p className="text-xs text-brand-gray/40">0 cards</p>
                            </div>
                            <div className="p-2 min-h-[80px] bg-brand-light-gray/5">
                              <div className="text-center py-4">
                                <div className="w-4 h-4 mx-auto mb-1 bg-brand-light-gray/20 rounded flex items-center justify-center">
                                  <span className="text-brand-gray/30 text-xs">+</span>
                                </div>
                                <p className="text-xs text-brand-gray/30">Vazio</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-brand-light-gray">
                  <button
                    onClick={() => setShowCreateBoardTemplateModal(false)}
                    className="btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createBoardTemplate}
                    className="btn-primary"
                  >
                    Criar Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Card Template Modal */}
      {showCreateCardTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-gray">Criar Template de Card</h2>
                <button
                  onClick={() => setShowCreateCardTemplateModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Nome do Template</label>
                    <input
                      type="text"
                      value={newCardTemplate.name}
                      onChange={(e) => setNewCardTemplate({...newCardTemplate, name: e.target.value})}
                      placeholder="Ex: Bug Report"
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Descrição</label>
                    <textarea
                      value={newCardTemplate.description}
                      onChange={(e) => setNewCardTemplate({...newCardTemplate, description: e.target.value})}
                      placeholder="Descreva o propósito deste template"
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Categoria</label>
                      <select
                        value={newCardTemplate.category}
                        onChange={(e) => setNewCardTemplate({...newCardTemplate, category: e.target.value as any})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="task">Tarefa</option>
                        <option value="bug">Bug</option>
                        <option value="feature">Funcionalidade</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Cor</label>
                      <select
                        value={newCardTemplate.color}
                        onChange={(e) => setNewCardTemplate({...newCardTemplate, color: e.target.value})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="bg-blue-500">Azul</option>
                        <option value="bg-green-500">Verde</option>
                        <option value="bg-purple-500">Roxo</option>
                        <option value="bg-pink-500">Rosa</option>
                        <option value="bg-yellow-500">Amarelo</option>
                        <option value="bg-indigo-500">Índigo</option>
                        <option value="bg-red-500">Vermelho</option>
                        <option value="bg-gray-500">Cinza</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Campos Padrão */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-brand-gray">Campos Padrão</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Título Padrão</label>
                    <input
                      type="text"
                      value={newCardTemplate.fields.title}
                      onChange={(e) => setNewCardTemplate({
                        ...newCardTemplate, 
                        fields: {...newCardTemplate.fields, title: e.target.value}
                      })}
                      placeholder="Ex: Bug: [Descrição]"
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Descrição Padrão</label>
                    <textarea
                      value={newCardTemplate.fields.description}
                      onChange={(e) => setNewCardTemplate({
                        ...newCardTemplate, 
                        fields: {...newCardTemplate.fields, description: e.target.value}
                      })}
                      placeholder="Ex: Passos para reproduzir:\n1. \n2. \n3."
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Prioridade Padrão</label>
                      <select
                        value={newCardTemplate.fields.priority}
                        onChange={(e) => setNewCardTemplate({
                          ...newCardTemplate, 
                          fields: {...newCardTemplate.fields, priority: e.target.value as any}
                        })}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Normal</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Status Padrão</label>
                      <input
                        type="text"
                        value={newCardTemplate.fields.status}
                        onChange={(e) => setNewCardTemplate({
                          ...newCardTemplate, 
                          fields: {...newCardTemplate.fields, status: e.target.value}
                        })}
                        placeholder="Ex: A Fazer"
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-brand-light-gray/30 rounded-xl">
                  <h3 className="text-sm font-medium text-brand-gray mb-3">Preview do Template</h3>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 ${newCardTemplate.color} rounded-lg flex items-center justify-center text-white text-sm overflow-hidden`}>
                      {newCardTemplate.category === 'bug' ? (
                        <span>🐛</span>
                      ) : newCardTemplate.category === 'feature' ? (
                        <span>✨</span>
                      ) : (
                                                 <img 
                           src="/img/icons_template/tarefas.png" 
                           alt="Tarefa"
                           className="w-5 h-5 object-contain"
                         />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-brand-gray">{newCardTemplate.name || 'Nome do Template'}</p>
                      <p className="text-xs text-brand-gray/60">{newCardTemplate.description || 'Descrição do template'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-brand-gray"><strong>Título:</strong> {newCardTemplate.fields.title || 'Título padrão'}</p>
                    <p className="text-sm text-brand-gray"><strong>Prioridade:</strong> 
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        newCardTemplate.fields.priority === 'critical' ? 'bg-red-600 text-white' :
                        newCardTemplate.fields.priority === 'high' ? 'bg-red-100 text-red-700' :
                        newCardTemplate.fields.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {newCardTemplate.fields.priority === 'critical' ? 'Crítica' :
                         newCardTemplate.fields.priority === 'high' ? 'Alta' :
                         newCardTemplate.fields.priority === 'medium' ? 'Normal' : 'Baixa'}
                      </span>
                    </p>
                    <p className="text-sm text-brand-gray"><strong>Status:</strong> {newCardTemplate.fields.status || 'Status padrão'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-brand-light-gray">
                  <button
                    onClick={() => setShowCreateCardTemplateModal(false)}
                    className="btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createCardTemplate}
                    className="btn-primary"
                  >
                    Criar Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Template de Quadro */}
      {showDeleteBoardTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-gray">Excluir Template</h3>
                  <p className="text-sm text-brand-gray/60">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-brand-gray/60">
                  Tem certeza que deseja excluir o template <strong>"{templateToDelete?.name}"</strong>?
                </p>
                
                <div className="p-3 bg-brand-red/5 border border-brand-red/20 rounded-lg">
                  <p className="text-sm text-brand-red">
                    <strong>Atenção:</strong> Este template será removido permanentemente e não poderá ser recuperado.
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={cancelDeleteTemplate}
                    className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteTemplate}
                    className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors"
                  >
                    Excluir Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Template de Card */}
      {showDeleteCardTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-gray">Excluir Template</h3>
                  <p className="text-sm text-brand-gray/60">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-brand-gray/60">
                  Tem certeza que deseja excluir o template <strong>"{templateToDelete?.name}"</strong>?
                </p>
                
                <div className="p-3 bg-brand-red/5 border border-brand-red/20 rounded-lg">
                  <p className="text-sm text-brand-red">
                    <strong>Atenção:</strong> Este template será removido permanentemente e não poderá ser recuperado.
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={cancelDeleteTemplate}
                    className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteTemplate}
                    className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors"
                  >
                    Excluir Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Subtarefas */}
      <SubtaskModal
        isOpen={showSubtaskModal}
        onClose={handleCloseSubtaskModal}
        subtask={selectedSubtask}
        onUpdate={handleUpdateSubtask}
        onDelete={handleDeleteSubtask}
      />

    </div>
  );
};

export default KanbanBoard;

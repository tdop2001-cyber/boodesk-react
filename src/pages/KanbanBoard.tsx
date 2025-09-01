import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { useDatabase } from '../hooks/useDatabase';
import { db } from '../services/database';
import { Board, Card, Column, CardDependency } from '../types';
import SubtaskManager, { Subtask } from '../components/SubtaskManager';
import CardDetailModal from '../components/CardDetailModal';
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
  MoreVertical,
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
  

  const [newCardData, setNewCardData] = useState({
    title: '',
    description: '',
    priority: cardSettings.defaultPriority as 'low' | 'medium' | 'high' | 'critical',
    column_id: 1,
    due_date: ''
  });
  const [selectedCardTemplate, setSelectedCardTemplate] = useState<CardTemplate | null>(null);
  
  // Estados para criação de templates
  const [showCreateBoardTemplateModal, setShowCreateBoardTemplateModal] = useState(false);
  const [showCreateCardTemplateModal, setShowCreateCardTemplateModal] = useState(false);
  const [showDeleteBoardTemplateModal, setShowDeleteBoardTemplateModal] = useState(false);
  const [showDeleteCardTemplateModal, setShowDeleteCardTemplateModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: number; name: string; type: 'board' | 'card' } | null>(null);
  const [showCardDetailModal, setShowCardDetailModal] = useState(false);
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

  // Templates de quadros carregados do banco
  const [boardTemplates, setBoardTemplates] = useState<BoardTemplate[]>([]);

  // Templates de cards padrão (serão carregados do banco quando implementado)
  const [cardTemplates, setCardTemplates] = useState<CardTemplate[]>([]);

  const loadKanbanData = async () => {
    await loadBoards();
    await loadBoardTemplates();
  };

  const loadBoards = async () => {
    try {
      // Carregar boards do Supabase
      const boardsData = await db.getBoards(user?.id);
      
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

  const loadBoardData = async (board: Board) => {
    try {
      console.log('=== INICIANDO CARREGAMENTO DO BOARD ===');
      console.log('Board:', board.name);
      console.log('Board ID:', board.id);
      console.log('Board Board ID:', board.board_id);
      
      // Verificar se board_id existe
      if (!board.board_id) {
        console.error('Board ID não encontrado para:', board.name);
        return;
      }
      
      // Carregar listas/colunas para o board
      const listsData = await db.getListsForBoard(board.board_id);
      console.log('=== CARREGANDO COLUNAS ===');
      console.log('listsData do banco:', listsData);
      
      const mappedColumns: Column[] = listsData.map(list => ({
        id: list.id,
        board_id: board.id,
        name: list.name,
        order: list.position,
        color: '#E5E7EB',
        created_at: list.created_at,
        updated_at: list.updated_at
      }));
      
      console.log('mappedColumns:', mappedColumns);
      setColumns(mappedColumns);
      
      // Carregar cards para o board
      const cardsData = await db.getCardsForBoard(board.board_id);
      console.log('=== CARREGANDO CARDS ===');
      console.log('board.board_id:', board.board_id);
      console.log('cardsData do banco:', cardsData);
      
      // Função auxiliar para obter ID da coluna pelo nome (usando as colunas mapeadas)
      const getColumnIdFromNameLocal = (columnName: string): number => {
        const column = mappedColumns.find(col => col.name === columnName);
        return column?.id || 1;
      };
      
      // Carregar subtarefas para cada card
      const mappedCards: Card[] = await Promise.all(cardsData.map(async (card) => {
        const subtasks = await db.getSubtasksForCard(card.card_id);
        const mappedSubtasks = subtasks.map(subtask => ({
          id: subtask.id.toString(),
          title: subtask.title,
          completed: subtask.completed,
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

        const columnId = getColumnIdFromNameLocal(card.list_name);
        console.log(`Mapeando card "${card.title}" da coluna "${card.list_name}" para column_id: ${columnId}`);
        
        const mappedCard = {
          id: card.id,
          board_id: board.id,
          column_id: columnId, // Mapear list_name para column_id
          title: card.title,
          description: card.description,
          priority: card.importance as 'low' | 'medium' | 'high',
          status: card.status as 'todo' | 'progress' | 'done',
          assigned_to: card.user_id,
          created_by: card.user_id || 1,
          created_at: card.created_at,
          updated_at: card.updated_at,
          due_date: card.due_date || undefined,
          tags: [],
          attachments: [],
          comments: [],
          dependencies: card.dependencies || [],
          subtasks: mappedSubtasks
        };
        return mappedCard;
      }));
      
      // Filtrar cards para mostrar apenas os do board atual
      const boardCards = mappedCards.filter(card => card.board_id === board.id);
      console.log('=== RESUMO DO CARREGAMENTO ===');
      console.log('Total de cards mapeados:', mappedCards.length);
      console.log('Total de cards filtrados:', boardCards.length);
      console.log('Board ID para filtro:', board.id);
      console.log('Cards filtrados:', boardCards);
      console.log('Cards antes de setCards:', cards);
      setCards(boardCards);
      console.log('=== CARREGAMENTO CONCLUÍDO ===');
      
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
      // Atualizar a posição de cada quadro no banco de dados
      for (let i = 0; i < orderedBoards.length; i++) {
        const board = orderedBoards[i];
        await db.updateBoard(board.id, { position: i + 1 } as any);
      }
    } catch (error) {
      console.error('Erro ao salvar ordem dos quadros:', error);
      throw error;
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
        // Atualizar o card no banco de dados
        const success = await db.updateCardById(draggedCard.id, {
          list_name: targetColumn.name,
          status: newStatus
        });

        if (success) {
          // Atualizar o card no estado local
          const updatedCards = cards.map(card =>
            card.id === draggedCard.id
              ? { ...card, column_id: targetColumnId, status: newStatus as 'todo' | 'progress' | 'done' }
              : card
          );
          setCards(updatedCards);
          
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
      due_date: ''
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
        board_id: currentBoard.board_id, // Usar board_id correto
        list_name: getColumnName(newCardData.column_id),
        title: newCardData.title,
        description: newCardData.description,
        status: getStatusFromColumn(newCardData.column_id),
        importance: newCardData.priority,
        due_date: newCardData.due_date || undefined,
        subject: '-',
        goal: '-',
        members: [],
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
          tags: [],
          attachments: [],
          comments: []
        };

        console.log('newCard a ser adicionado:', newCard);
        console.log('cards atuais:', cards);
        
        // Recarregar dados do board para garantir sincronização
        if (currentBoard) {
          await loadBoardData(currentBoard);
        }
        
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
      due_date: ''
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
      due_date: ''
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
    setNewCardData({
      title: template.fields.title,
      description: template.fields.description,
      priority: template.fields.priority,
      column_id: newCardData.column_id,
      due_date: newCardData.due_date
    });
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
      due_date: newCardData.due_date
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



  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (card.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || card.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || card.status === filterStatus;
    const matchesCompleted = showCompleted || card.status !== 'done';
    
    return matchesSearch && matchesPriority && matchesStatus && matchesCompleted;
  });

  const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
    const { hasPermission } = usePermissions();
    const isOverdue = card.due_date && new Date(card.due_date) < new Date();
    
    // Usar subtarefas reais do card se existirem
    const cardSubtasks = card.subtasks || [];
    
    return (
      <div
        draggable={hasPermission('card:edit')}
        onDragStart={(e) => handleDragStart(e, card)}
        onClick={() => {
          setSelectedCard(card);
          setShowCardDetailModal(true);
        }}
        className={`card-hover bg-white dark:bg-gray-800 border-2 rounded-xl p-3 mb-2 cursor-pointer hover:shadow-lg transition-all duration-200 shadow-sm ${
          card.dependencies && card.dependencies.length > 0 && !checkDependenciesCompleted(card)
            ? 'border-orange-300 bg-orange-50/30 dark:bg-orange-900/20' 
            : ''
        }`}
        style={{
          borderColor: card.dependencies && card.dependencies.length > 0 && !checkDependenciesCompleted(card)
            ? undefined
            : getPriorityColor(card.priority)
        }}
        title={
          card.dependencies && card.dependencies.length > 0 && !checkDependenciesCompleted(card)
            ? 'Este card possui dependências não concluídas e não pode ser movido para "Concluído"'
            : undefined
        }
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
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
          <p className="text-xs text-brand-gray/70 dark:text-gray-300 mb-2 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Subtasks Progress */}
        {cardSubtasks.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-brand-gray/60 mb-1">
              <span>Subtarefas</span>
              <span>{cardSubtasks.filter(s => s.completed).length}/{cardSubtasks.length}</span>
            </div>
            <div className="w-full h-1.5 bg-brand-light-gray rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-green to-brand-blue transition-all duration-300"
                style={{ 
                  width: `${cardSubtasks.length > 0 ? (cardSubtasks.filter(s => s.completed).length / cardSubtasks.length) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
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
        )}

        {/* Dependencies Status */}
        {card.dependencies && card.dependencies.length > 0 && (
          <div className="mb-2 p-2 bg-brand-light-gray/20 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-brand-gray/70">
                <Link className="w-3 h-3" />
                <span>Dependências ({card.dependencies.length})</span>
              </div>
              {checkDependenciesCompleted(card) ? (
                <span className="text-green-600 font-medium">✓ Pronto</span>
              ) : (
                <span className="text-orange-600 font-medium">⏳ Aguardando</span>
              )}
            </div>
            {!checkDependenciesCompleted(card) && (
              <div className="mt-1 text-xs text-brand-gray/60">
                {card.dependencies.length} dependência(s) não concluída(s)
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Due Date */}
            {card.due_date && (
              <div className={`flex items-center space-x-1 text-xs ${isOverdue ? 'text-brand-red' : 'text-brand-gray/70'}`}>
                <Clock className="w-3 h-3" />
                <span>{new Date(card.due_date).toLocaleDateString('pt-BR')}</span>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
              </div>
            )}

            {/* Attachments */}
            {card.attachments && card.attachments.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-brand-gray/70">
                <Paperclip className="w-3 h-3" />
                <span>{card.attachments.length}</span>
              </div>
            )}

            {/* Comments */}
            {card.comments && card.comments.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-brand-gray/70">
                <MessageSquare className="w-3 h-3" />
                <span>{card.comments.length}</span>
              </div>
            )}

            {/* Members */}
            {card.members && card.members.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-brand-gray/70">
                <Users className="w-3 h-3" />
                <span>{card.members.length}</span>
              </div>
            )}
          </div>

          {/* Assigned User */}
          <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-semibold">
              {card.assigned_to ? 'U' : '?'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const ColumnComponent: React.FC<{ column: Column }> = ({ column }) => {
    const filteredColumnCards = filteredCards.filter(card => card.column_id === column.id);
    
    // Debug: verificar colunas filtradas
    console.log('Colunas filtradas:', columns.filter(col => col.board_id === currentBoard?.id));
    console.log('ColumnComponent - column:', column);
    console.log('ColumnComponent - filteredCards:', filteredCards);
    console.log('ColumnComponent - filteredColumnCards:', filteredColumnCards);
    
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
                  onClick={() => setViewMode('list')}
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
        <div className="p-6">
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
            {columns.filter(col => col.board_id === currentBoard?.id).map((column) => (
              <ColumnComponent key={column.id} column={column} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-4 border-b border-brand-light-gray dark:border-gray-700">
              <h3 className="font-semibold text-brand-gray dark:text-gray-100">Todos os Cartões</h3>
            </div>
            <div className="divide-y divide-brand-light-gray dark:divide-gray-700">
              {filteredCards.map((card) => (
                <div 
                  key={card.id} 
                  className="p-4 hover:bg-brand-light-gray/30 dark:hover:bg-gray-700/30 transition-colors border-l-4"
                  style={{ borderLeftColor: getPriorityColor(card.priority) }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(card.status)}`}>
                        {card.status.toUpperCase()}
                      </span>
                      <h4 className="font-medium text-brand-gray dark:text-gray-100">{card.title}</h4>
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
                    <div className="flex items-center space-x-2">
                      {card.due_date && (
                        <span className="text-xs text-brand-gray/70 dark:text-gray-400">
                          {new Date(card.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedCard(card)}
                        className="p-1 text-brand-gray/50 dark:text-gray-400 hover:text-brand-gray dark:hover:text-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
          onSave={(updatedCard) => {
            setCards(cards.map(card => 
              card.id === updatedCard.id ? updatedCard : card
            ));
            setShowCardDetailModal(false);
            setSelectedCard(null);
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


    </div>
  );
};

export default KanbanBoard;

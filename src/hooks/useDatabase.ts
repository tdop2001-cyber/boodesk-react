import { useState, useEffect, useCallback } from 'react';
import { db, User, Board, Card, Subtask, Activity, Chat, ChatMessage } from '../services/database';
import { useToast } from '../contexts/ToastContext';

export const useDatabase = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, operation: string) => {
    const message = `Erro ao ${operation}: ${error.message || 'Erro desconhecido'}`;
    setError(message);
    addToast({
      type: 'error',
      title: 'Erro de Banco de Dados',
      message
    });
  }, [addToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // HOOKS PARA USUÁRIOS
  // ============================================================================

  const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
      setLoading(true);
      try {
        const data = await db.getUsers();
        setUsers(data);
      } catch (error) {
        handleError(error, 'buscar usuários');
      } finally {
        setLoading(false);
      }
    }, [handleError]);

    const createUser = useCallback(async (userData: Partial<User>) => {
      setLoading(true);
      try {
        const newUser = await db.createUser(userData);
        if (newUser) {
          setUsers(prev => [...prev, newUser]);
          addToast({
            type: 'success',
            title: 'Usuário Criado',
            message: 'Usuário criado com sucesso!'
          });
          return newUser;
        }
      } catch (error) {
        handleError(error, 'criar usuário');
      } finally {
        setLoading(false);
      }
      return null;
    }, [handleError, addToast]);

    const updateUser = useCallback(async (id: number, updates: Partial<User>) => {
      setLoading(true);
      try {
        const success = await db.updateUser(id, updates);
        if (success) {
          setUsers(prev => prev.map(user => 
            user.id === id ? { ...user, ...updates } : user
          ));
          addToast({
            type: 'success',
            title: 'Usuário Atualizado',
            message: 'Usuário atualizado com sucesso!'
          });
          return true;
        }
      } catch (error) {
        handleError(error, 'atualizar usuário');
      } finally {
        setLoading(false);
      }
      return false;
    }, [handleError, addToast]);

    const deleteUser = useCallback(async (id: number) => {
      setLoading(true);
      try {
        const success = await db.deleteUser(id);
        if (success) {
          setUsers(prev => prev.filter(user => user.id !== id));
          addToast({
            type: 'success',
            title: 'Usuário Deletado',
            message: 'Usuário deletado com sucesso!'
          });
          return true;
        }
      } catch (error) {
        handleError(error, 'deletar usuário');
      } finally {
        setLoading(false);
      }
      return false;
    }, [handleError, addToast]);

    useEffect(() => {
      fetchUsers();
    }, [fetchUsers]);

    return {
      users,
      loading,
      fetchUsers,
      createUser,
      updateUser,
      deleteUser
    };
  };

  // ============================================================================
  // HOOKS PARA QUADROS
  // ============================================================================

  const useBoards = (userId?: number) => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBoards = useCallback(async () => {
      setLoading(true);
      try {
        const data = await db.getBoards(userId);
        setBoards(data);
      } catch (error) {
        handleError(error, 'buscar quadros');
      } finally {
        setLoading(false);
      }
    }, [userId, handleError]);

    const createBoard = useCallback(async (boardData: Partial<Board>) => {
      setLoading(true);
      try {
        const newBoard = await db.createBoard(boardData);
        if (newBoard) {
          setBoards(prev => [...prev, newBoard]);
          addToast({
            type: 'success',
            title: 'Quadro Criado',
            message: 'Quadro criado com sucesso!'
          });
          return newBoard;
        }
      } catch (error) {
        handleError(error, 'criar quadro');
      } finally {
        setLoading(false);
      }
      return null;
    }, [handleError, addToast]);

    const updateBoard = useCallback(async (id: number, updates: Partial<Board>) => {
      setLoading(true);
      try {
        const success = await db.updateBoard(id, updates);
        if (success) {
          setBoards(prev => prev.map(board => 
            board.id === id ? { ...board, ...updates } : board
          ));
          addToast({
            type: 'success',
            title: 'Quadro Atualizado',
            message: 'Quadro atualizado com sucesso!'
          });
          return true;
        }
      } catch (error) {
        handleError(error, 'atualizar quadro');
      } finally {
        setLoading(false);
      }
      return false;
    }, [handleError, addToast]);

    const deleteBoard = useCallback(async (id: number) => {
      setLoading(true);
      try {
        const success = await db.deleteBoard(id);
        if (success) {
          setBoards(prev => prev.filter(board => board.id !== id));
          addToast({
            type: 'success',
            title: 'Quadro Deletado',
            message: 'Quadro deletado com sucesso!'
          });
          return true;
        }
      } catch (error) {
        handleError(error, 'deletar quadro');
      } finally {
        setLoading(false);
      }
      return false;
    }, [handleError, addToast]);

    useEffect(() => {
      fetchBoards();
    }, [fetchBoards]);

    return {
      boards,
      loading,
      fetchBoards,
      createBoard,
      updateBoard,
      deleteBoard
    };
  };

  // ============================================================================
  // HOOKS PARA CARDS
  // ============================================================================

  const useCards = (boardId: string) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCards = useCallback(async () => {
      if (!boardId) return;
      setLoading(true);
      try {
        const data = await db.getCardsForBoard(boardId);
        setCards(data);
      } catch (error) {
        handleError(error, 'buscar cards');
      } finally {
        setLoading(false);
      }
    }, [boardId, handleError]);

    const createCard = useCallback(async (cardData: Partial<Card>) => {
      setLoading(true);
      try {
        const newCard = await db.createCard(cardData);
        if (newCard) {
          setCards(prev => [...prev, newCard]);
          addToast({
            type: 'success',
            title: 'Card Criado',
            message: 'Card criado com sucesso!'
          });
          return newCard;
        }
      } catch (error) {
        handleError(error, 'criar card');
      } finally {
        setLoading(false);
      }
      return null;
    }, [handleError, addToast]);

    const updateCard = useCallback(async (cardId: string, updates: Partial<Card>) => {
      setLoading(true);
      try {
        const success = await db.updateCard(cardId, updates);
        if (success) {
          setCards(prev => prev.map(card => 
            card.card_id === cardId ? { ...card, ...updates } : card
          ));
          addToast({
            type: 'success',
            title: 'Card Atualizado',
            message: 'Card atualizado com sucesso!'
          });
          return true;
        }
      } catch (error) {
        handleError(error, 'atualizar card');
      } finally {
        setLoading(false);
      }
      return false;
    }, [handleError, addToast]);

    const deleteCard = useCallback(async (cardId: string) => {
      setLoading(true);
      try {
        const success = await db.deleteCard(cardId);
        if (success) {
          setCards(prev => prev.filter(card => card.card_id !== cardId));
          addToast({
            type: 'success',
            title: 'Card Deletado',
            message: 'Card deletado com sucesso!'
          });
          return true;
        }
      } catch (error) {
        handleError(error, 'deletar card');
      } finally {
        setLoading(false);
      }
      return false;
    }, [handleError, addToast]);

    useEffect(() => {
      fetchCards();
    }, [fetchCards]);

    return {
      cards,
      loading,
      fetchCards,
      createCard,
      updateCard,
      deleteCard
    };
  };

  // ============================================================================
  // HOOKS PARA SUBTAREFAS
  // ============================================================================

  const useSubtasks = (cardId: string) => {
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSubtasks = useCallback(async () => {
      if (!cardId) return;
      setLoading(true);
      try {
        const data = await db.getSubtasksForCard(cardId);
        setSubtasks(data);
      } catch (error) {
        handleError(error, 'buscar subtarefas');
      } finally {
        setLoading(false);
      }
    }, [cardId, handleError]);

    const createSubtask = useCallback(async (subtaskData: Partial<Subtask>) => {
      setLoading(true);
      try {
        const newSubtask = await db.createSubtask(subtaskData);
        if (newSubtask) {
          setSubtasks(prev => [...prev, newSubtask]);
          addToast({
            type: 'success',
            title: 'Subtarefa Criada',
            message: 'Subtarefa criada com sucesso!'
          });
          return newSubtask;
        }
      } catch (error) {
        handleError(error, 'criar subtarefa');
      } finally {
        setLoading(false);
      }
      return null;
    }, [handleError, addToast]);

    const updateSubtask = useCallback(async (id: number, updates: Partial<Subtask>) => {
      setLoading(true);
      try {
        const success = await db.updateSubtask(id, updates);
        if (success) {
          setSubtasks(prev => prev.map(subtask => 
            subtask.id === id ? { ...subtask, ...updates } : subtask
          ));
          addToast({
            type: 'success',
            title: 'Subtarefa Atualizada',
            message: 'Subtarefa atualizada com sucesso!'
          });
          return true;
        }
      } catch (error) {
        handleError(error, 'atualizar subtarefa');
      } finally {
        setLoading(false);
      }
      return false;
    }, [handleError, addToast]);

    const deleteSubtask = useCallback(async (id: number) => {
      setLoading(true);
      try {
        const success = await db.deleteSubtask(id);
        if (success) {
          setSubtasks(prev => prev.filter(subtask => subtask.id !== id));
          addToast({
            type: 'success',
            title: 'Subtarefa Deletada',
            message: 'Subtarefa deletada com sucesso!'
          });
          return true;
        }
      } catch (error) {
        handleError(error, 'deletar subtarefa');
      } finally {
        setLoading(false);
      }
      return false;
    }, [handleError, addToast]);

    useEffect(() => {
      fetchSubtasks();
    }, [fetchSubtasks]);

    return {
      subtasks,
      loading,
      fetchSubtasks,
      createSubtask,
      updateSubtask,
      deleteSubtask
    };
  };

  // ============================================================================
  // HOOKS PARA ATIVIDADES
  // ============================================================================

  const useActivities = (limit: number = 50) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchActivities = useCallback(async () => {
      setLoading(true);
      try {
        const data = await db.getActivities(limit);
        setActivities(data);
      } catch (error) {
        handleError(error, 'buscar atividades');
      } finally {
        setLoading(false);
      }
    }, [limit, handleError]);

    const createActivity = useCallback(async (activityData: Partial<Activity>) => {
      setLoading(true);
      try {
        const newActivity = await db.createActivity(activityData);
        if (newActivity) {
          setActivities(prev => [newActivity, ...prev]);
          return newActivity;
        }
      } catch (error) {
        handleError(error, 'criar atividade');
      } finally {
        setLoading(false);
      }
      return null;
    }, [handleError]);

    useEffect(() => {
      fetchActivities();
    }, [fetchActivities]);

    return {
      activities,
      loading,
      fetchActivities,
      createActivity
    };
  };

  // ============================================================================
  // HOOKS PARA CHAT
  // ============================================================================

  const useChats = (userId: number) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchChats = useCallback(async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await db.getChatsByUser(userId);
        setChats(data);
      } catch (error) {
        handleError(error, 'buscar chats');
      } finally {
        setLoading(false);
      }
    }, [userId, handleError]);

    useEffect(() => {
      fetchChats();
    }, [fetchChats]);

    return {
      chats,
      loading,
      fetchChats
    };
  };

  const useChatMessages = (chatId: number, limit: number = 50) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMessages = useCallback(async () => {
      if (!chatId) return;
      setLoading(true);
      try {
        const data = await db.getChatMessages(chatId, limit);
        setMessages(data);
      } catch (error) {
        handleError(error, 'buscar mensagens');
      } finally {
        setLoading(false);
      }
    }, [chatId, limit, handleError]);

    const sendMessage = useCallback(async (messageData: Partial<ChatMessage>) => {
      setLoading(true);
      try {
        const newMessage = await db.sendMessage(messageData);
        if (newMessage) {
          setMessages(prev => [newMessage, ...prev]);
          return newMessage;
        }
      } catch (error) {
        handleError(error, 'enviar mensagem');
      } finally {
        setLoading(false);
      }
      return null;
    }, [handleError]);

    useEffect(() => {
      fetchMessages();
    }, [fetchMessages]);

    return {
      messages,
      loading,
      fetchMessages,
      sendMessage
    };
  };

  return {
    loading,
    error,
    clearError,
    useUsers,
    useBoards,
    useCards,
    useSubtasks,
    useActivities,
    useChats,
    useChatMessages
  };
};

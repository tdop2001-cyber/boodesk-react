import { createClient } from '@supabase/supabase-js';
import { Card, Activity, User, Board, Cargo } from '../types';

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces específicas do banco de dados
export interface List {
  id: number;
  list_id: string;
  board_id: string;
  name: string;
  position: number;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: number;
  card_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string | null;
  estimated_time?: string;
  actual_time?: string;
  importance: string;
  tags: string[];
  category?: string;
  user_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: number;
  name: string;
  chat_type: string;
  board_id?: number;
  card_id?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Interfaces para métricas de performance
export interface PerformanceMetrics {
  avg_completion_days: number;
  total_cards: number;
  completed_cards: number;
}

export interface CompletionRate {
  total_cards: number;
  completed_cards: number;
  completion_rate: number;
}

export interface UserProductivity {
  user_id: number;
  username: string;
  nome_completo: string;
  total_cards: number;
  completed_cards: number;
  completion_rate: number;
  avg_completion_days: number;
}

export interface ProductivityTrend {
  period_label: string;
  total_cards: number;
  completed_cards: number;
  completion_rate: number;
}

export interface ProjectPerformance {
  board_id: number | string;
  board_name: string;
  total_cards: number;
  completed_cards: number;
  completion_rate: number;
  avg_completion_days: number;
}

export interface SubtaskMetrics {
  total_subtasks: number;
  completed_subtasks: number;
  completion_rate: number;
  avg_completion_days: number;
}

export interface MonthlyReport {
  metric_name: string;
  metric_description: string;
  metric_value: number;
  metric_unit: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  message: string;
  message_type: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  is_edited: boolean;
  edited_at?: string;
  is_deleted: boolean;
}

// Classe principal para gerenciar o banco de dados
export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // ============================================================================
  // MÉTODOS DE USUÁRIOS
  // ============================================================================

  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  async getUsersByIds(userIds: number[]): Promise<User[]> {
    try {
      if (!userIds || userIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários por IDs:', error);
      return [];
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário por username:', error);
      return null;
    }
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      // Verificar se o usuário já existe
      if (userData.username) {
        const existingUser = await this.getUserByUsername(userData.username);
        if (existingUser) {
          throw new Error('Nome de usuário já existe. Escolha outro nome.');
        }
      }

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error; // Re-throw para que o erro seja capturado no componente
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<boolean> {
    try {
      // Verificar se o username está sendo alterado e se já existe
      if (updates.username) {
        const existingUser = await this.getUserByUsername(updates.username);
        if (existingUser && existingUser.id !== id) {
          throw new Error('Nome de usuário já existe. Escolha outro nome.');
        }
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error; // Re-throw para que o erro seja capturado no componente
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  }

  // ============================================================================
  // MÉTODOS DE QUADROS
  // ============================================================================

  async getBoards(userId?: number, userRole?: string): Promise<Board[]> {
    try {
      let boards: Board[] = [];

      // Se for admin, retorna todos os boards
      if (userRole === 'admin' || !userRole) {
        const { data, error } = await supabase
          .from('boards')
          .select('*')
          .order('name');
        if (error) throw error;
        boards = data || [];
      } else if (userId) {
        // Para usuários não-admin, buscar boards onde são membros de algum card
        // 1. Buscar os 'board_id's dos cards onde o usuário é membro.
        const { data: cards, error: cardsError } = await supabase
          .from('cards')
          .select('board_id')
          // Removido .contains para filtrar no lado do cliente;

        if (cardsError) throw cardsError;

        if (cards && cards.length > 0) {
          // 2. Extrair os 'board_id's únicos.
          const boardIds = Array.from(new Set(cards.map(card => card.board_id)));

          // 3. Buscar os boards correspondentes a esses 'board_id's.
          const { data: boardsData, error: boardsError } = await supabase
            .from('boards')
            .select('*')
            .in('id', boardIds)
            .order('name');

          if (boardsError) throw boardsError;
          boards = boardsData || [];
        }
      }

      // Aplicar ordem personalizada do usuário se disponível
      if (userId && boards.length > 0) {
        const userBoardOrder = await this.getUserBoardOrder(userId);
        
        if (userBoardOrder.length > 0) {
          console.log('Database: Aplicando ordem personalizada dos quadros:', userBoardOrder);
          
          // Criar um mapa para ordenação eficiente
          const boardMap = new Map(boards.map(board => [board.id, board]));
          const orderedBoards: Board[] = [];
          
          // Adicionar quadros na ordem personalizada
          for (const boardId of userBoardOrder) {
            const board = boardMap.get(boardId);
            if (board) {
              orderedBoards.push(board);
              boardMap.delete(boardId);
            }
          }
          
          // Adicionar quadros restantes (novos quadros não na ordem personalizada)
          boardMap.forEach(board => {
            orderedBoards.push(board);
          });
          
          boards = orderedBoards;
        }
      }

      return boards;
    } catch (error) {
      console.error('Erro ao buscar quadros:', error);
      return [];
    }
  }

  async getBoardById(id: number): Promise<Board | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar quadro:', error);
      return null;
    }
  }

  async createBoard(boardData: Partial<Board>): Promise<Board | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .insert([boardData])
        .select()
        .single();

      if (error) throw error;
      
      // NÃO criar listas padrão automaticamente aqui
      // As listas serão criadas pelo frontend baseadas no template selecionado
      console.log('Board criado sem listas padrão automáticas:', data.board_id);
      
      return data;
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      return null;
    }
  }

  async createDefaultLists(boardId: string): Promise<void> {
    try {
      const defaultLists = [
        { list_id: `list-${Date.now()}-1`, board_id: boardId, name: 'A Fazer', position: 1 },
        { list_id: `list-${Date.now()}-2`, board_id: boardId, name: 'Em Progresso', position: 2 },
        { list_id: `list-${Date.now()}-3`, board_id: boardId, name: 'Concluído', position: 3 }
      ];

      const { error } = await supabase
        .from('lists')
        .insert(defaultLists);

      if (error) throw error;
      console.log('Listas padrão criadas para o board:', boardId);
    } catch (error) {
      console.error('Erro ao criar listas padrão:', error);
    }
  }

  async ensureDefaultListsForBoard(boardId: string): Promise<void> {
    try {
      // Verificar se já existem listas para este board
      const { data: existingLists, error: checkError } = await supabase
        .from('lists')
        .select('id')
        .eq('board_id', boardId);

      if (checkError) throw checkError;

      // Se não há listas, criar as padrão
      if (!existingLists || existingLists.length === 0) {
        console.log('Board sem listas, criando listas padrão:', boardId);
        await this.createDefaultLists(boardId);
      }
    } catch (error) {
      console.error('Erro ao verificar/criar listas padrão:', error);
    }
  }

  // Método para criar listas padrão manualmente (para boards antigos)
  async createDefaultListsIfNeeded(boardId: string): Promise<void> {
    try {
      const { data: existingLists, error: checkError } = await supabase
        .from('lists')
        .select('id')
        .eq('board_id', boardId);

      if (checkError) throw checkError;

      if (!existingLists || existingLists.length === 0) {
        console.log('Criando listas padrão para board antigo:', boardId);
        await this.createDefaultLists(boardId);
      }
    } catch (error) {
      console.error('Erro ao criar listas padrão se necessário:', error);
    }
  }

  async updateBoard(id: number, updates: Partial<Board>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('boards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar quadro:', error);
      return false;
    }
  }

  async deleteBoard(id: number): Promise<boolean> {
    // Usar o método de exclusão em cascata por padrão
    return await this.deleteBoardCascade(id);
  }

  // Método auxiliar para limpar dependências órfãs
  async cleanupOrphanedData(boardId: string): Promise<void> {
    try {
      console.log(`Limpando dados órfãos para board ${boardId}`);
      
      // Limpar subtarefas órfãs
      const { error: orphanedSubtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('board_id', boardId);

      if (orphanedSubtasksError) {
        console.error('Erro ao limpar subtarefas órfãs:', orphanedSubtasksError);
      }

      // Limpar atividades órfãs
      const { error: orphanedActivitiesError } = await supabase
        .from('activities')
        .delete()
        .eq('board_id', boardId);

      if (orphanedActivitiesError) {
        console.error('Erro ao limpar atividades órfãs:', orphanedActivitiesError);
      }

      // Limpar chats órfãos
      const { error: orphanedChatsError } = await supabase
        .from('chats')
        .delete()
        .eq('board_id', boardId);

      if (orphanedChatsError) {
        console.error('Erro ao limpar chats órfãos:', orphanedChatsError);
      }

      console.log('Limpeza de dados órfãos concluída');
    } catch (error) {
      console.error('Erro na limpeza de dados órfãos:', error);
    }
  }

  // Método de exclusão em cascata (garantia total)
  async deleteBoardCascade(id: number): Promise<boolean> {
    try {
      console.log(`Iniciando exclusão em cascata do board ID: ${id}`);
      
      // Buscar o board
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .select('board_id')
        .eq('id', id)
        .single();

      if (boardError || !board) {
        console.error('Board não encontrado:', boardError);
        return false;
      }

      const boardId = board.board_id;
      console.log(`Board encontrado com board_id: ${boardId}`);

      // 1. Deletar todas as subtarefas do board
      console.log(`Deletando subtarefas do board ${boardId}`);
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('board_id', boardId);

      if (subtasksError) {
        console.error('Erro ao deletar subtarefas:', subtasksError);
        // Continuar mesmo com erro
      } else {
        console.log('Subtarefas deletadas com sucesso');
      }

      // 2. Deletar todas as atividades do board
      console.log(`Deletando atividades do board ${boardId}`);
      const { error: activitiesError } = await supabase
        .from('activities')
        .delete()
        .eq('board_id', boardId);

      if (activitiesError) {
        console.error('Erro ao deletar atividades:', activitiesError);
        // Continuar mesmo com erro
      } else {
        console.log('Atividades deletadas com sucesso');
      }

      // 3. Deletar todos os cards do board
      console.log(`Deletando cards do board ${boardId}`);
      const { error: cardsError } = await supabase
        .from('cards')
        .delete()
        .eq('board_id', boardId);

      if (cardsError) {
        console.error('Erro ao deletar cards:', cardsError);
        return false;
      } else {
        console.log('Cards deletados com sucesso');
      }

      // 4. Deletar todas as listas do board
      console.log(`Deletando listas do board ${boardId}`);
      const { error: listsError } = await supabase
        .from('lists')
        .delete()
        .eq('board_id', boardId);

      if (listsError) {
        console.error('Erro ao deletar listas:', listsError);
        // Continuar mesmo com erro
      } else {
        console.log('Listas deletadas com sucesso');
      }

      // 5. Deletar todos os chats do board
      console.log(`Deletando chats do board ${boardId}`);
      const { error: chatsError } = await supabase
        .from('chats')
        .delete()
        .eq('board_id', boardId);

      if (chatsError) {
        console.error('Erro ao deletar chats:', chatsError);
        // Continuar mesmo com erro
      } else {
        console.log('Chats deletados com sucesso');
      }

      // 6. Finalmente, deletar o board
      console.log(`Deletando board ${id}`);
      const { error: boardDeleteError } = await supabase
        .from('boards')
        .delete()
        .eq('id', id);

      if (boardDeleteError) {
        console.error('Erro ao deletar board:', boardDeleteError);
        return false;
      }
      
      console.log(`Board ${boardId} e todos os seus dados foram excluídos com sucesso`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar quadro em cascata:', error);
      return false;
    }
  }

  // Método alternativo para exclusão em lote (mais eficiente)
  async deleteBoardBatch(id: number): Promise<boolean> {
    try {
      console.log(`Iniciando exclusão em lote do board ID: ${id}`);
      
      // Buscar o board
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .select('board_id')
        .eq('id', id)
        .single();

      if (boardError || !board) {
        console.error('Board não encontrado:', boardError);
        return false;
      }

      const boardId = board.board_id;
      console.log(`Board encontrado com board_id: ${boardId}`);

      // Executar exclusões em paralelo para melhor performance
      const deletePromises = [
        // Deletar subtarefas
        supabase.from('subtasks').delete().eq('board_id', boardId),
        // Deletar atividades
        supabase.from('activities').delete().eq('board_id', boardId),
        // Deletar chats
        supabase.from('chats').delete().eq('board_id', boardId),
        // Deletar cards
        supabase.from('cards').delete().eq('board_id', boardId),
        // Deletar listas
        supabase.from('lists').delete().eq('board_id', boardId)
      ];

      const results = await Promise.allSettled(deletePromises);
      
      // Verificar resultados
      results.forEach((result, index) => {
        const operations = ['subtarefas', 'atividades', 'chats', 'cards', 'listas'];
        if (result.status === 'rejected') {
          console.error(`Erro ao deletar ${operations[index]}:`, result.reason);
        } else if (result.value.error) {
          console.error(`Erro ao deletar ${operations[index]}:`, result.value.error);
        } else {
          console.log(`${operations[index]} deletados com sucesso`);
        }
      });

      // Finalmente, deletar o board
      const { error: boardDeleteError } = await supabase
        .from('boards')
        .delete()
        .eq('id', id);

      if (boardDeleteError) {
        console.error('Erro ao deletar board:', boardDeleteError);
        return false;
      }
      
      console.log(`Board ${boardId} e todos os seus dados foram excluídos com sucesso`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar quadro em lote:', error);
      return false;
    }
  }

  // ============================================================================
  // MÉTODOS DE LISTAS
  // ============================================================================

  async getListsForBoard(boardId: string): Promise<List[]> {
    console.log('=== DATABASE: getListsForBoard ===');
    console.log('boardId:', boardId);
    
    try {
      // Buscar listas existentes sem criar automaticamente
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position');

      console.log('Supabase response - data:', data);
      console.log('Supabase response - error:', error);

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }
      
      console.log('Listas encontradas:', data || []);
      console.log('Quantidade de listas:', (data || []).length);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar listas:', error);
      console.log('Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        code: (error as any)?.code,
        details: (error as any)?.details
      });
      return [];
    }
  }

  async createList(listData: Partial<List>): Promise<List | null> {
    try {
      const { data, error } = await supabase
        .from('lists')
        .insert([listData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      return null;
    }
  }

  // ============================================================================
  // MÉTODOS DE CARDS
  // ============================================================================

  async getCardsForBoard(boardId: string): Promise<Card[]> {
    console.log('=== DATABASE: getCardsForBoard ===');
    console.log('boardId:', boardId);
    console.log('Tipo do boardId:', typeof boardId);
    
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('board_id', boardId)
        .eq('is_archived', false)
        .order('created_at');

      console.log('Supabase response - data:', data);
      console.log('Supabase response - error:', error);
      console.log('Quantidade de cards retornados:', (data || []).length);

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }
      
      console.log('Cards encontrados:', data || []);
      // Log específico para membros e processar dados
      if (data) {
        data.forEach((card, index) => {
          console.log(`Card ${index + 1} (${card.title}) - board_id: ${card.board_id}, members:`, card.members, 'tipo:', typeof card.members);
          
          // Processar membros se for string
          if (card.members && typeof card.members === 'string') {
            try {
              const parsedMembers = JSON.parse(card.members);
              console.log(`Card ${index + 1} - members parsed:`, parsedMembers);
              // Atualizar o card com os membros parseados
              card.members = parsedMembers;
            } catch (e) {
              console.log(`Card ${index + 1} - erro ao fazer parse dos members:`, e);
              // Se não conseguir fazer parse, definir como array vazio
              card.members = [];
            }
          } else if (!card.members) {
            // Se não há membros, definir como array vazio
            card.members = [];
          }
        });
      }
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar cards:', error);
      console.log('Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        code: (error as any)?.code,
        details: (error as any)?.details
      });
      return [];
    }
  }

  async getCardsForBoardByUser(boardId: string, userId: number, userRole: string): Promise<Card[]> {
    try {
      if (userRole === 'admin') {
        return await this.getCardsForBoard(boardId);
      }

      // Buscar todos os cards do board e filtrar no lado do cliente
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('board_id', boardId)
        .eq('is_archived', false)
        .order('created_at');

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      // Filtrar cards onde o usuário é membro
      const filteredCards = (data || []).filter(card => {
        if (!card.members || !Array.isArray(card.members)) return false;
        return card.members.includes(userId) || card.members.includes(String(userId));
      });

      return filteredCards;
    } catch (error) {
      console.error('Erro ao buscar cards por usuário:', error);
      return [];
    }
  }

  async getAllCardsForUser(userId: number, userRole: string): Promise<Card[]> {
    try {
      if (userRole === 'admin') {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('is_archived', false)
          .order('created_at');

        if (error) {
          console.error('Erro do Supabase:', error);
          throw error;
        }

        return data || [];
      }

      // Buscar todos os cards e filtrar no lado do cliente
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('is_archived', false)
        .order('created_at');

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      // Filtrar cards onde o usuário é membro
      const filteredCards = (data || []).filter(card => {
        if (!card.members || !Array.isArray(card.members)) return false;
        return card.members.includes(userId) || card.members.includes(String(userId));
      });

      return filteredCards;
    } catch (error) {
      console.error('Erro ao buscar todos os cards por usuário:', error);
      return [];
    }
  }

  async getCardById(cardId: number): Promise<Card | null> {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar card:', error);
      return null;
    }
  }

  async getCardByNumericId(id: number): Promise<Card | null> {
    try {
      console.log('Buscando card por ID numérico:', id);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar card por ID numérico:', error);
        throw error;
      }
      
      console.log('Card encontrado:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar card por ID numérico:', error);
      return null;
    }
  }

  async getCardByStringId(cardId: string): Promise<Card | null> {
    try {
      console.log('Buscando card por ID string:', cardId);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('card_id', cardId)
        .single();

      if (error) {
        console.error('Erro ao buscar card por ID string:', error);
        throw error;
      }
      
      console.log('Card encontrado:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar card por ID string:', error);
      return null;
    }
  }

  async createCard(cardData: Partial<Card>): Promise<Card | null> {
    console.log('=== DATABASE: createCard ===');
    console.log('cardData recebido:', cardData);
    console.log('cardData.members:', cardData.members);
    console.log('Tipo de cardData.members:', typeof cardData.members);
    
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([cardData])
        .select()
        .single();

      console.log('Supabase response - data:', data);
      console.log('Supabase response - error:', error);
      console.log('Card criado - members:', data?.members);

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }
      
      console.log('Card criado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao criar card:', error);
      console.log('Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        code: (error as any)?.code,
        details: (error as any)?.details
      });
      return null;
    }
  }

  async updateCard(cardId: string, updates: Partial<Card>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cards')
        .update(updates)
        .eq('card_id', cardId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
      return false;
    }
  }

  async updateCardById(id: number, updates: Partial<Card>): Promise<boolean> {
    console.log('=== DATABASE: updateCardById ===');
    console.log('id:', id);
    console.log('updates:', updates);
    console.log('updates.members:', updates.members);
    console.log('Tipo de updates.members:', typeof updates.members);
    console.log('JSON.stringify(updates):', JSON.stringify(updates));
    
    try {
      const { error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id);

      console.log('updateCardById - error:', error);
      if (error) {
        console.error('Erro detalhado do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Erro ao atualizar card por ID:', error);
      return false;
    }
  }

  async deleteCard(cardId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('card_id', cardId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar card:', error);
      return false;
    }
  }

  async deleteCardById(id: number): Promise<boolean> {
    try {
      // Primeiro, buscar o card para obter o card_id
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .select('card_id')
        .eq('id', id)
        .single();

      if (cardError) throw cardError;

      // Deletar subtarefas associadas ao card
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('card_id', card.card_id);

      if (subtasksError) {
        console.error('Erro ao deletar subtarefas:', subtasksError);
        // Continuar mesmo se houver erro ao deletar subtarefas
      }

      // Deletar o card
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar card por ID:', error);
      return false;
    }
  }

  // ============================================================================
  // MÉTODOS DE SUBTAREFAS
  // ============================================================================

  // Método de teste para verificar a tabela subtasks
  async testSubtasksTable(): Promise<{ exists: boolean; error?: string }> {
    try {
      console.log('=== TESTANDO TABELA SUBTASKS ===');
      
      // Tentar fazer um SELECT simples
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Erro ao acessar tabela subtasks:', error);
        return { exists: false, error: error.message };
      }
      
      console.log('Tabela subtasks acessível, dados:', data);
      return { exists: true };
    } catch (error) {
      console.error('Erro inesperado ao testar tabela subtasks:', error);
      return { exists: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  async getSubtasksForCard(cardId: number): Promise<Subtask[]> {
    try {
      console.log('Buscando subtarefas para card_id:', cardId);
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at');

      if (error) {
        console.error('Erro ao buscar subtarefas:', error);
        throw error;
      }
      
      console.log('Subtarefas encontradas:', data);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar subtarefas:', error);
      return [];
    }
  }

  async getSubtaskById(subtaskId: number): Promise<Subtask | null> {
    try {
      console.log('Buscando subtarefa por ID:', subtaskId);
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('id', subtaskId)
        .single();

      if (error) {
        console.error('Erro ao buscar subtarefa:', error);
        throw error;
      }
      
      console.log('Subtarefa encontrada:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar subtarefa:', error);
      return null;
    }
  }

  async getSubtasksForCardByUser(cardId: number, userId: number, userRole: string): Promise<Subtask[]> {
    try {
      if (userRole === 'admin') {
        return await this.getSubtasksForCard(cardId);
      }

      // Para usuários não-admin, verificar se são membros do card
      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .select('members')
        .eq('id', cardId)
        .single();

      if (cardError || !cardData) {
        console.error('Erro ao buscar card ou card não encontrado:', cardError);
        return [];
      }

      // Verificar se o usuário é membro do card
      const cardMembers = cardData.members || [];
      const isCardMember = Array.isArray(cardMembers) && 
        (cardMembers.includes(userId) || cardMembers.includes(String(userId)));

      if (!isCardMember) {
        console.log('Usuário não é membro do card, retornando subtarefas vazias');
        return [];
      }

      // Se é membro do card, retornar todas as subtarefas do card
      return await this.getSubtasksForCard(cardId);
    } catch (error) {
      console.error('Erro ao buscar subtarefas por usuário:', error);
      return [];
    }
  }

  // Método para obter todas as subtarefas (para dashboard)
  async getAllSubtasks(userRole: string, userId?: number): Promise<any[]> {
    try {
      if (userRole === 'admin') {
        // Admin vê todas as subtarefas
        const { data, error } = await supabase
          .from('subtasks')
          .select('*');
        
        if (error) {
          console.error('Erro ao buscar todas as subtarefas:', error);
          return [];
        }
        
        return data || [];
      } else if (userId) {
        // Usuário comum vê apenas subtarefas onde é membro
        const { data, error } = await supabase
          .from('subtasks')
          .select('*')
          .contains('members', [userId]);
        
        if (error) {
          console.error('Erro ao buscar subtarefas do usuário:', error);
          return [];
        }
        
        return data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao buscar subtarefas:', error);
      return [];
    }
  }

  // ============================================================================
  // MÉTODOS DE ATIVIDADES
  // ============================================================================

  async getActivities(limit: number = 50): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      return [];
    }
  }

  async createActivity(activityData: Partial<Activity>): Promise<Activity | null> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      return null;
    }
  }

  // ============================================================================
  // MÉTODOS DE CHAT
  // ============================================================================

  async getChatsByUser(userId: number): Promise<Chat[]> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_participants!inner(user_id)
        `)
        .eq('chat_participants.user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      return [];
    }
  }

  async getChatMessages(chatId: number, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }

  async sendMessage(messageData: Partial<ChatMessage>): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return null;
    }
  }

  // ============================================================================
  // MÉTODOS DE CONFIGURAÇÕES
  // ============================================================================

  async getUserSettings(userId: number): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_key, setting_value')
        .eq('user_id', userId);

      if (error) throw error;
      
      const settings: Record<string, any> = {};
      data?.forEach(setting => {
        try {
          settings[setting.setting_key] = JSON.parse(setting.setting_value);
        } catch {
          settings[setting.setting_key] = setting.setting_value;
        }
      });
      
      return settings;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return {};
    }
  }

  async saveUserSetting(userId: number, key: string, value: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          setting_key: key,
          setting_value: JSON.stringify(value),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      return false;
    }
  }

  async saveUserSettings(userId: number, settings: Record<string, any>): Promise<boolean> {
    try {
      console.log('Database: Salvando configurações para usuário ID:', userId);
      console.log('Database: Configurações recebidas:', settings);
      
      // Verificar se a tabela existe primeiro
      const { error: tableError } = await supabase
        .from('user_settings')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('Database: Erro ao verificar tabela user_settings:', tableError);
        console.error('Database: Código do erro:', tableError.code);
        console.error('Database: Mensagem do erro:', tableError.message);
        return false;
      }
      
      console.log('Database: Tabela user_settings existe e é acessível');
      
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        user_id: userId,
        setting_key: key,
        setting_value: JSON.stringify(value),
        updated_at: new Date().toISOString()
      }));

      console.log('Database: Dados preparados para upsert:', settingsToSave);

      // Tentar inserir um por vez para identificar qual está falhando
      for (const setting of settingsToSave) {
        console.log('Database: Tentando salvar:', setting.setting_key);
        
        // Primeiro, verificar se já existe
        const { data: existing, error: checkError } = await supabase
          .from('user_settings')
          .select('id')
          .eq('user_id', setting.user_id)
          .eq('setting_key', setting.setting_key)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error(`Database: Erro ao verificar ${setting.setting_key}:`, checkError);
          throw checkError;
        }

        let result;
        if (existing) {
          // Atualizar registro existente
          console.log(`Database: Atualizando ${setting.setting_key} existente`);
          result = await supabase
            .from('user_settings')
            .update({
              setting_value: setting.setting_value,
              updated_at: setting.updated_at
            })
            .eq('user_id', setting.user_id)
            .eq('setting_key', setting.setting_key)
            .select();
        } else {
          // Inserir novo registro
          console.log(`Database: Inserindo ${setting.setting_key} novo`);
          result = await supabase
            .from('user_settings')
            .insert([setting])
            .select();
        }

        if (result.error) {
          console.error(`Database: Erro ao salvar ${setting.setting_key}:`, result.error);
          console.error('Database: Código do erro:', result.error.code);
          console.error('Database: Mensagem do erro:', result.error.message);
          console.error('Database: Detalhes do erro:', result.error.details);
          throw result.error;
        }
        
        console.log(`Database: ${setting.setting_key} salvo com sucesso:`, result.data);
      }
      
      console.log('Database: Todas as configurações salvas com sucesso');
      return true;
    } catch (error) {
      console.error('Database: Erro ao salvar configurações:', error);
      console.error('Database: User ID:', userId);
      console.error('Database: Settings:', settings);
      return false;
    }
  }

  // ============================================================================
  // MÉTODOS DE TEMPLATES DE QUADROS
  // ============================================================================

  async getBoardTemplates(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('board_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar templates de quadros:', error);
      return [];
    }
  }

  async createBoardTemplate(templateData: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('board_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar template de quadro:', error);
      return null;
    }
  }

  async updateBoardTemplate(id: number, updates: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('board_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar template de quadro:', error);
      return false;
    }
  }

  async deleteBoardTemplate(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('board_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar template de quadro:', error);
      return false;
    }
  }

  async insertDefaultBoardTemplates(): Promise<boolean> {
    try {
      const defaultTemplates = [
        {
          name: 'Desenvolvimento',
          description: 'Template para projetos de desenvolvimento de software',
          category: 'development',
          icon: 'desenvolvimento',
          color: 'bg-blue-500',
          columns: ['Backlog', 'Em Desenvolvimento', 'Em Teste', 'Pronto para Deploy', 'Deployado'],
          is_default: true
        },
        {
          name: 'Design',
          description: 'Template para projetos de design e UX/UI',
          category: 'design',
          icon: 'design',
          color: 'bg-purple-500',
          columns: ['Briefing', 'Em Design', 'Em Revisão', 'Aprovado', 'Finalizado'],
          is_default: true
        },
        {
          name: 'Manutenção',
          description: 'Template para tarefas de manutenção e suporte',
          category: 'maintenance',
          icon: 'manutencao',
          color: 'bg-orange-500',
          columns: ['Reportado', 'Em Análise', 'Em Correção', 'Em Teste', 'Resolvido'],
          is_default: true
        },
        {
          name: 'Marketing',
          description: 'Template para campanhas e estratégias de marketing',
          category: 'marketing',
          icon: 'marketing',
          color: 'bg-green-500',
          columns: ['Planejamento', 'Em Execução', 'Em Revisão', 'Aprovado', 'Finalizado'],
          is_default: true
        },
        {
          name: 'Produto',
          description: 'Template para desenvolvimento de produtos',
          category: 'product',
          icon: 'produto',
          color: 'bg-indigo-500',
          columns: ['Ideação', 'Validação', 'Desenvolvimento', 'Teste', 'Lançamento'],
          is_default: true
        },
        {
          name: 'Projeto',
          description: 'Template para gerenciamento de projetos gerais',
          category: 'project',
          icon: 'projeto',
          color: 'bg-red-500',
          columns: ['Início', 'Em Andamento', 'Em Revisão', 'Finalização', 'Concluído'],
          is_default: true
        },
        {
          name: 'RH',
          description: 'Template para processos de recursos humanos',
          category: 'hr',
          icon: 'rh',
          color: 'bg-pink-500',
          columns: ['Candidatura', 'Em Análise', 'Entrevista', 'Avaliação', 'Contratado'],
          is_default: true
        },
        {
          name: 'Suporte',
          description: 'Template para tickets de suporte técnico',
          category: 'support',
          icon: 'suporte',
          color: 'bg-yellow-500',
          columns: ['Aberto', 'Em Análise', 'Em Andamento', 'Aguardando Cliente', 'Fechado'],
          is_default: true
        },
        {
          name: 'Tarefas',
          description: 'Template simples para gerenciamento de tarefas',
          category: 'tasks',
          icon: 'tarefas',
          color: 'bg-gray-500',
          columns: ['A Fazer', 'Em Progresso', 'Concluído'],
          is_default: true
        },
        {
          name: 'Vendas',
          description: 'Template para pipeline de vendas',
          category: 'sales',
          icon: 'vendas',
          color: 'bg-teal-500',
          columns: ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado'],
          is_default: true
        }
      ];

      // Verificar se já existem templates padrão
      const existingTemplates = await this.getBoardTemplates();
      if (existingTemplates.length > 0) {
        console.log('Templates já existem, pulando inserção...');
        return true;
      }

      // Inserir templates padrão
      for (const template of defaultTemplates) {
        await this.createBoardTemplate(template);
      }

      console.log('Templates padrão inseridos com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao inserir templates padrão:', error);
      return false;
    }
  }

  // ============================================================================
  // MÉTODOS DE CARGOS
  // ============================================================================

  async getCargos(): Promise<Cargo[]> {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      return [];
    }
  }

  async getCargoById(id: number): Promise<Cargo | null> {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar cargo:', error);
      return null;
    }
  }

  async createCargo(cargoData: Partial<Cargo>): Promise<Cargo | null> {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .insert([{
          nome: cargoData.nome,
          descricao: cargoData.descricao || '',
          is_active: cargoData.is_active !== undefined ? cargoData.is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      return null;
    }
  }

  async updateCargo(id: number, updates: Partial<Cargo>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cargos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      return false;
    }
  }

  async deleteCargo(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cargos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar cargo:', error);
      return false;
    }
  }

  async ensureDefaultCargos(): Promise<boolean> {
    try {
      const defaultCargos = [
        { nome: 'Administrador', descricao: 'Administrador do sistema' },
        { nome: 'Gerente de Projetos', descricao: 'Gerencia projetos e equipes' },
        { nome: 'Desenvolvedor', descricao: 'Desenvolve funcionalidades' },
        { nome: 'Designer', descricao: 'Cria interfaces e experiências' },
        { nome: 'Analista', descricao: 'Analisa requisitos e processos' },
        { nome: 'Usuário', descricao: 'Usuário padrão do sistema' }
      ];

      for (const cargo of defaultCargos) {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('cargos')
          .select('id')
          .eq('nome', cargo.nome)
          .single();

        if (!existing) {
          await this.createCargo(cargo);
        }
      }

      console.log('Cargos padrão garantidos no banco');
      return true;
    } catch (error) {
      console.error('Erro ao garantir cargos padrão:', error);
      return false;
    }
  }

  // ==================== FUNÇÕES DE SUBTAREFAS ====================

  async getSubtasks(cardId: number, userId?: number): Promise<any[]> {
    try {
      console.log('Database: Buscando subtarefas para card ID:', cardId);
      
      const { data, error } = await supabase
        .from('subtasks')
        .select(`
          *,
          created_by_user:users!subtasks_created_by_fkey(id, username)
        `)
        .eq('card_id', cardId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Database: Erro ao buscar subtarefas:', error);
        throw error;
      }

      let subtasks = data || [];

      // Se userId fornecido, filtrar apenas subtarefas onde o usuário é membro
      if (userId) {
        subtasks = subtasks.filter(subtask => {
          if (!subtask.members) return false;
          // Verificar se members é string ou array
          let members = subtask.members;
          if (typeof members === 'string') {
            try {
              members = JSON.parse(members);
            } catch (e) {
              return false;
            }
          }
          return Array.isArray(members) && members.includes(userId.toString());
        });
      }

      console.log('Database: Subtarefas encontradas:', subtasks?.length || 0);
      return subtasks;
    } catch (error) {
      console.error('Database: Erro ao buscar subtarefas:', error);
      throw error;
    }
  }

  async createSubtask(subtaskData: {
    card_id: number;
    title: string;
    description?: string;
    priority?: string;
    due_date?: string | null;
    members?: string[];
    created_by: number;
  }): Promise<any> {
    try {
      console.log('Database: Criando subtarefa:', subtaskData);

      // Garantir que o criador seja membro da subtarefa
      const members = subtaskData.members || [];
      if (!members.includes(subtaskData.created_by.toString())) {
        members.push(subtaskData.created_by.toString());
      }

      const insertData = {
        card_id: parseInt(subtaskData.card_id.toString()),
        title: subtaskData.title,
        description: subtaskData.description || '',
        priority: subtaskData.priority || 'medium',
        due_date: subtaskData.due_date || null,
        members: members,
        created_by: subtaskData.created_by,
        status: 'todo',
        position: 0
      };
      
      console.log('Database: Dados para inserção:', insertData);
      console.log('Database: Tipo do card_id:', typeof insertData.card_id);
      console.log('Database: Valor do card_id:', insertData.card_id);

      // Verificar se o card existe
      const { data: cardCheck, error: cardError } = await supabase
        .from('cards')
        .select('id')
        .eq('id', insertData.card_id)
        .single();
      
      if (cardError || !cardCheck) {
        console.error('Database: Card não encontrado com ID:', insertData.card_id);
        throw new Error(`Card com ID ${insertData.card_id} não encontrado`);
      }
      
      console.log('Database: Card encontrado:', cardCheck);

      const { data, error } = await supabase
        .from('subtasks')
        .insert([insertData])
        .select('*')
        .single();

      if (error) {
        console.error('Database: Erro ao criar subtarefa:', error);
        throw error;
      }

      console.log('Database: Subtarefa criada com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao criar subtarefa:', error);
      throw error;
    }
  }

  async updateSubtask(subtaskId: number, updates: {
    title?: string;
    description?: string;
    priority?: string;
    due_date?: string | null;
    status?: string;
    members?: string[];
    position?: number;
    completed?: boolean;
    completed_at?: string | null;
    importance?: string;
    category?: string;
    estimated_time?: string;
    tags?: string[];
  }): Promise<any> {
    try {
      console.log('Database: Atualizando subtarefa ID:', subtaskId, 'Updates:', updates);

      // Mapear updates para as colunas corretas da tabela
      const mappedUpdates: any = {
        updated_at: new Date().toISOString()
      };

      // Mapear campos que existem na tabela
      if (updates.title !== undefined) mappedUpdates.title = updates.title;
      if (updates.description !== undefined) mappedUpdates.description = updates.description;
      if (updates.priority !== undefined) mappedUpdates.priority = updates.priority;
      if (updates.due_date !== undefined) mappedUpdates.due_date = updates.due_date;
      if (updates.status !== undefined) mappedUpdates.status = updates.status;
      if (updates.position !== undefined) mappedUpdates.position = updates.position;
      if (updates.importance !== undefined) mappedUpdates.importance = updates.importance;
      if (updates.category !== undefined) mappedUpdates.category = updates.category;
      if (updates.estimated_time !== undefined) mappedUpdates.estimated_time = updates.estimated_time;
      if (updates.tags !== undefined) mappedUpdates.tags = updates.tags;
      
      // Se completed é fornecido, mapear para status
      if (updates.completed !== undefined) {
        if (updates.completed) {
          mappedUpdates.status = 'completed';
        } else if (updates.status === undefined) {
          mappedUpdates.status = 'todo';
        }
      }

      const { data, error } = await supabase
        .from('subtasks')
        .update(mappedUpdates)
        .eq('id', subtaskId)
        .select(`
          *,
          created_by_user:users!subtasks_created_by_fkey(id, username)
        `)
        .single();

      if (error) {
        console.error('Database: Erro ao atualizar subtarefa:', error);
        throw error;
      }

      console.log('Database: Subtarefa atualizada com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao atualizar subtarefa:', error);
      throw error;
    }
  }

  async deleteSubtask(subtaskId: number): Promise<boolean> {
    try {
      console.log('Database: Deletando subtarefa ID:', subtaskId);

      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) {
        console.error('Database: Erro ao deletar subtarefa:', error);
        throw error;
      }

      console.log('Database: Subtarefa deletada com sucesso');
      return true;
    } catch (error) {
      console.error('Database: Erro ao deletar subtarefa:', error);
      throw error;
    }
  }

  async updateSubtaskStatus(subtaskId: number, status: string): Promise<any> {
    try {
      console.log('Database: Atualizando status da subtarefa ID:', subtaskId, 'Status:', status);

      const { data, error } = await supabase
        .from('subtasks')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', subtaskId)
        .select(`
          *,
          created_by_user:users!subtasks_created_by_fkey(id, username)
        `)
        .single();

      if (error) {
        console.error('Database: Erro ao atualizar status da subtarefa:', error);
        throw error;
      }

      console.log('Database: Status da subtarefa atualizado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao atualizar status da subtarefa:', error);
      throw error;
    }
  }

  async reorderSubtasks(cardId: number, subtaskIds: number[]): Promise<boolean> {
    try {
      console.log('Database: Reordenando subtarefas do card ID:', cardId, 'Ordem:', subtaskIds);

      // Atualizar posição de cada subtarefa
      for (let i = 0; i < subtaskIds.length; i++) {
        const { error } = await supabase
          .from('subtasks')
          .update({ position: i })
          .eq('id', subtaskIds[i])
          .eq('card_id', cardId);

        if (error) {
          console.error('Database: Erro ao reordenar subtarefa ID:', subtaskIds[i], error);
          throw error;
        }
      }

      console.log('Database: Subtarefas reordenadas com sucesso');
      return true;
    } catch (error) {
      console.error('Database: Erro ao reordenar subtarefas:', error);
      throw error;
    }
  }

  // ===== PREFERÊNCIAS DO USUÁRIO =====
  
  /**
   * Salva a ordem dos quadros para um usuário específico
   */
  async saveUserBoardOrder(userId: number, boardOrder: number[]): Promise<boolean> {
    try {
      console.log('Database: Salvando ordem dos quadros para usuário:', { userId, boardOrder });
      
      // Buscar preferências existentes
      const existingPrefs = await this.getUserPreferences(userId.toString());
      
      // Atualizar apenas a ordem dos quadros
      const updatedPrefs = {
        ...existingPrefs,
        boardOrder: boardOrder
      };
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId.toString(),
          preferences: updatedPrefs,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Database: Erro ao salvar ordem dos quadros:', error);
        throw error;
      }

      console.log('Database: Ordem dos quadros salva com sucesso');
      return true;
    } catch (error) {
      console.error('Database: Erro ao salvar ordem dos quadros:', error);
      return false;
    }
  }

  /**
   * Carrega a ordem dos quadros para um usuário específico
   */
  async getUserBoardOrder(userId: number): Promise<number[]> {
    try {
      console.log('Database: Carregando ordem dos quadros para usuário:', userId);
      
      // Buscar preferências do usuário
      const preferences = await this.getUserPreferences(userId.toString());
      
      const boardOrder = preferences?.boardOrder || [];
      console.log('Database: Ordem dos quadros carregada:', boardOrder);
      return boardOrder;
    } catch (error) {
      console.error('Database: Erro ao carregar ordem dos quadros:', error);
      return [];
    }
  }

  /**
   * Salva as preferências do usuário (filtros, modo de visualização, etc.)
   */
  async saveUserPreferences(userId: string, preferences: any): Promise<boolean> {
    try {
      console.log('Database: Salvando preferências do usuário:', { userId, preferences });
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferences: preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Database: Erro ao salvar preferências:', error);
        throw error;
      }

      console.log('Database: Preferências salvas com sucesso');
      return true;
    } catch (error) {
      console.error('Database: Erro ao salvar preferências do usuário:', error);
      throw error;
    }
  }

  /**
   * Carrega as preferências do usuário
   */
  async getUserPreferences(userId: string): Promise<any> {
    try {
      console.log('Database: Carregando preferências do usuário:', userId);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Database: Erro ao carregar preferências:', error);
        throw error;
      }

      const preferences = data?.preferences || {};
      console.log('Database: Preferências carregadas:', preferences);
      return preferences;
    } catch (error) {
      console.error('Database: Erro ao carregar preferências do usuário:', error);
      return {};
    }
  }

  /**
   * Atualiza uma preferência específica do usuário
   */
  async updateUserPreference(userId: string, key: string, value: any): Promise<boolean> {
    try {
      console.log('Database: Atualizando preferência específica:', { userId, key, value });
      
      // Primeiro, carrega as preferências atuais
      const currentPreferences = await this.getUserPreferences(userId);
      
      // Atualiza a preferência específica
      const updatedPreferences = {
        ...currentPreferences,
        [key]: value
      };
      
      // Salva as preferências atualizadas
      return await this.saveUserPreferences(userId, updatedPreferences);
    } catch (error) {
      console.error('Database: Erro ao atualizar preferência específica:', error);
      throw error;
    }
  }

  /**
   * Remove uma preferência específica do usuário
   */
  async removeUserPreference(userId: string, key: string): Promise<boolean> {
    try {
      console.log('Database: Removendo preferência específica:', { userId, key });
      
      // Primeiro, carrega as preferências atuais
      const currentPreferences = await this.getUserPreferences(userId);
      
      // Remove a preferência específica
      const { [key]: removed, ...updatedPreferences } = currentPreferences;
      
      // Salva as preferências atualizadas
      return await this.saveUserPreferences(userId, updatedPreferences);
    } catch (error) {
      console.error('Database: Erro ao remover preferência específica:', error);
      throw error;
    }
  }

  // ===== SISTEMA DE ARQUIVAMENTO =====

  /**
   * Arquivar um card individualmente
   */
  async archiveCard(cardId: number, folderId: number, userId: number, reason: string = 'Arquivamento manual'): Promise<boolean> {
    try {
      console.log('Database: Arquivando card:', cardId, 'para pasta:', folderId);
      
      const { error } = await supabase
        .from('cards')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: userId,
          archive_folder_id: folderId
        })
        .eq('id', cardId);

      if (error) {
        console.error('Database: Erro ao arquivar card:', error);
        throw error;
      }

      // Inserir no histórico de arquivo
      await supabase
        .from('archived_cards')
        .insert({
          original_card_id: cardId,
          archive_folder_id: folderId,
          archived_by: userId,
          archive_reason: reason,
          auto_archived: false
        });

      // Inserir no histórico
      await supabase
        .from('archive_history')
        .insert({
          card_id: cardId,
          action: 'archived',
          performed_by: userId,
          archive_folder_id: folderId,
          details: {
            reason: reason,
            manual_archive: true
          }
        });

      console.log('Database: Card arquivado com sucesso');
      return true;
    } catch (error) {
      console.error('Database: Erro ao arquivar card:', error);
      throw error;
    }
  }

  /**
   * Arquivar múltiplos cards em lote
   */
  async archiveCardsBulk(cardIds: number[], folderId: number, userId: number, reason: string = 'Arquivamento em lote'): Promise<boolean> {
    try {
      console.log('Database: Arquivando cards em lote:', cardIds);
      
      const { error } = await supabase
        .from('cards')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: userId,
          archive_folder_id: folderId
        })
        .in('id', cardIds);

      if (error) {
        console.error('Database: Erro ao arquivar cards em lote:', error);
        throw error;
      }

      // Inserir no histórico de arquivo para cada card
      const archivedCardsData = cardIds.map(cardId => ({
        original_card_id: cardId,
        archive_folder_id: folderId,
        archived_by: userId,
        archive_reason: reason,
        auto_archived: false
      }));

      await supabase
        .from('archived_cards')
        .insert(archivedCardsData);

      // Inserir no histórico para cada card
      const historyData = cardIds.map(cardId => ({
        card_id: cardId,
        action: 'archived',
        performed_by: userId,
        archive_folder_id: folderId,
        details: {
          reason: reason,
          bulk_archive: true,
          total_cards: cardIds.length
        }
      }));

      await supabase
        .from('archive_history')
        .insert(historyData);

      console.log('Database: Cards arquivados em lote com sucesso');
      return true;
    } catch (error) {
      console.error('Database: Erro ao arquivar cards em lote:', error);
      throw error;
    }
  }

  /**
   * Restaurar um card do arquivo
   */
  async restoreArchivedCard(cardId: number, userId: number): Promise<boolean> {
    try {
      console.log('Database: Restaurando card do arquivo:', cardId);
      
      const { error } = await supabase
        .from('cards')
        .update({
          is_archived: false,
          archived_at: null,
          archived_by: null,
          archive_folder_id: null
        })
        .eq('id', cardId)
        .eq('is_archived', true);

      if (error) {
        console.error('Database: Erro ao restaurar card:', error);
        throw error;
      }

      // Inserir no histórico
      await supabase
        .from('archive_history')
        .insert({
          card_id: cardId,
          action: 'restored',
          performed_by: userId,
          details: {
            restored_at: new Date().toISOString()
          }
        });

      console.log('Database: Card restaurado com sucesso');
      return true;
    } catch (error) {
      console.error('Database: Erro ao restaurar card:', error);
      throw error;
    }
  }

  /**
   * Buscar cards arquivados
   */
  async getArchivedCards(folderId?: number, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      console.log('Database: Buscando cards arquivados');
      
      // Buscar diretamente da tabela cards com JOINs
      let query = supabase
        .from('cards')
        .select(`
          id,
          title,
          description,
          status,
          importance,
          created_at,
          completed_at,
          archived_at,
          is_archived,
          list_name,
          board_id,
          archive_folder_id,
          archived_by
        `)
        .eq('is_archived', true)
        .order('archived_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (folderId) {
        query = query.eq('archive_folder_id', folderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database: Erro ao buscar cards arquivados:', error);
        throw error;
      }

      // Buscar informações das pastas e usuários separadamente
      const enrichedData = await Promise.all(
        (data || []).map(async (card) => {
          let folderInfo = null;
          let userInfo = null;
          let boardInfo = null;

          // Buscar informações da pasta
          if (card.archive_folder_id) {
            const { data: folder } = await supabase
              .from('archive_folders')
              .select('name, color, icon')
              .eq('id', card.archive_folder_id)
              .single();
            folderInfo = folder;
          }

          // Buscar informações do usuário
          if (card.archived_by) {
            const { data: user } = await supabase
              .from('users')
              .select('username, nome_completo')
              .eq('id', card.archived_by)
              .single();
            userInfo = user;
          }

          // Buscar informações do board
          if (card.board_id) {
            const { data: board } = await supabase
              .from('boards')
              .select('name')
              .eq('board_id', card.board_id)
              .single();
            boardInfo = board;
          }

          return {
            ...card,
            priority: card.importance || 'medium',
            column_name: card.list_name || 'Sem Coluna',
            archive_folder_name: folderInfo?.name || 'Sem Pasta',
            archive_folder_color: folderInfo?.color || '#6B7280',
            archive_folder_icon: folderInfo?.icon || 'folder',
            archived_by_username: userInfo?.username || 'Sistema',
            archived_by_name: userInfo?.nome_completo || userInfo?.username || 'Sistema',
            board_name: boardInfo?.name || 'Board não encontrado'
          };
        })
      );

      console.log('Database: Cards arquivados encontrados:', enrichedData.length);
      return enrichedData;
    } catch (error) {
      console.error('Database: Erro ao buscar cards arquivados:', error);
      return [];
    }
  }

  /**
   * Buscar pastas de arquivo
   */
  async getArchiveFolders(): Promise<any[]> {
    try {
      console.log('Database: Buscando pastas de arquivo');
      
      const { data, error } = await supabase
        .from('archive_folders')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Database: Erro ao buscar pastas de arquivo:', error);
        throw error;
      }

      console.log('Database: Pastas de arquivo encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Database: Erro ao buscar pastas de arquivo:', error);
      return [];
    }
  }

  /**
   * Criar nova pasta de arquivo
   */
  async createArchiveFolder(name: string, description: string, color: string, icon: string, userId: number): Promise<any> {
    try {
      console.log('Database: Criando pasta de arquivo:', name);
      
      const { data, error } = await supabase
        .from('archive_folders')
        .insert({
          name,
          description,
          color,
          icon,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Database: Erro ao criar pasta de arquivo:', error);
        throw error;
      }

      console.log('Database: Pasta de arquivo criada com sucesso');
      return data;
    } catch (error) {
      console.error('Database: Erro ao criar pasta de arquivo:', error);
      throw error;
    }
  }

  /**
   * Executar arquivamento automático
   */
  async executeAutoArchive(): Promise<number> {
    try {
      console.log('Database: Executando arquivamento automático');
      
      const { data, error } = await supabase
        .rpc('auto_archive_completed_cards');

      if (error) {
        console.error('Database: Erro ao executar arquivamento automático:', error);
        throw error;
      }

      console.log('Database: Arquivamento automático executado, cards arquivados:', data);
      return data || 0;
    } catch (error) {
      console.error('Database: Erro ao executar arquivamento automático:', error);
      throw error;
    }
  }

  /**
   * Configurar arquivamento automático
   */
  async setAutoArchiveSettings(boardId: number | null, enabled: boolean, archiveAfterDays: number, defaultFolderId: number, userId: number): Promise<boolean> {
    try {
      console.log('Database: Configurando arquivamento automático');
      
      const { error } = await supabase
        .from('archive_settings')
        .upsert({
          board_id: boardId,
          auto_archive_enabled: enabled,
          archive_after_days: archiveAfterDays,
          default_folder_id: defaultFolderId,
          created_by: userId,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Database: Erro ao configurar arquivamento automático:', error);
        throw error;
      }

      console.log('Database: Configuração de arquivamento automático salva');
      return true;
    } catch (error) {
      console.error('Database: Erro ao configurar arquivamento automático:', error);
      throw error;
    }
  }

  /**
   * Buscar configurações de arquivamento automático
   */
  async getAutoArchiveSettings(boardId?: number): Promise<any> {
    try {
      console.log('Database: Buscando configurações de arquivamento automático');
      
      let query = supabase
        .from('archive_settings')
        .select('*');

      if (boardId) {
        query = query.eq('board_id', boardId);
      } else {
        query = query.is('board_id', null); // Configuração global
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Database: Erro ao buscar configurações de arquivamento:', error);
        throw error;
      }

      console.log('Database: Configurações de arquivamento encontradas:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao buscar configurações de arquivamento:', error);
      return null;
    }
  }

  /**
   * Atualiza o status do card baseado no status das subtarefas
   */
  async updateCardStatusBasedOnSubtasks(cardId: string): Promise<boolean> {
    try {
      console.log('Database: Atualizando status do card baseado nas subtarefas:', cardId);
      
      // Busca todas as subtarefas do card
      const subtasks = await this.getSubtasksForCard(parseInt(cardId));
      
      if (!subtasks || subtasks.length === 0) {
        console.log('Database: Nenhuma subtarefa encontrada, mantendo status atual');
        return true;
      }

      // Calcula o novo status baseado nas subtarefas
      let newStatus = 'pending'; // padrão
      
      const totalSubtasks = subtasks.length;
      const completedSubtasks = subtasks.filter(sub => sub.status === 'completed').length;
      const inProgressSubtasks = subtasks.filter(sub => sub.status === 'in_progress').length;
      const pendingSubtasks = subtasks.filter(sub => sub.status === 'pending' || sub.status === 'todo').length;

      console.log('Database: Status das subtarefas:', {
        total: totalSubtasks,
        completed: completedSubtasks,
        inProgress: inProgressSubtasks,
        pending: pendingSubtasks
      });

      // Lógica de determinação do status
      if (inProgressSubtasks > 0) {
        // Se há subtarefas em progresso, card fica em progresso
        newStatus = 'in_progress';
      } else if (completedSubtasks === totalSubtasks) {
        // Se todas as subtarefas estão concluídas, card fica concluído
        newStatus = 'completed';
      } else if (pendingSubtasks === totalSubtasks) {
        // Se todas as subtarefas estão pendentes, card fica pendente
        newStatus = 'pending';
      } else {
        // Caso misto (algumas concluídas, outras pendentes), fica em progresso
        newStatus = 'in_progress';
      }

      console.log('Database: Novo status calculado:', newStatus);

      // Atualiza o status do card
      const { error } = await supabase
        .from('cards')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId);

      if (error) {
        console.error('Database: Erro ao atualizar status do card:', error);
        throw error;
      }

      console.log('Database: Status do card atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Database: Erro ao atualizar status do card baseado nas subtarefas:', error);
      throw error;
    }
  }

  // ===== FUNÇÕES DE TAGS =====

  // Buscar tags disponíveis
  async getAvailableTags(userId?: number) {
    try {
      console.log('Database: Buscando tags disponíveis...');
      
      const { data, error } = await supabase
        .rpc('get_available_tags', { user_id_param: userId || null });

      if (error) {
        console.error('Database: Erro ao buscar tags disponíveis:', error);
        throw error;
      }

      console.log('Database: Tags disponíveis encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Database: Erro ao buscar tags disponíveis:', error);
      throw error;
    }
  }

  // Buscar categorias disponíveis
  async getAvailableCategories() {
    try {
      console.log('Database: Buscando categorias disponíveis...');
      
      const { data, error } = await supabase
        .rpc('get_available_categories');

      if (error) {
        console.error('Database: Erro ao buscar categorias disponíveis:', error);
        throw error;
      }

      console.log('Database: Categorias disponíveis encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Database: Erro ao buscar categorias disponíveis:', error);
      throw error;
    }
  }

  // Adicionar tag a um card
  async addTagToCard(cardId: string, tagName: string) {
    try {
      console.log('Database: Adicionando tag ao card:', { cardId, tagName });
      
      const { data, error } = await supabase
        .rpc('add_tag_to_card', { 
          card_id_param: cardId, 
          tag_name_param: tagName 
        });

      if (error) {
        console.error('Database: Erro ao adicionar tag ao card:', error);
        throw error;
      }

      console.log('Database: Tag adicionada ao card:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao adicionar tag ao card:', error);
      throw error;
    }
  }

  // Remover tag de um card
  async removeTagFromCard(cardId: string, tagName: string) {
    try {
      console.log('Database: Removendo tag do card:', { cardId, tagName });
      
      const { data, error } = await supabase
        .rpc('remove_tag_from_card', { 
          card_id_param: cardId, 
          tag_name_param: tagName 
        });

      if (error) {
        console.error('Database: Erro ao remover tag do card:', error);
        throw error;
      }

      console.log('Database: Tag removida do card:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao remover tag do card:', error);
      throw error;
    }
  }

  // Adicionar tag a uma subtask
  async addTagToSubtask(subtaskId: number, tagName: string) {
    try {
      console.log('Database: Adicionando tag à subtask:', { subtaskId, tagName });
      
      const { data, error } = await supabase
        .rpc('add_tag_to_subtask', { 
          subtask_id_param: subtaskId, 
          tag_name_param: tagName 
        });

      if (error) {
        console.error('Database: Erro ao adicionar tag à subtask:', error);
        throw error;
      }

      console.log('Database: Tag adicionada à subtask:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao adicionar tag à subtask:', error);
      throw error;
    }
  }

  // Remover tag de uma subtask
  async removeTagFromSubtask(subtaskId: number, tagName: string) {
    try {
      console.log('Database: Removendo tag da subtask:', { subtaskId, tagName });
      
      const { data, error } = await supabase
        .rpc('remove_tag_from_subtask', { 
          subtask_id_param: subtaskId, 
          tag_name_param: tagName 
        });

      if (error) {
        console.error('Database: Erro ao remover tag da subtask:', error);
        throw error;
      }

      console.log('Database: Tag removida da subtask:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao remover tag da subtask:', error);
      throw error;
    }
  }

  // Buscar cards por tag
  async getCardsByTag(tagName: string, userId?: number) {
    try {
      console.log('Database: Buscando cards por tag:', { tagName, userId });
      
      const { data, error } = await supabase
        .rpc('get_cards_by_tag', { 
          tag_name_param: tagName, 
          user_id_param: userId || null 
        });

      if (error) {
        console.error('Database: Erro ao buscar cards por tag:', error);
        throw error;
      }

      console.log('Database: Cards encontrados por tag:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Database: Erro ao buscar cards por tag:', error);
      throw error;
    }
  }

  // Buscar subtasks por tag
  async getSubtasksByTag(tagName: string, userId?: number) {
    try {
      console.log('Database: Buscando subtasks por tag:', { tagName, userId });
      
      const { data, error } = await supabase
        .rpc('get_subtasks_by_tag', { 
          tag_name_param: tagName, 
          user_id_param: userId || null 
        });

      if (error) {
        console.error('Database: Erro ao buscar subtasks por tag:', error);
        throw error;
      }

      console.log('Database: Subtasks encontradas por tag:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Database: Erro ao buscar subtasks por tag:', error);
      throw error;
    }
  }

  // Criar nova tag personalizada
  async createCustomTag(tagData: {
    name: string;
    color?: string;
    type?: string;
    description?: string;
    createdBy: number;
  }) {
    try {
      console.log('Database: Criando tag personalizada:', tagData);
      
      const { data, error } = await supabase
        .from('custom_tags')
        .insert([{
          name: tagData.name,
          color: tagData.color || '#6B7280',
          type: tagData.type || 'category',
          description: tagData.description,
          created_by: tagData.createdBy
        }])
        .select()
        .single();

      if (error) {
        console.error('Database: Erro ao criar tag personalizada:', error);
        throw error;
      }

      console.log('Database: Tag personalizada criada:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao criar tag personalizada:', error);
      throw error;
    }
  }

  // Atualizar tag personalizada
  async updateCustomTag(tagId: number, tagData: {
    name?: string;
    color?: string;
    type?: string;
    description?: string;
  }) {
    try {
      console.log('Database: Atualizando tag personalizada:', { tagId, tagData });
      
      const { data, error } = await supabase
        .from('custom_tags')
        .update(tagData)
        .eq('id', tagId)
        .select()
        .single();

      if (error) {
        console.error('Database: Erro ao atualizar tag personalizada:', error);
        throw error;
      }

      console.log('Database: Tag personalizada atualizada:', data);
      return data;
    } catch (error) {
      console.error('Database: Erro ao atualizar tag personalizada:', error);
      throw error;
    }
  }

  // Deletar tag personalizada
  async deleteCustomTag(tagId: number) {
    try {
      console.log('Database: Deletando tag personalizada:', tagId);
      
      const { error } = await supabase
        .from('custom_tags')
        .delete()
        .eq('id', tagId);

      if (error) {
        console.error('Database: Erro ao deletar tag personalizada:', error);
        throw error;
      }

      console.log('Database: Tag personalizada deletada');
      return true;
    } catch (error) {
      console.error('Database: Erro ao deletar tag personalizada:', error);
      throw error;
    }
  }

  // ===== MÉTRICAS DE PERFORMANCE =====

  // Obter tempo médio de conclusão
  async getAverageCompletionTime(startDate?: string, endDate?: string, boardId?: number): Promise<PerformanceMetrics> {
    try {
      console.log('Database: Buscando tempo médio de conclusão:', { startDate, endDate, boardId });
      
      const { data, error } = await supabase.rpc('get_average_completion_time', {
        p_start_date: startDate || null,
        p_end_date: endDate || null,
        p_board_id: boardId || null
      });

      if (error) {
        console.error('Database: Erro ao buscar tempo médio de conclusão:', error);
        throw error;
      }

      console.log('Database: Tempo médio de conclusão encontrado:', data);
      return data[0] || { avg_completion_days: 0, total_cards: 0, completed_cards: 0 };
    } catch (error) {
      console.error('Database: Erro ao buscar tempo médio de conclusão:', error);
      throw error;
    }
  }

  // Obter taxa de conclusão
  async getCompletionRate(startDate?: string, endDate?: string, boardId?: number): Promise<CompletionRate> {
    try {
      console.log('Database: Buscando taxa de conclusão:', { startDate, endDate, boardId });
      
      const { data, error } = await supabase.rpc('get_completion_rate', {
        p_start_date: startDate || null,
        p_end_date: endDate || null,
        p_board_id: boardId || null
      });

      if (error) {
        console.error('Database: Erro ao buscar taxa de conclusão:', error);
        throw error;
      }

      console.log('Database: Taxa de conclusão encontrada:', data);
      return data[0] || { total_cards: 0, completed_cards: 0, completion_rate: 0 };
    } catch (error) {
      console.error('Database: Erro ao buscar taxa de conclusão:', error);
      throw error;
    }
  }

  // Obter produtividade por usuário
  async getUserProductivity(startDate?: string, endDate?: string, boardId?: number): Promise<UserProductivity[]> {
    try {
      console.log('Database: Buscando produtividade por usuário:', { startDate, endDate, boardId });
      
      const { data, error } = await supabase.rpc('get_user_productivity', {
        p_start_date: startDate || null,
        p_end_date: endDate || null,
        p_board_id: boardId || null
      });

      if (error) {
        console.error('Database: Erro ao buscar produtividade por usuário:', error);
        throw error;
      }

      console.log('Database: Produtividade por usuário encontrada:', data);
      return data || [];
    } catch (error) {
      console.error('Database: Erro ao buscar produtividade por usuário:', error);
      throw error;
    }
  }

  // Obter tendências de produtividade
  async getProductivityTrends(periodType: 'day' | 'week' | 'month' = 'month', startDate?: string, endDate?: string, boardId?: number): Promise<ProductivityTrend[]> {
    try {
      console.log('Database: Buscando tendências de produtividade:', { periodType, startDate, endDate, boardId });
      
      const { data, error } = await supabase.rpc('get_productivity_trends', {
        p_period_type: periodType,
        p_start_date: startDate || null,
        p_end_date: endDate || null,
        p_board_id: boardId || null
      });

      if (error) {
        console.error('Database: Erro ao buscar tendências de produtividade:', error);
        throw error;
      }

      console.log('Database: Tendências de produtividade encontradas:', data);
      return data || [];
    } catch (error) {
      console.error('Database: Erro ao buscar tendências de produtividade:', error);
      throw error;
    }
  }

  // Obter performance por projeto
  async getProjectPerformance(startDate?: string, endDate?: string, boardId?: number | string): Promise<ProjectPerformance[]> {
    try {
      console.log('Database: Buscando performance por projeto:', { startDate, endDate, boardId });
      
      // Se boardId contém prefixo "board-", não usar para filtrar
      let filteredBoardId = boardId;
      if (boardId && boardId.toString().includes('board-')) {
        console.log('Database: BoardId contém prefixo "board-", ignorando filtro');
        filteredBoardId = undefined;
      }
      
      const { data, error } = await supabase.rpc('get_project_performance', {
        p_start_date: startDate || null,
        p_end_date: endDate || null
      });

      if (error) {
        console.error('Database: Erro ao buscar performance por projeto:', error);
        throw error;
      }

      // Converter board_id para string se necessário para evitar overflow
      const processedData = (data || []).map((item: any) => ({
        ...item,
        board_id: item.board_id ? item.board_id.toString() : null
      }));

      console.log('Database: Performance por projeto encontrada:', processedData);
      return processedData;
    } catch (error) {
      console.error('Database: Erro ao buscar performance por projeto:', error);
      throw error;
    }
  }

  // Obter métricas de subtasks
  async getSubtaskMetrics(startDate?: string, endDate?: string, boardId?: number): Promise<SubtaskMetrics> {
    try {
      console.log('Database: Buscando métricas de subtasks:', { startDate, endDate, boardId });
      
      const { data, error } = await supabase.rpc('get_subtask_metrics', {
        p_start_date: startDate || null,
        p_end_date: endDate || null,
        p_board_id: boardId || null
      });

      if (error) {
        console.error('Database: Erro ao buscar métricas de subtasks:', error);
        throw error;
      }

      console.log('Database: Métricas de subtasks encontradas:', data);
      return data[0] || { total_subtasks: 0, completed_subtasks: 0, completion_rate: 0, avg_completion_days: 0 };
    } catch (error) {
      console.error('Database: Erro ao buscar métricas de subtasks:', error);
      throw error;
    }
  }

  // Obter relatório mensal
  async getMonthlyReport(reportMonth?: string): Promise<MonthlyReport[]> {
    try {
      console.log('Database: Buscando relatório mensal:', { reportMonth });
      
      const { data, error } = await supabase.rpc('get_monthly_report', {
        p_report_month: reportMonth || null
      });

      if (error) {
        console.error('Database: Erro ao buscar relatório mensal:', error);
        throw error;
      }

      console.log('Database: Relatório mensal encontrado:', data);
      return data || [];
    } catch (error) {
      console.error('Database: Erro ao buscar relatório mensal:', error);
      throw error;
    }
  }

  // Exportar relatório para CSV
  async exportReportToCSV(reportType: 'monthly' | 'project' | 'user', data: any[], filename: string): Promise<string> {
    try {
      console.log('Database: Exportando relatório para CSV:', { reportType, filename });
      
      // Converter dados para CSV
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      // Criar blob e URL para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      console.log('Database: Relatório exportado com sucesso');
      return 'Relatório exportado com sucesso!';
    } catch (error) {
      console.error('Database: Erro ao exportar relatório:', error);
      throw error;
    }
  }
}

// Instância global
export const db = DatabaseService.getInstance();

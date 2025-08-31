import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces para tipagem
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  cargo: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: number;
  board_id: string;
  name: string;
  description: string;
  owner_id?: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

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

export interface Card {
  id: number;
  card_id: string;
  board_id: string;
  list_name: string;
  title: string;
  description: string;
  status: string;
  importance: string;
  due_date?: string;
  subject: string;
  goal: string;
  members: string[];
  creation_date: string;
  is_archived: boolean;
  git_branch: string;
  git_commit: string;
  history: any[];
  dependencies: any[];
  recurrence: string;
  user_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: number;
  card_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string;
  estimated_time?: string;
  actual_time?: string;
  importance: string;
  tags: string[];
  category?: string;
  completed: boolean;
  completed_at?: string;
  user_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  card_id: string;
  user_id: number;
  action: string;
  description: string;
  created_at: string;
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

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário por username:', error);
      return null;
    }
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
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

  async getBoards(userId?: number): Promise<Board[]> {
    try {
      let query = supabase
        .from('boards')
        .select('*')
        .order('name');

      if (userId) {
        query = query.eq('owner_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
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
      return data;
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      return null;
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
    try {
      // Primeiro, buscar o board para obter o board_id
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .select('board_id')
        .eq('id', id)
        .single();

      if (boardError) throw boardError;
      if (!board) throw new Error('Board não encontrado');

      const boardId = board.board_id;

      // 1. Primeiro, buscar todos os cards do board para obter seus card_ids
      const { data: cards, error: cardsFetchError } = await supabase
        .from('cards')
        .select('card_id')
        .eq('board_id', boardId);

      if (cardsFetchError) {
        console.error('Erro ao buscar cards do board:', cardsFetchError);
      } else if (cards && cards.length > 0) {
        // 2. Deletar todas as subtarefas dos cards deste board
        const cardIds = cards.map(card => card.card_id);
        for (const cardId of cardIds) {
          const { error: subtasksError } = await supabase
            .from('subtasks')
            .delete()
            .eq('card_id', cardId);

          if (subtasksError) {
            console.error(`Erro ao deletar subtarefas do card ${cardId}:`, subtasksError);
          }
        }
        console.log(`Deletadas subtarefas de ${cardIds.length} cards`);
      }

      // 3. Deletar todos os cards do board
      const { error: cardsError } = await supabase
        .from('cards')
        .delete()
        .eq('board_id', boardId);

      if (cardsError) {
        console.error('Erro ao deletar cards:', cardsError);
        // Continuar mesmo se houver erro nos cards
      } else {
        console.log(`Deletados todos os cards do board ${boardId}`);
      }

      // 4. Deletar todas as listas do board
      const { error: listsError } = await supabase
        .from('lists')
        .delete()
        .eq('board_id', boardId);

      if (listsError) {
        console.error('Erro ao deletar listas:', listsError);
        // Continuar mesmo se houver erro nas listas
      } else {
        console.log(`Deletadas todas as listas do board ${boardId}`);
      }

      // 5. Deletar atividades relacionadas aos cards do board
      if (cards && cards.length > 0) {
        const cardIds = cards.map(card => card.card_id);
        for (const cardId of cardIds) {
          const { error: activitiesError } = await supabase
            .from('activities')
            .delete()
            .eq('card_id', cardId);

          if (activitiesError) {
            console.error(`Erro ao deletar atividades do card ${cardId}:`, activitiesError);
          }
        }
        console.log(`Deletadas atividades de ${cardIds.length} cards`);
      }

      // 6. Deletar chats relacionados ao board
      const { error: chatsError } = await supabase
        .from('chats')
        .delete()
        .eq('board_id', boardId);

      if (chatsError) {
        console.error('Erro ao deletar chats do board:', chatsError);
        // Continuar mesmo se houver erro nos chats
      } else {
        console.log(`Deletados chats do board ${boardId}`);
      }

      // 7. Finalmente, deletar o board
      const { error: boardDeleteError } = await supabase
        .from('boards')
        .delete()
        .eq('id', id);

      if (boardDeleteError) throw boardDeleteError;
      
      console.log(`Board ${boardId} e todos os seus dados foram excluídos com sucesso`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar quadro:', error);
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
    
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('board_id', boardId)
        .eq('is_archived', false)
        .order('created_at');

      console.log('Supabase response - data:', data);
      console.log('Supabase response - error:', error);

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }
      
      console.log('Cards encontrados:', data || []);
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

  async getCardById(cardId: string): Promise<Card | null> {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('card_id', cardId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar card:', error);
      return null;
    }
  }

  async createCard(cardData: Partial<Card>): Promise<Card | null> {
    console.log('=== DATABASE: createCard ===');
    console.log('cardData recebido:', cardData);
    
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([cardData])
        .select()
        .single();

      console.log('Supabase response - data:', data);
      console.log('Supabase response - error:', error);

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
    try {
      const { error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
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

  async getSubtasksForCard(cardId: string): Promise<Subtask[]> {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar subtarefas:', error);
      return [];
    }
  }

  async createSubtask(subtaskData: Partial<Subtask>): Promise<Subtask | null> {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert([subtaskData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar subtarefa:', error);
      return null;
    }
  }

  async updateSubtask(id: number, updates: Partial<Subtask>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar subtarefa:', error);
      return false;
    }
  }

  async deleteSubtask(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar subtarefa:', error);
      return false;
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
      const { data: tableCheck, error: tableError } = await supabase
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
}

// Instância global
export const db = DatabaseService.getInstance();

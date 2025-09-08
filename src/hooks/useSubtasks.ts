import { useState, useEffect } from 'react';
import { db } from '../services/database';

export interface Subtask {
  id: number;
  card_id: number;
  title: string;
  description?: string;
  priority: string;
  due_date?: string;
  status: 'todo' | 'in_progress' | 'completed';
  position: number;
  members: string[];
  created_by: number;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
}

export interface CreateSubtaskData {
  card_id: number;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  members?: string[];
  created_by: number;
}

export const useSubtasks = (cardId: number, userId?: number) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar subtarefas
  const loadSubtasks = async () => {
    if (!cardId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await db.getSubtasks(cardId, userId);
      setSubtasks(data);
    } catch (err) {
      console.error('Erro ao carregar subtarefas:', err);
      setError('Erro ao carregar subtarefas');
    } finally {
      setLoading(false);
    }
  };

  // Criar subtarefa
  const createSubtask = async (subtaskData: CreateSubtaskData): Promise<Subtask | null> => {
    try {
      setError(null);
      const newSubtask = await db.createSubtask(subtaskData);
      
      // Atualizar lista local
      setSubtasks(prev => [...prev, newSubtask]);
      
      return newSubtask;
    } catch (err) {
      console.error('Erro ao criar subtarefa:', err);
      setError('Erro ao criar subtarefa');
      return null;
    }
  };

  // Atualizar subtarefa
  const updateSubtask = async (subtaskId: number, updates: Partial<Subtask>): Promise<Subtask | null> => {
    try {
      setError(null);
      const updatedSubtask = await db.updateSubtask(subtaskId, updates);
      
      // Atualizar lista local
      setSubtasks(prev => 
        prev.map(subtask => 
          subtask.id === subtaskId ? updatedSubtask : subtask
        )
      );
      
      return updatedSubtask;
    } catch (err) {
      console.error('Erro ao atualizar subtarefa:', err);
      setError('Erro ao atualizar subtarefa');
      return null;
    }
  };

  // Deletar subtarefa
  const deleteSubtask = async (subtaskId: number): Promise<boolean> => {
    try {
      setError(null);
      const success = await db.deleteSubtask(subtaskId);
      
      if (success) {
        // Remover da lista local
        setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId));
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao deletar subtarefa:', err);
      setError('Erro ao deletar subtarefa');
      return false;
    }
  };

  // Atualizar status da subtarefa
  const updateSubtaskStatus = async (subtaskId: number, status: 'todo' | 'in_progress' | 'completed'): Promise<Subtask | null> => {
    try {
      setError(null);
      const updatedSubtask = await db.updateSubtaskStatus(subtaskId, status);
      
      // Atualizar lista local
      setSubtasks(prev => 
        prev.map(subtask => 
          subtask.id === subtaskId ? updatedSubtask : subtask
        )
      );
      
      return updatedSubtask;
    } catch (err) {
      console.error('Erro ao atualizar status da subtarefa:', err);
      setError('Erro ao atualizar status da subtarefa');
      return null;
    }
  };

  // Reordenar subtarefas
  const reorderSubtasks = async (subtaskIds: number[]): Promise<boolean> => {
    try {
      setError(null);
      const success = await db.reorderSubtasks(cardId, subtaskIds);
      
      if (success) {
        // Recarregar subtarefas para refletir a nova ordem
        await loadSubtasks();
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao reordenar subtarefas:', err);
      setError('Erro ao reordenar subtarefas');
      return false;
    }
  };

  // Carregar subtarefas quando o cardId mudar
  useEffect(() => {
    loadSubtasks();
  }, [cardId, userId]);

  // Agrupar subtarefas por status
  const subtasksByStatus = {
    todo: subtasks.filter(subtask => subtask.status === 'todo'),
    in_progress: subtasks.filter(subtask => subtask.status === 'in_progress'),
    completed: subtasks.filter(subtask => subtask.status === 'completed')
  };

  return {
    subtasks,
    subtasksByStatus,
    loading,
    error,
    loadSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    updateSubtaskStatus,
    reorderSubtasks
  };
};


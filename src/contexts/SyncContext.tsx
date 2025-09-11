import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SyncEvent {
  type: 'card_status_changed' | 'subtask_status_changed' | 'card_updated' | 'subtask_updated';
  cardId: number;
  subtaskId?: number;
  newStatus?: string;
  timestamp: number;
  source: 'kanban_board' | 'my_activities' | 'card_modal' | 'subtask_manager';
}

interface SyncContextType {
  // Eventos de sincronização
  syncEvents: SyncEvent[];
  
  // Funções para disparar eventos
  triggerCardStatusChange: (cardId: number, newStatus: string, source: SyncEvent['source']) => void;
  triggerSubtaskStatusChange: (cardId: number, subtaskId: number, newStatus: string, source: SyncEvent['source']) => void;
  triggerCardUpdate: (cardId: number, source: SyncEvent['source']) => void;
  triggerSubtaskUpdate: (cardId: number, subtaskId: number, source: SyncEvent['source']) => void;
  
  // Funções para escutar eventos
  onCardStatusChange: (callback: (cardId: number, newStatus: string, source: SyncEvent['source']) => void) => () => void;
  onSubtaskStatusChange: (callback: (cardId: number, subtaskId: number, newStatus: string, source: SyncEvent['source']) => void) => () => void;
  onCardUpdate: (callback: (cardId: number, source: SyncEvent['source']) => void) => () => void;
  onSubtaskUpdate: (callback: (cardId: number, subtaskId: number, source: SyncEvent['source']) => void) => () => void;
  
  // Limpar eventos antigos
  clearOldEvents: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [cardStatusCallbacks, setCardStatusCallbacks] = useState<Set<(cardId: number, newStatus: string, source: SyncEvent['source']) => void>>(new Set());
  const [subtaskStatusCallbacks, setSubtaskStatusCallbacks] = useState<Set<(cardId: number, subtaskId: number, newStatus: string, source: SyncEvent['source']) => void>>(new Set());
  const [cardUpdateCallbacks, setCardUpdateCallbacks] = useState<Set<(cardId: number, source: SyncEvent['source']) => void>>(new Set());
  const [subtaskUpdateCallbacks, setSubtaskUpdateCallbacks] = useState<Set<(cardId: number, subtaskId: number, source: SyncEvent['source']) => void>>(new Set());

  const triggerCardStatusChange = useCallback((cardId: number, newStatus: string, source: SyncEvent['source']) => {
    const event: SyncEvent = {
      type: 'card_status_changed',
      cardId,
      newStatus,
      timestamp: Date.now(),
      source
    };

    setSyncEvents(prev => [...prev, event]);
    
    // Notificar todos os callbacks
    cardStatusCallbacks.forEach(callback => {
      try {
        callback(cardId, newStatus, source);
      } catch (error) {
        console.error('Erro ao executar callback de mudança de status do card:', error);
      }
    });

    console.log('🔄 Sync: Card status changed', { cardId, newStatus, source });
  }, [cardStatusCallbacks]);

  const triggerSubtaskStatusChange = useCallback((cardId: number, subtaskId: number, newStatus: string, source: SyncEvent['source']) => {
    const event: SyncEvent = {
      type: 'subtask_status_changed',
      cardId,
      subtaskId,
      newStatus,
      timestamp: Date.now(),
      source
    };

    setSyncEvents(prev => [...prev, event]);
    
    // Notificar todos os callbacks
    subtaskStatusCallbacks.forEach(callback => {
      try {
        callback(cardId, subtaskId, newStatus, source);
      } catch (error) {
        console.error('Erro ao executar callback de mudança de status da subtarefa:', error);
      }
    });

    console.log('🔄 Sync: Subtask status changed', { cardId, subtaskId, newStatus, source });
  }, [subtaskStatusCallbacks]);

  const triggerCardUpdate = useCallback((cardId: number, source: SyncEvent['source']) => {
    const event: SyncEvent = {
      type: 'card_updated',
      cardId,
      timestamp: Date.now(),
      source
    };

    setSyncEvents(prev => [...prev, event]);
    
    // Notificar todos os callbacks
    cardUpdateCallbacks.forEach(callback => {
      try {
        callback(cardId, source);
      } catch (error) {
        console.error('Erro ao executar callback de atualização do card:', error);
      }
    });

    console.log('🔄 Sync: Card updated', { cardId, source });
  }, [cardUpdateCallbacks]);

  const triggerSubtaskUpdate = useCallback((cardId: number, subtaskId: number, source: SyncEvent['source']) => {
    const event: SyncEvent = {
      type: 'subtask_updated',
      cardId,
      subtaskId,
      timestamp: Date.now(),
      source
    };

    setSyncEvents(prev => [...prev, event]);
    
    // Notificar todos os callbacks
    subtaskUpdateCallbacks.forEach(callback => {
      try {
        callback(cardId, subtaskId, source);
      } catch (error) {
        console.error('Erro ao executar callback de atualização da subtarefa:', error);
      }
    });

    console.log('🔄 Sync: Subtask updated', { cardId, subtaskId, source });
  }, [subtaskUpdateCallbacks]);

  const onCardStatusChange = useCallback((callback: (cardId: number, newStatus: string, source: SyncEvent['source']) => void) => {
    setCardStatusCallbacks(prev => new Set(prev).add(callback));
    
    // Retorna função para remover o callback
    return () => {
      setCardStatusCallbacks(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  const onSubtaskStatusChange = useCallback((callback: (cardId: number, subtaskId: number, newStatus: string, source: SyncEvent['source']) => void) => {
    setSubtaskStatusCallbacks(prev => new Set(prev).add(callback));
    
    // Retorna função para remover o callback
    return () => {
      setSubtaskStatusCallbacks(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  const onCardUpdate = useCallback((callback: (cardId: number, source: SyncEvent['source']) => void) => {
    setCardUpdateCallbacks(prev => new Set(prev).add(callback));
    
    // Retorna função para remover o callback
    return () => {
      setCardUpdateCallbacks(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  const onSubtaskUpdate = useCallback((callback: (cardId: number, subtaskId: number, source: SyncEvent['source']) => void) => {
    setSubtaskUpdateCallbacks(prev => new Set(prev).add(callback));
    
    // Retorna função para remover o callback
    return () => {
      setSubtaskUpdateCallbacks(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  const clearOldEvents = useCallback(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    setSyncEvents(prev => prev.filter(event => event.timestamp > oneHourAgo));
  }, []);

  // Limpar eventos antigos a cada 5 minutos
  React.useEffect(() => {
    const interval = setInterval(clearOldEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clearOldEvents]);

  const value: SyncContextType = {
    syncEvents,
    triggerCardStatusChange,
    triggerSubtaskStatusChange,
    triggerCardUpdate,
    triggerSubtaskUpdate,
    onCardStatusChange,
    onSubtaskStatusChange,
    onCardUpdate,
    onSubtaskUpdate,
    clearOldEvents
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync deve ser usado dentro de um SyncProvider');
  }
  return context;
};

export default SyncContext;






# 📝 Exemplo de Implementação - Minhas Atividades com Kanban

## 🚀 Passo a Passo para Implementar

### 1. **Instalar Dependências**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install lucide-react
```

### 2. **Estrutura de Arquivos Criada**

```
src/
├── components/
│   ├── ActivitiesKanban.tsx      ✅ Criado
│   ├── ActivityStats.tsx         ✅ Criado
│   ├── ActivityFilters.tsx       ✅ Criado
│   └── SubtaskKanban.tsx         ✅ Existente
├── types/
│   ├── index.ts                  ✅ Atualizado
│   └── activities.ts             ✅ Criado
└── pages/
    └── MyActivities.tsx          🔄 Será atualizado
```

### 3. **Exemplo de Uso Básico**

```tsx
// src/pages/MyActivities.tsx
import React, { useState, useEffect } from 'react';
import ActivitiesKanban from '../components/ActivitiesKanban';
import ActivityStats from '../components/ActivityStats';
import ActivityFilters from '../components/ActivityFilters';
import { ActivityItem, ActivityFilter, ActivityStats as ActivityStatsType } from '../types';

const MyActivities: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filters, setFilters] = useState<ActivityFilter>({
    type: 'all',
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all',
    dueDate: 'all',
    searchTerm: ''
  });

  // Carregar atividades do banco
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    // Implementar carregamento do Supabase
    // Exemplo:
    // const data = await db.getActivities(user.id);
    // setActivities(data);
  };

  // Calcular estatísticas
  const calculateStats = (): ActivityStatsType => {
    const total = activities.length;
    const cards = activities.filter(a => a.type === 'card').length;
    const subtasks = activities.filter(a => a.type === 'subtask').length;
    const pending = activities.filter(a => a.status === 'pending').length;
    const inProgress = activities.filter(a => a.status === 'in_progress').length;
    const completed = activities.filter(a => a.status === 'completed').length;
    
    // Calcular outras métricas...
    
    return {
      total,
      cards,
      subtasks,
      pending,
      inProgress,
      completed,
      overdue: 0,
      dueToday: 0,
      dueThisWeek: 0,
      highPriority: 0,
      urgent: 0
    };
  };

  // Aplicar filtros
  const filteredActivities = activities.filter(activity => {
    if (filters.searchTerm && !activity.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filters.type !== 'all') {
      if (filters.type === 'cards' && activity.type !== 'card') return false;
      if (filters.type === 'subtasks' && !['subtask', 'individual_subtask'].includes(activity.type)) return false;
    }
    
    if (filters.status !== 'all' && activity.status !== filters.status) {
      return false;
    }
    
    if (filters.priority !== 'all' && activity.priority !== filters.priority) {
      return false;
    }
    
    // Aplicar outros filtros...
    
    return true;
  });

  // Converter para formato Kanban
  const kanbanItems = filteredActivities.map(activity => ({
    id: activity.id,
    title: activity.title,
    description: activity.description || '',
    status: activity.status,
    priority: activity.priority,
    importance: activity.importance || 'normal',
    category: activity.category || 'Geral',
    dueDate: activity.dueDate,
    assignedTo: activity.assigned_to || 'Usuário',
    estimatedTime: parseInt(activity.estimatedTime || '0'),
    actualTime: parseInt(activity.actualTime || '0'),
    tags: activity.tags || [],
    createdAt: new Date(activity.created_at || Date.now()),
    completed: activity.status === 'completed',
    parentCardId: activity.parentCardId
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <h1 className="text-3xl font-bold">Minhas Atividades</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtros */}
        <ActivityFilters
          filters={filters}
          onFiltersChange={setFilters}
          onResetFilters={() => setFilters({
            type: 'all',
            status: 'all',
            priority: 'all',
            category: 'all',
            assignedTo: 'all',
            dueDate: 'all',
            searchTerm: ''
          })}
          availableCategories={['Geral', 'Desenvolvimento', 'Design', 'Marketing']}
          availableUsers={['João', 'Maria', 'Pedro']}
          className="mb-8"
        />

        {/* Estatísticas */}
        <ActivityStats
          stats={calculateStats()}
          className="mb-8"
        />

        {/* Kanban */}
        <ActivitiesKanban
          activities={kanbanItems}
          onActivitiesChange={(updatedItems) => {
            // Atualizar atividades no estado
            const updatedActivities = activities.map(activity => {
              const updatedItem = updatedItems.find(item => item.id === activity.id);
              if (updatedItem) {
                return {
                  ...activity,
                  status: updatedItem.status as any,
                  priority: updatedItem.priority as any
                };
              }
              return activity;
            });
            setActivities(updatedActivities);
          }}
          onActivitySelect={(item) => {
            console.log('Atividade selecionada:', item);
          }}
          onActivityEdit={(item) => {
            console.log('Editar atividade:', item);
          }}
          onActivityDelete={(item) => {
            if (confirm(`Deletar atividade "${item.title}"?`)) {
              setActivities(prev => prev.filter(a => a.id !== item.id));
            }
          }}
          title="Kanban de Atividades"
          showStats={true}
        />
      </div>
    </div>
  );
};

export default MyActivities;
```

### 4. **Exemplo de Dados de Teste**

```typescript
// Dados de exemplo para desenvolvimento
const sampleActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'card',
    title: 'Implementar Sistema de Login',
    description: 'Criar sistema de autenticação com JWT',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-15',
    category: 'Desenvolvimento',
    importance: 'high',
    tags: ['backend', 'auth', 'security'],
    estimatedTime: '8h',
    actualTime: '4h',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-10T14:30:00Z'
  },
  {
    id: '2',
    type: 'subtask',
    title: 'Criar Componente de Formulário',
    description: 'Componente reutilizável para formulários',
    status: 'pending',
    priority: 'medium',
    dueDate: '2024-01-12',
    category: 'Desenvolvimento',
    importance: 'normal',
    tags: ['frontend', 'react', 'ui'],
    estimatedTime: '4h',
    actualTime: '0h',
    parentCardId: '1',
    created_at: '2024-01-02T09:00:00Z',
    updated_at: '2024-01-02T09:00:00Z'
  },
  {
    id: '3',
    type: 'card',
    title: 'Design do Dashboard',
    description: 'Criar mockups do painel principal',
    status: 'completed',
    priority: 'low',
    dueDate: '2024-01-08',
    category: 'Design',
    importance: 'normal',
    tags: ['design', 'ui', 'dashboard'],
    estimatedTime: '6h',
    actualTime: '5h',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-08T17:00:00Z'
  }
];
```

### 5. **Exemplo de Estilização Customizada**

```css
/* src/styles/activities.css */
.kanban-column {
  @apply bg-white rounded-lg border-2 shadow-sm;
}

.kanban-column-header {
  @apply p-4 border-b border-gray-200;
}

.kanban-item {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer;
}

.kanban-item-dragging {
  @apply opacity-50 rotate-2 scale-105;
}

.kanban-drop-zone {
  @apply min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-lg;
}

.kanban-drop-zone-active {
  @apply border-blue-500 bg-blue-50;
}
```

### 6. **Exemplo de Hook Customizado**

```typescript
// src/hooks/useActivities.ts
import { useState, useEffect } from 'react';
import { ActivityItem, ActivityFilter } from '../types';
import { db } from '../services/database';

export const useActivities = (userId: number) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await db.getActivities(userId);
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activity: Omit<ActivityItem, 'id'>) => {
    try {
      const newActivity = await db.createActivity(activity);
      setActivities(prev => [...prev, newActivity]);
      return newActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar atividade');
      throw err;
    }
  };

  const updateActivity = async (id: string, updates: Partial<ActivityItem>) => {
    try {
      const updatedActivity = await db.updateActivity(id, updates);
      setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));
      return updatedActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar atividade');
      throw err;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await db.deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar atividade');
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      loadActivities();
    }
  }, [userId]);

  return {
    activities,
    loading,
    error,
    loadActivities,
    addActivity,
    updateActivity,
    deleteActivity
  };
};
```

### 7. **Exemplo de Context para Atividades**

```typescript
// src/contexts/ActivitiesContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ActivityItem, ActivityFilter } from '../types';

interface ActivitiesState {
  activities: ActivityItem[];
  filters: ActivityFilter;
  selectedActivity: ActivityItem | null;
  loading: boolean;
}

type ActivitiesAction =
  | { type: 'SET_ACTIVITIES'; payload: ActivityItem[] }
  | { type: 'ADD_ACTIVITY'; payload: ActivityItem }
  | { type: 'UPDATE_ACTIVITY'; payload: ActivityItem }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'SET_FILTERS'; payload: ActivityFilter }
  | { type: 'SELECT_ACTIVITY'; payload: ActivityItem | null }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: ActivitiesState = {
  activities: [],
  filters: {
    type: 'all',
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all',
    dueDate: 'all',
    searchTerm: ''
  },
  selectedActivity: null,
  loading: false
};

const activitiesReducer = (state: ActivitiesState, action: ActivitiesAction): ActivitiesState => {
  switch (action.type) {
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(a => a.id === action.payload.id ? action.payload : a)
      };
    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(a => a.id !== action.payload)
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SELECT_ACTIVITY':
      return { ...state, selectedActivity: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

interface ActivitiesContextType {
  state: ActivitiesState;
  dispatch: React.Dispatch<ActivitiesAction>;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export const ActivitiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(activitiesReducer, initialState);

  return (
    <ActivitiesContext.Provider value={{ state, dispatch }}>
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
};
```

## 🎯 **Próximos Passos**

1. **Implementar a página principal** usando os exemplos acima
2. **Conectar com o banco de dados** (Supabase)
3. **Testar o drag & drop** do Kanban
4. **Personalizar cores e estilos** conforme necessário
5. **Adicionar funcionalidades extras** como export, relatórios, etc.

## 🔧 **Configurações Adicionais**

### **Tailwind CSS**
Certifique-se de que o Tailwind está configurado para incluir os novos componentes:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Suas extensões aqui
    },
  },
  plugins: [],
}
```

### **TypeScript**
Verifique se o `tsconfig.json` inclui os novos tipos:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

---

**🎉 Agora você tem uma tela de atividades completa com Kanban!**

*Implemente seguindo os exemplos acima e personalize conforme suas necessidades.*

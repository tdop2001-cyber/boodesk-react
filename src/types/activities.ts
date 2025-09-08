export interface ActivityItem {
  id: string;
  type: 'card' | 'subtask' | 'individual_subtask';
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'in_progress';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
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
  created_at?: string;
  updated_at?: string;
  board_id?: string;
  list_id?: string;
  position?: number;
  is_archived?: boolean;
  assigned_to?: string;
  completed_at?: string;
  user_id?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  description: string;
  maxItems?: number;
}

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  importance: string;
  category: string;
  dueDate?: string;
  assignedTo?: string;
  estimatedTime?: number;
  actualTime?: number;
  tags: string[];
  createdAt: Date;
  completed: boolean;
  parentCardId?: string;
}

export interface ActivityFilter {
  type: 'all' | 'cards' | 'subtasks';
  status: 'all' | 'pending' | 'completed' | 'in_progress';
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  category: 'all' | string;
  assignedTo: 'all' | string;
  dueDate: 'all' | 'today' | 'week' | 'month' | 'overdue';
  searchTerm: string;
}

export interface ActivityStats {
  total: number;
  cards: number;
  subtasks: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  highPriority: number;
  urgent: number;
}

export interface ActivityGroup {
  id: string;
  title: string;
  type: 'board' | 'category' | 'priority' | 'status' | 'assigned';
  activities: ActivityItem[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  };
}

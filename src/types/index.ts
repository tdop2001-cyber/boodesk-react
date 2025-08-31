// Tipos baseados no app23a.py

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager' | 'user';
  cargo: string;
  created_at: string;
  updated_at: string;
  member_id?: number;
  is_authenticated?: boolean;
  login_time?: string;
}

export interface Member {
  id: number;
  membro: string;
  email: string;
  telefone?: string;
  cargo?: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: number;
  board_id?: string; // ID único do board no Supabase
  name: string;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  position?: number; // Posição para ordenação
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  order: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: number;
  card_id?: string; // ID único do card (string)
  board_id: number;
  column_id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'progress' | 'done';
  assigned_to?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
  tags?: string[];
  attachments?: string[];
  comments?: Comment[];
  // Novos campos baseados no app23a.py
  members?: string[];
  dependencies?: string[] | CardDependency[];
  subtasks?: any[];
  git_branch?: string;
  git_commit?: string;
  git_pr?: string;
  goal?: string;
  category?: string;
  importance?: string;
  recurrence?: string;
  board_name?: string;
  column_name?: string;
}

export interface CardDependency {
  id: string;
  title: string;
  status: string;
  priority: string;
  requiredStatus?: string; // Status necessário para o card atual progredir
}

export interface Comment {
  id: number;
  card_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: number;
  platform: string;
  link: string;
  created_by: number;
  created_at: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  participants?: number[];
  description?: string;
  google_event_id?: string;
}

export interface PomodoroSession {
  id: number;
  user_id: number;
  task_name: string;
  duration: number;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

export interface Activity {
  id: number;
  user_id: number;
  type: 'card_created' | 'card_updated' | 'card_moved' | 'meeting_created' | 'pomodoro_completed';
  description: string;
  related_id?: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
  related_id?: number;
}

export interface Settings {
  id: number;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  title: string;
  type: 'cards_by_status' | 'cards_by_priority' | 'user_activity' | 'meeting_summary' | 'pomodoro_stats';
  filters: Record<string, any>;
  created_by: number;
  created_at: string;
  data?: any;
}

export interface DashboardStats {
  total_cards: number;
  cards_todo: number;
  cards_progress: number;
  cards_done: number;
  total_meetings: number;
  upcoming_meetings: number;
  total_pomodoros: number;
  completed_pomodoros: number;
  active_users: number;
  recent_activities: Activity[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  cargo: string;
  member_id?: number;
}

export interface CardFormData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'progress' | 'done';
  assigned_to?: number;
  due_date?: string;
  tags?: string[];
}

export interface MeetingFormData {
  title: string;
  date: string;
  time: string;
  duration: number;
  platform: string;
  link: string;
  description?: string;
  participants?: number[];
}

export interface PomodoroFormData {
  task_name: string;
  duration: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  created_by?: number;
  date_from?: string;
  date_to?: string;
  tags?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  theme: Theme;
  notifications: Notification[];
  unreadNotifications: number;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: SidebarItem[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filters?: FilterOptions;
  includeDetails?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}


import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus, Edit, Trash, ChevronLeft, ChevronRight, Clock, MapPin, Users, Link } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../services/database';
import { googleCalendarService, CalendarEvent as GoogleCalendarEvent } from '../services/googleCalendarService';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees?: string[];
  googleEventId?: string;
  type: 'meeting' | 'task' | 'reminder';
  color?: string;
  isAllDay?: boolean;
}

interface BoodeskTask {
  id: string;
  title: string;
  dueDate: string;
  importance: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
  board: string;
  list: string;
  status: string;
}

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [boodeskTasks, setBoodeskTasks] = useState<BoodeskTask[]>([]);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'meeting' | 'task' | 'reminder'>('all');

  // Cores baseadas na importância das tarefas
  const importanceColors = {
    'Baixa': '#4CAF50',
    'Normal': '#2196F3',
    'Alta': '#FF9800',
    'Urgente': '#F44336'
  };

  // Gerar dias do calendário
  const getCalendarDays = useCallback(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: ptBR });
    const end = endOfWeek(endOfMonth(currentDate), { locale: ptBR });
    
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Navegar para mês anterior
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navegar para próximo mês
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Ir para hoje
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Conectar ao Google Calendar
  const connectGoogleCalendar = async () => {
    setIsLoading(true);
    try {
      const success = await googleCalendarService.authenticate();
      if (success) {
        setIsGoogleCalendarConnected(true);
        addToast({ type: 'success', title: 'Sucesso', message: 'Conectado ao Google Calendar com sucesso!' });
        await loadGoogleCalendarEvents();
      } else {
        addToast({ type: 'error', title: 'Erro', message: 'Erro ao conectar ao Google Calendar' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Erro ao conectar ao Google Calendar' });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar eventos do Google Calendar
  const loadGoogleCalendarEvents = async () => {
    if (!isGoogleCalendarConnected) return;

    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const result = await googleCalendarService.getEvents(startDate, endDate);
      if (result.success && result.events) {
        setEvents(prev => [...prev.filter(e => !e.googleEventId), ...result.events!]);
      } else {
        addToast({ type: 'error', title: 'Erro', message: 'Erro ao carregar eventos do Google Calendar' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Erro ao carregar eventos do Google Calendar' });
    }
  };

  // Carregar tarefas do Boodesk
  const loadBoodeskTasks = async () => {
    try {
      if (!user?.id) return;

      // Carregar boards do usuário
      const boards = await db.getBoards(user.id);
      let allCards: any[] = [];
      
      // Carregar cards de todos os boards
      for (const board of boards) {
        try {
          const boardCards = await db.getCardsForBoard(board.board_id);
          // Verificar se o board ainda existe antes de adicionar os cards
          if (boardCards && boardCards.length > 0) {
            allCards = [...allCards, ...boardCards];
          }
        } catch (error) {
          console.log(`Board ${board.name} não encontrado ou excluído, pulando...`);
          continue;
        }
      }

      // Filtrar cards com data de vencimento
      const cardsWithDueDate = allCards.filter(card => card.due_date);
      
      // Converter cards para tarefas do Boodesk
      const boodeskTasks: BoodeskTask[] = cardsWithDueDate.map(card => ({
        id: card.card_id,
        title: card.title,
        dueDate: card.due_date,
        importance: card.importance === 'high' ? 'Alta' : 
                   card.importance === 'critical' ? 'Urgente' : 
                   card.importance === 'medium' ? 'Normal' : 'Baixa',
        board: boards.find(b => b.board_id === card.board_id)?.name || 'Quadro',
        list: card.list_name || 'Lista',
        status: card.is_archived ? 'archived' : 'active'
      }));

      setBoodeskTasks(boodeskTasks);

      // Converter tarefas para eventos do calendário
      const taskEvents: CalendarEvent[] = boodeskTasks.map(task => ({
        id: `boodesk-${task.id}`,
        title: `${task.title}`,
        description: `Tarefa do Boodesk - ${task.board} > ${task.list}`,
        startDate: new Date(task.dueDate),
        endDate: new Date(task.dueDate),
        type: 'task',
        color: importanceColors[task.importance],
        isAllDay: true
      }));

      setEvents(prev => [...prev.filter(e => typeof e.id === 'string' && !e.id.startsWith('boodesk-')), ...taskEvents]);
    } catch (error) {
      console.error('Erro ao carregar tarefas do Boodesk:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Erro ao carregar tarefas do Boodesk' });
    }
  };

  // Sincronizar eventos
  const syncEvents = async () => {
    setIsLoading(true);
    try {
      const result = await googleCalendarService.syncEvents(events);
      if (result.success && result.syncedEvents) {
        setEvents(result.syncedEvents);
        addToast({ type: 'success', title: 'Sucesso', message: 'Eventos sincronizados com sucesso!' });
      } else {
        addToast({ type: 'error', title: 'Erro', message: 'Erro ao sincronizar eventos' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Erro ao sincronizar eventos' });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar eventos por data selecionada
  const getEventsForSelectedDate = () => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, selectedDate);
    }).filter(event => {
      if (filterType === 'all') return true;
      return event.type === filterType;
    });
  };

  // Abrir modal de evento
  const openEventModal = (event?: CalendarEvent) => {
    setEditingEvent(event || null);
    setShowEventModal(true);
  };

  // Salvar evento
  const saveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (editingEvent) {
        // Editar evento existente
        const updatedEvent = { ...editingEvent, ...eventData };
        setEvents(prev => prev.map(e => 
          e.id === editingEvent.id ? updatedEvent : e
        ));
        
        // Sincronizar com Google Calendar se estiver conectado
        if (isGoogleCalendarConnected && editingEvent.googleEventId) {
          await googleCalendarService.updateEvent(editingEvent.googleEventId, updatedEvent);
        }
        
        addToast({ type: 'success', title: 'Sucesso', message: 'Evento atualizado com sucesso!' });
      } else {
        // Criar novo evento
        const newEvent: CalendarEvent = {
          id: `local-${Date.now()}`,
          title: eventData.title || '',
          description: eventData.description || '',
          startDate: eventData.startDate || new Date(),
          endDate: eventData.endDate || new Date(),
          location: eventData.location || '',
          attendees: eventData.attendees || [],
          type: eventData.type || 'reminder',
          color: eventData.color || '#2196F3',
          isAllDay: eventData.isAllDay || false
        };
        
        setEvents(prev => [...prev, newEvent]);
        
        // Sincronizar com Google Calendar se estiver conectado
        if (isGoogleCalendarConnected) {
          const result = await googleCalendarService.createEvent(newEvent);
          if (result.success && result.eventId) {
            setEvents(prev => prev.map(e => 
              e.id === newEvent.id ? { ...e, googleEventId: result.eventId } : e
            ));
          }
        }
        
        addToast({ type: 'success', title: 'Sucesso', message: 'Evento criado com sucesso!' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Erro ao salvar evento' });
    }
    
    setShowEventModal(false);
    setEditingEvent(null);
  };

  // Excluir evento
  const deleteEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      
      // Excluir do Google Calendar se estiver conectado
      if (isGoogleCalendarConnected && event?.googleEventId) {
        await googleCalendarService.deleteEvent(event.googleEventId);
      }
      
      setEvents(prev => prev.filter(e => e.id !== eventId));
      addToast({ type: 'success', title: 'Sucesso', message: 'Evento excluído com sucesso!' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Erro ao excluir evento' });
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadBoodeskTasks();
    
    // Verificar status de autenticação do Google Calendar
    const checkGoogleCalendarStatus = () => {
      const isConnected = googleCalendarService.getAuthStatus();
      setIsGoogleCalendarConnected(isConnected);
    };
    
    checkGoogleCalendarStatus();
  }, []);

  // Carregar eventos do Google Calendar quando conectar
  useEffect(() => {
    if (isGoogleCalendarConnected) {
      loadGoogleCalendarEvents();
    }
  }, [isGoogleCalendarConnected]);

  const calendarDays = getCalendarDays();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
                <p className="text-gray-600">Gerencie seus eventos e tarefas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Status do Google Calendar */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isGoogleCalendarConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isGoogleCalendarConnected ? 'Google Calendar Conectado' : 'Google Calendar Desconectado'}
                </span>
              </div>
              
              {!isGoogleCalendarConnected && (
                <button
                  onClick={connectGoogleCalendar}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Conectando...' : 'Conectar Google Calendar'}
                </button>
              )}
              
              <button
                onClick={syncEvents}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm">
            {/* Controles do calendário */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-xl"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <h2 className="text-xl font-semibold text-gray-900">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                  </h2>
                  
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-xl"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Hoje
                </button>
              </div>
            </div>

            {/* Grade do calendário */}
            <div className="p-6">
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do calendário */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  const dayEvents = events.filter(event => 
                    isSameDay(new Date(event.startDate), day)
                  );

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
                        ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
                      `}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${isToday ? 'text-blue-600' : ''}
                      `}>
                        {format(day, 'd')}
                      </div>
                      
                      {/* Indicadores de eventos */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className="text-xs p-1 rounded-xl truncate"
                            style={{ backgroundColor: event.color + '20', color: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Painel lateral */}
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'Todos', color: '#6B7280' },
                  { value: 'meeting', label: 'Reuniões', color: '#4285F4' },
                  { value: 'task', label: 'Tarefas', color: '#34A853' },
                  { value: 'reminder', label: 'Lembretes', color: '#FBBC04' }
                ].map(filter => (
                  <label key={filter.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="filter"
                      value={filter.value}
                      checked={filterType === filter.value}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: filter.color }} />
                    <span className="text-sm text-gray-700">{filter.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Eventos do dia selecionado */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Eventos - {format(selectedDate, 'dd/MM/yyyy')}
                </h3>
                <button
                  onClick={() => openEventModal()}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {getEventsForSelectedDate().length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum evento para este dia</p>
                ) : (
                  getEventsForSelectedDate().map(event => (
                    <div
                      key={event.id}
                      className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {event.isAllDay 
                                  ? 'Dia inteiro'
                                  : `${format(event.startDate, 'HH:mm')} - ${format(event.endDate, 'HH:mm')}`
                                }
                              </span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{event.attendees.length} participantes</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openEventModal(event)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de eventos:</span>
                  <span className="text-sm font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reuniões:</span>
                  <span className="text-sm font-medium">
                    {events.filter(e => e.type === 'meeting').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tarefas:</span>
                  <span className="text-sm font-medium">
                    {events.filter(e => e.type === 'task').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lembretes:</span>
                  <span className="text-sm font-medium">
                    {events.filter(e => e.type === 'reminder').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Evento */}
      {showEventModal && (
        <EventModal
          event={editingEvent}
          onSave={saveEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

// Componente Modal de Evento
interface EventModalProps {
  event?: CalendarEvent | null;
  onSave: (eventData: Partial<CalendarEvent>) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate ? format(event.startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: event?.startDate ? format(event.startDate, 'HH:mm') : '09:00',
    endDate: event?.endDate ? format(event.endDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    endTime: event?.endDate ? format(event.endDate, 'HH:mm') : '10:00',
    location: event?.location || '',
    attendees: event?.attendees?.join(', ') || '',
    type: event?.type || 'reminder',
    color: event?.color || '#2196F3',
    isAllDay: event?.isAllDay || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    onSave({
      ...formData,
      startDate: startDateTime,
      endDate: endDateTime,
      attendees: formData.attendees ? formData.attendees.split(',').map(email => email.trim()) : []
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {event ? 'Editar Evento' : 'Novo Evento'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Início
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={formData.isAllDay}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Fim
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={formData.isAllDay}
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAllDay}
                onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">Dia inteiro</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participantes (emails separados por vírgula)
            </label>
            <input
              type="text"
              value={formData.attendees}
              onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="joao@exemplo.com, maria@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="meeting">Reunião</option>
              <option value="task">Tarefa</option>
              <option value="reminder">Lembrete</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10 border border-gray-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              {event ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Calendar;

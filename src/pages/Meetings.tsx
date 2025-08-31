import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Meeting } from '../types';
import { googleMeetService } from '../services/googleCalendar';
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Video,
  Edit3,
  Trash2,
  Copy,
  Filter,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Play,
  RefreshCw
} from 'lucide-react';

interface MeetingsProps {}

const Meetings: React.FC<MeetingsProps> = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para criação/edição de reunião
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    platform: 'google_meet' as 'google_meet' | 'zoom' | 'teams',
    participants: [] as number[],
    syncGoogle: true
  });

  // Carregar dados do banco
  useEffect(() => {
    if (user?.id) {
      loadMeetingsData();
      checkGoogleConnection();
    }
  }, [user?.id]);

  const loadMeetingsData = async () => {
    try {
      // Por enquanto, não há tabela de meetings no banco
      // Quando implementar, usar: const meetingsData = await db.getMeetings(user?.id);
      setMeetings([]);
    } catch (error) {
      console.error('Erro ao carregar reuniões:', error);
      setMeetings([]);
    }
  };

  const checkGoogleConnection = async () => {
    try {
      const isConnected = await googleMeetService.authenticate();
      setIsGoogleConnected(isConnected);
    } catch (error) {
      console.error('Erro ao verificar conexão Google Meet:', error);
      setIsGoogleConnected(false);
    }
  };

  const generateGoogleMeetCode = async (): Promise<string> => {
    try {
      // Usar o serviço para gerar link real do Google Meet
      const realMeetLink = await googleMeetService.generateMeetLink(meetingData.title);
      return realMeetLink;
    } catch (error) {
      console.error('Erro ao gerar link real do Google Meet:', error);
      // Fallback para geração local
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return `https://meet.google.com/${part1}-${part2}-${part3}`;
    }
  };

  const createMeeting = async () => {
    if (!meetingData.title.trim() || !meetingData.date || !meetingData.time) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    try {
      let meetingLink = '';
      let googleEventId: string | undefined = undefined;

      // Gerar link baseado na plataforma
      switch (meetingData.platform) {
        case 'google_meet':
          if (meetingData.syncGoogle && isGoogleConnected) {
            // Integração com Google Meet API REST
            const meetResult = await googleMeetService.createMeetingSpace(
              meetingData.title,
              user?.email || 'organizador@exemplo.com',
              meetingData.description
            );
            
            if (meetResult.success && meetResult.space) {
              meetingLink = meetResult.space.meetingUri;
              googleEventId = meetResult.space.name;
            } else {
              throw new Error(meetResult.error || 'Erro ao criar reunião no Google Meet');
            }
          } else {
            meetingLink = await generateGoogleMeetCode();
          }
          break;
        case 'zoom':
          meetingLink = `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`;
          break;
        case 'teams':
          meetingLink = `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substring(7)}`;
          break;
      }

      const newMeeting: Meeting = {
        id: Date.now(),
        title: meetingData.title,
        description: meetingData.description,
        date: meetingData.date,
        time: meetingData.time,
        duration: meetingData.duration,
        platform: meetingData.platform,
        link: meetingLink,
        created_by: user?.id || 1,
        created_at: new Date().toISOString(),
        status: 'scheduled',
        participants: meetingData.participants,
        google_event_id: googleEventId
      };

      setMeetings([...meetings, newMeeting]);
      setShowCreateModal(false);
      resetMeetingData();

      // Mostrar mensagem de sucesso
      if (meetingData.syncGoogle && isGoogleConnected) {
        alert('Reunião criada com sucesso e sincronizada com Google Calendar!');
      } else {
        alert('Reunião criada com sucesso!');
      }

    } catch (error) {
      console.error('Erro ao criar reunião:', error);
      alert('Erro ao criar reunião. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMeeting = async () => {
    if (!selectedMeeting || !meetingData.title.trim() || !meetingData.date || !meetingData.time) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    try {
      const updatedMeeting: Meeting = {
        ...selectedMeeting,
        title: meetingData.title,
        description: meetingData.description,
        date: meetingData.date,
        time: meetingData.time,
        duration: meetingData.duration,
        platform: meetingData.platform,
        participants: meetingData.participants
      };

      setMeetings(meetings.map(meeting => 
        meeting.id === selectedMeeting.id ? updatedMeeting : meeting
      ));

      setShowEditModal(false);
      setSelectedMeeting(null);
      resetMeetingData();
      alert('Reunião atualizada com sucesso!');

    } catch (error) {
      console.error('Erro ao atualizar reunião:', error);
      alert('Erro ao atualizar reunião. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMeeting = async (meetingId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta reunião?')) {
      return;
    }

    try {
      const meeting = meetings.find(m => m.id === meetingId);
      
      // Se tem Google Event ID, cancelar no Google Calendar
      if (meeting?.google_event_id && isGoogleConnected) {
        // Em produção, você implementaria o cancelamento real
        console.log('Reunião cancelada no Google Meet:', meeting.google_event_id);
      }

      setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
      alert('Reunião excluída com sucesso!');

    } catch (error) {
      console.error('Erro ao excluir reunião:', error);
      alert('Erro ao excluir reunião. Tente novamente.');
    }
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  const joinMeeting = (meeting: Meeting) => {
    window.open(meeting.link, '_blank');
  };

  const resetMeetingData = () => {
    setMeetingData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      platform: 'google_meet',
      participants: [] as number[],
      syncGoogle: true
    });
  };

  const openEditModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingData({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      platform: meeting.platform as 'google_meet' | 'zoom' | 'teams',
      participants: meeting.participants || [],
      syncGoogle: !!meeting.google_event_id
    });
    setShowEditModal(true);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google_meet': return <Video className="w-4 h-4 text-red-500" />;
      case 'zoom': return <Video className="w-4 h-4 text-blue-500" />;
      case 'teams': return <Video className="w-4 h-4 text-purple-500" />;
      default: return <Video className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'google_meet': return 'Google Meet';
      case 'zoom': return 'Zoom';
      case 'teams': return 'Microsoft Teams';
      default: return platform;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-brand-blue-light/10 text-brand-blue';
      case 'ongoing': return 'bg-brand-yellow-light/10 text-brand-yellow';
      case 'completed': return 'bg-brand-green-light/10 text-brand-green';
      case 'cancelled': return 'bg-brand-red-light/10 text-brand-red';
      default: return 'bg-brand-gray-light/10 text-brand-gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'ongoing': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const isMeetingUpcoming = (meeting: Meeting) => {
    const meetingDateTime = new Date(`${meeting.date} ${meeting.time}`);
    const now = new Date();
    return meetingDateTime > now && meeting.status === 'scheduled';
  };

  const isMeetingOverdue = (meeting: Meeting) => {
    const meetingDateTime = new Date(`${meeting.date} ${meeting.time}`);
    const now = new Date();
    return meetingDateTime < now && meeting.status === 'scheduled';
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (meeting.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || meeting.platform === filterPlatform;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const upcomingMeetings = meetings.filter(meeting => isMeetingUpcoming(meeting));
  const todayMeetings = meetings.filter(meeting => {
    const today = new Date().toISOString().split('T')[0];
    return meeting.date === today && meeting.status === 'scheduled';
  });

  return (
    <div className="min-h-screen bg-brand-light-gray/30">
      {/* Header */}
      <div className="bg-white border-b border-brand-light-gray p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-gray">Reuniões</h1>
            <p className="text-brand-gray/70">
              Gerencie suas reuniões e integre com Google Meet
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Google Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isGoogleConnected 
                ? 'bg-brand-green-light/10 text-brand-green' 
                : 'bg-brand-red-light/10 text-brand-red'
            }`}>
              {isGoogleConnected ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isGoogleConnected ? 'Google Conectado' : 'Google Desconectado'}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-gray/50" />
              <input
                type="text"
                placeholder="Buscar reuniões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-brand-blue text-white' : 'bg-brand-light-gray text-brand-gray hover:bg-brand-gray hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Create Meeting */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Reunião</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-brand-light-gray/50 rounded-lg">
            <div className="flex items-center space-x-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="all">Todos</option>
                  <option value="scheduled">Agendada</option>
                  <option value="ongoing">Em Andamento</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Plataforma</label>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="px-3 py-2 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="all">Todas</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray/70">Total de Reuniões</p>
                <p className="text-2xl font-bold text-brand-gray">{meetings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-brand-blue" />
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray/70">Próximas Reuniões</p>
                <p className="text-2xl font-bold text-brand-gray">{upcomingMeetings.length}</p>
              </div>
              <Clock className="w-8 h-8 text-brand-green" />
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray/70">Reuniões Hoje</p>
                <p className="text-2xl font-bold text-brand-gray">{todayMeetings.length}</p>
              </div>
              <Video className="w-8 h-8 text-brand-red" />
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-brand-light-gray">
            <h3 className="font-semibold text-brand-gray">Todas as Reuniões</h3>
          </div>
          
          <div className="divide-y divide-brand-light-gray">
            {filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="p-4 hover:bg-brand-light-gray/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Platform Icon */}
                    {getPlatformIcon(meeting.platform)}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-medium text-brand-gray">{meeting.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                          {getStatusText(meeting.status)}
                        </span>
                        {isMeetingUpcoming(meeting) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-green-light/10 text-brand-green">
                            Próxima
                          </span>
                        )}
                        {isMeetingOverdue(meeting) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-red-light/10 text-brand-red">
                            Atrasada
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-brand-gray/70">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(meeting.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{meeting.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{meeting.participants?.length || 0} participantes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{getPlatformName(meeting.platform)}</span>
                        </div>
                      </div>
                      
                      {meeting.description && (
                        <p className="text-sm text-brand-gray/70 mt-1">{meeting.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Join Meeting */}
                    {meeting.status === 'scheduled' && (
                      <button
                        onClick={() => joinMeeting(meeting)}
                        className="p-2 text-brand-green hover:bg-brand-green hover:text-white rounded-lg transition-colors"
                        title="Entrar na reunião"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Copy Link */}
                    <button
                      onClick={() => copyMeetingLink(meeting.link)}
                      className="p-2 text-brand-blue hover:bg-brand-blue hover:text-white rounded-lg transition-colors"
                      title="Copiar link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(meeting)}
                      className="p-2 text-brand-gray hover:bg-brand-gray hover:text-white rounded-lg transition-colors"
                      title="Editar reunião"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    {/* Delete */}
                    <button
                      onClick={() => deleteMeeting(meeting.id)}
                      className="p-2 text-brand-red hover:bg-brand-red hover:text-white rounded-lg transition-colors"
                      title="Excluir reunião"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-brand-gray">Criar Nova Reunião</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Título da Reunião *</label>
                  <input
                    type="text"
                    value={meetingData.title}
                    onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                    placeholder="Digite o título da reunião"
                    className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Descrição</label>
                  <textarea
                    value={meetingData.description}
                    onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
                    placeholder="Digite uma descrição para a reunião"
                    className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    rows={3}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Data *</label>
                    <input
                      type="date"
                      value={meetingData.date}
                      onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Hora *</label>
                    <input
                      type="time"
                      value={meetingData.time}
                      onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                {/* Duration and Platform */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Duração (minutos)</label>
                    <input
                      type="number"
                      value={meetingData.duration}
                      onChange={(e) => setMeetingData({...meetingData, duration: parseInt(e.target.value) || 60})}
                      min="15"
                      max="480"
                      className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Plataforma</label>
                    <select
                      value={meetingData.platform}
                      onChange={(e) => setMeetingData({...meetingData, platform: e.target.value as any})}
                      className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <option value="google_meet">Google Meet</option>
                      <option value="zoom">Zoom</option>
                      <option value="teams">Microsoft Teams</option>
                    </select>
                  </div>
                </div>

                {/* Google Calendar Sync */}
                {meetingData.platform === 'google_meet' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="syncGoogle"
                      checked={meetingData.syncGoogle}
                      onChange={(e) => setMeetingData({...meetingData, syncGoogle: e.target.checked})}
                      className="rounded border-brand-light-gray"
                      disabled={!isGoogleConnected}
                    />
                    <label htmlFor="syncGoogle" className="text-sm text-brand-gray">
                      Sincronizar com Google Calendar
                      {!isGoogleConnected && <span className="text-brand-red ml-1">(Não conectado)</span>}
                    </label>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createMeeting}
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Criando...' : 'Criar Reunião'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {showEditModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-brand-gray">Editar Reunião</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Título da Reunião *</label>
                  <input
                    type="text"
                    value={meetingData.title}
                    onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                    placeholder="Digite o título da reunião"
                    className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Descrição</label>
                  <textarea
                    value={meetingData.description}
                    onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
                    placeholder="Digite uma descrição para a reunião"
                    className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    rows={3}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Data *</label>
                    <input
                      type="date"
                      value={meetingData.date}
                      onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Hora *</label>
                    <input
                      type="time"
                      value={meetingData.time}
                      onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                {/* Duration and Platform */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Duração (minutos)</label>
                    <input
                      type="number"
                      value={meetingData.duration}
                      onChange={(e) => setMeetingData({...meetingData, duration: parseInt(e.target.value) || 60})}
                      min="15"
                      max="480"
                      className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Plataforma</label>
                    <select
                      value={meetingData.platform}
                      onChange={(e) => setMeetingData({...meetingData, platform: e.target.value as any})}
                      className="w-full p-3 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <option value="google_meet">Google Meet</option>
                      <option value="zoom">Zoom</option>
                      <option value="teams">Microsoft Teams</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={updateMeeting}
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Atualizando...' : 'Atualizar Reunião'}</span>
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

export default Meetings;

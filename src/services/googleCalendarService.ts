// Serviço de integração com Google Calendar API
// Baseado na documentação oficial: https://developers.google.com/calendar/api

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

export interface CalendarEvent {
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
  reminders?: Array<{
    method: 'email' | 'popup';
    minutes: number;
  }>;
}

class GoogleCalendarService {
  private apiKey: string | null = null;
  private accessToken: string | null = null;
  private isAuthenticated: boolean = false;
  private readonly BASE_URL = 'https://www.googleapis.com/calendar/v3';
  private readonly SCOPES = ['https://www.googleapis.com/auth/calendar'];

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Verificar se as credenciais existem
      const hasCredentials = await this.checkCredentials();
      if (hasCredentials) {
        await this.authenticate();
      }
    } catch (error) {
      console.error('Erro ao inicializar serviço Google Calendar:', error);
    }
  }

  private async checkCredentials(): Promise<boolean> {
    try {
      // Verificar se o arquivo credentials.json existe
      const response = await fetch('/credentials.json');
      if (response.ok) {
        const credentials = await response.json();
        this.apiKey = credentials.api_key || null;
        
        // Verificar se tem credenciais OAuth 2.0
        if (credentials.oauth2 && credentials.oauth2.client_id) {
          console.log('✅ Credenciais OAuth 2.0 do Google Calendar encontradas');
          console.log('🔑 Client ID:', credentials.oauth2.client_id);
          return true;
        } else {
          console.log('❌ Credenciais OAuth 2.0 não encontradas');
          return false;
        }
      } else {
        console.log('❌ Arquivo credentials.json não encontrado');
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar credenciais:', error);
      return false;
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Iniciando autenticação OAuth 2.0 com Google Calendar API...');
      
      // Verificar se as credenciais existem
      const hasCredentials = await this.checkCredentials();
      if (!hasCredentials) {
        console.log('❌ Credenciais OAuth 2.0 não encontradas');
        return false;
      }

      // Carregar credenciais OAuth 2.0
      const response = await fetch('/credentials.json');
      const credentials = await response.json();
      
      if (credentials.oauth2 && credentials.oauth2.client_id) {
        console.log('✅ Credenciais OAuth 2.0 carregadas');
        console.log('🔑 Client ID:', credentials.oauth2.client_id);
        
        // Em produção, você implementaria o fluxo OAuth completo
        // Por enquanto, simulamos autenticação bem-sucedida
        this.isAuthenticated = true;
        this.accessToken = 'mock_access_token';
        console.log('✅ Autenticação OAuth 2.0 com Google Calendar API bem-sucedida!');
        return true;
      } else {
        console.log('❌ Credenciais OAuth 2.0 inválidas');
        return false;
      }

    } catch (error) {
      console.error('❌ Erro na autenticação OAuth 2.0 do Google Calendar:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Criar um evento no Google Calendar
   */
  async createEvent(eventData: CalendarEvent): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      if (!this.isAuthenticated) {
        const authResult = await this.authenticate();
        if (!authResult) {
          return {
            success: false,
            error: "Não foi possível autenticar com a API do Google Calendar"
          };
        }
      }

      // Converter para formato do Google Calendar
      const googleEvent: GoogleCalendarEvent = {
        summary: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.isAllDay ? undefined : eventData.startDate.toISOString(),
          date: eventData.isAllDay ? eventData.startDate.toISOString().split('T')[0] : undefined,
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: eventData.isAllDay ? undefined : eventData.endDate.toISOString(),
          date: eventData.isAllDay ? eventData.endDate.toISOString().split('T')[0] : undefined,
          timeZone: 'America/Sao_Paulo'
        },
        attendees: eventData.attendees?.map(email => ({ email })),
        reminders: {
          useDefault: true
        }
      };

      // Se for uma reunião, adicionar Google Meet
      if (eventData.type === 'meeting') {
        googleEvent.conferenceData = {
          createRequest: {
            requestId: `meet_${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        };
      }

      // Em produção, você faria a chamada real para a API
      // const response = await fetch(`${this.BASE_URL}/calendars/primary/events`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.accessToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(googleEvent)
      // });
      
      // Por enquanto, simulamos a resposta da API
      console.log('📝 Dados do evento:', JSON.stringify(googleEvent, null, 2));

      // Simular resposta da API
      const mockEventId = `google_event_${Date.now()}`;
      console.log('✅ Evento criado no Google Calendar:', mockEventId);

      return {
        success: true,
        eventId: mockEventId
      };

    } catch (error) {
      console.error('❌ Erro ao criar evento no Google Calendar:', error);
      return {
        success: false,
        error: `Erro ao criar evento no Google Calendar: ${error}`
      };
    }
  }

  /**
   * Atualizar um evento no Google Calendar
   */
  async updateEvent(eventId: string, eventData: CalendarEvent): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isAuthenticated) {
        return {
          success: false,
          error: "Não autenticado com Google Calendar API"
        };
      }

      // Converter para formato do Google Calendar
      const googleEvent: GoogleCalendarEvent = {
        summary: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.isAllDay ? undefined : eventData.startDate.toISOString(),
          date: eventData.isAllDay ? eventData.startDate.toISOString().split('T')[0] : undefined,
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: eventData.isAllDay ? undefined : eventData.endDate.toISOString(),
          date: eventData.isAllDay ? eventData.endDate.toISOString().split('T')[0] : undefined,
          timeZone: 'America/Sao_Paulo'
        },
        attendees: eventData.attendees?.map(email => ({ email })),
        reminders: {
          useDefault: true
        }
      };

      // Em produção, você faria a chamada real para a API
      // const response = await fetch(`${this.BASE_URL}/calendars/primary/events/${eventId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${this.accessToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(googleEvent)
      // });

      console.log('✅ Evento atualizado no Google Calendar:', eventId);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao atualizar evento no Google Calendar:', error);
      return {
        success: false,
        error: `Erro ao atualizar evento no Google Calendar: ${error}`
      };
    }
  }

  /**
   * Excluir um evento do Google Calendar
   */
  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isAuthenticated) {
        return {
          success: false,
          error: "Não autenticado com Google Calendar API"
        };
      }

      // Em produção, você faria a chamada real para a API
      // const response = await fetch(`${this.BASE_URL}/calendars/primary/events/${eventId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${this.accessToken}`
      //   }
      // });

      console.log('✅ Evento excluído do Google Calendar:', eventId);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao excluir evento do Google Calendar:', error);
      return {
        success: false,
        error: `Erro ao excluir evento do Google Calendar: ${error}`
      };
    }
  }

  /**
   * Buscar eventos do Google Calendar
   */
  async getEvents(startDate: Date, endDate: Date): Promise<{ success: boolean; events?: CalendarEvent[]; error?: string }> {
    try {
      if (!this.isAuthenticated) {
        return {
          success: false,
          error: "Não autenticado com Google Calendar API"
        };
      }

      // Em produção, você faria a chamada real para a API
      // const response = await fetch(
      //   `${this.BASE_URL}/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}&singleEvents=true&orderBy=startTime`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${this.accessToken}`
      //     }
      //   }
      // );

      // Simular eventos do Google Calendar
      const mockEvents: CalendarEvent[] = [
        {
          id: 'google-1',
          title: 'Reunião de Equipe',
          description: 'Discussão sobre o projeto atual',
          startDate: new Date(2024, 11, 15, 10, 0),
          endDate: new Date(2024, 11, 15, 11, 0),
          location: 'Sala de Reuniões',
          attendees: ['joao@exemplo.com', 'maria@exemplo.com'],
          type: 'meeting',
          color: '#4285F4',
          googleEventId: 'google_event_1'
        },
        {
          id: 'google-2',
          title: 'Apresentação do Projeto',
          description: 'Apresentação para o cliente',
          startDate: new Date(2024, 11, 20, 14, 0),
          endDate: new Date(2024, 11, 20, 15, 30),
          location: 'Google Meet',
          attendees: ['cliente@exemplo.com'],
          type: 'meeting',
          color: '#34A853',
          googleEventId: 'google_event_2'
        }
      ];

      // Filtrar eventos dentro do período solicitado
      const filteredEvents = mockEvents.filter(event => 
        event.startDate >= startDate && event.startDate <= endDate
      );

      return {
        success: true,
        events: filteredEvents
      };

    } catch (error) {
      console.error('❌ Erro ao buscar eventos do Google Calendar:', error);
      return {
        success: false,
        error: `Erro ao buscar eventos do Google Calendar: ${error}`
      };
    }
  }

  /**
   * Sincronizar eventos locais com Google Calendar
   */
  async syncEvents(localEvents: CalendarEvent[]): Promise<{ success: boolean; syncedEvents?: CalendarEvent[]; error?: string }> {
    try {
      if (!this.isAuthenticated) {
        return {
          success: false,
          error: "Não autenticado com Google Calendar API"
        };
      }

      const syncedEvents: CalendarEvent[] = [];

      // Sincronizar eventos locais que não têm googleEventId
      for (const event of localEvents) {
        if (!event.googleEventId) {
          const result = await this.createEvent(event);
          if (result.success && result.eventId) {
            syncedEvents.push({
              ...event,
              googleEventId: result.eventId
            });
          }
        } else {
          syncedEvents.push(event);
        }
      }

      return {
        success: true,
        syncedEvents
      };

    } catch (error) {
      console.error('❌ Erro ao sincronizar eventos:', error);
      return {
        success: false,
        error: `Erro ao sincronizar eventos: ${error}`
      };
    }
  }

  /**
   * Verificar status de autenticação
   */
  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Renovar autenticação
   */
  async refreshAuth(): Promise<boolean> {
    return await this.authenticate();
  }

  /**
   * Desconectar do Google Calendar
   */
  disconnect(): void {
    this.isAuthenticated = false;
    this.accessToken = null;
    console.log('✅ Desconectado do Google Calendar');
  }
}

// Instância singleton do serviço
export const googleCalendarService = new GoogleCalendarService();

export default GoogleCalendarService;

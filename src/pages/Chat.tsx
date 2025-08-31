import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/database';
import { 
  Send, 
  Search, 
  Users, 
  MessageSquare, 
  MoreVertical, 
  Paperclip, 
  Smile,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Plus
} from 'lucide-react';

interface Message {
  id: number;
  sender_id: number;
  username: string;
  message: string;
  created_at: string;
  is_own: boolean;
}

interface Chat {
  id: number;
  name: string;
  chat_type: 'board' | 'card' | 'direct';
  created_by: number;
  board_id?: number;
  card_id?: number;
  participants: User[];
}

interface User {
  id: number;
  username: string;
  role: string;
  cargo: string;
}

interface ChatProps {}

const Chat: React.FC<ChatProps> = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatType, setChatType] = useState<'all' | 'board' | 'direct' | 'card'>('all');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterType, setUserFilterType] = useState<'all' | 'user' | 'manager' | 'admin'>('all');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados do banco
  useEffect(() => {
    if (user?.id) {
      loadChatData();
      loadUsers();
    }
  }, [user?.id]);

  const loadChatData = async () => {
    try {
      const chatsData = await db.getChatsByUser(user?.id || 0);
      // Mapear para o formato esperado pelo componente
      const mappedChats: Chat[] = chatsData.map(chat => ({
        id: chat.id,
        name: chat.name,
        chat_type: chat.chat_type as 'board' | 'card' | 'direct',
        created_by: chat.created_by,
        board_id: chat.board_id,
        card_id: chat.card_id,
        participants: [] // Por enquanto vazio, será carregado separadamente se necessário
      }));
      setChats(mappedChats);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
      setChats([]);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await db.getUsers();
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setAvailableUsers([]);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const messagesData = await db.getChatMessages(chatId, 50);
      const messagesWithOwnFlag = messagesData.map((msg: any) => ({
        ...msg,
        is_own: msg.sender_id === user?.id
      }));
      setMessages(messagesWithOwnFlag);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentChat) return;

    const message: Message = {
      id: Date.now(),
      sender_id: user?.id || 1,
      username: user?.username || 'admin',
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_own: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat);
    loadMessages(chat.id);
    setShowParticipants(false);
  };

  const createDirectChat = (targetUser: User) => {
    const newChat: Chat = {
      id: Date.now(),
      name: `Chat com ${targetUser.username}`,
      chat_type: 'direct',
      created_by: user?.id || 1,
      participants: [
        { id: user?.id || 1, username: user?.username || 'admin', role: user?.role || 'admin', cargo: user?.cargo || 'Administrador' },
        targetUser
      ]
    };

    setChats(prev => [...prev, newChat]);
    selectChat(newChat);
    setShowNewChatModal(false);
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = chatType === 'all' || chat.chat_type === chatType;
    return matchesSearch && matchesType;
  });

  const filteredUsers = availableUsers.filter(userOption => {
    const matchesSearch = userOption.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         userOption.cargo.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesType = userFilterType === 'all' || userOption.role === userFilterType;
    const isNotCurrentUser = userOption.id !== user?.id;
    return matchesSearch && matchesType && isNotCurrentUser;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getChatIcon = (chat: Chat) => {
    switch (chat.chat_type) {
      case 'board':
        return <MessageSquare className="w-5 h-5" />;
      case 'direct':
        return <Users className="w-5 h-5" />;
      case 'card':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getChatTypeLabel = (chat: Chat) => {
    switch (chat.chat_type) {
      case 'board':
        return 'Quadro';
      case 'direct':
        return 'Direto';
      case 'card':
        return 'Cartão';
      default:
        return 'Chat';
    }
  };

  const getUserRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'user':
        return 'Usuário';
      default:
        return role;
    }
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'manager':
        return 'bg-blue-100 text-blue-700';
      case 'user':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-full bg-brand-light-gray/30">
      {/* Chat Sidebar */}
      <div className="w-80 bg-white border-r border-brand-light-gray flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-brand-light-gray">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-brand-gray">Chat</h1>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>

          {/* Chat Type Filter */}
          <div className="flex space-x-1 mt-3">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'board', label: 'Quadros' },
              { key: 'direct', label: 'Diretos' },
              { key: 'card', label: 'Cartões' }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setChatType(type.key as any)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  chatType === type.key
                    ? 'bg-brand-red text-white'
                    : 'bg-brand-light-gray text-brand-gray hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat)}
              className={`p-4 border-b border-brand-light-gray cursor-pointer transition-colors hover:bg-brand-light-gray/50 ${
                currentChat?.id === chat.id ? 'bg-brand-red/5 border-l-4 border-l-brand-red' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
                    {getChatIcon(chat)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-brand-gray truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-brand-gray/50">
                      {getChatTypeLabel(chat)}
                    </span>
                  </div>
                  <p className="text-xs text-brand-gray/50 mt-1">
                    {chat.participants.length} participantes
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-brand-light-gray p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentChat(null)}
                    className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-brand-gray">
                      {currentChat.name}
                    </h2>
                    <p className="text-sm text-brand-gray/50">
                      {getChatTypeLabel(currentChat)} • {currentChat.participants.length} participantes
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.is_own
                        ? 'bg-brand-red text-white'
                        : 'bg-white border border-brand-light-gray text-brand-gray'
                    }`}
                  >
                    {!message.is_own && (
                      <p className="text-xs font-medium text-brand-gray/50 mb-1">
                        {message.username}
                      </p>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.is_own ? 'text-red-100' : 'text-brand-gray/40'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-brand-light-gray p-4">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-brand-light-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-brand-gray/60 hover:bg-brand-light-gray rounded-full transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-brand-red text-white rounded-2xl hover:bg-brand-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-brand-red" />
              </div>
              <h2 className="text-2xl font-bold text-brand-gray mb-2">
                Bem-vindo ao Chat
              </h2>
              <p className="text-brand-gray/60 mb-6">
                Selecione uma conversa para começar a enviar mensagens
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-6 py-3 bg-brand-red text-white rounded-xl hover:bg-brand-red-dark transition-colors"
              >
                Nova Conversa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Participants Sidebar */}
      {showParticipants && currentChat && (
        <div className="w-80 bg-white border-l border-brand-light-gray p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-gray">Participantes</h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {currentChat.participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-3 p-3 bg-brand-light-gray/30 rounded-xl">
                <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-brand-red">
                    {participant.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-gray">
                    {participant.username}
                  </p>
                  <p className="text-xs text-brand-gray/50">{participant.cargo}</p>
                </div>
                <button className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-brand-gray">Nova Conversa</h2>
                  <p className="text-sm text-brand-gray/60 mt-1">Selecione um usuário para iniciar uma conversa direta</p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 text-brand-gray/60 hover:bg-brand-light-gray rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="space-y-4 mb-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/40 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou cargo..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>

                {/* Role Filter */}
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'Todos' },
                    { key: 'admin', label: 'Administradores' },
                    { key: 'manager', label: 'Gerentes' },
                    { key: 'user', label: 'Usuários' }
                  ].map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setUserFilterType(type.key as any)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                        userFilterType === type.key
                          ? 'bg-brand-red text-white'
                          : 'bg-brand-light-gray text-brand-gray hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((userOption) => (
                    <div
                      key={userOption.id}
                      onClick={() => createDirectChat(userOption)}
                      className="flex items-center space-x-4 p-4 bg-brand-light-gray/30 rounded-xl cursor-pointer hover:bg-brand-light-gray/50 transition-colors border border-transparent hover:border-brand-light-gray"
                    >
                      <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-brand-red">
                          {userOption.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-brand-gray">
                            {userOption.username}
                          </p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getUserRoleColor(userOption.role)}`}>
                            {getUserRoleLabel(userOption.role)}
                          </span>
                        </div>
                        <p className="text-xs text-brand-gray/50">{userOption.cargo}</p>
                      </div>
                      <div className="text-brand-gray/40">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-brand-light-gray/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-brand-gray/40" />
                    </div>
                    <p className="text-brand-gray/60 text-sm">
                      {userSearchTerm || userFilterType !== 'all' 
                        ? 'Nenhum usuário encontrado com os filtros aplicados'
                        : 'Nenhum usuário disponível para conversa'
                      }
                    </p>
                    {(userSearchTerm || userFilterType !== 'all') && (
                      <button
                        onClick={() => {
                          setUserSearchTerm('');
                          setUserFilterType('all');
                        }}
                        className="mt-2 text-xs text-brand-red hover:underline"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              {filteredUsers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-brand-light-gray">
                  <p className="text-xs text-brand-gray/50 text-center">
                    {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} disponível{filteredUsers.length !== 1 ? 'is' : ''} para conversa
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;

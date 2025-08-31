import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Shield, 
  Bell, 
  Palette,
  Key,
  LogOut,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  cargo: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  memberSince: string;
  lastLogin: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'pt-BR' | 'en-US' | 'es-ES';
    notifications: {
      email: boolean;
      push: boolean;
      sound: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showLocation: boolean;
    };
  };
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Dados do usuário do contexto de autenticação
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || 1,
    username: user?.username || 'admin',
    email: user?.email || 'admin@boodesk.com',
    fullName: user?.username || 'Administrador do Sistema',
    role: user?.role || 'admin',
    cargo: user?.cargo || 'Administrador',
    phone: '+55 (11) 99999-9999',
    location: 'São Paulo, SP',
    bio: 'Administrador do sistema Boodesk com foco em gestão de projetos e equipes.',
    avatar: user?.username?.charAt(0).toUpperCase() || 'A',
    memberSince: user?.created_at || '2024-01-15',
    lastLogin: user?.updated_at || '2024-08-29 10:30:00',
    preferences: {
      theme: 'light',
      language: 'pt-BR',
      notifications: {
        email: true,
        push: true,
        sound: false
      },
      privacy: {
        showEmail: true,
        showPhone: false,
        showLocation: true
      }
    }
  });

  const [editForm, setEditForm] = useState(profile);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = () => {
    setProfile(editForm);
    setIsEditing(false);
    // Aqui você faria a chamada para a API
    console.log('Perfil salvo:', editForm);
    addToast({
      type: 'success',
      title: 'Perfil atualizado',
      message: 'Suas informações foram salvas com sucesso!'
    });
  };

  const handleCancelEdit = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Erro na alteração',
        message: 'As senhas não coincidem!'
      });
      return;
    }
    // Aqui você faria a chamada para a API
    console.log('Senha alterada:', passwordForm);
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    addToast({
      type: 'success',
      title: 'Senha alterada',
      message: 'Sua senha foi atualizada com sucesso!'
    });
  };

  const handleDeleteAccount = () => {
    // Aqui você faria a chamada para a API
    console.log('Conta deletada');
    logout();
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Aqui você processaria o upload da imagem
      console.log('Avatar upload:', file);
      setShowAvatarModal(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-brand-light-gray/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-light-gray p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-gray">Perfil do Usuário</h1>
              <p className="text-brand-gray/60 mt-1">Gerencie suas informações pessoais e configurações</p>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 border border-brand-light-gray rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-brand-red text-white rounded-xl hover:bg-brand-red-dark transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Informações Pessoais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-2xl shadow-sm border border-brand-light-gray p-6">
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.avatar}
                  </div>
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center hover:bg-brand-blue-dark transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Informações */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Nome Completo</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                          className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <p className="text-brand-gray font-medium">{profile.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Nome de Usuário</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                          className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <p className="text-brand-gray font-medium">@{profile.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <p className="text-brand-gray font-medium">{profile.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Telefone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <p className="text-brand-gray font-medium">{profile.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Localização</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <p className="text-brand-gray font-medium">{profile.location}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Cargo</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.cargo}
                          onChange={(e) => setEditForm({...editForm, cargo: e.target.value})}
                          className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <p className="text-brand-gray font-medium">{profile.cargo}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-brand-gray mb-2">Biografia</label>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        rows={3}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    ) : (
                      <p className="text-brand-gray/70">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações da Conta */}
            <div className="bg-white rounded-2xl shadow-sm border border-brand-light-gray p-6">
              <h3 className="text-lg font-bold text-brand-gray mb-4">Informações da Conta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-brand-gray/60" />
                    <div>
                      <p className="text-sm text-brand-gray/60">Membro desde</p>
                      <p className="text-brand-gray font-medium">{new Date(profile.memberSince).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-brand-gray/60" />
                    <div>
                      <p className="text-sm text-brand-gray/60">Nível de acesso</p>
                      <p className="text-brand-gray font-medium">{profile.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-brand-gray/60" />
                    <div>
                      <p className="text-sm text-brand-gray/60">Último login</p>
                      <p className="text-brand-gray font-medium">{new Date(profile.lastLogin).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-brand-gray/60" />
                    <div>
                      <p className="text-sm text-brand-gray/60">Status da conta</p>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Ativa
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Configurações e Ações */}
          <div className="space-y-6">
            {/* Configurações */}
            <div className="bg-white rounded-2xl shadow-sm border border-brand-light-gray p-6">
              <h3 className="text-lg font-bold text-brand-gray mb-4">Configurações</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Tema</label>
                  <select
                    value={profile.preferences.theme}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        theme: e.target.value as 'light' | 'dark' | 'auto'
                      }
                    })}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Idioma</label>
                  <select
                    value={profile.preferences.language}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        language: e.target.value as 'pt-BR' | 'en-US' | 'es-ES'
                      }
                    })}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-2xl shadow-sm border border-brand-light-gray p-6">
              <h3 className="text-lg font-bold text-brand-gray mb-4">Ações Rápidas</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center space-x-3 p-3 text-brand-gray hover:bg-brand-light-gray/30 rounded-xl transition-colors"
                >
                  <Key className="w-5 h-5" />
                  <span>Alterar Senha</span>
                </button>

                <button
                  onClick={() => {/* Abrir configurações de notificação */}}
                  className="w-full flex items-center space-x-3 p-3 text-brand-gray hover:bg-brand-light-gray/30 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span>Notificações</span>
                </button>

                <button
                  onClick={() => {/* Abrir configurações de privacidade */}}
                  className="w-full flex items-center space-x-3 p-3 text-brand-gray hover:bg-brand-light-gray/30 rounded-xl transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Privacidade</span>
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 p-3 text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center space-x-3 p-3 text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Excluir Conta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Alteração de Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-brand-gray">Alterar Senha</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50 hover:text-brand-gray"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Nova Senha</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                  >
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload de Avatar */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-brand-gray">Alterar Foto de Perfil</h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 text-brand-gray/50 hover:text-brand-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-32 h-32 bg-brand-green rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                    {profile.avatar}
                  </div>
                  <p className="text-sm text-brand-gray/60 mb-4">
                    Selecione uma nova imagem para seu perfil
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-gray">Excluir Conta</h3>
                  <p className="text-sm text-brand-gray/60">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-brand-gray/60">
                  Tem certeza que deseja excluir sua conta? Todos os dados serão perdidos permanentemente.
                </p>
                
                <div className="p-3 bg-brand-red/5 border border-brand-red/20 rounded-lg">
                  <p className="text-sm text-brand-red">
                    <strong>Atenção:</strong> Esta ação excluirá todos os seus quadros, cards, configurações e dados pessoais.
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors"
                  >
                    Excluir Conta
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

export default Profile;

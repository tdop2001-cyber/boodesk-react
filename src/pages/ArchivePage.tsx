import React, { useState } from 'react';
import ArchiveManager from '../components/ArchiveManager';
import BulkArchiveManager from '../components/BulkArchiveManager';
import { 
  Archive, 
  FolderOpen, 
  Clock, 
  Settings,
  BarChart3,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ArchivePage: React.FC = () => {
  const [showArchiveManager, setShowArchiveManager] = useState(false);
  const [showBulkArchiveManager, setShowBulkArchiveManager] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'bulk'>('overview');

  const handleCardsArchived = (archivedCount: number) => {
    console.log(`${archivedCount} cards foram arquivados`);
    // Aqui você pode adicionar lógica para atualizar estatísticas ou notificações
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Archive className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Arquivo de Cards</h1>
                <p className="text-sm text-gray-600">Gerencie cards concluídos e configurações de arquivamento</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBulkArchiveManager(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span>Arquivamento em Lote</span>
              </button>
              <button
                onClick={() => setShowArchiveManager(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Gerenciar Arquivo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gerenciar
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Arquivamento em Lote
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cards Arquivados</p>
                    <p className="text-2xl font-bold text-gray-900">1,234</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pastas de Arquivo</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Arquivamento Automático</p>
                    <p className="text-2xl font-bold text-gray-900">Ativo</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Última Limpeza</p>
                    <p className="text-2xl font-bold text-gray-900">Hoje</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowArchiveManager(true)}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Gerenciar Arquivo</p>
                    <p className="text-sm text-gray-600">Visualizar e organizar cards arquivados</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowBulkArchiveManager(true)}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Archive className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Arquivamento em Lote</p>
                    <p className="text-sm text-gray-600">Arquivar múltiplos cards de uma vez</p>
                  </div>
                </button>

                <button
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Settings className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Configurações</p>
                    <p className="text-sm text-gray-600">Configurar arquivamento automático</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Informações Importantes */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Sobre o Sistema de Arquivamento</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    O sistema de arquivamento permite organizar cards concluídos em pastas temáticas, 
                    configurar arquivamento automático e manter um histórico completo de todas as atividades. 
                    Cards arquivados podem ser restaurados a qualquer momento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gerenciar Arquivo
            </h3>
            <p className="text-gray-600 mb-4">
              Clique no botão abaixo para abrir o gerenciador de arquivo completo.
            </p>
            <button
              onClick={() => setShowArchiveManager(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
            >
              <FolderOpen className="w-5 h-5" />
              <span>Abrir Gerenciador</span>
            </button>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="text-center py-12">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arquivamento em Lote
            </h3>
            <p className="text-gray-600 mb-4">
              Selecione múltiplos cards concluídos e arquive-os em lote para economizar tempo.
            </p>
            <button
              onClick={() => setShowBulkArchiveManager(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Archive className="w-5 h-5" />
              <span>Iniciar Arquivamento em Lote</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ArchiveManager
        isOpen={showArchiveManager}
        onClose={() => setShowArchiveManager(false)}
        onCardRestored={(cardId) => console.log('Card restaurado:', cardId)}
      />

      <BulkArchiveManager
        isOpen={showBulkArchiveManager}
        onClose={() => setShowBulkArchiveManager(false)}
        onCardsArchived={handleCardsArchived}
      />
    </div>
  );
};

export default ArchivePage;

import React, { useState } from 'react';
import { migrateDatabase } from '../utils/databaseMigration';
import { useToast } from '../contexts/ToastContext';
import { Database, CheckCircle, AlertCircle, Loader, FileText, Copy } from 'lucide-react';

const DatabaseSetup: React.FC = () => {
  const { addToast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus('idle');
    
    try {
      const success = await migrateDatabase();
      
      if (success) {
        setMigrationStatus('success');
        addToast({
          type: 'success',
          title: 'Migração Concluída',
          message: 'Banco de dados configurado com sucesso!'
        });
      } else {
        setMigrationStatus('error');
        addToast({
          type: 'error',
          title: 'Erro na Migração',
          message: 'Verifique as instruções abaixo para configurar manualmente.'
        });
      }
    } catch (error) {
      setMigrationStatus('error');
      addToast({
        type: 'error',
        title: 'Erro na Migração',
        message: 'Erro inesperado durante a migração.'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      type: 'success',
      title: 'Copiado!',
      message: 'SQL copiado para a área de transferência.'
    });
  };

  const sqlSchema = `-- Schema do Banco de Dados para o Sistema Kanban
-- Execute este SQL no Editor SQL do Supabase

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  cargo VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de quadros
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  board_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de listas
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  list_id VARCHAR(100) UNIQUE NOT NULL,
  board_id VARCHAR(100) REFERENCES boards(board_id),
  name VARCHAR(255) NOT NULL,
  position INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cards
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  card_id VARCHAR(100) UNIQUE NOT NULL,
  board_id VARCHAR(100) REFERENCES boards(board_id),
  list_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  importance VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  subject VARCHAR(255),
  goal TEXT,
  members JSONB DEFAULT '[]',
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  git_branch VARCHAR(255),
  git_commit VARCHAR(255),
  history JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  recurrence VARCHAR(50),
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de subtarefas
CREATE TABLE IF NOT EXISTS subtasks (
  id SERIAL PRIMARY KEY,
  card_id VARCHAR(100) REFERENCES cards(card_id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_time VARCHAR(50),
  actual_time VARCHAR(50),
  importance VARCHAR(20) DEFAULT 'medium',
  tags JSONB DEFAULT '[]',
  category VARCHAR(100),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atividades
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  card_id VARCHAR(100) REFERENCES cards(card_id),
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de chats
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  chat_type VARCHAR(50) DEFAULT 'general',
  board_id INTEGER REFERENCES boards(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id),
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'pt',
  notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados de exemplo
INSERT INTO users (username, email, role, cargo) 
VALUES ('admin', 'admin@example.com', 'admin', 'Administrador')
ON CONFLICT (username) DO NOTHING;

-- Inserir quadro de exemplo
INSERT INTO boards (board_id, name, description, owner_id) 
VALUES ('sample-board-1', 'Projeto Exemplo', 'Quadro de exemplo para demonstração', 1)
ON CONFLICT (board_id) DO NOTHING;

-- Inserir listas de exemplo
INSERT INTO lists (list_id, board_id, name, position) VALUES
  ('list-1', 'sample-board-1', 'A Fazer', 1),
  ('list-2', 'sample-board-1', 'Em Progresso', 2),
  ('list-3', 'sample-board-1', 'Concluído', 3)
ON CONFLICT (list_id) DO NOTHING;

-- Inserir cards de exemplo
INSERT INTO cards (card_id, board_id, list_name, title, description, status, importance, subject, goal, members, git_branch, git_commit, dependencies, recurrence) VALUES
  ('card-1', 'sample-board-1', 'A Fazer', 'Implementar Sistema de Login', 'Desenvolver sistema completo de autenticação', 'pending', 'high', 'Desenvolvimento', 'Sistema funcional', '["admin"]', 'feature/login', 'initial', '[]', 'Nenhuma'),
  ('card-2', 'sample-board-1', 'Em Progresso', 'Configurar Banco de Dados', 'Configurar PostgreSQL com migrations', 'in_progress', 'high', 'Infraestrutura', 'Banco configurado', '["admin"]', 'feature/database', 'setup', '[]', 'Nenhuma')
ON CONFLICT (card_id) DO NOTHING;

-- Inserir subtarefas de exemplo
INSERT INTO subtasks (card_id, title, description, status, priority, importance, tags, completed, completed_at) VALUES
  ('card-1', 'Criar componentes de login', 'Implementar formulários de login e registro', 'completed', 'medium', 'Média', '["React", "UI/UX"]', true, NOW()),
  ('card-1', 'Implementar validação de formulários', 'Adicionar validação client-side e server-side', 'pending', 'high', 'Alta', '["Validação", "Segurança"]', false, NULL)
ON CONFLICT DO NOTHING;`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Configuração do Banco</h1>
                <p className="text-blue-100 text-sm">Configure o PostgreSQL/Supabase</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            {migrationStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Configuração Concluída!</h3>
                    <p className="text-green-700 text-sm">O banco de dados foi configurado com sucesso.</p>
                  </div>
                </div>
              </div>
            )}

            {migrationStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Erro na Configuração</h3>
                    <p className="text-red-700 text-sm">Siga as instruções abaixo para configurar manualmente.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Instruções de Configuração</h3>
              <ol className="text-blue-700 text-sm space-y-2">
                <li>1. Acesse o painel do Supabase em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                <li>2. Vá para o seu projeto</li>
                <li>3. Acesse "SQL Editor" no menu lateral</li>
                <li>4. Clique em "New Query"</li>
                <li>5. Cole o SQL abaixo e execute</li>
              </ol>
            </div>

            {/* SQL Schema */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Schema SQL</span>
                </h3>
                <button
                  onClick={() => copyToClipboard(sqlSchema)}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </button>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs">{sqlSchema}</pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleMigration}
                disabled={isMigrating}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMigrating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Configurando...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Tentar Configuração Automática</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {showInstructions ? 'Ocultar' : 'Mostrar'} Detalhes
              </button>
            </div>

            {/* Additional Details */}
            {showInstructions && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-800">Detalhes Técnicos</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• O sistema usa Supabase como backend PostgreSQL</li>
                  <li>• Todas as tabelas são criadas com RLS (Row Level Security) habilitado</li>
                  <li>• Os dados de exemplo incluem usuário admin, quadro e cards</li>
                  <li>• Após a configuração, você pode acessar "Minhas Atividades" para ver os dados</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;

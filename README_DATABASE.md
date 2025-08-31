# Configuração do Banco de Dados PostgreSQL/Supabase

Este documento explica como configurar e integrar o PostgreSQL/Supabase com o aplicativo React.

## 📋 Pré-requisitos

1. **Conta no Supabase** (gratuita)
2. **Node.js** instalado
3. **npm** ou **yarn** instalado

## 🚀 Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Configure o projeto:
   - **Name**: `boodesk-react` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
6. Clique em "Create new project"

### 2. Obter Credenciais

1. No dashboard do Supabase, vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://your-project.supabase.co`)
   - **anon public** key

### 3. Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ Importante**: Substitua pelos valores reais do seu projeto Supabase.

### 4. Instalar Dependências

```bash
npm install @supabase/supabase-js
```

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

### Tabelas Principais

1. **users** - Usuários do sistema
2. **boards** - Quadros Kanban
3. **lists** - Listas dentro dos quadros
4. **cards** - Cards/tarefas
5. **subtasks** - Subtarefas dos cards
6. **activities** - Histórico de atividades
7. **chats** - Conversas do sistema
8. **chat_messages** - Mensagens dos chats
9. **user_settings** - Configurações dos usuários

### Tabelas de Gestão Empresarial

10. **departments** - Departamentos
11. **projects** - Projetos
12. **clients** - Clientes
13. **suppliers** - Fornecedores
14. **contracts** - Contratos
15. **invoices** - Faturas
16. **accounts_payable** - Contas a pagar
17. **accounts_receivable** - Contas a receber
18. **cash_flow** - Fluxo de caixa
19. **budgets** - Orçamentos
20. **financial_reports** - Relatórios financeiros

## 🔧 Configuração do Banco

### Método 1: Interface Web (Recomendado)

1. Inicie o aplicativo:
   ```bash
   npm start
   ```

2. Acesse: `http://localhost:3000/database-setup`

3. Clique em "Iniciar Configuração"

4. Aguarde a conclusão da migração

### Método 2: SQL Manual

Se preferir criar as tabelas manualmente, execute os seguintes comandos no SQL Editor do Supabase:

```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  cargo VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de quadros
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  board_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id),
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de listas
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  list_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  board_id UUID REFERENCES boards(board_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cards
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  card_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  board_id UUID REFERENCES boards(board_id) ON DELETE CASCADE,
  list_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  importance VARCHAR(50) DEFAULT 'medium',
  due_date DATE,
  subject VARCHAR(255),
  goal TEXT,
  members JSONB DEFAULT '[]',
  creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  git_branch VARCHAR(255),
  git_commit VARCHAR(255),
  history JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  recurrence VARCHAR(100) DEFAULT 'Nenhuma',
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de subtarefas
CREATE TABLE IF NOT EXISTS subtasks (
  id SERIAL PRIMARY KEY,
  card_id UUID REFERENCES cards(card_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  due_date DATE,
  estimated_time VARCHAR(50),
  actual_time VARCHAR(50),
  importance VARCHAR(50) DEFAULT 'Média',
  tags JSONB DEFAULT '[]',
  category VARCHAR(100),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de atividades
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  card_id UUID REFERENCES cards(card_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de chats
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  chat_type VARCHAR(50) NOT NULL,
  board_id INTEGER REFERENCES boards(id),
  card_id UUID REFERENCES cards(card_id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, setting_key)
);
```

## 🔐 Configuração de Segurança

### Row Level Security (RLS)

Para habilitar RLS nas tabelas:

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessário)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own boards" ON boards
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view cards in own boards" ON cards
  FOR SELECT USING (
    board_id IN (
      SELECT board_id FROM boards WHERE owner_id = auth.uid()
    )
  );
```

## 🧪 Testando a Integração

1. **Verificar Conexão**:
   - Acesse `/database-setup`
   - Clique em "Iniciar Configuração"
   - Verifique se não há erros

2. **Testar Funcionalidades**:
   - Crie um quadro em `/boards`
   - Adicione cards e subtarefas
   - Verifique se os dados persistem

3. **Verificar Dados**:
   - No Supabase Dashboard, vá para **Table Editor**
   - Verifique se as tabelas foram criadas
   - Confirme se os dados estão sendo inseridos

## 🐛 Solução de Problemas

### Erro de Conexão

1. Verifique as variáveis de ambiente
2. Confirme se o projeto Supabase está ativo
3. Verifique se as credenciais estão corretas

### Erro de Permissão

1. Verifique as políticas RLS
2. Confirme se o usuário tem permissões adequadas
3. Verifique se a autenticação está funcionando

### Erro de Tabela Não Encontrada

1. Execute a migração novamente
2. Verifique se as tabelas foram criadas no Supabase
3. Confirme se os nomes das tabelas estão corretos

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript)

## 🤝 Contribuição

Para contribuir com melhorias na integração do banco de dados:

1. Teste as mudanças localmente
2. Documente as alterações
3. Atualize este README se necessário
4. Crie um pull request com as mudanças

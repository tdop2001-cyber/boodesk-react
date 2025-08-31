# Sistema de Chat em Tempo Real - PostgreSQL

## 📋 Visão Geral

O sistema de chat em tempo real foi implementado no arquivo `app23a.py` e integrado ao banco de dados PostgreSQL. O sistema permite comunicação em tempo real entre usuários através de diferentes tipos de chat:

- **Chats de Quadro**: Comunicação específica por projeto/quadro
- **Chats de Cartão**: Comentários e discussões sobre cartões específicos
- **Chats Diretos**: Conversas privadas entre usuários

## 🏗️ Arquitetura

### Banco de Dados (PostgreSQL)

#### Tabelas Criadas:

1. **`chats`** - Armazena informações dos chats
   - `id`: ID único do chat
   - `name`: Nome do chat
   - `chat_type`: Tipo ('board', 'card', 'direct')
   - `board_id`: ID do quadro (para chats de quadro)
   - `card_id`: ID do cartão (para chats de cartão)
   - `created_by`: ID do usuário criador
   - `created_at`: Data de criação
   - `updated_at`: Data da última atualização
   - `is_active`: Status ativo/inativo

2. **`chat_messages`** - Armazena mensagens
   - `id`: ID único da mensagem
   - `chat_id`: ID do chat
   - `sender_id`: ID do remetente
   - `message`: Conteúdo da mensagem
   - `message_type`: Tipo ('text', 'file', 'image')
   - `file_path`: Caminho do arquivo (se aplicável)
   - `file_name`: Nome do arquivo
   - `file_size`: Tamanho do arquivo
   - `created_at`: Data de envio
   - `is_edited`: Se foi editada
   - `edited_at`: Data da edição
   - `is_deleted`: Soft delete

3. **`chat_participants`** - Participantes dos chats
   - `id`: ID único
   - `chat_id`: ID do chat
   - `user_id`: ID do usuário
   - `joined_at`: Data de entrada
   - `is_admin`: Se é administrador
   - `is_active`: Status ativo
   - `last_read_at`: Última leitura

4. **`chat_notifications`** - Notificações
   - `id`: ID único
   - `user_id`: ID do usuário
   - `chat_id`: ID do chat
   - `message_id`: ID da mensagem
   - `notification_type`: Tipo ('message', 'mention', 'reaction')
   - `is_read`: Se foi lida
   - `created_at`: Data de criação

### Classes Implementadas

#### 1. `ChatSystem` (Sistema Principal)
- **Localização**: Linha 5283
- **Responsabilidades**:
  - Gerenciar chats em tempo real
  - Atualizações automáticas a cada 2 segundos
  - Criação e gerenciamento de chats
  - Envio e recebimento de mensagens
  - Notificações de menções (@usuario)

#### 2. `BoardChatWindow` (Janela de Chat de Quadro)
- **Localização**: Linha 6265
- **Responsabilidades**:
  - Interface para chats de quadro/projeto
  - Exibição de mensagens em tempo real
  - Envio de mensagens
  - Busca no histórico
  - Visualização de participantes

#### 3. `CardCommentsWindow` (Janela de Comentários)
- **Localização**: Linha 6000
- **Responsabilidades**:
  - Interface para comentários de cartões
  - Exibição de comentários em tempo real
  - Adição de novos comentários
  - Atualização automática

#### 4. `DirectChatWindow` (Janela de Chat Direto)
- **Localização**: Linha 6125
- **Responsabilidades**:
  - Interface para chats diretos entre usuários
  - Conversas privadas
  - Envio de mensagens
  - Atualização em tempo real

## 🚀 Funcionalidades

### 1. Aba Principal de Chat
- **Localização**: Método `create_chat_tab()` na linha 10850
- **Funcionalidades**:
  - Lista de todos os chats do usuário
  - Chats por quadro disponíveis
  - Lista de usuários online
  - Sistema de notificações
  - Criação de novos chats diretos

### 2. Sistema de Tempo Real
- **Atualizações automáticas** a cada 2 segundos
- **Notificações em tempo real** para novas mensagens
- **Sincronização automática** entre janelas abertas
- **Indicadores de mensagens não lidas**

### 3. Tipos de Chat

#### Chat de Quadro
```python
# Abrir chat de um quadro
self.chat_system.open_project_chat("Nome do Quadro")
```

#### Chat de Cartão
```python
# Abrir comentários de um cartão
self.chat_system.open_card_comments(card_id, "Título do Cartão")
```

#### Chat Direto
```python
# Iniciar chat direto com usuário
self.chat_system.open_direct_chat(user_id, "username")
```

### 4. Sistema de Menções
- **Sintaxe**: `@usuario`
- **Notificações automáticas** para usuários mencionados
- **Destaque visual** das menções nas mensagens

### 5. Busca e Histórico
- **Busca em tempo real** no histórico de mensagens
- **Filtros por usuário e conteúdo**
- **Paginação** de mensagens antigas

## 🔧 Configuração

### 1. Banco de Dados PostgreSQL
O sistema está configurado para usar PostgreSQL através da classe `DatabasePostgres`:

```python
# Configuração no app23a.py
self.db = Database('postgresql')
```

### 2. Tabelas
As tabelas são criadas automaticamente no método `create_tables()` da classe `DatabasePostgres`.

### 3. Inicialização
O sistema é inicializado automaticamente na classe `BoodeskApp`:

```python
self.chat_system = ChatSystem(self)
```

## 📱 Interface do Usuário

### Aba Principal de Chat
- **Lista de Chats**: Todos os chats do usuário com ícones por tipo
- **Chats por Quadro**: Lista de quadros disponíveis para chat
- **Usuários Online**: Lista de usuários para chat direto
- **Notificações**: Indicador de mensagens não lidas

### Janelas de Chat
- **Área de mensagens** com scroll automático
- **Campo de entrada** com suporte a Enter para enviar
- **Botões de ação**: Enviar, Buscar, Participantes
- **Indicadores visuais** de status

## 🔄 Atualizações em Tempo Real

### Sistema de Polling
- **Intervalo**: 2 segundos
- **Funcionalidades**:
  - Verificação de novas mensagens
  - Atualização de notificações
  - Sincronização de janelas abertas
  - Marcação automática de mensagens como lidas

### Notificações
- **Tipos**: Mensagens, Menções, Reações
- **Indicadores visuais** na interface
- **Contador de não lidas**
- **Sistema de badges**

## 🛡️ Segurança

### Controle de Acesso
- **Verificação de participação** nos chats
- **Permissões por tipo de chat**
- **Validação de usuário** para envio de mensagens

### Soft Delete
- **Mensagens não são excluídas permanentemente**
- **Flag `is_deleted`** para controle
- **Histórico preservado** para auditoria

## 📊 Performance

### Otimizações Implementadas
- **Índices no banco** para consultas rápidas
- **Limite de mensagens** carregadas (padrão: 50)
- **Cache de dados** em memória
- **Atualizações incrementais**

### Monitoramento
- **Logs de erro** detalhados
- **Métricas de performance**
- **Tratamento de exceções** robusto

## 🚀 Como Usar

### 1. Acessar o Chat
1. Abra a aplicação
2. Vá para a aba "Chat"
3. Veja seus chats disponíveis

### 2. Abrir Chat de Quadro
1. Selecione um quadro na lista "Chats por Quadro"
2. Clique em "Abrir Chat do Quadro"
3. Envie mensagens e veja em tempo real

### 3. Comentar em Cartão
1. Abra um cartão
2. Clique no botão de comentários
3. Adicione comentários que aparecem em tempo real

### 4. Chat Direto
1. Selecione um usuário na lista
2. Clique em "Iniciar Chat Direto"
3. Converse em privado

### 5. Menções
- Use `@usuario` em suas mensagens
- O usuário será notificado automaticamente

## 🔧 Manutenção

### Backup
- **Dados salvos no PostgreSQL**
- **Backup automático** recomendado
- **Migração de dados** suportada

### Logs
- **Logs de erro** no console
- **Logs de atividade** no banco
- **Monitoramento** de performance

## 📈 Futuras Melhorias

### Funcionalidades Planejadas
- **Upload de arquivos** nas mensagens
- **Emojis e reações**
- **Chats em grupo** (mais de 2 usuários)
- **Notificações push** externas
- **Criptografia** de mensagens
- **Moderação** de conteúdo

### Integrações
- **Webhooks** para notificações externas
- **API REST** para integração
- **Mobile app** nativo
- **Integração com email**

## ✅ Status da Implementação

- ✅ **Banco de dados PostgreSQL** configurado
- ✅ **Tabelas criadas** com índices
- ✅ **Sistema de chat** implementado
- ✅ **Interface de usuário** completa
- ✅ **Tempo real** funcionando
- ✅ **Notificações** implementadas
- ✅ **Menções** funcionando
- ✅ **Busca** implementada
- ✅ **Aba principal** criada
- ✅ **Integração** com sistema existente

## 🎯 Conclusão

O sistema de chat em tempo real foi implementado com sucesso no arquivo `app23a.py`, integrado ao PostgreSQL e oferece uma experiência completa de comunicação em tempo real para os usuários da aplicação Boodesk.

O sistema é robusto, escalável e pronto para uso em produção, com todas as funcionalidades básicas implementadas e preparado para futuras expansões.

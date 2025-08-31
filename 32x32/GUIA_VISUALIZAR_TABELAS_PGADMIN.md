# 📊 Guia para Visualizar Tabelas no pgAdmin

## 🎯 **COMO VER AS TABELAS NO PGADMIN**

### 1. 📂 **Expandir a Estrutura do Banco**
```
boodesk_db (clique para expandir)
└── Schemas (clique para expandir)
    └── public (clique para expandir)
        └── Tables (AQUI ESTÃO AS TABELAS!)
```

### 2. 📋 **Tabelas Disponíveis no Boodesk**
- ✅ **users** - Usuários do sistema
- ✅ **boards** - Quadros do Trello
- ✅ **lists** - Listas dos quadros
- ✅ **cards** - Cartões das listas
- ✅ **comments** - Comentários dos cartões
- ✅ **attachments** - Anexos dos cartões
- ✅ **pomodoro_tasks** - Tarefas do Pomodoro

## 🔍 **COMO VISUALIZAR OS DADOS**

### 📊 **Método 1: Visualizar Dados Diretamente**
1. Clique com botão direito na tabela desejada
2. Selecione: **"View/Edit Data"** → **"All Rows"**
3. Os dados aparecerão em formato de tabela

### 📊 **Método 2: Usar Query Tool**
1. Clique em **"Tools"** → **"Query Tool"**
2. Digite: `SELECT * FROM nome_da_tabela;`
3. Pressione **F5** ou clique em **"Execute"**

## 📝 **EXEMPLOS DE CONSULTAS ÚTEIS**

### 🔍 **Ver todas as tabelas:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 👥 **Ver usuários:**
```sql
SELECT * FROM users;
```

### 📋 **Ver quadros:**
```sql
SELECT * FROM boards;
```

### 📊 **Ver cartões:**
```sql
SELECT * FROM cards;
```

### ⏰ **Ver tarefas Pomodoro:**
```sql
SELECT * FROM pomodoro_tasks;
```

### 📈 **Contar registros em cada tabela:**
```sql
SELECT 'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'boards', COUNT(*) FROM boards
UNION ALL
SELECT 'cards', COUNT(*) FROM cards
UNION ALL
SELECT 'pomodoro_tasks', COUNT(*) FROM pomodoro_tasks;
```

## 🏗️ **COMO VER A ESTRUTURA DAS TABELAS**

### 📋 **Ver colunas de uma tabela:**
1. Clique com botão direito na tabela
2. Selecione **"Properties"**
3. Vá na aba **"Columns"**

### 🔍 **Ou use SQL:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'nome_da_tabela';
```

## 🎯 **PASSOS RÁPIDOS PARA VER SUAS TABELAS**

1. **No pgAdmin, expanda:**
   - `boodesk_db`
   - `Schemas`
   - `public`
   - `Tables`

2. **Você verá as 7 tabelas listadas**

3. **Para ver dados:**
   - Clique com botão direito na tabela
   - `View/Edit Data` → `All Rows`

4. **Para ver estrutura:**
   - Clique com botão direito na tabela
   - `Properties` → aba `Columns`

## 💡 **DICAS IMPORTANTES**

- ✅ **Dados atuais:** A maioria das tabelas está vazia (pronta para uso)
- ✅ **Tabela users:** Deve ter pelo menos 1 registro (admin)
- ✅ **Interface intuitiva:** pgAdmin mostra dados em formato de tabela
- ✅ **Edição direta:** Você pode editar dados diretamente na interface
- ✅ **Filtros:** Use a barra de pesquisa para filtrar dados

## 🚀 **PRÓXIMOS PASSOS**

Agora que você pode ver as tabelas:
1. **Explore os dados** em cada tabela
2. **Teste consultas SQL** no Query Tool
3. **Monitore** quando o app salvar novos dados
4. **Faça backup** regular dos dados importantes

**Seu banco PostgreSQL está totalmente funcional e visual!** 🎉




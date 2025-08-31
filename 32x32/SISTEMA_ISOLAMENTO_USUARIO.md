# 🔐 SISTEMA DE ISOLAMENTO POR USUÁRIO - BOODESK

## 🎯 VISÃO GERAL

O **Boodesk** implementa um sistema rigoroso de isolamento por usuário, garantindo que cada usuário veja apenas seus próprios dados, com exceção dos administradores que possuem acesso amplo.

---

## 👤 **TIPOS DE USUÁRIO**

### **👤 USUÁRIO COMUM**
- **Acesso**: Limitado aos próprios dados
- **Visualização**: Apenas quadros/cards onde participa
- **Edição**: Apenas suas próprias subtasks
- **Chats**: Apenas conversas onde participa
- **Uploads**: Apenas seus arquivos

### **👑 ADMINISTRADOR**
- **Acesso**: Completo a todos os dados
- **Visualização**: Todos os quadros, cards, usuários
- **Edição**: Qualquer elemento do sistema
- **Gerenciamento**: Usuários, configurações, logs

---

## 📊 **ISOLAMENTO POR FUNCIONALIDADE**

### **🏠 QUADROS (BOARDS)**
```sql
-- Usuário comum vê apenas:
SELECT * FROM boards WHERE 
    id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
    OR owner_id = auth.uid()

-- Admin vê todos:
SELECT * FROM boards
```

**Comportamento:**
- ✅ Ver quadros onde participa
- ✅ Ver quadros que criou
- ❌ Ver quadros de outros usuários
- 👑 Admin vê todos os quadros

### **📋 CARDS**
```sql
-- Usuário comum vê apenas:
SELECT * FROM cards WHERE 
    id IN (SELECT card_id FROM card_members WHERE user_id = auth.uid())
    OR list_id IN (
        SELECT list_id FROM lists WHERE board_id IN (
            SELECT board_id FROM board_members WHERE user_id = auth.uid()
        )
    )

-- Admin vê todos:
SELECT * FROM cards
```

**Comportamento:**
- ✅ Ver cards onde participa
- ✅ Ver cards de quadros onde participa
- ❌ Ver cards de outros usuários
- 👑 Admin vê todos os cards

### **✅ SUBTASKS**
```sql
-- Usuário comum vê todas as subtasks do card, mas só edita as suas:
SELECT * FROM subtasks WHERE 
    card_id IN (SELECT card_id FROM card_members WHERE user_id = auth.uid())

-- Edição apenas das próprias:
UPDATE subtasks SET ... WHERE 
    id = subtask_id AND created_by = auth.uid()
```

**Comportamento:**
- ✅ Ver todas as subtasks do card (leitura)
- ✅ Editar suas próprias subtasks
- ❌ Editar subtasks de outros
- 👑 Admin edita qualquer subtask

### **💬 CHATS E MENSAGENS**
```sql
-- Chats privados:
SELECT * FROM chats WHERE 
    user1_id = auth.uid() OR user2_id = auth.uid()

-- Mensagens:
SELECT * FROM messages WHERE 
    sender_id = auth.uid() OR receiver_id = auth.uid()
```

**Comportamento:**
- ✅ Ver chats onde participa
- ✅ Ver suas mensagens
- ✅ Ver mensagens direcionadas a ele
- ❌ Ver chats de outros usuários
- 👑 Admin vê todos os chats

### **📁 UPLOADS E ARQUIVOS**
```sql
-- Uploads pessoais:
SELECT * FROM attachments WHERE 
    uploaded_by = auth.uid()

-- Uploads de cards (somente leitura):
SELECT * FROM attachments WHERE 
    card_id IN (SELECT card_id FROM card_members WHERE user_id = auth.uid())
```

**Comportamento:**
- ✅ Ver seus próprios uploads
- ✅ Ver uploads de cards onde participa (leitura)
- ❌ Ver uploads de outros usuários
- 👑 Admin vê todos os uploads

### **📝 ANOTAÇÕES E DADOS PESSOAIS**
```sql
-- Anotações pessoais:
SELECT * FROM notes WHERE 
    user_id = auth.uid()

-- Preferências pessoais:
SELECT * FROM user_preferences WHERE 
    user_id = auth.uid()

-- Histórico pessoal:
SELECT * FROM activities WHERE 
    user_id = auth.uid()
```

**Comportamento:**
- ✅ Ver suas anotações
- ✅ Ver suas preferências
- ✅ Ver seu histórico
- ❌ Ver dados de outros usuários
- 👑 Admin vê todos os dados

---

## 🔒 **IMPLEMENTAÇÃO TÉCNICA**

### **📋 RLS (ROW LEVEL SECURITY)**

#### **1. HABILITAR RLS**
```sql
-- Em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
```

#### **2. POLÍTICAS DE ACESSO**
```sql
-- Exemplo: Política para boards
CREATE POLICY "boards_user_access" ON boards
    FOR ALL USING (
        id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
        OR owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
```

### **🔧 FUNÇÕES DE VERIFICAÇÃO**
```sql
-- Verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar acesso ao card
CREATE OR REPLACE FUNCTION has_card_access(card_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM card_members 
        WHERE card_id = card_id_param AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎯 **REGRAS DE DESENVOLVIMENTO**

### **✅ SEMPRE IMPLEMENTAR**
1. **RLS em todas as tabelas** com dados sensíveis
2. **Verificação de permissões** em todas as operações
3. **Filtros por usuário** em todas as consultas
4. **Validação de acesso** antes de operações
5. **Logs de auditoria** para ações sensíveis

### **❌ NUNCA PERMITIR**
1. **Acesso sem autenticação**
2. **Exposição de dados de outros usuários**
3. **Operações sem verificação de permissão**
4. **Bypass das políticas RLS**
5. **Hardcode de IDs de usuário**

### **🔍 VALIDAÇÕES OBRIGATÓRIAS**
```python
# Exemplo de validação no código
def get_user_boards(user_id):
    # Sempre verificar se o usuário está autenticado
    if not current_user.is_authenticated:
        raise PermissionError("Usuário não autenticado")
    
    # Sempre filtrar por usuário
    return db.query(Board).join(BoardMember).filter(
        BoardMember.user_id == user_id
    ).all()

def update_subtask(subtask_id, user_id, data):
    # Verificar se o usuário pode editar
    subtask = db.query(Subtask).filter(
        Subtask.id == subtask_id,
        Subtask.created_by == user_id
    ).first()
    
    if not subtask:
        raise PermissionError("Sem permissão para editar esta subtask")
    
    # Atualizar apenas se for o criador
    subtask.update(data)
```

---

## 🚀 **TESTES DE SEGURANÇA**

### **🧪 TESTES OBRIGATÓRIOS**
```python
def test_user_isolation():
    # Testar que usuário A não vê dados do usuário B
    user_a = create_user("user_a")
    user_b = create_user("user_b")
    
    # Criar dados para user_b
    board_b = create_board(user_b.id, "Board B")
    
    # User A não deve ver o board de B
    boards_a = get_user_boards(user_a.id)
    assert board_b not in boards_a

def test_admin_access():
    # Testar que admin vê todos os dados
    admin = create_admin_user()
    user = create_user("user")
    
    # Admin deve ver dados do usuário
    all_boards = get_all_boards(admin.id)
    user_boards = get_user_boards(user.id)
    
    assert all(user_boards).issubset(all_boards)
```

---

## 📚 **REFERÊNCIAS**

- **Arquivo principal**: `.cursorrules`
- **Manuais completos**: `BOODESK_MANUAIS/`
- **Implementação RLS**: `supabase/migrations/`
- **Testes**: `tests/security/`

---

**🔐 O isolamento por usuário é FUNDAMENTAL para a segurança do Boodesk!**

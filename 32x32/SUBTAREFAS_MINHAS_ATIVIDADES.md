# Subtarefas na Tela Minhas Atividades - Boodesk

## 🎯 Objetivo

Implementar a exibição de subtarefas na tela "Minhas Atividades", organizadas por cards e filtradas apenas para o usuário logado, com armazenamento no banco de dados SQLite.

## ✅ Implementações Realizadas

### 1. **Migração de Subtarefas para Banco de Dados**

#### Método de Migração:
```python
def migrate_subtasks_to_database(self):
    """Migra subtarefas existentes do JSON para o banco de dados"""
    try:
        import sqlite3
        from datetime import datetime
        
        conn = sqlite3.connect('boodesk_new.db')
        cursor = conn.cursor()
        
        # Verificar se já existem subtarefas no banco
        cursor.execute("SELECT COUNT(*) FROM subtasks")
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"Já existem {existing_count} subtarefas no banco de dados. Pulando migração.")
            conn.close()
            return
        
        print("Iniciando migração de subtarefas do JSON para o banco de dados...")
        
        migrated_count = 0
        
        # Percorrer todos os cards e suas subtarefas
        for board_name, lists in self.boodesk_data["boards"].items():
            if board_name == "workflow": 
                continue
                
            for list_name, cards in lists.items():
                for card in cards:
                    card_id = card.get('card_id')
                    if not card_id:
                        continue
                        
                    subtasks = card.get('subtasks', [])
                    if subtasks:
                        for i, subtask in enumerate(subtasks):
                            try:
                                cursor.execute("""
                                    INSERT INTO subtasks (card_id, text, desc, completed, position, created_at)
                                    VALUES (?, ?, ?, ?, ?, ?)
                                """, (
                                    card_id,
                                    subtask.get('text', ''),
                                    subtask.get('desc', ''),
                                    subtask.get('completed', False),
                                    i,
                                    datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                                ))
                                migrated_count += 1
                            except Exception as e:
                                print(f"Erro ao migrar subtarefa do card {card_id}: {e}")
        
        conn.commit()
        conn.close()
        
        print(f"Migração concluída! {migrated_count} subtarefas migradas para o banco de dados.")
        
    except Exception as e:
        print(f"Erro durante a migração de subtarefas: {e}")
        if 'conn' in locals():
            conn.close()
```

### 2. **Métodos de Busca de Subtarefas**

#### Busca de Subtarefas por Card:
```python
def get_subtasks_for_card(self, card_id):
    """Busca subtarefas do banco de dados para um card específico"""
    try:
        import sqlite3
        conn = sqlite3.connect('boodesk_new.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, text, desc, completed, position, created_at
            FROM subtasks 
            WHERE card_id = ? 
            ORDER BY position, created_at
        """, (card_id,))
        
        subtasks = []
        for row in cursor.fetchall():
            subtask = {
                'id': row[0],
                'text': row[1],
                'desc': row[2],
                'completed': bool(row[3]),
                'position': row[4],
                'created_at': row[5]
            }
            subtasks.append(subtask)
        
        conn.close()
        return subtasks
        
    except Exception as e:
        print(f"Erro ao buscar subtarefas para card {card_id}: {e}")
        return []
```

#### Busca de Subtarefa Específica:
```python
def get_subtask_by_id(self, subtask_id):
    """Busca uma subtarefa específica do banco de dados"""
    try:
        import sqlite3
        conn = sqlite3.connect('boodesk_new.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, card_id, text, desc, completed, position, created_at
            FROM subtasks 
            WHERE id = ?
        """, (subtask_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row[0],
                'card_id': row[1],
                'text': row[2],
                'desc': row[3],
                'completed': bool(row[4]),
                'position': row[5],
                'created_at': row[6]
            }
        return None
        
    except Exception as e:
        print(f"Erro ao buscar subtarefa {subtask_id}: {e}")
        return None
```

### 3. **Atualização da Tela Minhas Atividades**

#### Método `update_my_activities_tab` Melhorado:
```python
def update_my_activities_tab(self):
    """Atualiza a aba 'Minhas Atividades' com os cards e subtarefas do usuário logado"""
    for i in self.activities_tree.get_children():
        self.activities_tree.delete(i)

    if not self.current_user:
        print("DEBUG: Nenhum usuário logado")
        return

    # Obter o membro associado ao usuário logado
    current_user_member = self._get_current_user_member()
    if not current_user_member:
        print(f"DEBUG: Usuário {self.current_user.username} não tem membro associado")
        return

    print(f"DEBUG: Carregando atividades para o membro: {current_user_member}")
    all_cards = self.get_all_cards()

    # Filtrar cards baseado no papel do usuário
    if hasattr(self.current_user, 'role') and self.current_user.role in ['admin', 'Administrador']:
        # Administradores veem todos os cards
        user_cards = all_cards
        print(f"DEBUG: Administrador - mostrando todos os {len(user_cards)} cards")
    else:
        # Usuários normais veem apenas cards onde são membros
        user_cards = [
            card_info for card_info in all_cards
            if current_user_member in card_info['card'].get('members', []) and
            not card_info['card'].get("is_archived", False)
        ]
        print(f"DEBUG: Usuário normal - mostrando {len(user_cards)} cards do membro {current_user_member}")

    # Contadores para estatísticas
    total_cards = 0
    total_subtasks = 0
    completed_subtasks = 0

    for card_info in user_cards:
        card = card_info['card']
        card_id = card.get('card_id')
        if not card_id:
            continue

        importance_tag = card.get("importance", "Normal")
        
        # Buscar subtarefas do banco de dados para este card
        subtasks = self.get_subtasks_for_card(card_id)
        has_subtasks_indicator = f"({len(subtasks)})" if subtasks else ""

        # Insert the parent card, using its card_id as the iid and in the tags
        self.activities_tree.insert(
            "", "end",
            iid=card_id,
            values=("Tarefa", card['title'], has_subtasks_indicator),
            tags=(card_id, importance_tag)
        )
        total_cards += 1

        # Add subtasks from database, also tagging them with the parent card_id
        if subtasks:
            for subtask in subtasks:
                subtask_id = subtask.get('id')
                if subtask_id:
                    # Determinar status da subtarefa
                    status_icon = "✓" if subtask.get('completed') else "○"
                    subtask_text = f"{status_icon} {subtask.get('text', '')}"
                    
                    self.activities_tree.insert(
                        card_id, "end",
                        iid=f"subtask_{subtask_id}",
                        values=("Subtarefa", subtask_text, ""),
                        tags=(card_id, "subtask")
                    )
                    total_subtasks += 1
                    if subtask.get('completed'):
                        completed_subtasks += 1

    print(f"DEBUG: Carregadas {total_cards} tarefas e {total_subtasks} subtarefas ({completed_subtasks} concluídas)")
```

### 4. **Interação com Subtarefas**

#### Duplo Clique em Subtarefas:
```python
def on_activity_double_click(self, event):
    item_id = self.activities_tree.identify_row(event.y)
    if not item_id:
        return

    item_type = self.activities_tree.item(item_id, "values")[0]
    if item_type == "Subtarefa":
        # Extrair o ID da subtarefa do item_id (formato: "subtask_123")
        if item_id.startswith("subtask_"):
            subtask_id = int(item_id.split("_")[1])
            subtask = self.get_subtask_by_id(subtask_id)
            if subtask:
                # Buscar o card pai
                card = self.find_card_by_id(subtask['card_id'])
                if card:
                    SubtaskEditorWindow(self.root, self, card, subtask)
        else:
            # Fallback para o método antigo
            parent_id = self.activities_tree.parent(item_id)
            card = self.find_card_by_id(parent_id)
            subtask = self.find_subtask_by_id(card, item_id)
            if card and subtask:
                SubtaskEditorWindow(self.root, self, card, subtask)
```

### 5. **Exibição de Detalhes das Subtarefas**

#### Método `on_activity_select` Atualizado:
```python
# --- Populate Subtasks with formatting ---
self.activity_subtasks_text.tag_configure("bold", font=bold_font)
# Buscar subtarefas do banco de dados
subtasks = self.get_subtasks_for_card(card_id)
if not subtasks:
    self.activity_subtasks_text.insert("1.0", "Nenhuma subtarefa.")
else:
    # Contadores para estatísticas
    completed_count = sum(1 for s in subtasks if s.get('completed'))
    total_count = len(subtasks)
    self.activity_subtasks_text.insert(tk.END, f"Progresso: {completed_count}/{total_count} subtarefas concluídas\n\n", "bold")
    
    for subtask in subtasks:
        status = "✓" if subtask.get('completed') else "○"
        self.activity_subtasks_text.insert(tk.END, f"{status} ")
        self.activity_subtasks_text.insert(tk.END, f"{subtask.get('text', '')}\n", "bold")
        if subtask.get('desc'):
            self.activity_subtasks_text.insert(tk.END, f"  - {subtask.get('desc')}\n")
        # Adicionar data de criação se disponível
        if subtask.get('created_at'):
            self.activity_subtasks_text.insert(tk.END, f"  Criada em: {subtask.get('created_at')}\n")
        self.activity_subtasks_text.insert(tk.END, "\n")
```

## 🎨 Interface Visual

### Layout Atualizado da Tela "Minhas Atividades":
```
┌─────────────────────────────────────────────────────────────────┐
│ Sistema Boodesk - admin (Administrador)                        │
├─────────────────────────────────────────────────────────────────┤
│ [🏠 Menu Principal] [📁 Quadros] [▶️ Produtividade] [💰 Finanças] │
│ [📅 Calendário] [📊 Gráfico de Gantt] [📈 Dashboard Executivo]  │
├─────────────────────────────────────────────────────────────────┤
│ [Timer Pomodoro] [Minhas Atividades] ← Selecionado              │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┬─────────────────────────────────────────────┐ │
│ │ Tipo  │ Título  │ Sub                                         │ │
│ ├─────────────────┼─────────────────────────────────────────────┤ │
│ │ Tarefa│ Card 1  │ (3)                                         │ │
│ │ Subtarefa│ ○ Subtarefa 1                                      │ │
│ │ Subtarefa│ ✓ Subtarefa 2                                      │ │
│ │ Subtarefa│ ○ Subtarefa 3                                      │ │
│ │ Tarefa│ Card 2  │ (1)                                         │ │
│ │ Subtarefa│ ○ Subtarefa 1                                      │ │
│ └─────────────────┴─────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ -Detalhes da Atividade-                                     │ │
│ │ Descrição: [Conteúdo da descrição]                          │ │
│ │ Prazo: [Data de vencimento]                                 │ │
│ │ Membros: [Lista de membros]                                 │ │
│ │ Dependências: [Lista de dependências]                       │ │
│ │                                                             │ │
│ │ Progresso: 1/3 subtarefas concluídas                        │ │
│ │                                                             │ │
│ │ ○ Subtarefa 1                                               │ │
│ │   - Descrição da subtarefa 1                                │ │
│ │   Criada em: 2024-12-20 10:30:00                            │ │
│ │                                                             │ │
│ │ ✓ Subtarefa 2                                               │ │
│ │   - Descrição da subtarefa 2                                │ │
│ │   Criada em: 2024-12-20 11:15:00                            │ │
│ │                                                             │ │
│ │ ○ Subtarefa 3                                               │ │
│ │   - Descrição da subtarefa 3                                │ │
│ │   Criada em: 2024-12-20 14:20:00                            │ │
│ │                                                             │ │
│ │ [→ Ir para o Quadro] [🃏 Abrir Card]                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Modificações Técnicas

### 1. **Estrutura do Banco de Dados**

#### Tabela `subtasks`:
```sql
CREATE TABLE IF NOT EXISTS subtasks (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    desc TEXT,
    completed BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### 2. **Filtragem por Usuário**

#### Critérios de Filtragem:
- **Cards**: Apenas cards onde o usuário é membro
- **Subtarefas**: Todas as subtarefas dos cards filtrados
- **Arquivados**: Cards arquivados são excluídos
- **Papel do Usuário**: Administradores veem todos os cards

### 3. **Organização Hierárquica**

#### Estrutura da Árvore:
- **Nível 1**: Cards (Tarefas)
- **Nível 2**: Subtarefas (filhas dos cards)
- **Indicadores**: Número de subtarefas por card
- **Status Visual**: Ícones de conclusão (✓/○)

### 4. **Sistema de Migração**

#### Processo de Migração:
1. **Verificação**: Confirma se já existem subtarefas no banco
2. **Leitura**: Percorre todos os cards do JSON
3. **Conversão**: Migra subtarefas para o banco SQLite
4. **Preservação**: Mantém dados originais (texto, descrição, status)
5. **Ordenação**: Define posição baseada na ordem original

## 🚀 Benefícios da Mudança

### Para o Usuário:
- ✅ **Visão Completa**: Vê todas as subtarefas dos seus cards
- ✅ **Organização Hierárquica**: Subtarefas organizadas por card
- ✅ **Status Visual**: Identificação rápida de subtarefas concluídas
- ✅ **Progresso**: Contadores de progresso por card
- ✅ **Detalhes Completos**: Informações detalhadas das subtarefas

### Para o Sistema:
- ✅ **Performance**: Busca otimizada no banco de dados
- ✅ **Escalabilidade**: Suporte a grandes volumes de subtarefas
- ✅ **Integridade**: Relacionamentos consistentes no banco
- ✅ **Migração Automática**: Conversão automática de dados existentes
- ✅ **Filtragem Eficiente**: Apenas dados relevantes ao usuário

## 📋 Requisitos Técnicos

### Banco de Dados:
- **Tabela `subtasks`**: Estrutura completa para armazenar subtarefas
- **Relacionamentos**: `subtasks.card_id` → `cards.id`
- **Índices**: Para otimização de consultas
- **Integridade**: Cascade delete para limpeza automática

### Sistema de Usuários:
- **Login Funcional**: Usuário deve estar logado
- **Associação Membro**: Usuário deve ter membro associado
- **Permissões**: Baseadas no papel do usuário

## 🎯 Resultado Esperado

Após as modificações:

1. **Subtarefas Organizadas**: Exibição hierárquica por cards
2. **Filtragem Inteligente**: Apenas dados do usuário logado
3. **Status Visual**: Indicadores claros de progresso
4. **Detalhes Completos**: Informações completas das subtarefas
5. **Migração Automática**: Conversão de dados existentes

## 📁 Arquivos Modificados

1. **`app23a.py`**:
   - Adicionado método `migrate_subtasks_to_database`
   - Adicionado método `get_subtasks_for_card`
   - Adicionado método `get_subtask_by_id`
   - Melhorado método `update_my_activities_tab`
   - Atualizado método `on_activity_double_click`
   - Atualizado método `on_activity_select`
   - Integrada migração no `__init__`

## 🔄 Compatibilidade

### ✅ **Mantido**:
- Todas as funcionalidades existentes
- Estrutura da tela "Minhas Atividades"
- Sistema de navegação e detalhes
- Funcionalidades de edição de subtarefas

### 🆕 **Adicionado**:
- Exibição de subtarefas organizadas por cards
- Filtragem por usuário logado
- Migração automática de dados
- Busca otimizada no banco de dados
- Indicadores visuais de progresso

## 📊 Impacto da Mudança

### Antes:
- **Subtarefas**: Não exibidas na tela
- **Organização**: Apenas cards principais
- **Dados**: Armazenados em JSON
- **Filtragem**: Apenas cards do usuário

### Depois:
- **Subtarefas**: Exibidas hierarquicamente
- **Organização**: Cards + subtarefas aninhadas
- **Dados**: Armazenados no banco SQLite
- **Filtragem**: Cards e subtarefas do usuário

## 📍 Localizações das Modificações

### 1. **Métodos de Banco de Dados**:
- Localização: Classe `BoodeskApp`
- Função: Busca e migração de subtarefas

### 2. **Atualização da Interface**:
- Localização: Método `update_my_activities_tab`
- Função: Exibição hierárquica de cards e subtarefas

### 3. **Interação com Subtarefas**:
- Localização: Métodos `on_activity_double_click` e `on_activity_select`
- Função: Edição e visualização de detalhes

### 4. **Migração Automática**:
- Localização: Método `__init__`
- Função: Conversão de dados na inicialização

---

**Status**: ✅ Implementado
**Versão**: 2.2
**Data**: Dezembro 2024

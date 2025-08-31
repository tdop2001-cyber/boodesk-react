# 📅 Sincronização Automática com Google Calendar

## 🎯 **Funcionalidade Implementada**

### **Sincronização Automática de Cards**
- **Quando um card é criado** com data de vencimento → **Evento criado automaticamente no Google Calendar**
- **Quando um card é editado** com data de vencimento → **Evento atualizado no Google Calendar**
- **Formato brasileiro de data** → **Totalmente suportado**

## ✅ **Como Funciona**

### **1. Criação de Card**
```python
# 1. Usuário cria um novo card
# 2. Define título, descrição, data de vencimento, etc.
# 3. Salva o card
# 4. Sistema automaticamente:
#    - Verifica se Google Calendar está habilitado
#    - Verifica se há data de vencimento
#    - Cria evento no Google Calendar
#    - Adiciona ao histórico do card
```

### **2. Edição de Card**
```python
# 1. Usuário edita um card existente
# 2. Modifica data de vencimento ou outros campos
# 3. Salva o card
# 4. Sistema automaticamente:
#    - Verifica se Google Calendar está habilitado
#    - Verifica se há data de vencimento
#    - Atualiza evento no Google Calendar
#    - Adiciona ao histórico do card
```

## 🔧 **Detalhes Técnicos**

### **Funções de Sincronização**

#### **`_sync_new_card_to_calendar(card, board_name, list_name)`**
```python
def _sync_new_card_to_calendar(self, card, board_name, list_name):
    """Sincroniza um card recém-criado com o Google Calendar"""
    # Verifica autenticação do Google Calendar
    # Processa data brasileira
    # Cria evento com informações completas do card
    # Adiciona ao histórico
```

#### **`_sync_card_to_calendar()` (CardWindow)**
```python
def _sync_card_to_calendar(self):
    """Sincroniza o card com o Google Calendar"""
    # Verifica autenticação do Google Calendar
    # Processa data brasileira
    # Cria/atualiza evento
    # Adiciona ao histórico
```

### **Processamento de Data Brasileira**
```python
# Usa função auxiliar para processar qualquer formato
event_datetime = self.parse_brazilian_date(card['due_date'])

# Formatos suportados:
# - "12/08/2025" (brasileiro)
# - "12/08/2025 14:30" (brasileiro com hora)
# - "2025-08-12" (americano)
# - "2025-08-12 14:30" (americano com hora)
```

### **Estrutura do Evento no Google Calendar**
```python
event_title = f"📋 {card['title']}"
event_description = f"""
Card: {card['title']}
Descrição: {card.get('desc', 'Sem descrição')}
Importância: {card.get('importance', 'Normal')}
Assunto: {card.get('subject', '-')}
Objetivo: {card.get('goal', '-')}
Membros: {', '.join(card.get('members', []))}
Board: {board_name}
Lista: {list_name}
Card ID: {card_id}
""".strip()
```

## 🎯 **Configuração Necessária**

### **1. Habilitar Google Calendar**
```json
{
  "google_calendar_enabled": true,
  "google_calendar": {
    "auth_type": "json",
    "credentials_file": "path/to/credentials.json",
    "calendar_id": "primary"
  }
}
```

### **2. Autenticação**
- Configurar credenciais do Google Calendar
- Autenticar na primeira execução
- Tokens salvos automaticamente

## 📊 **Fluxo de Sincronização**

### **Criação de Card:**
```
1. Usuário clica "Adicionar Card"
2. Preenche informações (incluindo data de vencimento)
3. Salva o card
4. handle_card_window_closed() é chamada
5. _sync_new_card_to_calendar() é executada
6. Evento criado no Google Calendar
7. Histórico atualizado
```

### **Edição de Card:**
```
1. Usuário edita card existente
2. Modifica data de vencimento
3. Salva o card
4. save_card() é chamada
5. _sync_card_to_calendar() é executada
6. Evento atualizado no Google Calendar
7. Histórico atualizado
```

## 🎯 **Formatos de Data Suportados**

### **✅ Formatos Brasileiros (Prioridade):**
- `12/08/2025` - Data simples
- `12/08/2025 14:30` - Data com hora
- `12/08/2025 14:30:45` - Data com hora e segundos

### **✅ Formatos Americanos (Compatibilidade):**
- `2025-08-12` - Data simples
- `2025-08-12 14:30` - Data com hora
- `2025-08-12 14:30:45` - Data com hora e segundos

## 🔍 **Logs e Debug**

### **Logs de Sucesso:**
```
✅ Evento criado no Google Calendar para o card: TÍTULO DO CARD
✅ Evento criado no Google Calendar para o card recém-criado: TÍTULO DO CARD
```

### **Logs de Erro:**
```
❌ Google Calendar não está autenticado
❌ Card não possui data de vencimento
❌ Formato de data inválido: 12/08/2025
❌ Erro ao criar evento no Google Calendar para o card: TÍTULO
❌ Erro na sincronização com Google Calendar: [detalhes]
```

## 🧪 **Testes da Funcionalidade**

### **1. Teste de Criação:**
```python
# 1. Criar novo card
# 2. Definir data de vencimento: "12/08/2025 14:30"
# 3. Salvar card
# 4. Verificar se evento aparece no Google Calendar
# 5. Verificar logs no console
```

### **2. Teste de Edição:**
```python
# 1. Editar card existente
# 2. Modificar data de vencimento: "20/08/2025 16:00"
# 3. Salvar card
# 4. Verificar se evento é atualizado no Google Calendar
# 5. Verificar logs no console
```

### **3. Teste de Formatos:**
```python
# Testar diferentes formatos de data:
test_dates = [
    "12/08/2025",           # Brasileiro simples
    "12/08/2025 14:30",     # Brasileiro com hora
    "2025-08-12",           # Americano simples
    "2025-08-12 14:30",     # Americano com hora
]

# Verificar se todos criam eventos corretamente
```

## 📋 **Informações do Evento**

### **Título do Evento:**
```
📋 TÍTULO DO CARD
```

### **Descrição do Evento:**
```
Card: TÍTULO DO CARD
Descrição: Descrição detalhada do card
Importância: Alta/Normal/Baixa
Assunto: Assunto do card
Objetivo: Objetivo do card
Membros: Nome1, Nome2, Nome3
Board: Nome do Quadro
Lista: Nome da Lista
Card ID: uuid-do-card
```

### **Duração do Evento:**
- **Padrão:** 1 hora
- **Início:** Data e hora de vencimento do card
- **Fim:** Data e hora de vencimento + 1 hora

### **Lembretes:**
- **30 minutos antes:** Popup
- **1 hora antes:** Email

## 🚀 **Como Verificar**

### **1. Verificar Console:**
- Procurar por logs ✅ de sucesso
- Verificar se não há erros ❌

### **2. Verificar Google Calendar:**
- Abrir Google Calendar
- Procurar por eventos com 📋
- Verificar se datas e horários estão corretos

### **3. Verificar Histórico do Card:**
- Abrir card no app
- Verificar se há entrada: "Evento criado no Google Calendar"

---

**🎯 Sincronização automática com Google Calendar implementada!**

**📊 Resumo:**
- ✅ **Criação automática** de eventos ao criar cards
- ✅ **Atualização automática** ao editar cards
- 🇧🇷 **Formato brasileiro** totalmente suportado
- 📝 **Histórico completo** de sincronização
- 🔧 **Configuração simples** e robusta

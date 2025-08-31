# 📧 Gerenciamento de Emails do Google Calendar

## 🎯 **Funcionalidade Implementada**

### **Sistema de Gerenciamento de Emails**
- **Emails padrão** → Adicionados automaticamente em todos os eventos
- **Membros do card** → Adicionados automaticamente se tiverem email configurado
- **Validação de emails** → Verifica formato correto antes de salvar
- **Configuração flexível** → Habilita/desabilita cada tipo de email

## ✅ **Como Funciona**

### **1. Configuração de Emails**
```python
# Na aba "Calendário" das configurações:
# - Campo de texto para emails padrão (um por linha)
# - Checkbox: "Incluir emails padrão em todos os eventos"
# - Checkbox: "Incluir membros do card automaticamente"
```

### **2. Processo de Sincronização**
```python
# Quando um evento é criado:
# 1. Coleta emails padrão (se habilitado)
# 2. Coleta emails dos membros do card (se habilitado)
# 3. Remove duplicatas
# 4. Cria evento com todos os participantes
# 5. Google Calendar envia convites automaticamente
```

## 🔧 **Detalhes Técnicos**

### **Configuração na Interface**
```python
# Aba "Calendário" → Seção "Gerenciamento de Emails"
- Campo de texto: Emails padrão (um por linha)
- Checkbox: Incluir emails padrão
- Checkbox: Incluir membros do card
- Instruções detalhadas
```

### **Validação de Emails**
```python
import re
email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

# Validação automática ao salvar configurações
# Emails inválidos são ignorados com aviso
```

### **Coleta de Emails**
```python
def _get_member_email(self, member_name):
    """Busca o email de um membro no arquivo de membros"""
    for member in self.members:
        if member.get('Membro') == member_name:
            return member.get('email', '')
    return None
```

### **Integração com Google Calendar**
```python
# Função create_event modificada para aceitar attendees
success = self.google_calendar.create_event(
    title=event_title,
    description=event_description,
    start_datetime=event_datetime,
    duration=event_duration,
    card_id=card_id,
    attendees=attendees  # Lista de emails
)
```

## 🎯 **Configuração**

### **1. Emails Padrão**
```
# Formato: um email por linha
gerente@empresa.com
coordenador@empresa.com
admin@empresa.com
```

### **2. Opções de Configuração**
```json
{
  "calendar_integration": {
    "default_emails": ["email1@exemplo.com", "email2@exemplo.com"],
    "include_default_emails": true,
    "include_card_members": true
  }
}
```

### **3. Configuração de Membros**
```excel
# Arquivo: boodesk_members.xlsx
Membro    | Cargo        | email
João      | Desenvolvedor| joao@empresa.com
Maria     | Designer     | maria@empresa.com
Pedro     | Gerente      | pedro@empresa.com
```

## 📊 **Fluxo de Funcionamento**

### **Criação de Evento:**
```
1. Card criado com data de vencimento
2. Sistema coleta emails padrão (se habilitado)
3. Sistema coleta emails dos membros do card (se habilitado)
4. Remove duplicatas
5. Cria evento no Google Calendar com participantes
6. Google Calendar envia convites automaticamente
```

### **Edição de Evento:**
```
1. Card editado com nova data de vencimento
2. Sistema atualiza evento no Google Calendar
3. Participantes são atualizados automaticamente
4. Novos convites são enviados se necessário
```

## 🎯 **Tipos de Email**

### **1. Emails Padrão**
- **O que são:** Emails que recebem todos os eventos
- **Configuração:** Campo de texto nas configurações
- **Uso:** Gerentes, coordenadores, administradores
- **Exemplo:** `gerente@empresa.com`, `admin@empresa.com`

### **2. Emails dos Membros**
- **O que são:** Emails dos membros atribuídos ao card
- **Configuração:** Arquivo `boodesk_members.xlsx`
- **Uso:** Participantes específicos do card
- **Exemplo:** `joao@empresa.com` (membro do card)

## 🔍 **Logs e Debug**

### **Logs de Sucesso:**
```
✅ Evento criado no Google Calendar para o card: TÍTULO
✅ Participantes adicionados: email1@exemplo.com, email2@exemplo.com
```

### **Logs de Erro:**
```
❌ Email inválido ignorado: email_invalido
❌ Membro sem email: Nome do Membro
❌ Erro ao buscar email do membro: [detalhes]
```

## 🧪 **Testes da Funcionalidade**

### **1. Teste de Emails Padrão:**
```python
# 1. Configurar emails padrão nas configurações
# 2. Criar card com data de vencimento
# 3. Verificar se emails padrão receberam convite
# 4. Verificar logs no console
```

### **2. Teste de Membros do Card:**
```python
# 1. Configurar membros com emails no arquivo
# 2. Criar card e atribuir membros
# 3. Verificar se membros receberam convite
# 4. Verificar logs no console
```

### **3. Teste de Validação:**
```python
# 1. Adicionar email inválido nas configurações
# 2. Salvar configurações
# 3. Verificar aviso de email inválido
# 4. Verificar se apenas emails válidos são usados
```

## 📋 **Estrutura do Convite**

### **Email Recebido:**
```
De: Google Calendar
Para: [emails configurados]
Assunto: Convite: 📋 TÍTULO DO CARD

Olá,

Você foi convidado para o evento:
📋 TÍTULO DO CARD

Data: 12/08/2025 14:30
Duração: 1 hora

Detalhes:
Card: TÍTULO DO CARD
Descrição: Descrição do card
Importância: Alta
Board: Nome do Quadro
Lista: Nome da Lista

[Botões: Aceitar / Recusar / Talvez]
```

### **Informações Incluídas:**
- **Título:** 📋 + Título do card
- **Data/Hora:** Data de vencimento do card
- **Duração:** 1 hora (padrão)
- **Descrição:** Informações completas do card
- **Participantes:** Todos os emails configurados

## 🚀 **Como Configurar**

### **1. Configurar Emails Padrão:**
1. Abrir configurações do app
2. Ir para aba "Calendário"
3. Seção "Gerenciamento de Emails"
4. Adicionar emails (um por linha)
5. Marcar "Incluir emails padrão"
6. Salvar configurações

### **2. Configurar Membros com Emails:**
1. Abrir arquivo `boodesk_members.xlsx`
2. Adicionar coluna "email" se não existir
3. Preencher emails dos membros
4. Salvar arquivo
5. Marcar "Incluir membros do card" nas configurações

### **3. Testar Configuração:**
1. Criar card com data de vencimento
2. Atribuir membros ao card
3. Salvar card
4. Verificar se convites foram enviados
5. Verificar logs no console

## ⚠️ **Limitações e Considerações**

### **Limitações:**
- **Google Calendar:** Máximo de 100 participantes por evento
- **Rate Limits:** Limites da API do Google Calendar
- **Emails:** Deve ser formato válido de email

### **Considerações:**
- **Privacidade:** Emails ficam visíveis para todos os participantes
- **Spam:** Muitos convites podem ser marcados como spam
- **Permissões:** Usuários podem recusar convites

---

**🎯 Sistema de gerenciamento de emails do Google Calendar implementado!**

**📊 Resumo:**
- ✅ **Emails padrão** configuráveis
- ✅ **Membros automáticos** do card
- ✅ **Validação** de formato de email
- ✅ **Configuração flexível** na interface
- ✅ **Integração completa** com Google Calendar

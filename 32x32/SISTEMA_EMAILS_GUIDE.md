# 📧 SISTEMA DE GERENCIAMENTO DE EMAILS - GUIA COMPLETO

## 🎯 VISÃO GERAL

O sistema de gerenciamento de emails permite cadastrar, organizar e gerenciar emails que serão utilizados automaticamente no sistema, especialmente na integração com Google Calendar.

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 🔧 **Sistema Completo**
- ✅ **Cadastro manual** de emails com validação
- ✅ **Categorização** (Padrão, Notificações, Relatórios, etc.)
- ✅ **Ativação/desativação** de emails
- ✅ **Importação via CSV** com validação automática
- ✅ **Edição e remoção** de emails
- ✅ **Integração com Google Calendar**
- ✅ **Busca e filtros** por categoria
- ✅ **Interface intuitiva** com TreeView

### 🗄️ **Banco de Dados**
- ✅ **Tabela `system_emails`** criada automaticamente
- ✅ **Campos**: id, email, name, category, is_active, created_at, updated_at
- ✅ **Validação única** de emails
- ✅ **Índices** para performance

## 🚀 COMO USAR

### **1. Acessar o Sistema**
```
1. Execute: python app23a.py
2. Acesse: Usuários → Gerenciar Emails
3. A janela de gerenciamento será aberta
```

### **2. Cadastrar Email Manualmente**
```
1. Preencha o campo "Email" (validação automática)
2. Adicione um "Nome" (opcional)
3. Selecione uma "Categoria"
4. Marque "Ativo" se desejar usar o email
5. Clique em "Adicionar Email"
```

### **3. Importar via CSV**
```
1. Prepare um arquivo CSV com as colunas:
   - email (obrigatório)
   - name (opcional)
   - category (opcional, padrão: "Padrão")
   - is_active (opcional, padrão: true)

2. Clique em "Importar CSV"
3. Selecione o arquivo
4. Sistema importará e validará automaticamente
```

### **4. Gerenciar Emails**
```
- **Editar**: Selecione um email na lista e clique "Editar Email"
- **Remover**: Selecione um email e clique "Remover Email"
- **Filtrar**: Use as categorias para organizar
- **Ativar/Desativar**: Marque/desmarque o checkbox "Ativo"
```

## 📊 CATEGORIAS DISPONÍVEIS

### **📁 Categorias Padrão**
- **Padrão**: Emails gerais do sistema
- **Notificações**: Para notificações automáticas
- **Relatórios**: Para envio de relatórios
- **Administração**: Para administradores
- **Suporte**: Para equipe de suporte

### **🎯 Como Usar Categorias**
```
- **Padrão**: Usado automaticamente em eventos gerais
- **Notificações**: Incluído em notificações do sistema
- **Relatórios**: Usado para envio de relatórios semanais/mensais
- **Administração**: Para comunicações administrativas
- **Suporte**: Para tickets e suporte técnico
```

## 🔗 INTEGRAÇÃO COM GOOGLE CALENDAR

### **🔄 Funcionamento Automático**
```
1. Ao criar um evento no Google Calendar
2. Sistema busca emails ativos por categoria
3. Adiciona automaticamente como participantes
4. Google Calendar envia convites por email
5. Participantes recebem notificações
```

### **⚙️ Configuração**
```
1. Acesse: Configurações → Calendário
2. Configure "Emails padrão" se necessário
3. Marque "Incluir emails padrão em todos os eventos"
4. Sistema usará emails da categoria "Padrão"
```

## 📄 EXEMPLO DE ARQUIVO CSV

### **📋 Estrutura do CSV**
```csv
email,name,category,is_active
admin@empresa.com,Administrador,Administração,true
gerente@empresa.com,Gerente de Projetos,Administração,true
desenvolvedor1@empresa.com,João Silva,Desenvolvimento,true
desenvolvedor2@empresa.com,Maria Santos,Desenvolvimento,true
designer@empresa.com,Pedro Costa,Design,true
teste@empresa.com,Equipe de Teste,Qualidade,true
suporte@empresa.com,Suporte Técnico,Suporte,true
relatorios@empresa.com,Relatórios Automáticos,Relatórios,true
notificacoes@empresa.com,Sistema de Notificações,Notificações,true
cliente@exemplo.com,Cliente Exemplo,Clientes,false
```

### **📝 Regras de Importação**
- **email**: Obrigatório, deve ser válido
- **name**: Opcional, nome para identificação
- **category**: Opcional, usa "Padrão" se não especificado
- **is_active**: Opcional, usa "true" se não especificado

## 🔍 VALIDAÇÃO DE EMAILS

### **✅ Formatos Válidos**
```
usuario@exemplo.com
teste@empresa.com.br
admin@teste.org
usuario+tag@exemplo.com
user.name@domain.co.uk
```

### **❌ Formatos Inválidos**
```
email.invalido
@dominio.com
usuario@
teste@dominio
```

## 🛠️ FUNÇÕES TÉCNICAS

### **🔧 Métodos Disponíveis**
```python
# Buscar emails ativos
get_active_emails(category=None)

# Exemplo de uso:
emails = email_manager.get_active_emails("Notificações")
```

### **📊 Estrutura da Tabela**
```sql
CREATE TABLE system_emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Padrão',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 CASOS DE USO

### **📅 Eventos do Google Calendar**
```
1. Criar evento no sistema
2. Sistema busca emails da categoria "Padrão"
3. Adiciona como participantes automaticamente
4. Google Calendar envia convites
```

### **📧 Notificações do Sistema**
```
1. Sistema busca emails da categoria "Notificações"
2. Envia notificações automáticas
3. Usuários recebem por email
```

### **📊 Relatórios Automáticos**
```
1. Sistema busca emails da categoria "Relatórios"
2. Gera relatório semanal/mensal
3. Envia automaticamente por email
```

## 🔧 TROUBLESHOOTING

### **❌ Problemas Comuns**

#### **Email não é adicionado**
```
- Verificar se o formato é válido
- Verificar se não está duplicado
- Verificar se está marcado como "Ativo"
```

#### **Importação CSV falha**
```
- Verificar se o arquivo tem a coluna "email"
- Verificar se os emails são válidos
- Verificar se não há duplicatas
```

#### **Integração Google Calendar não funciona**
```
- Verificar se emails estão ativos
- Verificar configurações do Google Calendar
- Verificar categoria dos emails
```

## 📈 PRÓXIMAS MELHORIAS

### **🚀 Funcionalidades Planejadas**
- [ ] **Templates de email** personalizáveis
- [ ] **Agendamento** de envios
- [ ] **Relatórios** de uso de emails
- [ ] **Integração** com outros sistemas
- [ ] **API** para acesso externo

### **🔧 Melhorias Técnicas**
- [ ] **Cache** de emails para performance
- [ ] **Logs** detalhados de uso
- [ ] **Backup** automático
- [ ] **Sincronização** em tempo real

## 📞 SUPORTE

### **🆘 Como Obter Ajuda**
```
1. Verificar este guia
2. Executar: python test_email_management.py
3. Verificar logs do sistema
4. Contatar suporte técnico
```

### **📋 Informações Úteis**
- **Arquivo de teste**: `test_email_management.py`
- **Demonstração**: `demonstrar_emails.py`
- **CSV de exemplo**: `exemplo_emails.csv`
- **Tabela no banco**: `system_emails`

---

## 🎉 CONCLUSÃO

O sistema de gerenciamento de emails está **100% funcional** e integrado ao Boodesk. Permite cadastrar, organizar e usar emails automaticamente em eventos do Google Calendar e outras funcionalidades do sistema.

**✅ Sistema pronto para uso em produção!**



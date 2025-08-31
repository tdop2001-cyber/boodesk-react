# 🚀 Novas Funcionalidades - Boodesk App

## 📅 Integração com Google Calendar

### Configuração Inicial

1. **Acesse o Google Cloud Console**
   - Vá para https://console.developers.google.com/
   - Crie um novo projeto ou selecione um existente

2. **Ative a Google Calendar API**
   - No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
   - Procure por "Google Calendar API"
   - Clique em "Ativar"

3. **Crie Credenciais OAuth 2.0**
   - Vá em "APIs e Serviços" > "Credenciais"
   - Clique em "Criar Credenciais" > "ID do Cliente OAuth 2.0"
   - Configure a tela de consentimento OAuth
   - Escolha "Aplicativo Desktop" como tipo de aplicativo
   - Baixe o arquivo JSON de credenciais

4. **Configure no Boodesk**
   - Abra as Configurações do Boodesk
   - Vá na aba "Calendário"
   - Marque "Habilitar Integração com Google Calendar"
   - Clique em "Procurar" e selecione o arquivo JSON baixado
   - Salve as configurações

### Funcionalidades Disponíveis

- **Sincronização Automática**: Cartões com prazo são automaticamente criados no Google Calendar
- **Visualização de Eventos**: Veja eventos do Google Calendar na aba Calendário
- **Criação de Eventos**: Crie novos eventos diretamente no Boodesk
- **Sincronização Bidirecional**: Eventos criados no Google Calendar aparecem no Boodesk

## 📧 Templates de Email Personalizáveis

### Acessando os Templates

1. Abra as Configurações do Boodesk
2. Vá na aba "Templates de Email"
3. Selecione um template existente ou crie um novo

### Templates Padrão

- **card_created**: Notificação de cartão criado
- **card_modified**: Notificação de cartão modificado
- **deadline_reminder**: Lembrete de prazo
- **weekly_report**: Relatório semanal

### Variáveis Disponíveis

Use estas variáveis nos seus templates:

- `{card_title}` - Título do cartão
- `{board_name}` - Nome do quadro
- `{list_name}` - Nome da lista
- `{card_description}` - Descrição do cartão
- `{due_date}` - Data de vencimento
- `{importance}` - Nível de importância
- `{member_name}` - Nome do membro
- `{changes}` - Lista de alterações
- `{week_period}` - Período do relatório
- `{completed_tasks}` - Tarefas concluídas
- `{pending_tasks}` - Tarefas pendentes
- `{total_pomodoro_time}` - Tempo total de pomodoro
- `{productivity_score}` - Score de produtividade
- `{important_completed_tasks}` - Tarefas importantes concluídas
- `{upcoming_deadlines}` - Próximos prazos

### Exemplo de Template

```
Assunto: Nova Tarefa Criada: {card_title}

Olá {member_name},

Uma nova tarefa foi criada e você foi designado como responsável:

**Tarefa:** {card_title}
**Quadro:** {board_name}
**Lista:** {list_name}
**Descrição:** {card_description}
**Prazo:** {due_date}
**Importância:** {importance}

Acesse o sistema para mais detalhes.

Atenciosamente,
Sistema Boodesk
```

## 🔧 Instalação das Dependências

Execute o comando para instalar as novas dependências:

```bash
pip install -r requirements.txt
```

## 🎯 Como Usar

### Google Calendar

1. **Conectar ao Google Calendar**
   - Vá na aba "Calendário"
   - Clique em "Conectar"
   - Autorize o acesso na janela do navegador

2. **Sincronizar Eventos**
   - Clique em "Sincronizar" para buscar eventos do Google Calendar
   - Cartões com prazo são automaticamente sincronizados

3. **Criar Eventos**
   - Selecione uma data no calendário
   - Clique em "Novo Evento"
   - Preencha os detalhes e salve

### Templates de Email

1. **Editar Templates**
   - Selecione um template na lista
   - Modifique o assunto e corpo
   - Use as variáveis disponíveis
   - Clique em "Salvar Template"

2. **Testar Templates**
   - Clique em "Testar Template" para ver como ficará
   - Use dados de exemplo para visualizar o resultado

3. **Criar Novos Templates**
   - Clique em "Novo Template"
   - Digite um nome único
   - Configure o assunto e corpo
   - Salve o template

## 🔒 Segurança

- As credenciais do Google Calendar são armazenadas localmente
- Os templates de email são salvos em arquivo JSON local
- Nenhum dado é enviado para servidores externos sem sua autorização

## 🐛 Solução de Problemas

### Google Calendar não conecta
- Verifique se o arquivo de credenciais está correto
- Certifique-se de que a Google Calendar API está ativada
- Verifique se o arquivo JSON não está corrompido

### Templates não funcionam
- Verifique se as variáveis estão escritas corretamente
- Certifique-se de que o template foi salvo
- Teste o template antes de usar

### Erro de autenticação
- Delete o arquivo `google_calendar_token.pickle` e tente novamente
- Verifique se as credenciais não expiraram
- Regenere as credenciais no Google Cloud Console

## 📝 Notas Importantes

- A primeira conexão com o Google Calendar pode demorar alguns segundos
- Os templates são aplicados automaticamente quando as notificações são enviadas
- Você pode desabilitar a sincronização automática nas configurações
- Os eventos criados no Boodesk aparecem no Google Calendar em tempo real

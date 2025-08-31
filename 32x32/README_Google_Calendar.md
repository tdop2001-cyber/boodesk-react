# Integração com Google Calendar - Boodesk

## Visão Geral

A integração com Google Calendar permite que os cards do Boodesk sejam sincronizados automaticamente com o calendário do Google. A funcionalidade principal é:

- **Sincronização baseada em membros**: Apenas os cards onde o usuário está como membro aparecem no seu calendário
- **Sincronização automática**: Os cards são sincronizados automaticamente quando salvos ou modificados
- **Modo demo**: Permite testar a funcionalidade sem configurar credenciais reais

## Instalação das Dependências

1. Instale as bibliotecas necessárias:
```bash
pip install -r requirements_google_calendar.txt
```

Ou instale individualmente:
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

## Configuração do Google Calendar API

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Calendar API:
   - Vá para "APIs e Serviços" > "Biblioteca"
   - Procure por "Google Calendar API"
   - Clique em "Ativar"

### 2. Configurar Credenciais OAuth2

1. Vá para "APIs e Serviços" > "Credenciais"
2. Clique em "Criar Credenciais" > "ID do Cliente OAuth 2.0"
3. Configure o tipo de aplicativo como "Aplicativo da área de trabalho"
4. Dê um nome para sua aplicação (ex: "Boodesk Calendar Integration")
5. Clique em "Criar"
6. Anote o **Client ID** e **Client Secret**

### 3. Configurar no Boodesk

1. Abra o Boodesk
2. Vá em "Configurações" > "Google Calendar"
3. Marque "Habilitar Integração com Google Calendar"
4. Cole o Client ID e Client Secret nas respectivas caixas
5. Clique em "Testar Conexão" para verificar se está funcionando

## Funcionalidades

### Sincronização de Cards

- **Cards com data de vencimento**: São criados como eventos no calendário
- **Cores por importância**: 
  - Baixa: Azul
  - Normal: Amarelo  
  - Alta: Vermelho
  - Crítica: Vermelho escuro
- **Lembretes automáticos**: 1 dia e 1 hora antes do prazo
- **Descrição detalhada**: Inclui quadro, lista, membros e descrição do card

### Modo Demo

- Permite testar a funcionalidade sem credenciais reais
- Simula a criação de eventos no console
- Útil para desenvolvimento e testes

### Configurações

- **Intervalo de sincronização**: Define com que frequência os cards são sincronizados (padrão: 30 minutos)
- **Sincronizar cards dos membros**: Habilita/desabilita a sincronização baseada em membros
- **Reautenticação**: Permite renovar o token de acesso quando necessário

## Como Funciona

1. **Autenticação**: O usuário é autenticado via OAuth2 com o Google
2. **Sincronização inicial**: Todos os cards onde o usuário é membro são sincronizados
3. **Sincronização contínua**: Novos cards e modificações são sincronizados automaticamente
4. **Gerenciamento de eventos**: Eventos existentes são atualizados, novos são criados

## Solução de Problemas

### Erro de Autenticação
- Verifique se as credenciais estão corretas
- Certifique-se de que a Google Calendar API está ativada
- Tente reautenticar usando o botão "Reautenticar"

### Cards não aparecem no calendário
- Verifique se o usuário está como membro do card
- Confirme se o card tem data de vencimento definida
- Teste a conexão nas configurações

### Erro de bibliotecas
- Instale as dependências: `pip install -r requirements_google_calendar.txt`
- Verifique se está usando Python 3.7+

## Segurança

- As credenciais são armazenadas localmente no arquivo de configurações
- O token de acesso é salvo em `google_calendar_token.json`
- Apenas o usuário autenticado pode acessar seu próprio calendário
- Não há compartilhamento de dados entre usuários

## Suporte

Para problemas ou dúvidas sobre a integração com Google Calendar, consulte:
- Documentação da Google Calendar API
- Logs do console para mensagens de debug
- Configurações do Boodesk para verificar status da integração


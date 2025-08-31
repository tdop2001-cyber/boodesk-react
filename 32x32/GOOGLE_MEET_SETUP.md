# Configuração da API Google Meet

Para usar a integração real com Google Meet, siga estas instruções:

## 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com
2. Clique em "Selecionar projeto" ou "Criar projeto"
3. Digite um nome para o projeto (ex: "Boodesk Meet Integration")
4. Clique em "Criar"

## 2. Ativar a Google Calendar API

1. No menu lateral, vá em "APIs e serviços" > "Biblioteca"
2. Procure por "Google Calendar API"
3. Clique na API e depois em "Ativar"

## 3. Criar Credenciais OAuth 2.0

1. Vá em "APIs e serviços" > "Credenciais"
2. Clique em "Criar credenciais" > "ID do cliente OAuth 2.0"
3. Se solicitado, configure a tela de consentimento OAuth:
   - Tipo de usuário: Externo
   - Nome do app: "Boodesk Meet Integration"
   - Email de suporte: seu email
   - Domínios autorizados: deixe vazio
   - Escopo: adicione "https://www.googleapis.com/auth/calendar"
4. Volte para "Credenciais" e clique em "Criar credenciais" > "ID do cliente OAuth 2.0"
5. Tipo de aplicativo: "Aplicativo da área de trabalho"
6. Nome: "Boodesk Desktop App"
7. Clique em "Criar"

## 4. Baixar o Arquivo de Credenciais

1. Após criar as credenciais, clique em "Baixar JSON"
2. Renomeie o arquivo para `credentials.json`
3. Coloque o arquivo na pasta raiz do aplicativo (mesma pasta do `app20a.py`)

## 5. Primeira Execução

1. Execute o aplicativo
2. Ao tentar criar uma reunião do Google Meet, o navegador abrirá
3. Faça login com sua conta Google
4. Autorize o aplicativo a acessar seu Google Calendar
5. O token será salvo automaticamente para uso futuro

## 6. Permissões Necessárias

O aplicativo solicitará acesso a:
- Ler e criar eventos no Google Calendar
- Criar reuniões do Google Meet

## 7. Solução de Problemas

### Erro "credentials.json não encontrado"
- Verifique se o arquivo está na pasta correta
- Verifique se o nome está exatamente como `credentials.json`

### Erro de autenticação
- Delete o arquivo `token.pickle` se existir
- Tente autenticar novamente

### Erro de permissão
- Verifique se a API Google Calendar está ativada
- Verifique se as credenciais têm as permissões corretas

## 8. Estrutura de Arquivos

```
pasta_do_app/
├── app20a.py
├── credentials.json  ← Arquivo de credenciais do Google
├── token.pickle      ← Token de autenticação (criado automaticamente)
└── GOOGLE_MEET_SETUP.md
```

## 9. Segurança

- Nunca compartilhe o arquivo `credentials.json`
- O arquivo `token.pickle` contém tokens de acesso - mantenha seguro
- Use apenas em computadores confiáveis

## 10. Limitações

- A API tem limites de uso (quota)
- Reuniões criadas aparecerão no Google Calendar
- Links funcionam apenas para contas autorizadas







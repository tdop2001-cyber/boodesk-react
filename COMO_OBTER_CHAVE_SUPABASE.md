# 🔑 Como Obter a Chave da API do Supabase

## 📋 Passo a Passo

### 1. Acesse o Dashboard do Supabase
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Faça login na sua conta

### 2. Selecione seu Projeto
- Clique no projeto `noxhoaarzezagzsbypsw` (ou o projeto correto)

### 3. Acesse as Configurações da API
- No menu lateral, clique em **Settings** (Configurações)
- Clique em **API**

### 4. Copie a Chave Anon/Public
- Procure por **Project API keys**
- Copie a chave **anon** ou **public** (não a service_role)
- A chave deve começar com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 5. Use no Teste
- Abra o arquivo `test_metrics_fixes.html` no navegador
- Cole a chave no campo "Configuração da API"
- Clique em "Atualizar Chave da API"
- Execute os testes

## 🔍 Exemplo de Chave Válida

Uma chave válida do Supabase tem este formato:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veGhvYWFyemV6YWd6c2J5cHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq
```

## ⚠️ Importante

- **NÃO** use a chave `service_role` (ela tem permissões administrativas)
- Use apenas a chave `anon` ou `public`
- A chave é segura para usar no frontend

## 🧪 Testando

Após inserir a chave correta:
1. Execute "Testar Relatório Mensal"
2. Execute "Testar Performance por Projeto"
3. Verifique se não há mais erros de "Invalid API key"

## 📞 Se Ainda Houver Problemas

Se mesmo com a chave correta ainda houver erros:
1. Verifique se o projeto está ativo no Supabase
2. Confirme se as funções foram criadas corretamente
3. Execute os scripts SQL de correção novamente


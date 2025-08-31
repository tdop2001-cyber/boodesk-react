# Solução para Erro de Configurações

## Problema
O erro "Não foi possível salvar as configurações" indica que há um conflito de chave única na tabela `user_settings`. O erro específico é:

**Erro:** `duplicate key value violates unique constraint "user_settings_user_id_setting_key_key"`
**Detalhes:** `Key (user_id, setting_key)=(1, boardSettings) already exists.`

Isso significa que já existem configurações na tabela e o método `upsert` não está funcionando corretamente.

## Solução

### 1. Criar a Tabela user_settings

Execute o script SQL `create_user_settings_table.sql` no seu banco de dados Supabase:

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Cole e execute o conteúdo do arquivo `create_user_settings_table.sql`

**⚠️ ATENÇÃO:** Este script irá apagar a tabela `user_settings` existente e criar uma nova. Se você tiver dados importantes, faça backup primeiro.

### 2. Verificar a Estrutura da Tabela

A tabela `user_settings` deve ter a seguinte estrutura:

```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);
```

### 3. Testar a Conexão

Execute o script de teste para verificar se tudo está funcionando:

```bash
node test_user_settings.js
```

### 4. Verificar Logs

Abra o console do navegador (F12) e tente salvar as configurações novamente. Os logs detalhados mostrarão exatamente onde está o problema.

## Possíveis Causas

1. **Tabela não existe**: Execute o script SQL para criar a tabela
2. **Estrutura incorreta**: A tabela antiga pode ter uma estrutura diferente
3. **Permissões**: Verifique se o usuário tem permissão para inserir/atualizar na tabela
4. **Chave única**: Pode haver conflito na chave única (user_id, setting_key)

## Logs de Debug

O sistema agora gera logs detalhados que mostram:
- User ID sendo usado
- Configurações sendo salvas
- Erros específicos do Supabase
- Códigos de erro e mensagens

## Próximos Passos

### Passo 1: Limpar Dados Existentes
Execute o script `clear_user_settings.sql` para limpar os dados existentes que estão causando conflito.

### Passo 2: Verificar a Tabela
Execute o script `check_user_settings_table.sql` para verificar se a tabela existe e tem a estrutura correta.

### Passo 3: Criar a Tabela (se necessário)
Se a tabela não existir ou tiver estrutura incorreta, execute o script `create_user_settings_table.sql`.

### Passo 4: Testar Inserção Manual
Execute o script `test_simple_insert.sql` para testar se consegue inserir dados manualmente.

### Passo 5: Testar no Aplicativo
1. Abra o console do navegador (F12)
2. Vá para a página de Configurações
3. Tente salvar as configurações
4. Verifique os logs detalhados no console

**✅ SOLUÇÃO IMPLEMENTADA:** O código foi corrigido para verificar se a configuração já existe antes de tentar inserir/atualizar, evitando o conflito de chave única.

### Passo 5: Análise dos Logs
Os logs agora mostram:
- Se a tabela existe e é acessível
- Qual configuração específica está falhando
- Códigos de erro detalhados do Supabase
- Mensagens de erro específicas

### Passo 6: Compartilhar Logs
Se ainda houver erro, compartilhe os logs do console para análise detalhada.

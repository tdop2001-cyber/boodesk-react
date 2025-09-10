# 🧹 Scripts de Limpeza do Banco de Dados

Este diretório contém scripts para limpar todos os cards e subtasks do banco de dados.

## ⚠️ ATENÇÃO

**ESTES SCRIPTS IRÃO DELETAR TODOS OS DADOS!**
- Use apenas em ambiente de desenvolvimento/teste
- Faça backup antes de executar
- Não execute em produção sem autorização

## 📁 Arquivos Disponíveis

### 1. `cleanup_all_cards_subtasks.js` - Script Completo
**Recomendado para uso seguro**

```bash
node cleanup_all_cards_subtasks.js
```

**Características:**
- ✅ Confirmação obrigatória antes da execução
- ✅ Contagem de registros antes e depois
- ✅ Logs detalhados de cada operação
- ✅ Verificação de sucesso
- ✅ Tratamento de erros robusto

### 2. `cleanup_simple.js` - Script Rápido
**Para limpeza rápida sem confirmação**

```bash
node cleanup_simple.js
```

**Características:**
- ⚡ Execução imediata (sem confirmação)
- ⚡ Deletar tudo em paralelo
- ⚡ Logs básicos
- ⚠️ **Use com cuidado!**

### 3. `cleanup_database.sql` - Script SQL
**Para execução direta no Supabase**

1. Abra o SQL Editor no Supabase
2. Cole o conteúdo do arquivo
3. Execute o script

**Características:**
- 🎯 Execução direta no banco
- 📊 Contagem antes e depois
- 🔄 Reset de sequências (opcional)

### 4. `backup_before_cleanup.js` - Script de Backup
**Para fazer backup antes da limpeza**

```bash
# Criar backup
node backup_before_cleanup.js create

# Listar backups
node backup_before_cleanup.js list

# Restaurar backup
node backup_before_cleanup.js restore backup_data_2024-01-15_14-30-00.json
```

**Características:**
- 💾 Backup completo de todas as tabelas
- 📁 Arquivos com timestamp
- 🔄 Restauração automática
- 📋 Listagem de backups disponíveis

## 🚀 Como Usar (Recomendado)

### Passo 1: Fazer Backup
```bash
node backup_before_cleanup.js create
```

### Passo 2: Executar Limpeza
```bash
node cleanup_all_cards_subtasks.js
```

### Passo 3: Verificar Resultado
O script mostrará:
- Quantos registros foram deletados
- Se a operação foi bem-sucedida
- Resumo da limpeza

## 📊 O que é Deletado

Os scripts deletam **TODOS** os registros das seguintes tabelas:

1. **`subtasks`** - Todas as subtarefas
2. **`activities`** - Todas as atividades
3. **`chats`** - Todos os chats
4. **`cards`** - Todos os cards
5. **`lists`** - Todas as listas

## 🔧 Configuração Necessária

Certifique-se de que as variáveis de ambiente estão configuradas:

```env
REACT_APP_SUPABASE_URL=sua_url_aqui
REACT_APP_SUPABASE_ANON_KEY=sua_chave_aqui
```

## 📝 Exemplo de Saída

```
🧹 Script de Limpeza Completa do Banco de Dados
================================================
🔌 Verificando conexão com o banco...
✅ Conexão estabelecida com sucesso!
📊 Contando registros atuais...
📋 Cards: 25
📝 Subtasks: 150
📅 Atividades: 75
📊 Total: 250 registros

⚠️  ATENÇÃO: Esta operação irá deletar TODOS os cards e subtasks do banco!
⚠️  Esta ação NÃO pode ser desfeita!
Digite "CONFIRMAR" para continuar ou qualquer outra coisa para cancelar:
> CONFIRMAR

🧹 Iniciando limpeza completa do banco...
🗑️  Deletando todas as subtasks...
✅ 150 subtasks deletadas
🗑️  Deletando todas as atividades...
✅ 75 atividades deletadas
🗑️  Deletando todos os cards...
✅ 25 cards deletados
🗑️  Deletando todas as listas...
✅ 5 listas deletadas
🗑️  Deletando todos os chats...
✅ 10 chats deletados

🎉 Limpeza completa realizada com sucesso!
📊 Resumo da limpeza:
   • 150 subtasks deletadas
   • 75 atividades deletadas
   • 25 cards deletados
   • 5 listas deletadas
   • 10 chats deletados

🔍 Verificando se a limpeza foi bem-sucedida...
✅ Banco limpo com sucesso! Todos os registros foram removidos.

🏁 Script finalizado.
```

## 🆘 Recuperação de Dados

Se você fez backup antes da limpeza:

```bash
# Listar backups disponíveis
node backup_before_cleanup.js list

# Restaurar backup específico
node backup_before_cleanup.js restore backup_data_2024-01-15_14-30-00.json
```

## ⚠️ Troubleshooting

### Erro de Conexão
```
❌ Erro: Variáveis de ambiente do Supabase não encontradas!
```
**Solução:** Verifique se o arquivo `.env` está configurado corretamente.

### Erro de Permissão
```
❌ Erro ao deletar cards: { message: "permission denied" }
```
**Solução:** Verifique se a chave do Supabase tem permissões de escrita.

### Backup Não Encontrado
```
❌ Erro ao carregar backup: ENOENT: no such file or directory
```
**Solução:** Verifique se o arquivo de backup existe e o nome está correto.

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme as configurações do Supabase
3. Teste a conexão com o banco
4. Execute o backup antes de qualquer operação

---

**Lembre-se: Sempre faça backup antes de executar qualquer script de limpeza!** 🛡️

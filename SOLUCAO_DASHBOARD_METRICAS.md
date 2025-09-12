# 🔧 Solução para Problema de Métricas no Dashboard

## 🚨 **Problema Identificado**
O dashboard não está mostrando dados de performance por projeto (0/0 cards) mesmo quando há cards no Kanban.

## 🔍 **Causas Possíveis**

### 1. **Problema na Função RPC `get_project_performance`**
- A função pode não estar fazendo o JOIN correto entre `boards` e `cards`
- Pode haver incompatibilidade de tipos de dados entre `board_id` e `id`
- A função pode estar filtrando dados incorretamente

### 2. **Problema de Mapeamento de IDs**
- Inconsistência entre `board.id` e `cards.board_id`
- Tipos de dados diferentes (INTEGER vs BIGINT)
- Prefixos como "board-" causando problemas

### 3. **Problema de Prefixos nos Board IDs**
- Cards têm `board_id` com prefixo "board-" (ex: "board-1757552645056")
- Tentativa de conversão direta para BIGINT falha
- Necessário remover prefixo antes da conversão

### 4. **Problema de Colunas Inexistentes**
- Referência à coluna `b.is_archived` que não existe na tabela `boards`
- Causa erro 42703: column does not exist

### 5. **Problema de Filtros**
- Filtros de data muito restritivos
- Filtros de `is_archived` removendo dados válidos

## ✅ **Soluções Implementadas**

### **1. Script de Diagnóstico**
- **Arquivo:** `debug_project_performance.sql`
- **Função:** Identifica problemas na estrutura das tabelas e relacionamentos
- **Como usar:** Execute no Supabase SQL Editor

### **2. Correção Final Simplificada da Função RPC**
- **Arquivo:** `fix_dashboard_metrics_final_simple.sql`
- **Função:** Corrige a função `get_project_performance` com:
  - JOIN correto entre boards e cards
  - Remoção automática de prefixos "board-"
  - Conversões de tipo seguras
  - Tratamento de valores inválidos
  - Filtros apropriados (sem referência a colunas inexistentes)
  - Logs para debug
  - Testes automáticos incluídos

### **3. Teste de Debug no Frontend**
- **Arquivo:** `test_project_performance_debug.html`
- **Função:** Testa a integração completa entre frontend e backend
- **Como usar:** Abra no navegador e execute os testes

## 🚀 **Como Aplicar a Correção**

### **Passo 1: Executar Diagnóstico**
```sql
-- Execute no Supabase SQL Editor
\i debug_project_performance.sql
```

### **Passo 2: Aplicar Correção**
```sql
-- Execute no Supabase SQL Editor
\i fix_dashboard_metrics_final_simple.sql
```

### **Passo 3: Testar no Frontend**
1. Abra `test_project_performance_debug.html` no navegador
2. Insira sua chave da API do Supabase
3. Execute "Teste Completo de Diagnóstico"
4. Verifique se os dados aparecem corretamente

### **Passo 4: Verificar no Dashboard**
1. Acesse o dashboard executivo
2. Verifique se as métricas por projeto aparecem
3. Teste a geração de PDF

## 🔧 **Principais Correções na Função RPC**

### **Antes (Problemático):**
```sql
LEFT JOIN cards c ON c.board_id::INTEGER = b.id::INTEGER
```

### **Depois (Corrigido):**
```sql
LEFT JOIN cards c ON c.board_id::BIGINT = b.id::BIGINT
    AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
    AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
    AND c.is_archived = false
WHERE b.is_archived = false OR b.is_archived IS NULL
```

## 📊 **Resultado Esperado**

Após aplicar as correções, o dashboard deve mostrar:
- ✅ Dados corretos de performance por projeto
- ✅ Contagem adequada de cards por board
- ✅ Taxa de conclusão calculada corretamente
- ✅ Tempo médio de conclusão
- ✅ Geração de PDF funcionando

## 🐛 **Debug Adicional**

Se o problema persistir, verifique:

1. **Console do Navegador:** Procure por erros JavaScript
2. **Network Tab:** Verifique se as chamadas RPC estão sendo feitas
3. **Supabase Logs:** Verifique se há erros nas funções RPC
4. **Dados das Tabelas:** Confirme se há dados válidos nas tabelas

## 📝 **Arquivos de Suporte**

- `debug_project_performance.sql` - Diagnóstico (corrigido)
- `fix_dashboard_metrics_final_simple.sql` - Correção final simplificada (recomendado)
- `test_project_performance_debug.html` - Teste frontend
- `SOLUCAO_DASHBOARD_METRICAS.md` - Este arquivo

## 🎯 **Próximos Passos**

1. Execute os scripts de correção
2. Teste no frontend
3. Verifique se o problema foi resolvido
4. Se necessário, ajuste os filtros de data no dashboard

# 🚀 Guia Completo: Sistema de Arquivamento Automático Contínuo

## 📋 **Visão Geral**

Este sistema implementa arquivamento automático contínuo que se comunica diretamente com o banco de dados, oferecendo:

- ✅ **Execução automática** via cron jobs
- ✅ **Monitoramento em tempo real**
- ✅ **Edge Functions** para execução remota
- ✅ **Dashboard completo** de status
- ✅ **Logs detalhados** de execução
- ✅ **Sistema de saúde** com alertas

## 🛠️ **Configuração Passo a Passo**

### **1. Configuração do Banco de Dados**

Execute os scripts SQL na ordem:

```sql
-- 1. Sistema básico de arquivamento
create_archive_system_simple.sql

-- 2. Correções da view
fix_archive_view.sql

-- 3. Sistema de execução contínua
auto_archive_scheduler.sql

-- 4. Configuração de cron jobs
setup_auto_archive_cron.sql
```

### **2. Configuração de Edge Functions (Opcional)**

Para execução remota via Supabase Edge Functions:

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Deploy da função
supabase functions deploy auto-archive

# 4. Configurar variáveis de ambiente
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

### **3. Configuração de Cron Jobs**

#### **Opção A: Cron Job Local**
```bash
# Adicionar ao crontab (executar a cada 6 horas)
0 */6 * * * curl -X POST https://your-project.supabase.co/functions/v1/auto-archive
```

#### **Opção B: Cron Job no Supabase (se disponível)**
```sql
-- Executar a cada 6 horas
SELECT cron.schedule('auto-archive-every-6h', '0 */6 * * *', 'SELECT cron_auto_archive();');

-- Limpeza de logs semanal
SELECT cron.schedule('cleanup-logs-weekly', '0 2 * * 0', 'SELECT cleanup_archive_logs();');
```

### **4. Integração no Frontend**

Adicione o componente de monitoramento:

```tsx
// No ArchiveManager.tsx
import AutoArchiveMonitor from './AutoArchiveMonitor';

// Adicionar estado
const [showMonitor, setShowMonitor] = useState(false);

// Adicionar botão no header
<button
  onClick={() => setShowMonitor(true)}
  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
  title="Monitor de Arquivamento"
>
  <Activity className="w-5 h-5" />
</button>

// Adicionar componente
<AutoArchiveMonitor 
  isOpen={showMonitor} 
  onClose={() => setShowMonitor(false)} 
/>
```

## 📊 **Funcionalidades do Sistema**

### **1. Execução Automática**
- **Função**: `cron_auto_archive()`
- **Frequência**: Configurável (recomendado: 6 horas)
- **Critérios**: Cards concluídos há mais de X dias
- **Logs**: Registro completo de todas as execuções

### **2. Monitoramento em Tempo Real**
- **Dashboard**: Status do sistema, métricas, saúde
- **Logs**: Histórico de execuções com detalhes
- **Alertas**: Notificações de problemas
- **Atualização**: Automática a cada 30 segundos

### **3. Sistema de Saúde**
- **Verificação**: Status do sistema, configurações, execuções
- **Recomendações**: Sugestões automáticas de otimização
- **Alertas**: Problemas detectados automaticamente

### **4. Configurações Flexíveis**
- **Por Board**: Diferentes regras por projeto
- **Global**: Configuração para todos os boards
- **Dias**: Configurável por configuração
- **Pastas**: Destino personalizado por configuração

## 🔧 **Comandos Úteis**

### **Execução Manual**
```sql
-- Executar arquivamento manual
SELECT cron_auto_archive();

-- Verificar status do sistema
SELECT check_archive_system_health();

-- Ver dashboard
SELECT * FROM archive_dashboard;
```

### **Monitoramento**
```sql
-- Ver logs de execução
SELECT * FROM archive_execution_log 
ORDER BY executed_at DESC 
LIMIT 10;

-- Ver configurações ativas
SELECT * FROM archive_settings 
WHERE auto_archive_enabled = true;

-- Ver cards prontos para arquivamento
SELECT COUNT(*) FROM cards c
JOIN archive_settings s ON (s.board_id IS NULL OR c.board_id = s.board_id)
WHERE c.is_archived = false 
AND c.status = 'done'
AND c.completed_at IS NOT NULL
AND s.auto_archive_enabled = true
AND c.completed_at <= NOW() - INTERVAL '1 day' * s.archive_after_days;
```

## 📈 **Métricas e Relatórios**

### **Dashboard Principal**
- Status do sistema (ATIVO/INATIVO)
- Configurações ativas
- Boards configurados
- Cards prontos para arquivamento
- Execuções bem-sucedidas (24h)
- Cards arquivados (24h)
- Última execução bem-sucedida

### **Status de Saúde**
- **healthy**: Sistema funcionando normalmente
- **inactive**: Nenhuma configuração ativa
- **stale**: Última execução há mais de 2 horas
- **overloaded**: Mais de 100 cards pendentes

### **Logs de Execução**
- Data/hora da execução
- Status (success/error)
- Cards arquivados
- Duração da execução
- Configurações verificadas
- Mensagens de erro (se houver)

## 🚨 **Troubleshooting**

### **Problemas Comuns**

1. **Sistema não está arquivando**
   - Verificar se `auto_archive_enabled = true`
   - Verificar se há cards concluídos há mais de X dias
   - Verificar logs de execução

2. **Execuções falhando**
   - Verificar logs de erro
   - Verificar permissões do banco
   - Verificar configurações

3. **Performance lenta**
   - Verificar índices do banco
   - Limpar logs antigos
   - Otimizar configurações

### **Comandos de Diagnóstico**
```sql
-- Verificar saúde do sistema
SELECT check_archive_system_health();

-- Ver configurações ativas
SELECT * FROM archive_settings WHERE auto_archive_enabled = true;

-- Ver cards que deveriam ser arquivados
SELECT c.id, c.title, c.completed_at, 
       EXTRACT(DAYS FROM (NOW() - c.completed_at)) as dias_desde_conclusao
FROM cards c
JOIN archive_settings s ON (s.board_id IS NULL OR c.board_id = s.board_id)
WHERE c.is_archived = false 
AND c.status = 'done'
AND s.auto_archive_enabled = true
AND c.completed_at <= NOW() - INTERVAL '1 day' * s.archive_after_days;
```

## 🎯 **Próximos Passos**

1. **Execute os scripts SQL** na ordem correta
2. **Configure o cron job** ou Edge Function
3. **Teste o sistema** com execução manual
4. **Monitore** através do dashboard
5. **Ajuste configurações** conforme necessário

## 📞 **Suporte**

- **Logs**: Verifique `archive_execution_log` para detalhes
- **Status**: Use `check_archive_system_health()` para diagnóstico
- **Dashboard**: Monitore através da view `archive_dashboard`
- **Frontend**: Use o componente `AutoArchiveMonitor` para interface

---

**Sistema implementado com sucesso! 🎉**

O arquivamento automático agora está configurado para funcionar de forma contínua e comunicacional com o banco de dados.

# 🔧 GUIA PARA CORRIGIR TABELAS DO SUPABASE

## ❌ **PROBLEMA IDENTIFICADO:**
O Cloud Deploy Manager está funcionando, mas as tabelas do Supabase precisam ser criadas/corrigidas.

### **Erros encontrados:**
1. ❌ Tabela `historico_deploys` não existe
2. ❌ Coluna `download_url` não existe na tabela `versoes_sistema`

---

## ✅ **SOLUÇÃO:**

### **PASSO 1: Acessar o Supabase**
1. Abra o navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login na sua conta
4. Selecione o projeto: `takwmhdwydujndqlznqk`

### **PASSO 2: Abrir SQL Editor**
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"** (Nova consulta)

### **PASSO 3: Executar o SQL**
Cole o seguinte código SQL e clique em **"Run"**:

```sql
-- 1. Criar tabela historico_deploys
CREATE TABLE IF NOT EXISTS historico_deploys (
    id SERIAL PRIMARY KEY,
    versao VARCHAR(20) NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL,
    mensagem TEXT,
    detalhes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para historico_deploys
CREATE INDEX IF NOT EXISTS idx_historico_deploys_versao ON historico_deploys(versao);
CREATE INDEX IF NOT EXISTS idx_historico_deploys_data_hora ON historico_deploys(data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_historico_deploys_status ON historico_deploys(status);

-- 3. Adicionar coluna download_url na tabela versoes_sistema (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'versoes_sistema' 
        AND column_name = 'download_url'
    ) THEN
        ALTER TABLE versoes_sistema ADD COLUMN download_url TEXT;
    END IF;
END $$;

-- 4. Adicionar coluna status na tabela versoes_sistema (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'versoes_sistema' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE versoes_sistema ADD COLUMN status VARCHAR(50) DEFAULT 'ativo';
    END IF;
END $$;

-- 5. Adicionar comentários
COMMENT ON TABLE historico_deploys IS 'Histórico de deploys do Boodesk';
COMMENT ON COLUMN historico_deploys.versao IS 'Versão do deploy';
COMMENT ON COLUMN historico_deploys.data_hora IS 'Data e hora do deploy';
COMMENT ON COLUMN historico_deploys.status IS 'Status do deploy (Iniciado, Concluído, Falhou, Erro)';
COMMENT ON COLUMN historico_deploys.mensagem IS 'Mensagem descritiva do deploy';
COMMENT ON COLUMN historico_deploys.detalhes IS 'Detalhes adicionais em formato JSON';
COMMENT ON COLUMN versoes_sistema.download_url IS 'URL de download da versão';
COMMENT ON COLUMN versoes_sistema.status IS 'Status da versão (ativo, inativo, deprecated)';
```

### **PASSO 4: Verificar Resultado**
Após executar, você deve ver:
- ✅ **Success** na mensagem de resultado
- ✅ Tabela `historico_deploys` criada
- ✅ Coluna `download_url` adicionada à `versoes_sistema`

---

## 🎯 **APÓS CORRIGIR:**

### **1. Testar o Cloud Deploy Manager:**
```bash
python cloud_deploy_manager.py
```

### **2. Verificar se os erros sumiram:**
- ✅ Histórico de deploys carregado
- ✅ Versões registradas com sucesso
- ✅ Sistema funcionando completamente

### **3. Fazer um novo deploy:**
- Clique em "☁️ Deploy na Nuvem"
- Versão será incrementada automaticamente
- Histórico será salvo corretamente

---

## 📊 **O QUE SERÁ CRIADO:**

### **Tabela `historico_deploys`:**
- **id**: ID único do registro
- **versao**: Versão do deploy (ex: 2.4.1)
- **data_hora**: Data e hora do deploy
- **status**: Status (Iniciado, Concluído, Falhou, Erro)
- **mensagem**: Descrição detalhada
- **detalhes**: Informações adicionais em JSON

### **Coluna `download_url` em `versoes_sistema`:**
- **download_url**: URL para download da versão
- Permite download direto do Cloudflare R2

---

## 🚀 **RESULTADO FINAL:**

Após executar o SQL, o sistema terá:
- ✅ **Versionamento automático** funcionando
- ✅ **Histórico de deploys** completo
- ✅ **Download de versões** via R2
- ✅ **Interface melhorada** no Cloud Manager
- ✅ **Logs detalhados** de cada deploy

**🎯 Sistema 100% funcional após a correção!**

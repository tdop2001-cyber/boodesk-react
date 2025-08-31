# 🔑 INSTRUÇÕES PARA CONFIGURAR CREDENCIAIS R2

## ✅ CONFIGURAÇÕES ENCONTRADAS

### **Cloudflare R2 Configurado:**
- ✅ **Account ID**: `d20101af9dd64057603c4871abeb1b0c`
- ✅ **Endpoint**: `https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com`
- ✅ **Bucket**: `boodesk-uploads`
- ⚠️ **Access Key ID**: Precisa ser configurado
- ⚠️ **Secret Access Key**: Precisa ser configurado

---

## 🔧 PASSO 1: OBTER CREDENCIAIS R2

### **1.1 Acessar Cloudflare Dashboard**
1. Acesse: https://dash.cloudflare.com/
2. Faça login na sua conta
3. Vá em "R2 Object Storage"

### **1.2 Criar API Token**
1. Clique em "Manage R2 API tokens"
2. Clique em "Create API token"
3. Configure:
   - **Permissions**: Object Read & Write
   - **Resources**: Include - Specific bucket - `boodesk-uploads`
4. Clique em "Create API Token"
5. **Anote**:
   - Access Key ID
   - Secret Access Key

### **1.3 Verificar Bucket**
1. Vá em "R2 Object Storage"
2. Verifique se o bucket `boodesk-uploads` existe
3. Se não existir, crie-o

---

## 🔧 PASSO 2: CONFIGURAR ARQUIVO .ENV

### **2.1 Editar arquivo .env**
Edite o arquivo `.env` e substitua:

```bash
# Configurações do Cloudflare R2
R2_ACCESS_KEY_ID=SUA_ACCESS_KEY_ID_REAL_AQUI
R2_SECRET_ACCESS_KEY=SUA_SECRET_ACCESS_KEY_REAL_AQUI
CLOUDFLARE_ACCOUNT_ID=d20101af9dd64057603c4871abeb1b0c
R2_ENDPOINT=https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com
R2_BUCKET_NAME=boodesk-uploads
```

### **2.2 Ou usar script automático**
```bash
python configurar_credenciais_r2.py
```

---

## 🧪 PASSO 3: TESTAR CONFIGURAÇÃO

### **3.1 Testar conexão R2**
```bash
python -c "
import boto3
import os
from dotenv import load_dotenv
load_dotenv()

r2_client = boto3.client(
    's3',
    endpoint_url=os.getenv('R2_ENDPOINT'),
    aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
    region_name='auto'
)

try:
    response = r2_client.list_objects_v2(Bucket=os.getenv('R2_BUCKET_NAME'), MaxKeys=1)
    print('✅ Conexão R2 OK!')
    print(f'Bucket: {os.getenv(\"R2_BUCKET_NAME\")}')
except Exception as e:
    print(f'❌ Erro: {e}')
"
```

### **3.2 Testar upload**
```bash
python -c "
import boto3
import os
from dotenv import load_dotenv
load_dotenv()

r2_client = boto3.client(
    's3',
    endpoint_url=os.getenv('R2_ENDPOINT'),
    aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
    region_name='auto'
)

try:
    # Criar arquivo de teste
    with open('teste.txt', 'w') as f:
        f.write('Teste de upload R2')
    
    # Fazer upload
    r2_client.upload_file('teste.txt', os.getenv('R2_BUCKET_NAME'), 'teste.txt')
    print('✅ Upload teste OK!')
    
    # Limpar arquivo
    os.remove('teste.txt')
except Exception as e:
    print(f'❌ Erro no upload: {e}')
"
```

---

## 🚀 PASSO 4: EXECUTAR DEPLOY

### **4.1 Deploy completo**
```bash
python quick_deploy.py
```

### **4.2 Ou manualmente**
```bash
# 1. Deploy local
python deploy_manager.py

# 2. Deploy na nuvem
python cloud_deploy_manager.py

# 3. Integrar atualizações
python integrate_updater.py
```

---

## 📋 RESUMO DAS CONFIGURAÇÕES

### **Arquivos Atualizados:**
- ✅ `.env` - Credenciais R2
- ✅ `deploy_config.json` - Configuração do deploy
- ✅ `cloud_deploy_manager.py` - Bucket correto

### **Configurações R2:**
- **Account ID**: `d20101af9dd64057603c4871abeb1b0c`
- **Endpoint**: `https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com`
- **Bucket**: `boodesk-uploads`
- **Access Key ID**: [CONFIGURAR]
- **Secret Access Key**: [CONFIGURAR]

---

## ⚠️ IMPORTANTE

### **Segurança:**
- Nunca compartilhe suas credenciais R2
- Use variáveis de ambiente
- Não commite o arquivo .env no git

### **Bucket:**
- Certifique-se de que o bucket `boodesk-uploads` existe
- Configure as permissões corretas
- Teste o upload antes do deploy

### **Teste:**
- Sempre teste a conexão antes do deploy
- Verifique se o upload funciona
- Teste o sistema completo

---

## 🎯 COMANDOS RÁPIDOS

```bash
# Configurar credenciais
python configurar_credenciais_r2.py

# Testar conexão
python -c "import boto3; print('R2 OK')"

# Deploy completo
python quick_deploy.py

# Verificar status
python -c "from supabase import create_client; print('Supabase OK')"
```

**Sistema pronto para deploy! 🚀**





# ⚡ COMANDOS RÁPIDOS - DEPLOY CLOUDFLARE R2

## 🚀 **DEPLOY COMPLETO EM 3 PASSOS**

### **PASSO 1: Configurar Credenciais**
Edite o arquivo `.env` e adicione:
```env
R2_ACCESS_KEY_ID=sua_access_key_id_aqui
R2_SECRET_ACCESS_KEY=sua_secret_access_key_aqui
CLOUDFLARE_ACCOUNT_ID=d20101af9dd64057603c4871abeb1b0c
```

### **PASSO 2: Instalar Dependências**
```bash
pip install boto3 python-dotenv requests
```

### **PASSO 3: Executar Deploy**
```bash
python deploy_automatico.py
```

---

## 📋 **COMANDOS INDIVIDUAIS**

### **Deploy Manual**
```bash
python upload_to_cloudflare.py
```

### **Deploy Automático (Recomendado)**
```bash
python deploy_automatico.py
```

### **Testar Aplicativo**
```bash
python app23a.py
```

### **Verificar Configuração**
```bash
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('R2_ACCESS_KEY_ID:', '✅' if os.getenv('R2_ACCESS_KEY_ID') else '❌'); print('R2_SECRET_ACCESS_KEY:', '✅' if os.getenv('R2_SECRET_ACCESS_KEY') else '❌'); print('CLOUDFLARE_ACCOUNT_ID:', '✅' if os.getenv('CLOUDFLARE_ACCOUNT_ID') else '❌')"
```

---

## 🔍 **VERIFICAÇÃO RÁPIDA**

### **Verificar Arquivos**
```bash
ls -la boodesk_latest.exe upload_to_cloudflare.py cloud_deploy_config.json
```

### **Verificar URLs**
Abra no navegador:
- **Executável**: https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com/boodesk-cdn/boodesk_latest.exe
- **Versão**: https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com/boodesk-cdn/version.json
- **Changelog**: https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com/boodesk-cdn/changelog.txt

---

## 🎯 **TESTE RÁPIDO DO SISTEMA**

### **1. Executar Aplicativo**
```bash
python app23a.py
```

### **2. Testar Atualizações**
1. Menu → Atualizações → Verificar Atualizações
2. Clique em "Verificar Novamente"
3. Clique em "Download Atualização"
4. Clique em "Instalar Atualização"

---

## ⚠️ **SOLUÇÃO DE PROBLEMAS**

### **Erro: "Variáveis não configuradas"**
```bash
# Verificar arquivo .env
cat .env

# Recarregar variáveis
source .env
```

### **Erro: "Bucket não encontrado"**
1. Acesse: https://dash.cloudflare.com
2. R2 Object Storage → Create bucket
3. Nome: `boodesk-cdn`

### **Erro: "Arquivo não encontrado"**
```bash
# Verificar se o arquivo existe
ls -la boodesk_latest.exe

# Recriar arquivo de exemplo
python -c "import os; open('boodesk_latest.exe', 'wb').write(b'MZ' + b'\x90' * 58 + b'PE\x00\x00' + b'BOODESK_SAMPLE' * 1000)"
```

---

## 📊 **STATUS DO SISTEMA**

### **Verificar Status Completo**
```bash
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

print('🔍 STATUS DO SISTEMA')
print('=' * 30)
print(f'Arquivo boodesk_latest.exe: {\"✅\" if os.path.exists(\"boodesk_latest.exe\") else \"❌\"}')
print(f'Script upload_to_cloudflare.py: {\"✅\" if os.path.exists(\"upload_to_cloudflare.py\") else \"❌\"}')
print(f'Config cloud_deploy_config.json: {\"✅\" if os.path.exists(\"cloud_deploy_config.json\") else \"❌\"}')
print(f'Variáveis de ambiente: {\"✅\" if all([os.getenv(\"R2_ACCESS_KEY_ID\"), os.getenv(\"R2_SECRET_ACCESS_KEY\"), os.getenv(\"CLOUDFLARE_ACCOUNT_ID\")]) else \"❌\"}')
print(f'Aplicativo app23a.py: {\"✅\" if os.path.exists(\"app23a.py\") else \"❌\"}')
"
```

---

## 🎉 **SUCESSO!**

Se tudo estiver funcionando, você verá:
- ✅ Deploy concluído
- ✅ URLs acessíveis
- ✅ Sistema de atualizações funcionando
- ✅ Download e instalação operacionais

**Sistema pronto para uso!** 🚀




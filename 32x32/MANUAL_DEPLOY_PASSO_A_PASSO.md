# 🚀 MANUAL DE DEPLOY PASSO A PASSO - BOODESK

## 📋 PRÉ-REQUISITOS

### 1. **Configurações do Supabase** ✅ (JÁ CONFIGURADO)
```python
SUPABASE_URL = "https://takwmhdwydujndqlznqk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE"
```

### 2. **Configurações do Cloudflare R2** ⚠️ (PRECISA CONFIGURAR)
```bash
# Configurar variáveis de ambiente
R2_ACCESS_KEY_ID=sua_access_key_aqui
R2_SECRET_ACCESS_KEY=sua_secret_key_aqui
CLOUDFLARE_ACCOUNT_ID=seu_account_id_aqui
```

### 3. **Dependências Python**
```bash
pip install supabase boto3 python-dotenv pillow psycopg2-binary pyinstaller requests
```

---

## 🔧 PASSO 1: PREPARAR O AMBIENTE

### 1.1 **Verificar arquivos necessários**
```bash
# Verificar se os arquivos existem
ls -la app23a.py
ls -la cloud_deploy_manager.py
ls -la auto_updater.py
ls -la deploy_manager.py
```

### 1.2 **Configurar credenciais R2** (OPCIONAL)
```bash
# Criar arquivo .env
echo "R2_ACCESS_KEY_ID=sua_access_key_aqui" > .env
echo "R2_SECRET_ACCESS_KEY=sua_secret_key_aqui" >> .env
echo "CLOUDFLARE_ACCOUNT_ID=seu_account_id_aqui" >> .env
```

### 1.3 **Executar migração do banco**
```bash
# Executar migração SQL no Supabase
python -c "
from supabase import create_client
supabase = create_client('https://takwmhdwydujndqlznqk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE')

# Executar migração
with open('supabase/migrations/003_update_system.sql', 'r') as f:
    sql = f.read()
    # Executar no Supabase (via SQL Editor)
    print('Execute o SQL no Supabase SQL Editor')
"
```

---

## 🚀 PASSO 2: DEPLOY LOCAL (TESTE)

### 2.1 **Usar Deploy Manager Local**
```bash
# Executar deploy manager local
python deploy_manager.py
```

**Interface do Deploy Manager:**
1. **Configurações do App:**
   - Nome: `BoodeskApp`
   - Versão: `2.4.0`
   - Arquivo Principal: `app23a.py`

2. **Plataformas:**
   - ✅ Windows (.exe)
   - ✅ Linux (.AppImage) 
   - ✅ macOS (.dmg)

3. **Opções:**
   - ✅ Criar backup
   - ✅ Limpar builds anteriores
   - ✅ Auto-upload (se configurado)

4. **Clicar em "🚀 Deploy"**

### 2.2 **Verificar Build Local**
```bash
# Verificar se os executáveis foram criados
ls -la dist/
# Deve mostrar:
# - BoodeskApp_windows.exe
# - BoodeskApp_linux.AppImage
# - BoodeskApp_macos.dmg
```

---

## ☁️ PASSO 3: DEPLOY NA NUVEM

### 3.1 **Usar Cloud Deploy Manager**
```bash
# Executar cloud deploy manager
python cloud_deploy_manager.py
```

**Interface do Cloud Deploy Manager:**

1. **📱 Configurações do App:**
   - Nome do App: `BoodeskApp`
   - Versão: `2.4.0`
   - Arquivo Principal: `app23a.py`

2. **☁️ Configurações da Nuvem:**
   - Supabase URL: `https://takwmhdwydujndqlznqk.supabase.co`
   - R2 Endpoint: `https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com`
   - R2 Bucket: `boodesk-cdn`

3. **🚀 Opções de Deploy:**
   - ✅ Windows (.exe)
   - ✅ Linux (.AppImage)
   - ✅ macOS (.dmg)
   - ✅ Notificar usuários
   - ✅ Criar backup

4. **📝 Changelog:**
   ```
   - Correção de bugs
   - Melhorias na interface
   - Novas funcionalidades
   - Sistema de atualizações automáticas
   ```

5. **Clicar em "☁️ Deploy na Nuvem"**

### 3.2 **Processo Automático**
O sistema fará automaticamente:

1. **ETAPA 1: Build local**
   - Instalar PyInstaller se necessário
   - Construir executáveis para todas as plataformas
   - Verificar se os builds foram bem-sucedidos

2. **ETAPA 2: Upload para R2**
   - Fazer upload dos executáveis para Cloudflare R2
   - Calcular hash SHA256 dos arquivos
   - Gerar URLs públicas de download

3. **ETAPA 3: Registrar versão**
   - Inserir nova versão no Supabase
   - Salvar informações dos arquivos
   - Configurar plataformas suportadas

4. **ETAPA 4: Notificar usuários**
   - Criar notificação no sistema
   - Configurar dados de download
   - Ativar notificação para usuários

---

## 🔍 PASSO 4: VERIFICAR DEPLOY

### 4.1 **Verificar no Supabase**
```bash
# Verificar versões registradas
python -c "
from supabase import create_client
supabase = create_client('https://takwmhdwydujndqlznqk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE')

response = supabase.table('versoes_sistema').select('*').execute()
print('Versões registradas:')
for version in response.data:
    print(f'- {version[\"versao\"]} ({version[\"data_lancamento\"]})')
"
```

### 4.2 **Verificar no Cloudflare R2**
```bash
# Verificar arquivos no R2 (se credenciais configuradas)
python -c "
import boto3
import os

r2_client = boto3.client(
    's3',
    endpoint_url='https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com',
    aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
    region_name='auto'
)

try:
    response = r2_client.list_objects_v2(Bucket='boodesk-cdn', Prefix='releases/')
    print('Arquivos no R2:')
    for obj in response.get('Contents', []):
        print(f'- {obj[\"Key\"]} ({obj[\"Size\"]} bytes)')
except Exception as e:
    print(f'Erro ao verificar R2: {e}')
"
```

---

## 🧪 PASSO 5: TESTAR ATUALIZAÇÕES

### 5.1 **Testar Auto Updater**
```bash
# Executar teste do sistema de atualizações
python auto_updater.py
```

### 5.2 **Integrar ao App Principal**
```bash
# Integrar sistema de atualizações ao app
python integrate_updater.py
```

### 5.3 **Testar App com Atualizações**
```bash
# Executar app principal
python app23a.py
```

**Verificar no app:**
1. Menu "Ajuda" → "Verificar Atualizações"
2. Deve mostrar diálogo de atualização se houver nova versão
3. Testar download e instalação automática

---

## 📊 PASSO 6: MONITORAMENTO

### 6.1 **Verificar Logs**
```bash
# Verificar logs do deploy
cat deploy_log.txt
```

### 6.2 **Verificar Notificações**
```bash
# Verificar notificações criadas
python -c "
from supabase import create_client
supabase = create_client('https://takwmhdwydujndqlznqk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE')

response = supabase.table('notificacoes_sistema').select('*').execute()
print('Notificações do sistema:')
for notification in response.data:
    print(f'- {notification[\"titulo\"]} ({notification[\"tipo\"]})')
"
```

---

## 🎯 COMANDOS RÁPIDOS

### **Deploy Completo (Local + Nuvem)**
```bash
# 1. Deploy local
python deploy_manager.py

# 2. Deploy na nuvem
python cloud_deploy_manager.py

# 3. Integrar atualizações
python integrate_updater.py

# 4. Testar
python app23a.py
```

### **Verificar Status**
```bash
# Verificar versões
python -c "from supabase import create_client; supabase = create_client('https://takwmhdwydujndqlznqk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE'); print('Versões:', len(supabase.table('versoes_sistema').select('*').execute().data))"

# Verificar notificações
python -c "from supabase import create_client; supabase = create_client('https://takwmhdwydujndqlznqk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE'); print('Notificações:', len(supabase.table('notificacoes_sistema').select('*').execute().data))"
```

---

## ⚠️ TROUBLESHOOTING

### **Erro: PyInstaller não encontrado**
```bash
pip install pyinstaller
```

### **Erro: Credenciais R2 não configuradas**
```bash
# Configurar variáveis de ambiente ou usar apenas Supabase
export R2_ACCESS_KEY_ID=sua_key
export R2_SECRET_ACCESS_KEY=sua_secret
```

### **Erro: Tabelas não existem no Supabase**
```bash
# Executar migração SQL no Supabase SQL Editor
# Copiar conteúdo de: supabase/migrations/003_update_system.sql
```

### **Erro: Arquivo principal não encontrado**
```bash
# Verificar se app23a.py existe
ls -la app23a.py
```

---

## 🎉 RESULTADO FINAL

Após seguir todos os passos, você terá:

1. ✅ **Executáveis gerados** para Windows, Linux e macOS
2. ✅ **Upload automático** para Cloudflare R2
3. ✅ **Versão registrada** no Supabase
4. ✅ **Notificações** para usuários
5. ✅ **Sistema de atualizações** integrado ao app
6. ✅ **Download automático** de novas versões

**Os usuários receberão automaticamente:**
- Notificação de nova versão disponível
- Download automático da versão correta para sua plataforma
- Instalação automática com reinicialização do app

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verificar logs** no Cloud Deploy Manager
2. **Testar conexões** com Supabase e R2
3. **Verificar dependências** Python
4. **Consultar documentação** do sistema

**Sistema funcionando! 🚀**





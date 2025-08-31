# 🚀 GUIA DE INSTALAÇÃO - BOODESK

## 📋 PRÉ-REQUISITOS

### 🔧 REQUISITOS DO SISTEMA
- **Python**: 3.8 ou superior
- **Node.js**: 16 ou superior (para Edge Functions)
- **Git**: Para versionamento
- **PostgreSQL**: 13 ou superior (opcional, Supabase fornece)

### 📦 DEPENDÊNCIAS PYTHON
```bash
pip install -r requirements.txt
```

### 📦 DEPENDÊNCIAS NODE.JS
```bash
npm install -g supabase
npm install -g @supabase/supabase-js
```

---

## 🏗️ CONFIGURAÇÃO INICIAL

### 1️⃣ CONFIGURAR SUPABASE

#### **Criar Projeto Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login e crie um novo projeto
3. Anote as credenciais:
   - Project URL
   - Anon Key
   - Service Role Key

#### **Configurar Variáveis de Ambiente**
```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### **Deploy das Migrações**
```bash
# Login no Supabase CLI
supabase login

# Inicializar projeto
supabase init

# Linkar ao projeto remoto
supabase link --project-ref your-project-ref

# Deploy das migrações
supabase db push

# Deploy das Edge Functions
supabase functions deploy upload-handler
supabase functions deploy image-processor
supabase functions deploy notification-sender
supabase functions deploy report-generator
```

### 2️⃣ CONFIGURAR CLOUDFLARE R2

#### **Criar Bucket R2**
1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá para R2 Object Storage
3. Crie um novo bucket chamado `boodesk-uploads`
4. Configure as políticas de acesso

#### **Configurar CORS**
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

#### **Configurar Variáveis R2**
```bash
# .env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=boodesk-uploads
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### 3️⃣ CONFIGURAR EMAIL

#### **Gmail SMTP**
```bash
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@boodesk.com
```

#### **Outlook SMTP**
```bash
# .env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=noreply@boodesk.com
```

### 4️⃣ CONFIGURAR GOOGLE CALENDAR

#### **Criar Projeto Google Cloud**
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative a Google Calendar API
4. Crie credenciais OAuth 2.0
5. Baixe o arquivo `credentials.json`

#### **Configurar Credenciais**
```bash
# Colocar credentials.json na raiz do projeto
cp credentials.json ./credentials.json

# Configurar variáveis
GOOGLE_CALENDAR_CREDENTIALS=./credentials.json
```

---

## 🚀 INSTALAÇÃO PASSO A PASSO

### **Passo 1: Clonar Repositório**
```bash
git clone https://github.com/seu-usuario/boodesk.git
cd boodesk
```

### **Passo 2: Instalar Dependências Python**
```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### **Passo 3: Configurar Arquivos**
```bash
# Copiar arquivo de configuração
cp cloudflare-r2-config.json.example cloudflare-r2-config.json

# Editar configurações
nano cloudflare-r2-config.json
```

### **Passo 4: Configurar Banco de Dados**
```bash
# Deploy das migrações
supabase db push

# Verificar se as tabelas foram criadas
supabase db diff
```

### **Passo 5: Configurar Edge Functions**
```bash
# Deploy das funções
supabase functions deploy upload-handler
supabase functions deploy image-processor
supabase functions deploy notification-sender
supabase functions deploy report-generator

# Verificar status
supabase functions list
```

### **Passo 6: Testar Instalação**
```bash
# Executar aplicação
python app23a.py

# Verificar logs
tail -f logs/boodesk.log
```

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### **Configurar Domínio Customizado (Opcional)**
```bash
# Configurar DNS para R2
# Adicionar CNAME record:
# uploads.yourdomain.com -> your-bucket.your-account-id.r2.cloudflarestorage.com

# Atualizar configuração
{
  "r2": {
    "publicUrl": "https://uploads.yourdomain.com"
  }
}
```

### **Configurar SSL/TLS**
```bash
# Supabase já fornece SSL automaticamente
# Para R2, configurar no Cloudflare Dashboard:
# 1. Vá para R2 Object Storage
# 2. Selecione seu bucket
# 3. Configure Custom Domain
# 4. Ative SSL/TLS
```

### **Configurar Backup Automático**
```bash
# Criar script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# Backup do banco
supabase db dump > $BACKUP_DIR/db_backup_$DATE.sql

# Backup das configurações
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz *.json *.env

echo "Backup criado: $BACKUP_DIR/backup_$DATE"
EOF

chmod +x backup.sh

# Adicionar ao crontab (backup diário às 2h)
crontab -e
# Adicionar linha:
# 0 2 * * * /path/to/boodesk/backup.sh
```

---

## 🧪 TESTES E VERIFICAÇÃO

### **Testar Conexão com Supabase**
```python
# test_supabase.py
import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
supabase = create_client(url, key)

# Testar conexão
try:
    response = supabase.table('users').select("*").limit(1).execute()
    print("✅ Conexão com Supabase OK")
except Exception as e:
    print(f"❌ Erro na conexão: {e}")
```

### **Testar Upload para R2**
```python
# test_r2.py
import boto3
import os

s3 = boto3.client(
    's3',
    endpoint_url=os.environ.get('R2_ENDPOINT'),
    aws_access_key_id=os.environ.get('R2_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('R2_SECRET_ACCESS_KEY')
)

try:
    # Testar upload
    s3.put_object(
        Bucket=os.environ.get('R2_BUCKET_NAME'),
        Key='test/test.txt',
        Body='Hello R2!'
    )
    print("✅ Upload para R2 OK")
except Exception as e:
    print(f"❌ Erro no upload: {e}")
```

### **Testar Email**
```python
# test_email.py
import smtplib
from email.mime.text import MIMEText
import os

try:
    msg = MIMEText('Teste de email do Boodesk')
    msg['Subject'] = 'Teste Boodesk'
    msg['From'] = os.environ.get('SMTP_USER')
    msg['To'] = 'test@example.com'

    server = smtplib.SMTP(os.environ.get('SMTP_HOST'), int(os.environ.get('SMTP_PORT')))
    server.starttls()
    server.login(os.environ.get('SMTP_USER'), os.environ.get('SMTP_PASS'))
    server.send_message(msg)
    server.quit()
    print("✅ Email enviado com sucesso")
except Exception as e:
    print(f"❌ Erro no email: {e}")
```

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### **Problemas Comuns**

#### **Erro de Conexão com Supabase**
```bash
# Verificar variáveis de ambiente
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Verificar status do projeto
supabase status

# Re-linkar projeto se necessário
supabase link --project-ref your-project-ref
```

#### **Erro de Upload para R2**
```bash
# Verificar credenciais R2
aws s3 ls s3://your-bucket-name --endpoint-url https://your-account-id.r2.cloudflarestorage.com

# Verificar permissões do bucket
# No Cloudflare Dashboard, verificar se o bucket está público
```

#### **Erro de Email**
```bash
# Verificar configurações SMTP
telnet smtp.gmail.com 587

# Para Gmail, verificar se App Password está habilitado
# 1. Ativar 2FA na conta Google
# 2. Gerar App Password específico
```

#### **Erro de Google Calendar**
```bash
# Verificar arquivo credentials.json
cat credentials.json

# Verificar se a API está ativada
# No Google Cloud Console, verificar se Google Calendar API está ativa
```

### **Logs e Debug**
```bash
# Verificar logs da aplicação
tail -f logs/boodesk.log

# Verificar logs do Supabase
supabase logs

# Verificar logs das Edge Functions
supabase functions logs upload-handler
```

---

## 📚 RECURSOS ADICIONAIS

### **Documentação Oficial**
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Google Calendar API](https://developers.google.com/calendar)

### **Comunidade**
- [Supabase Discord](https://discord.supabase.com)
- [Cloudflare Community](https://community.cloudflare.com)

### **Suporte**
- Criar issue no GitHub
- Consultar documentação oficial
- Verificar logs de erro

---

## ✅ CHECKLIST FINAL

- [ ] Supabase configurado e migrações aplicadas
- [ ] Cloudflare R2 configurado e bucket criado
- [ ] Email SMTP configurado e testado
- [ ] Google Calendar API configurada
- [ ] Edge Functions deployadas
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação executando sem erros
- [ ] Upload de arquivos funcionando
- [ ] Sistema de chat funcionando
- [ ] Reuniões sendo criadas
- [ ] Notificações sendo enviadas
- [ ] Backup configurado

---

*Se todos os itens estiverem marcados, sua instalação está completa! 🎉*

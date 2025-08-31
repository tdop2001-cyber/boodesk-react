# 🔗 GUIA DAS INTEGRAÇÕES EXISTENTES - BOODESK

## 🎯 VISÃO GERAL

O **Boodesk** já possui integrações completas e funcionais com **Supabase** e **Cloudflare R2**. Este guia mostra como usar essas integrações no desenvolvimento.

---

## ✅ SUPABASE - INTEGRAÇÃO ATIVA

### 🔧 CONFIGURAÇÃO ATUAL

```python
# supabase_setup.py - JÁ CONFIGURADO
SUPABASE_URL = "https://takwmhdwydujndqlznqk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE"

# PostgreSQL
HOST = "db.takwmhdwydujndqlznqk.supabase.co"
DATABASE = "postgres"
USER = "postgres"
PASSWORD = "2412"
PORT = "5432"
```

### 📊 COMO USAR O BANCO DE DADOS

```python
# Exemplo de uso do banco Supabase
from supabase_setup import supabase_config

# Obter conexão
conn = supabase_config.get_connection()

# Executar query
cursor = conn.cursor()
cursor.execute("SELECT * FROM users WHERE is_active = TRUE")
users = cursor.fetchall()

# Fechar conexão
cursor.close()
conn.close()
```

### 📁 COMO USAR O STORAGE

```python
# Exemplo de upload para Supabase Storage
from supabase import create_client

supabase = create_client(
    "https://takwmhdwydujndqlznqk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE"
)

# Upload de arquivo
with open('documento.pdf', 'rb') as f:
    result = supabase.storage.from_('boodesk-files').upload(
        path='documentos/documento.pdf',
        file=f
    )

# Obter URL pública
url = supabase.storage.from_('boodesk-files').get_public_url('documentos/documento.pdf')
```

---

## ☁️ CLOUDFLARE R2 - INTEGRAÇÃO ATIVA

### 🔧 CONFIGURAÇÃO ATUAL

```python
# sistema_upload_completo.py - JÁ CONFIGURADO
R2_ENDPOINT = "https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com"
R2_BUCKET = "boodesk-cdn"
R2_REGION = "auto"
```

### 📤 COMO USAR O UPLOAD HÍBRIDO

```python
# Exemplo de uso do sistema de upload completo
from sistema_upload_completo import SistemaUploadCompleto

# Inicializar sistema
sistema = SistemaUploadCompleto(
    supabase_url="https://takwmhdwydujndqlznqk.supabase.co",
    supabase_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE"
)

# Upload automático (escolhe o melhor serviço)
resultado = sistema.upload_arquivo(
    file_path="arquivo_grande.zip",
    categoria="documentos"
)

if resultado["success"]:
    print(f"✅ Upload realizado: {resultado['url']}")
    print(f"🌐 Provedor: {resultado['provider']}")
else:
    print(f"❌ Erro: {resultado['error']}")
```

### 🔄 CRITÉRIOS DE ESCOLHA AUTOMÁTICA

O sistema escolhe automaticamente onde fazer upload:

| Tamanho | Tipo de Arquivo | Serviço Escolhido | Motivo |
|---------|----------------|-------------------|---------|
| < 10MB | Qualquer | Supabase | Gratuito e rápido |
| 10-50MB | Documentos/Imagens | Supabase | Limite do Supabase |
| > 50MB | Qualquer | Cloudflare R2 | Arquivo muito grande |
| Qualquer | Executáveis (.exe, .msi) | Cloudflare R2 | Segurança |
| Qualquer | Vídeos (.mp4, .avi) | Cloudflare R2 | Otimização |

---

## 🚀 EXEMPLOS PRÁTICOS DE USO

### 📝 EXEMPLO 1: UPLOAD DE FOTO DE PERFIL

```python
def upload_foto_perfil(user_id: int, foto_path: str):
    """Upload de foto de perfil usando sistema híbrido"""
    
    sistema = SistemaUploadCompleto(SUPABASE_URL, SUPABASE_KEY)
    
    # Upload da foto
    resultado = sistema.upload_arquivo(
        file_path=foto_path,
        categoria="profile_images"
    )
    
    if resultado["success"]:
        # Atualizar banco de dados
        conn = supabase_config.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE users 
            SET profile_image_url = %s 
            WHERE id = %s
        """, (resultado["url"], user_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return resultado["url"]
    
    return None
```

### 📄 EXEMPLO 2: UPLOAD DE ANEXO DE CARTÃO

```python
def upload_anexo_cartao(card_id: int, arquivo_path: str):
    """Upload de anexo para cartão"""
    
    sistema = SistemaUploadCompleto(SUPABASE_URL, SUPABASE_KEY)
    
    # Upload do arquivo
    resultado = sistema.upload_arquivo(
        file_path=arquivo_path,
        categoria=f"card_attachments/card_{card_id}"
    )
    
    if resultado["success"]:
        # Salvar metadados no banco
        conn = supabase_config.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO card_attachments 
            (card_id, file_name, file_url, file_size, provider) 
            VALUES (%s, %s, %s, %s, %s)
        """, (
            card_id,
            os.path.basename(arquivo_path),
            resultado["url"],
            os.path.getsize(arquivo_path),
            resultado["provider"]
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return resultado["url"]
    
    return None
```

### 🎥 EXEMPLO 3: UPLOAD DE GRAVAÇÃO DE REUNIÃO

```python
def upload_gravacao_reuniao(meeting_id: int, video_path: str):
    """Upload de gravação de reunião (arquivo grande)"""
    
    sistema = SistemaUploadCompleto(SUPABASE_URL, SUPABASE_KEY)
    
    # Upload do vídeo (vai para R2 automaticamente)
    resultado = sistema.upload_arquivo(
        file_path=video_path,
        categoria=f"meeting_recordings/meeting_{meeting_id}"
    )
    
    if resultado["success"]:
        # Atualizar reunião com URL da gravação
        conn = supabase_config.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE meetings 
            SET recording_url = %s 
            WHERE id = %s
        """, (resultado["url"], meeting_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return resultado["url"]
    
    return None
```

---

## 🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE

### 📋 ARQUIVO .env NECESSÁRIO

```bash
# .env
# Supabase (já configurado)
SUPABASE_URL=https://takwmhdwydujndqlznqk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dtaGR3eWR1am5kcWx6bnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQ3MDMsImV4cCI6MjA3MTM2MDcwM30.XUuRWmLrvNXfCI9PtD-2CR2y3NkxMFKRyQT_gbkuIhE

# Cloudflare R2 (configurar suas credenciais)
R2_ACCESS_KEY=sua_access_key_aqui
R2_SECRET_KEY=sua_secret_key_aqui
R2_ENDPOINT=https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com
R2_BUCKET_NAME=boodesk-cdn
```

### 🔑 COMO OBTER CREDENCIAIS R2

1. **Acesse**: https://dash.cloudflare.com/
2. **Vá para**: R2 Object Storage
3. **Crie um bucket**: `boodesk-cdn`
4. **Gere credenciais**: API Tokens > R2 API Tokens
5. **Configure as variáveis**: R2_ACCESS_KEY e R2_SECRET_KEY

---

## 🧪 TESTES DAS INTEGRAÇÕES

### ✅ TESTE SUPABASE

```python
# test_supabase.py
from supabase_setup import supabase_config

def test_supabase_connection():
    """Testa conexão com Supabase"""
    try:
        conn = supabase_config.get_connection()
        if conn:
            print("✅ Conexão com Supabase OK")
            conn.close()
            return True
        else:
            print("❌ Falha na conexão com Supabase")
            return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    test_supabase_connection()
```

### ✅ TESTE CLOUDFLARE R2

```python
# test_r2.py
import boto3
import os

def test_r2_connection():
    """Testa conexão com Cloudflare R2"""
    try:
        s3 = boto3.client(
            's3',
            endpoint_url=os.getenv('R2_ENDPOINT'),
            aws_access_key_id=os.getenv('R2_ACCESS_KEY'),
            aws_secret_access_key=os.getenv('R2_SECRET_KEY')
        )
        
        # Testar upload
        s3.put_object(
            Bucket=os.getenv('R2_BUCKET_NAME'),
            Key='test/test.txt',
            Body='Hello R2!'
        )
        
        print("✅ Conexão com Cloudflare R2 OK")
        return True
        
    except Exception as e:
        print(f"❌ Erro R2: {e}")
        return False

if __name__ == "__main__":
    test_r2_connection()
```

### ✅ TESTE SISTEMA COMPLETO

```python
# test_sistema_completo.py
from sistema_upload_completo import SistemaUploadCompleto
import os

def test_sistema_upload():
    """Testa o sistema de upload completo"""
    
    sistema = SistemaUploadCompleto(
        supabase_url=os.getenv('SUPABASE_URL'),
        supabase_key=os.getenv('SUPABASE_ANON_KEY')
    )
    
    # Criar arquivo de teste
    with open('teste.txt', 'w') as f:
        f.write('Arquivo de teste para upload')
    
    # Testar upload
    resultado = sistema.upload_arquivo(
        file_path='teste.txt',
        categoria='testes'
    )
    
    if resultado["success"]:
        print(f"✅ Upload realizado: {resultado['url']}")
        print(f"🌐 Provedor: {resultado['provider']}")
        
        # Limpar arquivo de teste
        os.remove('teste.txt')
        return True
    else:
        print(f"❌ Erro: {resultado['error']}")
        return False

if __name__ == "__main__":
    test_sistema_upload()
```

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### ❌ PROBLEMA: "Supabase connection failed"

**Solução:**
```bash
# Verificar variáveis de ambiente
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Verificar se o arquivo .env está carregado
python -c "import os; print(os.getenv('SUPABASE_URL'))"
```

### ❌ PROBLEMA: "R2 credentials not found"

**Solução:**
```bash
# Verificar credenciais R2
echo $R2_ACCESS_KEY
echo $R2_SECRET_KEY

# Configurar credenciais
export R2_ACCESS_KEY="sua_access_key"
export R2_SECRET_KEY="sua_secret_key"
```

### ❌ PROBLEMA: "File too large for Supabase"

**Solução:**
- O sistema deve automaticamente redirecionar para R2
- Verificar se as credenciais R2 estão configuradas
- Verificar se o bucket R2 existe

---

## 📚 RECURSOS ADICIONAIS

### 🔗 DOCUMENTAÇÃO
- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)
- [Cloudflare R2 Python](https://developers.cloudflare.com/r2/api/s3/tokens/)
- [Boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

### 🛠️ FERRAMENTAS
- **Supabase CLI**: `npm install -g supabase`
- **AWS CLI**: Para testar R2 localmente
- **PostgreSQL Client**: Para acessar banco diretamente

### 💬 SUPORTE
- **Supabase**: [Discord Community](https://discord.supabase.com/)
- **Cloudflare**: [Community Forum](https://community.cloudflare.com/)
- **GitHub**: Issues do projeto

---

## ✅ CHECKLIST DE USO

- [ ] Variáveis de ambiente configuradas
- [ ] Supabase conectado e testado
- [ ] Cloudflare R2 configurado e testado
- [ ] Sistema de upload funcionando
- [ ] Uploads pequenos indo para Supabase
- [ ] Uploads grandes indo para R2
- [ ] URLs sendo geradas corretamente
- [ ] Metadados sendo salvos no banco

---

*As integrações estão prontas para uso! Apenas configure suas credenciais R2 e comece a desenvolver.* 🚀

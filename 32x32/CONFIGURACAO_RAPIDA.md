# ⚡ CONFIGURAÇÃO RÁPIDA - SISTEMA DE UPLOAD

## 🎯 **Resumo**
Sistema completo de upload integrando **Supabase Storage** + **Cloudflare R2** para arquivos grandes.

## 📋 **Pré-requisitos**
- ✅ Conta Supabase configurada
- ✅ Cloudflare R2 configurado (já feito!)
- ✅ Python 3.7+

## 🚀 **Configuração em 3 Passos**

### **Passo 1: Instalar Dependências**
```bash
pip install boto3 supabase python-dotenv
```

### **Passo 2: Configurar Credenciais**
```bash
python configurar_upload.py
```

**Ou manualmente:**
```bash
# Supabase
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_KEY="sua_chave_supabase"

# Cloudflare R2 (já configurado!)
export R2_ACCESS_KEY="sua_access_key"
export R2_SECRET_KEY="sua_secret_key"
```

### **Passo 3: Executar Schema SQL**
Execute o arquivo `schema_upload_sistema.sql` no seu banco Supabase.

## 🧪 **Testar Sistema**
```bash
python teste_upload_sistema.py
```

## 📁 **Estrutura de Arquivos**
```
📦 Sistema de Upload
├── sistema_upload_completo.py    # Sistema principal
├── teste_upload_sistema.py       # Testes completos
├── configurar_upload.py          # Configurador
├── schema_upload_sistema.sql     # Schema do banco
├── CONFIGURACAO_RAPIDA.md        # Este guia
└── GUIA_UPLOAD_COMPLETO.md       # Guia detalhado
```

## 🎯 **Como Usar**

### **Upload de Versão do Sistema**
```python
from sistema_upload_completo import SistemaUploadCompleto

sistema = SistemaUploadCompleto(SUPABASE_URL, SUPABASE_KEY)

# Upload de versão
resultado = sistema.upload_versao_sistema(
    "Boodesk_v1.0.1.exe",
    "1.0.1",
    "windows"
)
```

### **Upload de Arquivo Genérico**
```python
# Upload de documento
resultado = sistema.upload_arquivo(
    "documento.pdf",
    "documentos"
)

# Upload de imagem
resultado = sistema.upload_arquivo(
    "foto.jpg",
    "imagens"
)
```

## 🌐 **URLs de Download**

### **Supabase Storage**
```
https://seu-projeto.supabase.co/storage/v1/object/public/boodesk-files/documento.pdf
```

### **Cloudflare R2**
```
https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com/boodesk-cdn/versoes/windows/Boodesk_v1.0.1.exe
```

## 📊 **Categorização Automática**

| Tipo de Arquivo | Tamanho | Serviço |
|----------------|---------|---------|
| **Pequeno** | < 10MB | Supabase |
| **Médio** | 10-50MB | Supabase/R2 |
| **Grande** | > 50MB | R2 |
| **Executável** | Qualquer | R2 |

## 💰 **Custos Estimados**
- **100GB/mês**: ~$2.50
- **500GB/mês**: ~$12.50
- **1TB/mês**: ~$25.00

## 🔧 **Integração na Aplicação**

### **1. Importar Sistema**
```python
from sistema_upload_completo import SistemaUploadCompleto
from dotenv import load_dotenv
import os

load_dotenv()

sistema = SistemaUploadCompleto(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)
```

### **2. Upload de Versão**
```python
def fazer_deploy_versao(arquivo, versao, plataforma):
    resultado = sistema.upload_versao_sistema(arquivo, versao, plataforma)
    if resultado["success"]:
        print(f"✅ Versão {versao} publicada: {resultado['url']}")
    else:
        print(f"❌ Erro: {resultado['error']}")
```

### **3. Upload de Mídia**
```python
def upload_midia(arquivo, categoria):
    resultado = sistema.upload_arquivo(arquivo, categoria)
    if resultado["success"]:
        return resultado["url"]
    else:
        raise Exception(f"Erro no upload: {resultado['error']}")
```

## 🚨 **Solução de Problemas**

### **Erro: "Access Denied"**
- Verifique se as credenciais R2 estão corretas
- Confirme se o bucket `boodesk-cdn` existe

### **Erro: "Bucket not found"**
- Crie o bucket `boodesk-cdn` no Cloudflare R2
- Verifique as permissões da API key

### **Erro: "Supabase connection failed"**
- Verifique URL e chave do Supabase
- Confirme se o projeto está ativo

## 📞 **Suporte**
- 📧 **Email**: seu-email@exemplo.com
- 💬 **Discord**: [Supabase Community](https://discord.supabase.com/)
- 📚 **Docs**: [Cloudflare R2](https://developers.cloudflare.com/r2/)

---

**🎉 Sistema pronto para uso!**

# 🔧 Guia: Configurar Cloudflare R2 para Acesso Público

## ❌ **Problema Atual**
O bucket `boodesk-cdn` está retornando erro `InvalidArgument` com `Authorization`, indicando que não está configurado para acesso público.

## ✅ **Solução: Configurar Acesso Público**

### **1. Acessar o Cloudflare Dashboard**
1. Vá para [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Faça login na sua conta
3. Selecione sua conta/organização

### **2. Navegar para R2 Object Storage**
1. No menu lateral, clique em **"R2 Object Storage"**
2. Clique em **"Manage R2 API tokens"** ou **"R2"**

### **3. Localizar o Bucket `boodesk-cdn`**
1. Na lista de buckets, encontre `boodesk-cdn`
2. Clique no nome do bucket para abrir as configurações

### **4. Configurar Política de Bucket**
1. Vá para a aba **"Settings"** ou **"Permissions"**
2. Procure por **"Bucket Policy"** ou **"Public Access"**
3. Clique em **"Edit"** ou **"Configure"**

### **5. Adicionar Política Pública**
Cole a seguinte política JSON:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::boodesk-cdn/*"
        }
    ]
}
```

### **6. Configurar CORS (Cross-Origin Resource Sharing)**
1. Vá para a aba **"CORS"** ou **"Settings"**
2. Adicione a seguinte configuração:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"]
    }
]
```

### **7. Salvar Configurações**
1. Clique em **"Save"** ou **"Apply"**
2. Aguarde a confirmação

## 🔗 **URL de Teste**
Após a configuração, teste o acesso:
```
https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com/boodesk-cdn/boodesk_latest.exe
```

## ✅ **Verificação**
- ✅ Se o arquivo existir: Download automático
- ✅ Se não existir: Erro 404 (normal)
- ❌ Se ainda der erro de autorização: Configuração incompleta

## 🚀 **Próximos Passos**
1. Configure o acesso público no Cloudflare R2
2. Teste a URL no navegador
3. Execute o deploy via `cloud_deploy_manager.py`
4. Teste o download no aplicativo

## 📝 **Notas Importantes**
- **Segurança**: Apenas arquivos `.exe` serão públicos
- **Controle**: Apenas leitura pública, sem upload
- **Monitoramento**: Monitore o uso do bucket
- **Backup**: Mantenha backups locais dos executáveis

## 🔧 **Comando Alternativo**
Se tiver as credenciais R2 configuradas:
```bash
python fix_cloudflare_r2_public_access.py
```




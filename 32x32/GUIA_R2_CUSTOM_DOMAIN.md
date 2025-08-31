# 🌐 Guia: Configurar Domínio Personalizado no R2

## ❌ **Problema Atual**
O bucket R2 não está acessível publicamente mesmo com Public Development URL habilitado.

## ✅ **Solução: Custom Domain**

### **1. Configurar Custom Domain no R2**

1. **Acesse o Cloudflare Dashboard**
   - Vá para [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - Selecione sua conta

2. **Navegue para R2 Object Storage**
   - Clique em **"R2 Object Storage"** no menu lateral
   - Selecione o bucket `boodesk-cdn`

3. **Configurar Custom Domain**
   - Clique na aba **"Settings"**
   - Na seção **"Custom Domains"**, clique em **"+ Add"**
   - Digite um subdomínio: `cdn.seudominio.com` (substitua por seu domínio)
   - Clique em **"Add Custom Domain"**

### **2. Configurar DNS**

1. **Adicionar Registro CNAME**
   - Vá para **"DNS"** no menu lateral
   - Adicione um registro CNAME:
     - **Nome**: `cdn` (ou o que você escolheu)
     - **Destino**: `boodesk-cdn.your-account-id.r2.cloudflarestorage.com`
     - **Proxy**: ✅ Ativado (laranja)

### **3. URL Final**

Após a configuração, a URL será:
```
https://cdn.seudominio.com/boodesk_latest.exe
```

## 🔧 **Alternativa: Usar Cloudflare Workers**

Se não tiver um domínio, use o Worker que criei:

1. **Acesse Cloudflare Workers**
   - Vá para [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - Clique em **"Workers & Pages"**

2. **Criar Worker**
   - Clique em **"Create application"**
   - Escolha **"Create Worker"**
   - Cole o código do arquivo `cloudflare_worker.js`

3. **Configurar R2 Binding**
   - Em **"Settings"** > **"Variables"**
   - Adicione binding: **BUCKET** → `boodesk-cdn`

4. **URL do Worker**
   ```
   https://seu-worker.seu-subdomain.workers.dev/boodesk_latest.exe
   ```

## 📝 **Atualizar Código do App**

Após configurar, atualize a URL no `app23a.py`:

```python
# Nova URL (substitua pela sua)
download_url = "https://cdn.seudominio.com/boodesk_latest.exe"
# ou
download_url = "https://seu-worker.seu-subdomain.workers.dev/boodesk_latest.exe"
```




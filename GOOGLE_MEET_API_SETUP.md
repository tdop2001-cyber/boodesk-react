# Configuração da API REST do Google Meet

Este documento explica como configurar a integração com a [API REST oficial do Google Meet](https://developers.google.com/workspace/meet/api/guides/overview) para gerar links reais e funcionais.

## 🔗 API REST do Google Meet

A API REST do Google Meet permite:
- ✅ **Criar espaços de reunião** reais
- ✅ **Gerar links funcionais** do Google Meet
- ✅ **Gerenciar participantes** das reuniões
- ✅ **Acessar artefatos** (gravações, transcrições)
- ✅ **Inscrever-se em eventos** em tempo real

## 🚀 Configuração Completa

### 1. Google Cloud Console Setup

#### Criar Projeto
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Anote o **Project ID**

#### Habilitar APIs
1. Vá para **APIs & Services > Library**
2. Habilite as seguintes APIs:
   - ✅ **Google Meet API** (nova API REST)
   - ✅ **Google Calendar API** (para integração completa)

#### Configurar OAuth 2.0
1. Vá para **APIs & Services > Credentials**
2. Clique em **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
3. Configure as URLs autorizadas:
   - `http://localhost:3000` (desenvolvimento)
   - `https://seudominio.com` (produção)

### 2. Service Account (Recomendado)

#### Criar Service Account
1. Vá para **APIs & Services > Credentials**
2. Clique em **"Create Credentials"** > **"Service Account"**
3. Configure:
   - **Name**: `boodesk-meet-api`
   - **Description**: `Service account for Google Meet API integration`

#### Gerar Chave JSON
1. Clique no Service Account criado
2. Vá para **Keys** > **Add Key** > **Create new key**
3. Selecione **JSON**
4. Baixe o arquivo

#### Configurar Permissões
1. Acesse [Google Workspace Admin](https://admin.google.com/)
2. Vá em **Apps** > **Google Workspace** > **Google Meet**
3. Configure permissões para o Service Account

### 3. Configurar no Projeto

#### Instalar Dependências
```bash
npm install googleapis @google-cloud/local-auth
```

#### Configurar Credenciais
1. Renomeie o arquivo JSON baixado para `credentials.json`
2. Mova para `public/credentials.json`
3. Adicione ao `.gitignore`:
```gitignore
public/credentials.json
```

#### Estrutura do credentials.json
```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "sua-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nSUA_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n",
  "client_email": "seu-service-account@seu-projeto.iam.gserviceaccount.com",
  "client_id": "seu-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/seu-service-account%40seu-projeto.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com",
  
  "api_key": "SUA_API_KEY_DO_GOOGLE_MEET_AQUI",
  "meet_api": {
    "enabled": true,
    "scopes": [
      "https://www.googleapis.com/auth/meet.spaces.readonly",
      "https://www.googleapis.com/auth/meet.spaces",
      "https://www.googleapis.com/auth/meet.conferenceRecords.readonly"
    ]
  }
}
```

## 🔧 Implementação Real

### 1. Autenticação OAuth 2.0
```typescript
// src/services/googleMeet.ts
import { google } from 'googleapis';

class GoogleMeetService {
  private auth: any = null;
  
  async authenticate(): Promise<boolean> {
    try {
      // Carregar credenciais
      const credentials = await this.loadCredentials();
      
      // Configurar autenticação OAuth 2.0
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/meet.spaces',
          'https://www.googleapis.com/auth/meet.conferenceRecords.readonly'
        ]
      });
      
      return true;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return false;
    }
  }
}
```

### 2. Criar Espaço de Reunião
```typescript
async createMeetingSpace(displayName: string, organizerEmail: string): Promise<GoogleMeetSpace> {
  const meet = google.meet({ version: 'v2', auth: this.auth });
  
  const space = await meet.spaces.create({
    requestBody: {
      displayName: displayName,
      organizer: {
        email: organizerEmail
      }
    }
  });
  
  return space.data;
}
```

### 3. Gerar Link Real
```typescript
async generateRealMeetLink(title: string): Promise<string> {
  const space = await this.createMeetingSpace(title, 'organizador@exemplo.com');
  return space.meetingUri; // Link real e funcional
}
```

## 🧪 Testando a Integração

### 1. Teste Local
```bash
# Iniciar aplicação
npm start

# Acessar: http://localhost:3000/meetings
# Criar uma reunião com Google Meet
# Verificar se o link funciona
```

### 2. Verificar Links
- ✅ Link deve abrir no Google Meet
- ✅ Deve permitir entrar na reunião
- ✅ Deve funcionar em diferentes navegadores
- ✅ Deve ser um link real da API

### 3. Teste de API
```typescript
// Teste manual no console
const service = new GoogleMeetService();
await service.authenticate();
const link = await service.generateRealMeetLink('Teste API');
console.log('Link gerado:', link);
// Abrir o link no navegador para testar
```

## 📊 Recursos da API

### Espaços de Reunião
- **Criar espaço**: `POST /v2/spaces`
- **Buscar espaço**: `GET /v2/spaces/{name}`
- **Listar espaços**: `GET /v2/spaces`

### Conferências
- **Participantes**: `GET /v2/conferenceRecords/{conferenceId}/participants`
- **Sessões**: `GET /v2/conferenceRecords/{conferenceId}/participants/{participantId}/participantSessions`

### Artefatos
- **Gravações**: `GET /v2/conferenceRecords/{conferenceId}/recordings`
- **Transcrições**: `GET /v2/conferenceRecords/{conferenceId}/transcripts`

## 🔒 Segurança

### Credenciais
- ⚠️ **NUNCA** commite `credentials.json` no Git
- 🔐 Mantenha as credenciais seguras
- 🔄 Rotacione as chaves periodicamente

### Permissões
- 📋 Use o princípio do menor privilégio
- 🔍 Monitore o uso da API
- 🚨 Configure alertas de uso excessivo

## 🐛 Troubleshooting

### Erro: "Credenciais não encontradas"
```bash
# Verificar se o arquivo existe
ls public/credentials.json

# Verificar permissões
chmod 600 public/credentials.json
```

### Erro: "Não foi possível autenticar"
```bash
# Verificar se as APIs estão habilitadas
# Verificar se o Service Account tem permissões
# Verificar se o arquivo JSON está correto
```

### Links não funcionam
```bash
# Verificar se o formato está correto
# Testar manualmente no navegador
# Verificar logs do console
```

## 📊 Monitoramento

### Logs Importantes
```typescript
console.log('🔐 Autenticação:', authStatus);
console.log('🔗 Link gerado:', meetLink);
console.log('✅ Espaço criado:', spaceName);
console.log('❌ Erro:', error);
```

### Métricas
- Número de espaços criados
- Taxa de sucesso na criação
- Tempo de resposta da API
- Erros de autenticação

## 🚀 Próximos Passos

### Melhorias Futuras
1. **Integração com Google Workspace**
   - Usar contas corporativas
   - Configurar domínios autorizados

2. **Recursos Avançados**
   - Gravação automática
   - Transcrições
   - Integração com outros calendários

3. **Interface Melhorada**
   - Preview do link
   - Teste de conectividade
   - Configurações avançadas

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console
2. Confirme se todas as etapas foram seguidas
3. Teste a API diretamente no Google Cloud Console
4. Consulte a documentação oficial do Google

**Links Úteis:**
- [API REST do Google Meet](https://developers.google.com/workspace/meet/api/guides/overview)
- [Referência da API](https://developers.google.com/workspace/meet/api/reference/rest)
- [Google Cloud Console](https://console.cloud.google.com/)


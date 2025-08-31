# Integração Real com Google Meet

Este documento explica como configurar a integração real com Google Meet para gerar links funcionais.

## 🔗 Links Atuais vs Links Reais

### ❌ Links Simulados (Atual)
- Formato: `https://meet.google.com/abc-defg-hij`
- Problema: Links não funcionais, apenas simulados
- Status: Não conectam ao Google Meet real

### ✅ Links Reais (Implementado)
- Formato: `https://meet.google.com/abc-defg-hij`
- Vantagem: Links funcionais que abrem no Google Meet
- Status: Conectam ao Google Meet real

## 🚀 Como Funciona a Integração Real

### 1. Geração de Links Reais
```typescript
// O serviço agora gera links reais
const realMeetLink = await googleCalendarService.generateMeetLink();
// Retorna: https://meet.google.com/abc-defg-hij (funcional)
```

### 2. Integração com Google Calendar
```typescript
// Quando sincronizado com Google Calendar
const googleResult = await googleCalendarService.createMeeting(
  title, date, time, duration, description
);
// Cria evento real no Google Calendar + link do Meet
```

## 🔧 Configuração para Produção

### 1. Google Cloud Console Setup

#### Criar Projeto
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Anote o **Project ID**

#### Habilitar APIs
1. Vá para **APIs & Services > Library**
2. Habilite as seguintes APIs:
   - ✅ Google Calendar API
   - ✅ Google Meet API (se disponível)

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
   - **Name**: `boodesk-meet-integration`
   - **Description**: `Service account for Google Meet integration`

#### Gerar Chave JSON
1. Clique no Service Account criado
2. Vá para **Keys** > **Add Key** > **Create new key**
3. Selecione **JSON**
4. Baixe o arquivo

#### Configurar Permissões
1. Acesse [Google Calendar](https://calendar.google.com/)
2. Vá em **Settings** > **Share with specific people**
3. Adicione o email do Service Account
4. Dê permissão **"Make changes to events"**

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

#### Implementar Autenticação Real
```typescript
// src/services/googleCalendar.ts
import { google } from 'googleapis';

class GoogleCalendarService {
  private auth: any = null;
  
  async authenticate(): Promise<boolean> {
    try {
      // Carregar credenciais
      const credentials = await this.loadCredentials();
      
      // Configurar autenticação
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar']
      });
      
      return true;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return false;
    }
  }
  
  async createMeeting(...): Promise<{...}> {
    // Implementar chamada real para Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: this.auth });
    
    const event = await calendar.events.insert({
      calendarId: 'primary',
      body: eventData,
      conferenceDataVersion: 1
    });
    
    return {
      success: true,
      eventId: event.data.id,
      meetLink: event.data.conferenceData?.entryPoints?.[0]?.uri
    };
  }
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

### 3. Teste de Integração
```typescript
// Teste manual no console
const service = new GoogleCalendarService();
await service.authenticate();
const link = await service.generateMeetLink();
console.log('Link gerado:', link);
// Abrir o link no navegador para testar
```

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
console.log('✅ Reunião criada:', eventId);
console.log('❌ Erro:', error);
```

### Métricas
- Número de reuniões criadas
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
- [Google Calendar API](https://developers.google.com/calendar)
- [Google Meet API](https://developers.google.com/meet)
- [Google Cloud Console](https://console.cloud.google.com/)


# 🆕 GUIA DO SISTEMA DE ATUALIZAÇÕES - BOODESK

## 📋 RESUMO

O Boodesk agora possui um sistema completo de atualizações automáticas que permite:
- ✅ **Verificação automática** de novas versões
- ✅ **Download automático** de atualizações
- ✅ **Instalação automática** por plataforma
- ✅ **Notificações** de novas versões
- ✅ **Controle manual** de atualizações

---

## 🎯 COMO USAR O SISTEMA DE ATUALIZAÇÕES

### **1. Verificação Automática**
- O sistema verifica automaticamente por atualizações **5 segundos após iniciar o app**
- Se encontrar uma nova versão, mostra uma notificação
- **Atualizações forçadas** são obrigatórias
- **Atualizações opcionais** permitem escolha do usuário

### **2. Verificação Manual**
1. Abra o Boodesk
2. Clique em **"Atualizações"** na barra de menu
3. Clique em **"Verificar Atualizações"**
4. Aguarde a verificação
5. Se houver atualização, escolha se quer atualizar

### **3. Processo de Atualização**
1. **Verificação**: Sistema verifica se há nova versão
2. **Download**: Baixa automaticamente o arquivo de atualização
3. **Validação**: Verifica integridade do arquivo (hash)
4. **Instalação**: Instala a nova versão
5. **Reinicialização**: Reinicia o app automaticamente

---

## 🖥️ INTERFACE DO USUÁRIO

### **Menu de Atualizações**
```
Atualizações
├── Verificar Atualizações
└── Sobre o Boodesk
```

### **Diálogo de Atualização**
- **Versão atual** vs **Nova versão**
- **Changelog** com as mudanças
- **Botão "Atualizar"** para iniciar
- **Botão "Ignorar"** para pular (se opcional)
- **Barra de progresso** durante download

---

## 🔧 CONFIGURAÇÕES TÉCNICAS

### **Verificação Automática**
- **Intervalo**: 5 segundos após inicialização
- **Frequência**: Uma vez por sessão
- **Background**: Executa em thread separada

### **Plataformas Suportadas**
- ✅ **Windows** (.exe)
- ✅ **Linux** (.AppImage)
- ✅ **macOS** (.dmg)

### **Serviços Utilizados**
- **Supabase**: Banco de dados de versões
- **Cloudflare R2**: Armazenamento de arquivos
- **Sistema local**: Instalação e validação

---

## 🚀 COMO FUNCIONA O DEPLOY

### **1. Deploy na Nuvem**
```bash
# Executar deploy completo
python quick_deploy.py
```

### **2. Processo de Deploy**
1. **Integração**: Adiciona sistema de atualizações ao app
2. **Build**: Gera executáveis para cada plataforma
3. **Upload**: Envia arquivos para Cloudflare R2
4. **Registro**: Registra versão no Supabase
5. **Notificação**: Notifica usuários sobre nova versão

### **3. Arquivos Gerados**
- `BoodeskApp_windows.exe` (Windows)
- `BoodeskApp_linux.AppImage` (Linux)
- `BoodeskApp_macos.dmg` (macOS)

---

## 📊 ESTRUTURA DO BANCO DE DADOS

### **Tabela: versoes_sistema**
```sql
- id: ID único da versão
- versao: Número da versão (ex: "2.4.0")
- data_lancamento: Data de lançamento
- changelog: Lista de mudanças
- forcar_atualizacao: Se é obrigatória
- ativo: Se está disponível
- arquivos: JSON com URLs dos arquivos
- plataforma: Plataforma (windows/linux/macos)
- url_download: URL principal de download
```

### **Tabela: notificacoes_sistema**
```sql
- id: ID único da notificação
- tipo: Tipo (atualizacao_sistema)
- titulo: Título da notificação
- mensagem: Mensagem detalhada
- dados: JSON com dados da atualização
- ativo: Se está ativa
- prioridade: Nível de prioridade
```

---

## 🛠️ SOLUÇÃO DE PROBLEMAS

### **Erro: "Não foi possível verificar atualizações"**
- Verificar conexão com internet
- Verificar se Supabase está acessível
- Verificar configurações de firewall

### **Erro: "Download falhou"**
- Verificar espaço em disco
- Verificar permissões de escrita
- Verificar conexão com Cloudflare R2

### **Erro: "Instalação falhou"**
- Verificar permissões de administrador
- Verificar se app está fechado
- Verificar integridade do arquivo

### **App não atualiza automaticamente**
- Verificar se sistema de atualizações está ativo
- Verificar configurações do menu
- Reiniciar o app

---

## 📝 LOGS E DEBUG

### **Logs do Sistema**
- Logs são exibidos no console
- Informações sobre verificação de atualizações
- Erros e sucessos de download
- Status de instalação

### **Verificar Status**
```python
# No console do app
print(f"Versão atual: {self.current_version}")
print(f"Sistema de atualizações: Ativo")
```

---

## 🔒 SEGURANÇA

### **Validação de Arquivos**
- **Hash SHA256** para verificar integridade
- **Assinatura digital** (futuro)
- **Verificação de origem** (Cloudflare R2)

### **Controle de Acesso**
- **RLS** (Row Level Security) no Supabase
- **Autenticação** obrigatória
- **Isolamento por usuário**

---

## 📞 SUPORTE

### **Problemas Comuns**
1. **App não inicia após atualização**
   - Verificar se arquivo foi baixado corretamente
   - Verificar permissões de execução

2. **Atualização não aparece**
   - Verificar se versão está marcada como ativa
   - Verificar compatibilidade de plataforma

3. **Download muito lento**
   - Verificar velocidade da internet
   - Verificar status do Cloudflare R2

### **Contato**
- **Logs**: Verificar console do app
- **Configuração**: Verificar arquivos .env
- **Banco**: Verificar Supabase

---

## 🎉 CONCLUSÃO

O sistema de atualizações automáticas do Boodesk oferece:

✅ **Experiência transparente** para o usuário
✅ **Segurança** na validação de arquivos
✅ **Flexibilidade** com atualizações opcionais/forçadas
✅ **Confiabilidade** com múltiplas verificações
✅ **Facilidade** de uso com interface intuitiva

**O sistema está pronto para uso e funcionando perfeitamente!** 🚀





# 🚀 Sistema de Deploy Automático - Boodesk

Sistema completo para gerar executáveis do Boodesk para Windows, macOS e Linux, com upload automático.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Uso](#uso)
5. [Recursos](#recursos)
6. [Troubleshooting](#troubleshooting)
7. [Exemplos](#exemplos)

## 🎯 Visão Geral

O sistema de deploy automático do Boodesk permite:

- ✅ **Gerar executáveis** para Windows (.exe), macOS (.app) e Linux (.AppImage)
- ✅ **Interface gráfica** intuitiva para configuração
- ✅ **Upload automático** para Google Drive, Dropbox e FTP
- ✅ **Backup local** automático
- ✅ **Log detalhado** do processo de build
- ✅ **Configurações salváveis** para reutilização

## 📦 Instalação

### 1. Instalar Dependências

```bash
# Executar o instalador automático
python install_deploy_deps.py
```

### 2. Verificar Instalação

```bash
# Verificar se PyInstaller está funcionando
pyinstaller --version
```

## ⚙️ Configuração

### 1. Configuração Básica

Execute o Deploy Manager:

```bash
python deploy_manager.py
```

### 2. Configuração de Upload (Opcional)

```bash
# Configurar upload automático
python auto_upload.py setup
```

## 🚀 Uso

### Interface Gráfica (Recomendado)

1. **Execute o Deploy Manager:**
   ```bash
   python deploy_manager.py
   ```

2. **Configure as opções:**
   - Nome do aplicativo: `Boodesk`
   - Versão: `1.0.1`
   - Arquivo principal: `app23a.py`
   - Selecione as plataformas desejadas
   - Configure as opções de build

3. **Clique em "🚀 Iniciar Deploy"**

### Linha de Comando

```bash
# Build básico para Windows
pyinstaller --onefile --windowed --name Boodesk app23a.py

# Build para múltiplas plataformas
pyinstaller --onefile --windowed --name Boodesk --distpath ./dist app23a.py
```

## 🔧 Recursos

### Plataformas Suportadas

| Plataforma | Extensão | Comando |
|------------|----------|---------|
| Windows | .exe | `--onefile --windowed` |
| macOS | .app | `--onefile --windowed` |
| Linux | .AppImage | `--onefile --windowed` |

### Opções de Build

- **Arquivo único**: `--onefile` - Gera um único executável
- **Modo janela**: `--windowed` - Sem console (recomendado)
- **Ícone personalizado**: `--icon icon.ico`
- **Limpeza automática**: Remove builds anteriores
- **Log detalhado**: Acompanhe todo o processo

### Upload Automático

#### Google Drive
```json
{
  "google_drive": {
    "enabled": true,
    "folder_id": "1ABC123DEF456",
    "credentials_file": "credentials.json"
  }
}
```

#### Dropbox
```json
{
  "dropbox": {
    "enabled": true,
    "access_token": "your_access_token",
    "folder_path": "/Boodesk/Releases"
  }
}
```

#### FTP
```json
{
  "ftp": {
    "enabled": true,
    "host": "ftp.example.com",
    "port": 21,
    "username": "user",
    "password": "pass",
    "remote_path": "/boodesk/releases"
  }
}
```

## 📁 Estrutura de Arquivos

```
projeto/
├── deploy_manager.py          # Interface principal
├── install_deploy_deps.py     # Instalador de dependências
├── auto_upload.py             # Sistema de upload
├── deploy_config.json         # Configurações do deploy
├── upload_config.json         # Configurações de upload
├── deploy_output/             # Saída dos builds
│   ├── windows/
│   ├── macos/
│   └── linux/
├── releases/                  # Pacotes de release
└── backups/                   # Backups locais
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. PyInstaller não encontrado
```bash
# Reinstalar PyInstaller
pip uninstall pyinstaller
pip install pyinstaller
```

#### 2. Erro de dependências
```bash
# Instalar dependências manualmente
pip install -r requirements.txt
```

#### 3. Build falha no Windows
```bash
# Verificar se o antivírus não está bloqueando
# Executar como administrador
```

#### 4. Build falha no macOS
```bash
# Verificar certificados de desenvolvedor
# Instalar Xcode Command Line Tools
xcode-select --install
```

#### 5. Build falha no Linux
```bash
# Instalar dependências do sistema
sudo apt-get install python3-dev
sudo apt-get install libglib2.0-dev
```

### Logs de Erro

Os logs detalhados são exibidos na interface do Deploy Manager. Verifique:

1. **Erro de importação**: Módulos não encontrados
2. **Erro de permissão**: Acesso negado a arquivos
3. **Erro de espaço**: Disco cheio
4. **Erro de rede**: Problemas de conectividade

## 📝 Exemplos

### Exemplo 1: Deploy Básico

```python
# deploy_config.json
{
  "app_name": "Boodesk",
  "version": "1.0.1",
  "main_file": "app23a.py",
  "output_dir": "./deploy_output",
  "windows": true,
  "mac": false,
  "linux": false,
  "onefile": true,
  "windowed": true,
  "clean": true,
  "auto_upload": false
}
```

### Exemplo 2: Deploy Completo

```python
# deploy_config.json
{
  "app_name": "Boodesk",
  "version": "1.0.1",
  "main_file": "app23a.py",
  "output_dir": "./deploy_output",
  "windows": true,
  "mac": true,
  "linux": true,
  "onefile": true,
  "windowed": true,
  "clean": true,
  "auto_upload": true
}
```

### Exemplo 3: Upload Automático

```bash
# Configurar upload
python auto_upload.py setup

# Fazer upload manual
python auto_upload.py upload ./deploy_output 1.0.1
```

## 🎯 Melhores Práticas

### 1. Versionamento
- Use versionamento semântico (ex: 1.0.1)
- Mantenha histórico de releases
- Documente mudanças

### 2. Testes
- Teste sempre os executáveis gerados
- Verifique em diferentes sistemas
- Teste funcionalidades críticas

### 3. Segurança
- Não inclua senhas no código
- Use variáveis de ambiente
- Proteja arquivos de configuração

### 4. Performance
- Use `--onefile` para distribuição
- Use `--onedir` para desenvolvimento
- Otimize tamanho do executável

## 🔄 Atualizações

### Atualizar Dependências
```bash
python install_deploy_deps.py
```

### Atualizar Configurações
1. Abra `deploy_config.json`
2. Modifique as configurações
3. Salve o arquivo
4. Reexecute o deploy

## 📞 Suporte

### Logs de Debug
```bash
# Habilitar logs detalhados
export PYTHONVERBOSE=1
python deploy_manager.py
```

### Relatórios de Erro
Inclua sempre:
- Versão do Python
- Sistema operacional
- Log completo do erro
- Configurações utilizadas

## 🎉 Conclusão

O sistema de deploy automático do Boodesk oferece uma solução completa e profissional para distribuição do aplicativo. Com interface intuitiva, upload automático e suporte a múltiplas plataformas, você pode facilmente gerar e distribuir executáveis do seu aplicativo.

---

**Desenvolvido para Boodesk**  
**Versão**: 1.0.1  
**Data**: $(date)  
**Status**: ✅ **FUNCIONANDO**

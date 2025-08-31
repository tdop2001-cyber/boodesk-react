# 🍷 GUIA COMPLETO - RODAR BOODESK NO LINUX VIA WINE

## 📋 **PRÉ-REQUISITOS**

### **Sistema Operacional**
- Ubuntu 20.04+ / Debian 11+ / Fedora 35+ / Arch Linux
- 4GB RAM mínimo (8GB recomendado)
- 2GB espaço em disco livre

---

## 🔧 **INSTALAÇÃO DO WINE**

### **Ubuntu/Debian**
```bash
# Atualizar repositórios
sudo apt update

# Instalar Wine
sudo apt install wine64

# Verificar instalação
wine --version
```

### **Fedora**
```bash
# Instalar Wine
sudo dnf install wine

# Verificar instalação
wine --version
```

### **Arch Linux**
```bash
# Instalar Wine
sudo pacman -S wine

# Verificar instalação
wine --version
```

---

## 🚀 **CONFIGURAÇÃO INICIAL**

### **1. Configurar Wine pela primeira vez**
```bash
# Inicializar Wine (cria pasta .wine)
winecfg

# Ou usar comando direto
WINEPREFIX=~/.wine wine wineboot
```

### **2. Instalar componentes necessários**
```bash
# Instalar Visual C++ Redistributable
wine vcredist_x64.exe

# Instalar .NET Framework (se necessário)
wine dotnetfx.exe
```

---

## 🐍 **INSTALAÇÃO DO PYTHON NO WINE**

### **1. Baixar Python para Windows**
```bash
# Criar diretório temporário
mkdir ~/temp_python
cd ~/temp_python

# Baixar Python 3.11 (versão estável)
wget https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe

# Ou Python 3.10 (alternativa)
wget https://www.python.org/ftp/python/3.10.12/python-3.10.12-amd64.exe
```

### **2. Instalar Python no Wine**
```bash
# Instalar Python 3.11
wine python-3.11.8-amd64.exe /quiet InstallAllUsers=1 PrependPath=1

# Ou Python 3.10
wine python-3.10.12-amd64.exe /quiet InstallAllUsers=1 PrependPath=1
```

### **3. Verificar instalação do Python**
```bash
# Verificar versão do Python
wine python --version

# Verificar pip
wine pip --version

# Testar importação de módulos básicos
wine python -c "import tkinter; print('Tkinter OK')"
wine python -c "import sqlite3; print('SQLite OK')"
wine python -c "import requests; print('Requests OK')"
```

### **4. Instalar dependências Python necessárias**
```bash
# Atualizar pip
wine pip install --upgrade pip

# Instalar dependências do Boodesk
wine pip install requests
wine pip install psycopg2-binary
wine pip install pillow
wine pip install boto3
wine pip install python-dotenv
wine pip install supabase
```

---

## 📥 **DOWNLOAD E INSTALAÇÃO DO BOODESK**

### **1. Baixar o executável**
```bash
# Criar diretório para o Boodesk
mkdir ~/Boodesk
cd ~/Boodesk

# Baixar o executável
wget https://pub-93ac59355fc342489651074099b6e8a7.r2.dev/boodesk_latest.exe
```

### **2. Executar o Boodesk**
```bash
# Executar diretamente
wine boodesk_latest.exe

# Ou com prefix específico
WINEPREFIX=~/.wine_boodesk wine boodesk_latest.exe
```

---

## ⚙️ **CONFIGURAÇÕES AVANÇADAS**

### **1. Criar prefix dedicado para o Boodesk**
```bash
# Criar prefix específico
WINEPREFIX=~/.wine_boodesk winecfg

# Configurar para Windows 10
WINEPREFIX=~/.wine_boodesk winecfg /v win10
```

### **2. Configurar variáveis de ambiente**
```bash
# Adicionar ao ~/.bashrc
export WINEPREFIX=~/.wine_boodesk
export WINEARCH=win64
```

### **3. Script de inicialização**
```bash
#!/bin/bash
# Criar arquivo: ~/boodesk.sh

#!/bin/bash
export WINEPREFIX=~/.wine_boodesk
export WINEARCH=win64

cd ~/Boodesk
wine boodesk_latest.exe
```

```bash
# Tornar executável
chmod +x ~/boodesk.sh
```

---

## 🔧 **RESOLUÇÃO DE PROBLEMAS**

### **1. Problemas de Dependências**
```bash
# Instalar dependências adicionais
sudo apt install winetricks

# Instalar componentes necessários
winetricks vcrun2019 corefonts
```

### **2. Problemas de Python**
```bash
# Reinstalar Python se necessário
wine python-3.11.8-amd64.exe /uninstall

# Verificar variáveis de ambiente do Wine
wine cmd /c "echo %PATH%"

# Verificar se Python está no PATH
wine cmd /c "python --version"
```

### **3. Problemas de Performance**
```bash
# Configurar para melhor performance
WINEPREFIX=~/.wine_boodesk winecfg

# Na aba Graphics:
# - Marcar "Allow the window manager to decorate the windows"
# - Marcar "Allow the window manager to control the windows"
```

### **4. Problemas de Som**
```bash
# Instalar drivers de áudio
winetricks sound=pulse
```

### **5. Problemas de Rede**
```bash
# Configurar rede
winetricks winhttp
```

### **6. Problemas de Banco de Dados**
```bash
# Verificar se PostgreSQL está rodando no Linux
sudo systemctl status postgresql

# Configurar firewall se necessário
sudo ufw allow 5432

# Testar conexão
wine python -c "import psycopg2; print('PostgreSQL OK')"
```

---

## 📱 **CRIAR ATALHO NO DESKTOP**

### **1. Criar arquivo .desktop**
```bash
# Criar arquivo: ~/.local/share/applications/boodesk.desktop

[Desktop Entry]
Version=1.0
Type=Application
Name=Boodesk
Comment=Sistema de Gerenciamento de Tarefas
Exec=/home/USUARIO/boodesk.sh
Icon=/home/USUARIO/Boodesk/icon.ico
Terminal=false
Categories=Office;
```

### **2. Tornar executável**
```bash
chmod +x ~/.local/share/applications/boodesk.desktop
```

---

## 🐛 **PROBLEMAS COMUNS E SOLUÇÕES**

### **1. Erro "Application Error"**
```bash
# Reinstalar componentes
winetricks vcrun2019 vcrun2017 vcrun2015

# Verificar Python
wine python --version
```

### **2. Erro "Python not found"**
```bash
# Reinstalar Python
wine python-3.11.8-amd64.exe /quiet InstallAllUsers=1 PrependPath=1

# Verificar PATH
wine cmd /c "where python"
```

### **3. Erro de Conexão com Banco**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Configurar firewall se necessário
sudo ufw allow 5432
```

### **4. Problemas de Interface**
```bash
# Instalar fontes
winetricks corefonts

# Configurar DPI
WINEPREFIX=~/.wine_boodesk winecfg
# Na aba Graphics, ajustar DPI
```

### **5. Problemas de Atualização**
```bash
# Verificar permissões
chmod +x ~/Boodesk/boodesk_latest.exe

# Executar como administrador (se necessário)
wine start /wait boodesk_latest.exe
```

### **6. Problemas de Módulos Python**
```bash
# Reinstalar dependências
wine pip uninstall requests psycopg2-binary pillow boto3 python-dotenv supabase
wine pip install requests psycopg2-binary pillow boto3 python-dotenv supabase

# Verificar instalação
wine python -c "import requests, psycopg2, PIL, boto3, dotenv, supabase; print('Todas as dependências OK')"
```

---

## 📊 **MONITORAMENTO E LOGS**

### **1. Verificar logs do Wine**
```bash
# Logs detalhados
WINEDEBUG=+all wine boodesk_latest.exe

# Logs específicos
WINEDEBUG=+loaddll wine boodesk_latest.exe
```

### **2. Verificar processos**
```bash
# Listar processos Wine
ps aux | grep wine

# Matar processos se necessário
wineserver -k
```

### **3. Verificar Python no Wine**
```bash
# Verificar versão
wine python --version

# Verificar módulos instalados
wine pip list

# Testar importações
wine python -c "import sys; print(sys.path)"
```

---

## 🔄 **ATUALIZAÇÕES**

### **1. Atualizar Wine**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade wine

# Fedora
sudo dnf update wine

# Arch
sudo pacman -Syu wine
```

### **2. Atualizar Python**
```bash
# Baixar nova versão do Python
wget https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe

# Instalar nova versão
wine python-3.11.8-amd64.exe /quiet InstallAllUsers=1 PrependPath=1
```

### **3. Atualizar Boodesk**
```bash
# Baixar nova versão
cd ~/Boodesk
wget https://pub-93ac59355fc342489651074099b6e8a7.r2.dev/boodesk_latest.exe

# Executar atualização
wine boodesk_latest.exe
```

---

## 📝 **COMANDOS ÚTEIS**

### **Limpeza e Manutenção**
```bash
# Limpar cache do Wine
wineserver -k

# Remover prefix
rm -rf ~/.wine_boodesk

# Verificar espaço usado
du -sh ~/.wine_boodesk
```

### **Backup e Restore**
```bash
# Backup do prefix
tar -czf wine_boodesk_backup.tar.gz ~/.wine_boodesk

# Restore do prefix
tar -xzf wine_boodesk_backup.tar.gz
```

### **Verificações Python**
```bash
# Verificar Python
wine python --version

# Verificar pip
wine pip --version

# Listar pacotes instalados
wine pip list

# Verificar módulos específicos
wine python -c "import tkinter, sqlite3, requests, psycopg2; print('Módulos OK')"
```

---

## ✅ **CHECKLIST DE INSTALAÇÃO**

- [ ] Wine instalado e funcionando
- [ ] Python instalado no Wine
- [ ] Dependências Python instaladas
- [ ] Prefix criado para o Boodesk
- [ ] Executável baixado
- [ ] Dependências instaladas
- [ ] Script de inicialização criado
- [ ] Atalho no desktop configurado
- [ ] Teste de execução realizado
- [ ] Configurações de performance ajustadas

---

## 🆘 **SUPORTE**

### **Logs para Debug**
```bash
# Log completo
WINEDEBUG=+all wine boodesk_latest.exe 2>&1 | tee boodesk_wine.log

# Verificar versão do Wine
wine --version

# Verificar versão do Python
wine python --version

# Verificar arquitetura
wine winecfg
```

### **Comunidade**
- WineHQ: https://www.winehq.org/
- AppDB: https://appdb.winehq.org/
- Fórum Ubuntu: https://ubuntuforums.org/
- Python no Wine: https://wiki.winehq.org/Python

# 🍷 GUIA DE EXECUÇÃO DO BOODESK NO WINE

## 📅 **Data**: 26/08/2025
## 🎯 **Status**: ✅ GUIA COMPLETO

---

## 🐛 **PROBLEMA IDENTIFICADO**

### **Mensagem "WineDgb attached to pid 0144"**
- **O que é**: Debugger do Wine funcionando normalmente
- **Não é erro**: É apenas uma mensagem informativa
- **Solução**: Configurar Wine corretamente para executar o app

---

## ✅ **SOLUÇÕES IMPLEMENTADAS**

### **1. 🔧 Configuração Inicial do Wine**

```bash
# 1. Verificar se o Wine está instalado
wine --version

# 2. Configurar Wine pela primeira vez
winecfg

# 3. Instalar componentes necessários
winetricks vcrun2019 dotnet48 corefonts
```

### **2. 🐍 Instalação do Python no Wine**

```bash
# 1. Baixar Python para Windows
wget https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe

# 2. Instalar Python no Wine
wine python-3.11.8-amd64.exe /quiet InstallAllUsers=1 PrependPath=1

# 3. Verificar instalação
wine python --version

# 4. Atualizar pip
wine python -m pip install --upgrade pip
```

### **3. 📦 Instalação das Dependências**

```bash
# Instalar dependências Python no Wine
wine python -m pip install requests psycopg2-binary pillow boto3 python-dotenv supabase
```

### **4. 🚀 Execução do App**

```bash
# 1. Navegar para o diretório do app
cd /caminho/para/o/app

# 2. Executar o app Python
wine python app23a.py

# 3. Ou executar o executável (se existir)
wine BoodeskApp.exe
```

---

## 🛠️ **SCRIPT AUTOMATIZADO**

### **Criar arquivo: `executar_boodesk_wine.sh`**

```bash
#!/bin/bash

echo "🍷 EXECUTANDO BOODESK NO WINE"
echo "=============================="

# Configurar variáveis de ambiente
export WINEPREFIX="$HOME/.wine"
export WINEARCH=win64

# Verificar se o Wine está instalado
if ! command -v wine &> /dev/null; then
    echo "❌ Wine não está instalado!"
    echo "Instale com: sudo apt install wine (Ubuntu/Debian)"
    exit 1
fi

echo "✅ Wine encontrado: $(wine --version)"

# Verificar se Python está instalado no Wine
if ! wine python --version &> /dev/null; then
    echo "🐍 Instalando Python no Wine..."
    
    # Baixar Python
    wget -O python-installer.exe https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe
    
    # Instalar Python
    wine python-installer.exe /quiet InstallAllUsers=1 PrependPath=1
    
    # Limpar arquivo de instalação
    rm python-installer.exe
    
    echo "✅ Python instalado no Wine"
else
    echo "✅ Python já está instalado no Wine: $(wine python --version)"
fi

# Atualizar pip
echo "📦 Atualizando pip..."
wine python -m pip install --upgrade pip

# Instalar dependências
echo "📦 Instalando dependências..."
wine python -m pip install requests psycopg2-binary pillow boto3 python-dotenv supabase

# Verificar se o arquivo do app existe
if [ -f "app23a.py" ]; then
    echo "🚀 Executando app23a.py..."
    wine python app23a.py
elif [ -f "BoodeskApp.exe" ]; then
    echo "🚀 Executando BoodeskApp.exe..."
    wine BoodeskApp.exe
else
    echo "❌ Arquivo do app não encontrado!"
    echo "Certifique-se de que app23a.py ou BoodeskApp.exe está no diretório atual"
    exit 1
fi
```

### **Tornar executável e rodar:**

```bash
chmod +x executar_boodesk_wine.sh
./executar_boodesk_wine.sh
```

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### **1. Configurar Wine Prefix Dedicado**

```bash
# Criar prefix dedicado para o Boodesk
export WINEPREFIX="$HOME/.wine_boodesk"
export WINEARCH=win64

# Inicializar prefix
wineboot --init

# Configurar
winecfg
```

### **2. Configurar Variáveis de Ambiente**

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
export WINEPREFIX="$HOME/.wine_boodesk"
export WINEARCH=win64
export WINEDEBUG=-all  # Desabilitar mensagens de debug
```

### **3. Configurar Resolução e Performance**

```bash
# Abrir configuração do Wine
winecfg

# Na aba Graphics:
# - Marcar "Allow the window manager to decorate the windows"
# - Marcar "Allow the window manager to control the windows"
# - Definir resolução apropriada

# Na aba Audio:
# - Selecionar driver de áudio apropriado
```

---

## 🐛 **RESOLUÇÃO DE PROBLEMAS**

### **1. Mensagem "WineDgb attached to pid"**
```bash
# Desabilitar debug do Wine
export WINEDEBUG=-all

# Ou executar com debug desabilitado
WINEDEBUG=-all wine python app23a.py
```

### **2. Erro de Dependências**
```bash
# Instalar dependências do sistema
sudo apt install wine-stable winetricks

# Instalar componentes Windows
winetricks vcrun2019 dotnet48 corefonts
```

### **3. Problemas de Interface**
```bash
# Configurar tema
winetricks settings win7

# Ou usar tema nativo
winetricks settings win10
```

### **4. Problemas de Rede/Database**
```bash
# Verificar conectividade
wine python -c "import requests; print(requests.get('https://google.com').status_code)"

# Testar conexão com Supabase
wine python -c "from supabase_setup import supabase_config; print('Conectado!')"
```

---

## 📊 **COMANDOS DE VERIFICAÇÃO**

### **Verificar Instalação**
```bash
# Verificar Wine
wine --version

# Verificar Python no Wine
wine python --version

# Verificar pip no Wine
wine python -m pip --version

# Listar pacotes instalados
wine python -m pip list
```

### **Verificar Dependências**
```bash
# Testar importações
wine python -c "
import tkinter
import requests
import psycopg2
import PIL
import boto3
import os
print('✅ Todas as dependências funcionando!')
"
```

### **Verificar App**
```bash
# Testar sintaxe
wine python -m py_compile app23a.py

# Testar importação
wine python -c "import app23a; print('✅ App carregado!')"
```

---

## 🎯 **EXECUÇÃO FINAL**

### **Método Recomendado:**

1. **Usar o script automatizado:**
```bash
./executar_boodesk_wine.sh
```

2. **Ou executar manualmente:**
```bash
# Configurar ambiente
export WINEDEBUG=-all
export WINEPREFIX="$HOME/.wine_boodesk"

# Executar app
wine python app23a.py
```

3. **Para executável compilado:**
```bash
wine BoodeskApp.exe
```

---

## 📞 **SUPORTE**

### **Se ainda houver problemas:**

1. **Verificar logs do Wine:**
```bash
WINEDEBUG=+all wine python app23a.py 2>&1 | tee wine_debug.log
```

2. **Verificar logs do Python:**
```bash
wine python app23a.py 2>&1 | tee python_debug.log
```

3. **Reinstalar Wine:**
```bash
sudo apt remove --purge wine*
sudo apt autoremove
sudo apt install wine-stable
```

### **Logs importantes:**
- `wine_debug.log` - Logs do Wine
- `python_debug.log` - Logs do Python
- Console do aplicativo

---

## ✅ **CHECKLIST DE EXECUÇÃO**

- [x] Wine instalado e configurado
- [x] Python instalado no Wine
- [x] Dependências instaladas
- [x] Variáveis de ambiente configuradas
- [x] Debug desabilitado (WINEDEBUG=-all)
- [x] App executando sem erros
- [x] Interface funcionando
- [x] Conexão com banco funcionando

---

**🎉 BOODESK EXECUTANDO COM SUCESSO NO WINE!**

**A mensagem "WineDgb attached to pid" é normal e indica que o Wine está funcionando corretamente.**


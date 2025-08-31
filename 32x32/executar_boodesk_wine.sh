#!/bin/bash

echo "🍷 EXECUTANDO BOODESK NO WINE"
echo "=============================="

# Configurar variáveis de ambiente
export WINEPREFIX="$HOME/.wine"
export WINEARCH=win64
export WINEDEBUG=-all  # Desabilitar mensagens de debug

# Verificar se o Wine está instalado
if ! command -v wine &> /dev/null; then
    echo "❌ Wine não está instalado!"
    echo "Instale com: sudo apt install wine (Ubuntu/Debian)"
    echo "Ou: sudo dnf install wine (Fedora)"
    echo "Ou: sudo pacman -S wine (Arch)"
    exit 1
fi

echo "✅ Wine encontrado: $(wine --version)"

# Verificar se Python está instalado no Wine
if ! wine python --version &> /dev/null; then
    echo "🐍 Instalando Python no Wine..."
    
    # Baixar Python
    echo "📥 Baixando Python 3.11.8..."
    wget -O python-installer.exe https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe
    
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao baixar Python!"
        exit 1
    fi
    
    # Instalar Python
    echo "🔧 Instalando Python no Wine..."
    wine python-installer.exe /quiet InstallAllUsers=1 PrependPath=1
    
    # Aguardar instalação
    sleep 10
    
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

# Verificar se as dependências foram instaladas
echo "🔍 Verificando dependências..."
wine python -c "
try:
    import tkinter
    import requests
    import psycopg2
    import PIL
    import boto3
    import os
    print('✅ Todas as dependências funcionando!')
except ImportError as e:
    print(f'❌ Erro de dependência: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Erro ao verificar dependências!"
    exit 1
fi

# Verificar se o arquivo do app existe
if [ -f "app23a.py" ]; then
    echo "🚀 Executando app23a.py..."
    echo "📝 Dica: A mensagem 'WineDgb attached to pid' é normal!"
    wine python app23a.py
elif [ -f "BoodeskApp.exe" ]; then
    echo "🚀 Executando BoodeskApp.exe..."
    wine BoodeskApp.exe
else
    echo "❌ Arquivo do app não encontrado!"
    echo "Certifique-se de que app23a.py ou BoodeskApp.exe está no diretório atual"
    echo ""
    echo "📁 Arquivos encontrados no diretório:"
    ls -la *.py *.exe 2>/dev/null || echo "Nenhum arquivo .py ou .exe encontrado"
    exit 1
fi


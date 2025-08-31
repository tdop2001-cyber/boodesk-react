#!/bin/bash
# -*- coding: utf-8 -*-
"""
Script para instalar todas as dependências do BoodeskApp no Linux
"""

echo "🐧 Instalando Dependências - BoodeskApp Linux"
echo "============================================="
echo

# Verificar se está no Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ Este script deve ser executado no Linux!"
    exit 1
fi

echo "✅ Sistema Linux detectado"
echo "📂 Diretório atual: $(pwd)"
echo

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update -y

# Instalar dependências do sistema
echo "🔧 Instalando dependências do sistema..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-tk \
    python3-venv \
    python3-dev \
    build-essential \
    libtk8.6 \
    libx11-dev \
    libxext-dev \
    libxrender-dev \
    libxinerama-dev \
    libxi-dev \
    libxrandr-dev \
    libxcursor-dev \
    libxcomposite-dev \
    libxdamage-dev \
    libxfixes-dev \
    libxss-dev \
    libxtst-dev \
    libasound2-dev \
    libpango1.0-dev \
    libcairo2-dev \
    libgdk-pixbuf-xlib-2.0-dev \
    libgtk-3-dev \
    libglib2.0-dev \
    libatk1.0-dev \
    libgirepository1.0-dev

echo "✅ Dependências do sistema instaladas"
echo

# Instalar PyInstaller
echo "📦 Instalando PyInstaller..."
pip3 install --user pyinstaller

echo "✅ PyInstaller instalado"
echo

# Instalar dependências Python
echo "🐍 Instalando dependências Python..."
pip3 install --user \
    psutil \
    pandas \
    pillow \
    matplotlib \
    requests \
    ttkthemes \
    tkcalendar

echo "✅ Dependências Python instaladas"
echo

# Verificar instalações
echo "🔍 Verificando instalações..."
echo

# Verificar Python
if command -v python3 &> /dev/null; then
    echo "✅ Python3: $(python3 --version)"
else
    echo "❌ Python3 não encontrado"
fi

# Verificar PyInstaller
if command -v pyinstaller &> /dev/null; then
    echo "✅ PyInstaller: $(pyinstaller --version)"
else
    echo "⚠️ PyInstaller não encontrado no PATH"
    echo "💡 Tente: ~/.local/bin/pyinstaller"
fi

# Verificar módulos Python
echo "🔍 Verificando módulos Python..."
python3 -c "import tkinter; print('✅ tkinter')" 2>/dev/null || echo "❌ tkinter"
python3 -c "import ttkthemes; print('✅ ttkthemes')" 2>/dev/null || echo "❌ ttkthemes"
python3 -c "import tkcalendar; print('✅ tkcalendar')" 2>/dev/null || echo "❌ tkcalendar"
python3 -c "import pandas; print('✅ pandas')" 2>/dev/null || echo "❌ pandas"
python3 -c "import matplotlib; print('✅ matplotlib')" 2>/dev/null || echo "❌ matplotlib"
python3 -c "import psutil; print('✅ psutil')" 2>/dev/null || echo "❌ psutil"

echo
echo "🎉 Instalação concluída!"
echo
echo "🚀 Para executar o BoodeskApp:"
echo "   chmod +x BoodeskApp"
echo "   ./BoodeskApp"
echo
echo "🔧 Se ainda houver problemas, tente:"
echo "   pip3 install --user --upgrade ttkthemes tkcalendar"


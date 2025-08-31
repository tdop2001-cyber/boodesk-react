#!/bin/bash
# -*- coding: utf-8 -*-
"""
Script de Instalação Rápida - BoodeskApp Linux Mint
Execute este script para instalar e executar o BoodeskApp
"""

echo "🎯 BoodeskApp - Instalação Rápida Linux Mint"
echo "============================================="
echo

# Verificar se está no Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ Este script deve ser executado no Linux!"
    echo "💡 Use WSL ou uma máquina virtual Linux"
    exit 1
fi

echo "✅ Sistema Linux detectado"
echo "📂 Diretório atual: $(pwd)"
echo

# Verificar arquivo principal
if [ ! -f "BoodeskApp" ]; then
    echo "❌ Arquivo BoodeskApp não encontrado!"
    echo "💡 Certifique-se de que todos os arquivos estão presentes"
    exit 1
fi

echo "📦 Verificando dependências..."

# Instalar dependências básicas
echo "🔧 Instalando dependências do sistema..."
sudo apt update

# Dependências essenciais
sudo apt install -y \
    python3-tk \
    tk8.6 \
    libtk8.6 \
    libx11-6 \
    libxext6 \
    libxrender1 \
    libxinerama1 \
    libxi6 \
    libxrandr2 \
    libxcursor1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxss1 \
    libxtst6 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libgtk-3-0 \
    libglib2.0-0 \
    libatk1.0-0 \
    libgirepository-1.0-1

echo "✅ Dependências instaladas"
echo

# Configurar permissões
echo "🔐 Configurando permissões..."
chmod +x BoodeskApp
chmod +x install_linux_mint.sh
chmod +x test_linux_mint.sh

echo "✅ Permissões configuradas"
echo

# Executar teste
echo "🧪 Executando teste rápido..."
./test_linux_mint.sh

echo
echo "🎉 Instalação concluída!"
echo
echo "🚀 Para executar o BoodeskApp:"
echo "   ./BoodeskApp"
echo
echo "📖 Para mais informações:"
echo "   cat README_LINUX_MINT.md"
echo
echo "🎯 Deseja executar o BoodeskApp agora? (s/n)"
read -r resposta

if [[ "$resposta" =~ ^[Ss]$ ]]; then
    echo "🚀 Executando BoodeskApp..."
    ./BoodeskApp
else
    echo "✅ Instalação concluída! Execute ./BoodeskApp quando quiser."
fi

echo
echo "🎉 Obrigado por usar o BoodeskApp!"


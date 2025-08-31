#!/bin/bash
# -*- coding: utf-8 -*-
"""
Script de Instalação e Execução do BoodeskApp no Linux Mint
"""

echo "🐧 Instalador BoodeskApp para Linux Mint"
echo "========================================"
echo

# Verificar se está no Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ Este script deve ser executado no Linux!"
    exit 1
fi

echo "✅ Sistema Linux detectado"
echo "📂 Diretório atual: $(pwd)"
echo

# Verificar se o executável existe
if [ ! -f "BoodeskApp" ]; then
    echo "❌ Arquivo BoodeskApp não encontrado!"
    echo "💡 Certifique-se de que o arquivo está no diretório atual"
    exit 1
fi

echo "📦 Verificando dependências do sistema..."

# Instalar dependências necessárias
echo "🔧 Instalando dependências do sistema..."
sudo apt update

# Dependências básicas para GUI
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

# Dar permissão de execução
echo "🔐 Configurando permissões..."
chmod +x BoodeskApp

echo "✅ Permissões configuradas"
echo

# Verificar se é executável
if [ -x "BoodeskApp" ]; then
    echo "🎉 BoodeskApp está pronto para execução!"
    echo
    echo "📊 Informações do arquivo:"
    ls -la BoodeskApp
    echo
    echo "📁 Tamanho: $(du -h BoodeskApp | cut -f1)"
    echo
    echo "🚀 Para executar o aplicativo:"
    echo "   ./BoodeskApp"
    echo
    echo "💡 Ou clique duas vezes no arquivo no gerenciador de arquivos"
    echo
    echo "🎯 Deseja executar agora? (s/n)"
    read -r resposta
    
    if [[ "$resposta" =~ ^[Ss]$ ]]; then
        echo "🚀 Executando BoodeskApp..."
        ./BoodeskApp
    else
        echo "✅ Instalação concluída! Execute ./BoodeskApp quando quiser."
    fi
else
    echo "❌ Erro: Arquivo não é executável"
    exit 1
fi

echo
echo "🎉 Processo concluído!"


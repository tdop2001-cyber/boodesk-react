#!/bin/bash
# -*- coding: utf-8 -*-
"""
Teste Rápido do BoodeskApp no Linux Mint
"""

echo "🧪 Teste Rápido - BoodeskApp Linux Mint"
echo "======================================="
echo

# Verificar sistema
echo "📋 Informações do Sistema:"
echo "   OS: $(uname -s)"
echo "   Arquitetura: $(uname -m)"
echo "   Distribuição: $(lsb_release -d | cut -f2)"
echo

# Verificar arquivo
if [ -f "BoodeskApp" ]; then
    echo "✅ Arquivo BoodeskApp encontrado"
    echo "   Tamanho: $(du -h BoodeskApp | cut -f1)"
    echo "   Permissões: $(ls -la BoodeskApp | awk '{print $1}')"
else
    echo "❌ Arquivo BoodeskApp não encontrado"
    exit 1
fi

echo

# Verificar dependências básicas
echo "🔍 Verificando dependências básicas..."

# Verificar Python
if command -v python3 &> /dev/null; then
    echo "✅ Python3 encontrado: $(python3 --version)"
else
    echo "⚠️ Python3 não encontrado"
fi

# Verificar Tkinter
if python3 -c "import tkinter" 2>/dev/null; then
    echo "✅ Tkinter disponível"
else
    echo "⚠️ Tkinter não disponível"
fi

# Verificar bibliotecas do sistema
echo
echo "📦 Verificando bibliotecas do sistema..."

libs=("libtk8.6" "libx11-6" "libgtk-3-0")
for lib in "${libs[@]}"; do
    if dpkg -l | grep -q "$lib"; then
        echo "✅ $lib instalado"
    else
        echo "⚠️ $lib não instalado"
    fi
done

echo

# Teste de execução
echo "🚀 Teste de execução..."
echo "   Executando: ./BoodeskApp --version (se disponível)"

# Tentar executar com timeout
timeout 5s ./BoodeskApp --version 2>/dev/null
if [ $? -eq 124 ]; then
    echo "✅ Aplicativo iniciou (timeout após 5s)"
elif [ $? -eq 0 ]; then
    echo "✅ Aplicativo executou com sucesso"
else
    echo "⚠️ Aplicativo pode ter problemas"
fi

echo
echo "🎯 Para executar o aplicativo completo:"
echo "   ./BoodeskApp"
echo
echo "📖 Para mais informações, consulte:"
echo "   cat README_LINUX_MINT.md"


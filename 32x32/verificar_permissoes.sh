#!/bin/bash
# -*- coding: utf-8 -*-
"""
Script de Verificação de Permissões - Linux Mint
"""

echo "🔍 Verificação de Permissões - BoodeskApp"
echo "=========================================="
echo

# Verificar se está no Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ Este script deve ser executado no Linux!"
    exit 1
fi

echo "✅ Sistema Linux detectado"
echo "📂 Diretório atual: $(pwd)"
echo

# Verificar arquivos
echo "📋 Verificando arquivos:"
echo

files=("BoodeskApp" "INSTALAR.sh" "install_linux_mint.sh" "test_linux_mint.sh")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
        echo "   Permissões: $(ls -la "$file" | awk '{print $1}')"
        echo "   Tamanho: $(du -h "$file" | cut -f1)"
        
        # Verificar se tem permissão de execução
        if [ -x "$file" ]; then
            echo "   ✅ Tem permissão de execução"
        else
            echo "   ❌ SEM permissão de execução"
            echo "   💡 Execute: chmod +x $file"
        fi
    else
        echo "❌ $file NÃO encontrado"
    fi
    echo
done

echo "🔧 Comandos para corrigir permissões:"
echo "chmod +x BoodeskApp"
echo "chmod +x INSTALAR.sh"
echo "chmod +x install_linux_mint.sh"
echo "chmod +x test_linux_mint.sh"
echo

echo "🚀 Para executar:"
echo "./INSTALAR.sh"
echo "ou"
echo "./BoodeskApp"
echo

echo "📖 Para mais informações, leia:"
echo "cat README_LINUX_MINT.md"
echo "cat COMO_USAR.txt"


#!/bin/bash
# -*- coding: utf-8 -*-
"""
Correção Rápida para ttkthemes no Linux
"""

echo "🔧 Correção Rápida - ttkthemes Linux"
echo "====================================="
echo

# Verificar se está no Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ Este script deve ser executado no Linux!"
    exit 1
fi

echo "✅ Sistema Linux detectado"
echo

# Atualizar pip
echo "📦 Atualizando pip..."
python3 -m pip install --user --upgrade pip

# Instalar ttkthemes especificamente
echo "🐍 Instalando ttkthemes..."
pip3 install --user --upgrade ttkthemes

# Instalar tkcalendar também
echo "📅 Instalando tkcalendar..."
pip3 install --user --upgrade tkcalendar

# Verificar instalação
echo "🔍 Verificando instalação..."
python3 -c "import ttkthemes; print('✅ ttkthemes instalado com sucesso!')" 2>/dev/null || {
    echo "❌ Falha na instalação do ttkthemes"
    echo "💡 Tentando método alternativo..."
    
    # Método alternativo
    pip3 install --user --upgrade --force-reinstall ttkthemes
    
    # Verificar novamente
    python3 -c "import ttkthemes; print('✅ ttkthemes instalado com sucesso!')" 2>/dev/null || {
        echo "❌ Ainda falhou. Tentando instalar via apt..."
        sudo apt install -y python3-ttkthemes 2>/dev/null || echo "❌ Pacote não disponível via apt"
    }
}

echo
echo "🎉 Correção concluída!"
echo
echo "🚀 Agora tente executar o BoodeskApp:"
echo "   ./BoodeskApp"


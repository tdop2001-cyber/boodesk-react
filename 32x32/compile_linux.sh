#!/bin/bash

echo "========================================"
echo "   COMPILANDO BOODESK APP PARA LINUX"
echo "========================================"
echo

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "ERRO: Python3 não encontrado!"
    echo "Por favor, instale o Python 3.8 ou superior"
    echo "sudo apt-get install python3 python3-pip"
    exit 1
fi

echo "Python3 encontrado: $(python3 --version)"
echo

# Verificar se pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "ERRO: pip3 não encontrado!"
    echo "Por favor, instale o pip3"
    echo "sudo apt-get install python3-pip"
    exit 1
fi

echo "pip3 encontrado: $(pip3 --version)"
echo

# Instalar dependências do sistema (se necessário)
echo "Instalando dependências do sistema..."
if command -v apt-get &> /dev/null; then
    # Ubuntu/Debian
    sudo apt-get update
    sudo apt-get install -y python3-dev python3-pip python3-venv
    sudo apt-get install -y libgl1-mesa-glx libglib2.0-0
    sudo apt-get install -y libsm6 libxext6 libxrender-dev
    sudo apt-get install -y libgomp1 libgcc-s1
elif command -v yum &> /dev/null; then
    # CentOS/RHEL/Fedora
    sudo yum install -y python3-devel python3-pip
    sudo yum install -y mesa-libGL mesa-libGL-devel
    sudo yum install -y libSM libXext libXrender
elif command -v dnf &> /dev/null; then
    # Fedora (versões mais recentes)
    sudo dnf install -y python3-devel python3-pip
    sudo dnf install -y mesa-libGL mesa-libGL-devel
    sudo dnf install -y libSM libXext libXrender
fi

echo "Dependências do sistema instaladas!"
echo

# Instalar/atualizar PyInstaller
echo "Instalando/atualizando PyInstaller..."
pip3 install --upgrade pyinstaller
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar PyInstaller!"
    exit 1
fi

echo "PyInstaller instalado com sucesso!"
echo

# Instalar dependências Python
echo "Instalando dependências Python..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependências Python!"
    exit 1
fi

echo "Dependências Python instaladas com sucesso!"
echo

# Verificar se o arquivo app23a.py existe
if [ ! -f "app23a.py" ]; then
    echo "ERRO: Arquivo app23a.py não encontrado!"
    echo "Certifique-se de estar no diretório correto"
    exit 1
fi

echo "Arquivo app23a.py encontrado!"
echo

# Verificar se o arquivo de especificação existe
if [ ! -f "app23a.spec" ]; then
    echo "ERRO: Arquivo app23a.spec não encontrado!"
    exit 1
fi

echo "Arquivo app23a.spec encontrado!"
echo

# Limpar compilações anteriores
echo "Limpando compilações anteriores..."
rm -rf build/
rm -rf dist/
rm -rf __pycache__/
rm -rf *.spec.bak

echo "Limpeza concluída!"
echo

# Compilar o executável
echo "========================================"
echo "Iniciando compilação..."
echo "========================================"
echo

pyinstaller --clean app23a.spec

if [ $? -ne 0 ]; then
    echo
    echo "========================================"
    echo "ERRO NA COMPILAÇÃO!"
    echo "========================================"
    echo "Verifique os erros acima e tente novamente"
    exit 1
fi

echo
echo "========================================"
echo "COMPILAÇÃO CONCLUÍDA COM SUCESSO!"
echo "========================================"
echo
echo "O executável foi criado em: dist/BoodeskApp"
echo
echo "Para distribuir:"
echo "1. Copie a pasta 'dist' completa"
echo "2. Inclua o banco de dados SQLite (se necessário)"
echo "3. Inclua os arquivos de configuração JSON"
echo "4. Torne o executável executável: chmod +x dist/BoodeskApp"
echo

# Tornar o executável executável
chmod +x dist/BoodeskApp

echo "Permissões de execução configuradas!"
echo

# Verificar se a compilação foi bem-sucedida
if [ -f "dist/BoodeskApp" ]; then
    echo "✅ Executável criado com sucesso!"
    echo "📁 Localização: $(pwd)/dist/BoodeskApp"
    echo "📊 Tamanho: $(du -h dist/BoodeskApp | cut -f1)"
    echo
    echo "Para testar o executável:"
    echo "cd dist && ./BoodeskApp"
    echo
else
    echo "❌ ERRO: Executável não foi criado!"
    exit 1
fi

echo "Compilação finalizada!"
echo "Pressione Enter para abrir a pasta dist..."
read

# Abrir a pasta dist
if command -v xdg-open &> /dev/null; then
    xdg-open dist/
elif command -v open &> /dev/null; then
    open dist/
else
    echo "Pasta dist criada em: $(pwd)/dist"
fi



#!/bin/bash

echo "🔍 DIAGNÓSTICO DO WINE E BOODESK"
echo "================================"

# Configurar variáveis de ambiente
export WINEPREFIX="$HOME/.wine"
export WINEARCH=win64

echo "📋 INFORMAÇÕES DO SISTEMA"
echo "-------------------------"
echo "Sistema: $(uname -a)"
echo "Distribuição: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Usuário: $(whoami)"
echo "Diretório atual: $(pwd)"

echo ""
echo "🍷 INFORMAÇÕES DO WINE"
echo "---------------------"

# Verificar se o Wine está instalado
if command -v wine &> /dev/null; then
    echo "✅ Wine instalado: $(wine --version)"
else
    echo "❌ Wine não está instalado!"
    exit 1
fi

# Verificar configuração do Wine
echo "📁 Prefix do Wine: $WINEPREFIX"
if [ -d "$WINEPREFIX" ]; then
    echo "✅ Prefix do Wine existe"
    echo "📊 Tamanho do prefix: $(du -sh $WINEPREFIX | cut -f1)"
else
    echo "❌ Prefix do Wine não existe"
fi

echo ""
echo "🐍 INFORMAÇÕES DO PYTHON"
echo "----------------------"

# Verificar Python no Wine
if wine python --version &> /dev/null; then
    echo "✅ Python no Wine: $(wine python --version)"
else
    echo "❌ Python não está instalado no Wine"
fi

# Verificar pip no Wine
if wine python -m pip --version &> /dev/null; then
    echo "✅ pip no Wine: $(wine python -m pip --version)"
else
    echo "❌ pip não está funcionando no Wine"
fi

echo ""
echo "📦 DEPENDÊNCIAS INSTALADAS"
echo "-------------------------"

# Listar pacotes instalados
if wine python -m pip list &> /dev/null; then
    echo "📋 Pacotes Python instalados:"
    wine python -m pip list | grep -E "(requests|psycopg2|pillow|boto3|dotenv|supabase)" || echo "Nenhuma dependência encontrada"
else
    echo "❌ Não foi possível listar pacotes"
fi

echo ""
echo "🔍 VERIFICAÇÃO DE DEPENDÊNCIAS"
echo "----------------------------"

# Testar importações
echo "Testando importações..."
wine python -c "
imports = [
    'tkinter',
    'requests', 
    'psycopg2',
    'PIL',
    'boto3',
    'os',
    'dotenv',
    'supabase'
]

for module in imports:
    try:
        __import__(module)
        print(f'✅ {module}')
    except ImportError as e:
        print(f'❌ {module}: {e}')
    except Exception as e:
        print(f'⚠️ {module}: {e}')
"

echo ""
echo "📁 ARQUIVOS DO APLICATIVO"
echo "------------------------"

# Verificar arquivos do app
if [ -f "app23a.py" ]; then
    echo "✅ app23a.py encontrado"
    echo "📊 Tamanho: $(ls -lh app23a.py | awk '{print $5}')"
    echo "📅 Modificado: $(ls -l app23a.py | awk '{print $6, $7, $8}')"
    
    # Verificar sintaxe
    echo "🔍 Verificando sintaxe..."
    if wine python -m py_compile app23a.py; then
        echo "✅ Sintaxe Python OK"
    else
        echo "❌ Erro de sintaxe Python"
    fi
else
    echo "❌ app23a.py não encontrado"
fi

if [ -f "BoodeskApp.exe" ]; then
    echo "✅ BoodeskApp.exe encontrado"
    echo "📊 Tamanho: $(ls -lh BoodeskApp.exe | awk '{print $5}')"
else
    echo "❌ BoodeskApp.exe não encontrado"
fi

echo ""
echo "🌐 TESTE DE CONECTIVIDADE"
echo "------------------------"

# Testar conectividade
echo "Testando conectividade..."
wine python -c "
import requests
try:
    response = requests.get('https://google.com', timeout=5)
    print(f'✅ Conectividade OK: {response.status_code}')
except Exception as e:
    print(f'❌ Erro de conectividade: {e}')
"

echo ""
echo "🗄️ TESTE DE BANCO DE DADOS"
echo "-------------------------"

# Testar conexão com Supabase
echo "Testando conexão com Supabase..."
wine python -c "
try:
    from supabase_setup import supabase_config
    conn = supabase_config.get_connection()
    if conn:
        print('✅ Conexão com Supabase OK')
        conn.close()
    else:
        print('❌ Falha na conexão com Supabase')
except Exception as e:
    print(f'❌ Erro de banco: {e}')
"

echo ""
echo "🚀 TESTE DE EXECUÇÃO"
echo "-------------------"

# Testar execução do app
echo "Testando execução do app..."
if [ -f "app23a.py" ]; then
    echo "Executando app23a.py por 10 segundos..."
    timeout 10s wine python app23a.py &
    APP_PID=$!
    sleep 5
    if kill -0 $APP_PID 2>/dev/null; then
        echo "✅ App iniciou com sucesso"
        kill $APP_PID 2>/dev/null
    else
        echo "❌ App não iniciou ou falhou"
    fi
else
    echo "❌ app23a.py não encontrado para teste"
fi

echo ""
echo "📝 RECOMENDAÇÕES"
echo "---------------"

# Dar recomendações baseadas nos resultados
if ! wine python --version &> /dev/null; then
    echo "🔧 Instale Python no Wine:"
    echo "   wget https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe"
    echo "   wine python-3.11.8-amd64.exe /quiet InstallAllUsers=1 PrependPath=1"
fi

if [ ! -f "app23a.py" ] && [ ! -f "BoodeskApp.exe" ]; then
    echo "🔧 Copie os arquivos do app para este diretório"
fi

echo ""
echo "🔧 Para executar o app:"
echo "   ./executar_boodesk_wine.sh"
echo ""
echo "🔧 Para desabilitar mensagens de debug:"
echo "   export WINEDEBUG=-all"
echo ""
echo "🔧 Para usar prefix dedicado:"
echo "   export WINEPREFIX=\"\$HOME/.wine_boodesk\""
echo "   wineboot --init"

echo ""
echo "✅ Diagnóstico concluído!"


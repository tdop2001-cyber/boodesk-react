@echo off
echo ========================================
echo    COMPILANDO BOODESK APP PARA WINDOWS
echo ========================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado!
    echo Por favor, instale o Python 3.8 ou superior
    pause
    exit /b 1
)

echo Python encontrado!
echo.

REM Verificar se pip está instalado
pip --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: pip nao encontrado!
    echo Por favor, instale o pip
    pause
    exit /b 1
)

echo pip encontrado!
echo.

REM Instalar/atualizar PyInstaller
echo Instalando/atualizando PyInstaller...
pip install --upgrade pyinstaller
if errorlevel 1 (
    echo ERRO: Falha ao instalar PyInstaller!
    pause
    exit /b 1
)

echo PyInstaller instalado com sucesso!
echo.

REM Instalar dependências
echo Instalando dependencias...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)

echo Dependencias instaladas com sucesso!
echo.

REM Verificar se o arquivo app23a.py existe
if not exist "app23a.py" (
    echo ERRO: Arquivo app23a.py nao encontrado!
    echo Certifique-se de estar no diretorio correto
    pause
    exit /b 1
)

echo Arquivo app23a.py encontrado!
echo.

REM Verificar se o arquivo de especificação existe
if not exist "app23a.spec" (
    echo ERRO: Arquivo app23a.spec nao encontrado!
    pause
    exit /b 1
)

echo Arquivo app23a.spec encontrado!
echo.

REM Limpar compilações anteriores
echo Limpando compilacoes anteriores...
if exist "build" rmdir /s /q build
if exist "dist" rmdir /s /q dist
if exist "__pycache__" rmdir /s /q __pycache__

echo Limpeza concluida!
echo.

REM Compilar o executável
echo ========================================
echo Iniciando compilacao...
echo ========================================
echo.

pyinstaller --clean app23a.spec

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERRO NA COMPILACAO!
    echo ========================================
    echo Verifique os erros acima e tente novamente
    pause
    exit /b 1
)

echo.
echo ========================================
echo COMPILACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo O executavel foi criado em: dist\BoodeskApp.exe
echo.
echo Para distribuir:
echo 1. Copie a pasta 'dist' completa
echo 2. Inclua o banco de dados SQLite (se necessario)
echo 3. Inclua os arquivos de configuracao JSON
echo.
echo Pressione qualquer tecla para abrir a pasta dist...
pause >nul

REM Abrir a pasta dist
start dist

echo.
echo Compilacao finalizada!
pause



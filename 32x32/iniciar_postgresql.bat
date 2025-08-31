@echo off
echo ========================================
echo    INICIADOR DO POSTGRESQL BOODESK
echo ========================================
echo.

REM Adicionar PostgreSQL ao PATH
set PATH=%PATH%;C:\Program Files\PostgreSQL\17\bin

REM Verificar se o serviço está rodando
echo Verificando servicos PostgreSQL...
sc query postgresql-x64-17 | find "RUNNING"
if %errorlevel% neq 0 (
    echo.
    echo Servico PostgreSQL nao esta rodando!
    echo Iniciando servico...
    net start postgresql-x64-17
    if %errorlevel% neq 0 (
        echo ERRO: Nao foi possivel iniciar o servico PostgreSQL
        echo Execute como Administrador
        pause
        exit /b 1
    )
) else (
    echo Servico PostgreSQL ja esta rodando!
)

echo.
echo PostgreSQL esta pronto para uso!
echo.
echo Comandos disponiveis:
echo - psql -U postgres -d boodesk_db
echo - psql -U boodesk_app -d boodesk_db
echo.
echo Para sair, digite: exit
echo.

REM Manter o terminal aberto
cmd /k





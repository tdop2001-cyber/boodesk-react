@echo off
echo ========================================
echo    LIMPANDO PROCESSOS BOODESK
echo ========================================
echo.

echo Finalizando processos em execucao...

REM Finalizar processos do Boodesk
taskkill /f /im BoodeskApp.exe 2>nul
taskkill /f /im Boodesk.exe 2>nul
taskkill /f /im app23a.exe 2>nul

REM Finalizar processos Python relacionados
taskkill /f /im python.exe 2>nul
taskkill /f /im pyinstaller.exe 2>nul

REM Finalizar processos que podem estar usando os arquivos
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq BoodeskApp.exe" /fo table /nh 2^>nul') do (
    taskkill /f /pid %%i 2>nul
)

for /f "tokens=2" %%i in ('tasklist /fi "imagename eq Boodesk.exe" /fo table /nh 2^>nul') do (
    taskkill /f /pid %%i 2>nul
)

echo.
echo Processos finalizados!
echo.
echo Aguardando 3 segundos para liberar arquivos...
timeout /t 3 /nobreak >nul

echo.
echo Limpeza concluida!
echo.
pause

@echo off
echo.
echo ======================================
echo   🐧 Deploy Linux via WSL
echo ======================================
echo.

echo 📂 Verificando diretório atual...
echo %cd%

echo.
echo 🔄 Abrindo WSL e executando deploy...
echo.

wsl bash -c "
echo '🐧 Dentro do WSL Ubuntu';
echo '📂 Navegando para o diretório do projeto...';
cd /mnt/c/Users/thall/Documents/Automatizacao/pomodoro/app2/app_trello_pomodoro/32x32;
echo '✅ Diretório atual:' \$(pwd);
echo;

echo '📦 Atualizando sistema Ubuntu...';
sudo apt update -y;

echo;
echo '🐍 Instalando Python e dependências...';
sudo apt install -y python3 python3-pip python3-venv python3-tk;

echo;
echo '📦 Instalando PyInstaller...';
pip3 install --user pyinstaller;

echo;
echo '📦 Instalando dependências Python...';
pip3 install --user psutil pandas pillow matplotlib requests ttkthemes tkcalendar;

echo;
echo '🔨 Criando executável Linux...';
mkdir -p deploy_output/linux;

python3 -m PyInstaller --clean --onefile --windowed --name BoodeskApp --distpath deploy_output/linux app23a.py;

echo;
if [ -f 'deploy_output/linux/BoodeskApp' ]; then
    echo '🎉 Executável Linux criado com sucesso!';
    echo '📁 Localização: deploy_output/linux/BoodeskApp';
    ls -la deploy_output/linux/BoodeskApp;
    echo;
    echo '📊 Tamanho do arquivo:';
    du -h deploy_output/linux/BoodeskApp;
else
    echo '❌ Falha ao criar executável Linux';
fi;
echo;
echo '🎉 Deploy Linux via WSL concluído!';
"

echo.
echo ======================================
echo   Deploy concluído!
echo ======================================
echo.
pause


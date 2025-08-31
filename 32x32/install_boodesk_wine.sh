#!/bin/bash

# 🍷 SCRIPT DE INSTALAÇÃO AUTOMATIZADA - BOODESK NO LINUX VIA WINE
# Autor: Sistema Boodesk
# Versão: 1.1 (com Python)

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para detectar distribuição Linux
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
        VERSION=$VERSION_ID
    else
        print_error "Não foi possível detectar a distribuição Linux"
        exit 1
    fi
}

# Função para instalar Wine
install_wine() {
    print_status "Detectando distribuição Linux..."
    detect_distro
    
    print_status "Instalando Wine para $DISTRO..."
    
    case $DISTRO in
        "ubuntu"|"debian"|"linuxmint")
            sudo apt update
            sudo apt install -y wine64 winetricks wget
            ;;
        "fedora")
            sudo dnf install -y wine winetricks wget
            ;;
        "arch"|"manjaro")
            sudo pacman -S --noconfirm wine winetricks wget
            ;;
        "opensuse")
            sudo zypper install -y wine winetricks wget
            ;;
        *)
            print_error "Distribuição não suportada: $DISTRO"
            print_status "Por favor, instale o Wine manualmente"
            exit 1
            ;;
    esac
    
    print_success "Wine instalado com sucesso!"
}

# Função para configurar Wine
setup_wine() {
    print_status "Configurando Wine..."
    
    # Criar prefix dedicado para o Boodesk
    export WINEPREFIX=~/.wine_boodesk
    export WINEARCH=win64
    
    # Inicializar Wine
    wine wineboot --init
    
    # Configurar para Windows 10
    winecfg /v win10
    
    # Instalar componentes necessários
    print_status "Instalando componentes necessários..."
    winetricks -q vcrun2019 corefonts winhttp
    
    print_success "Wine configurado com sucesso!"
}

# Função para instalar Python no Wine
install_python_wine() {
    print_status "Instalando Python no Wine..."
    
    # Criar diretório temporário
    mkdir -p ~/temp_python
    cd ~/temp_python
    
    # Baixar Python 3.11
    print_status "Baixando Python 3.11..."
    if wget -q --show-progress https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe; then
        print_success "Python 3.11 baixado!"
    else
        print_error "Falha ao baixar Python"
        exit 1
    fi
    
    # Instalar Python no Wine
    print_status "Instalando Python no Wine..."
    wine python-3.11.8-amd64.exe /quiet InstallAllUsers=1 PrependPath=1
    
    # Aguardar instalação
    sleep 10
    
    # Verificar instalação
    if wine python --version > /dev/null 2>&1; then
        print_success "Python instalado: $(wine python --version)"
    else
        print_error "Falha na instalação do Python"
        exit 1
    fi
    
    # Atualizar pip
    print_status "Atualizando pip..."
    wine pip install --upgrade pip
    
    # Instalar dependências Python
    print_status "Instalando dependências Python..."
    wine pip install requests
    wine pip install psycopg2-binary
    wine pip install pillow
    wine pip install boto3
    wine pip install python-dotenv
    wine pip install supabase
    
    # Verificar dependências
    print_status "Verificando dependências..."
    wine python -c "import tkinter, sqlite3, requests, psycopg2, PIL, boto3, dotenv, supabase; print('Todas as dependências OK')" 2>/dev/null || {
        print_warning "Algumas dependências podem não estar funcionando corretamente"
    }
    
    # Limpar arquivos temporários
    cd ~
    rm -rf ~/temp_python
    
    print_success "Python e dependências instalados com sucesso!"
}

# Função para baixar e instalar Boodesk
install_boodesk() {
    print_status "Baixando Boodesk..."
    
    # Criar diretório
    mkdir -p ~/Boodesk
    cd ~/Boodesk
    
    # Baixar executável
    if wget -q --show-progress https://pub-93ac59355fc342489651074099b6e8a7.r2.dev/boodesk_latest.exe; then
        print_success "Boodesk baixado com sucesso!"
    else
        print_error "Falha ao baixar Boodesk"
        exit 1
    fi
    
    # Tornar executável
    chmod +x boodesk_latest.exe
    
    print_success "Boodesk instalado em ~/Boodesk/"
}

# Função para criar script de inicialização
create_launcher() {
    print_status "Criando script de inicialização..."
    
    cat > ~/boodesk.sh << 'EOF'
#!/bin/bash

# Script de inicialização do Boodesk
export WINEPREFIX=~/.wine_boodesk
export WINEARCH=win64

cd ~/Boodesk
wine boodesk_latest.exe
EOF
    
    chmod +x ~/boodesk.sh
    print_success "Script de inicialização criado: ~/boodesk.sh"
}

# Função para criar atalho no desktop
create_desktop_shortcut() {
    print_status "Criando atalho no desktop..."
    
    # Criar diretório se não existir
    mkdir -p ~/.local/share/applications
    
    # Criar arquivo .desktop
    cat > ~/.local/share/applications/boodesk.desktop << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Boodesk
Comment=Sistema de Gerenciamento de Tarefas
Exec=$HOME/boodesk.sh
Icon=applications-office
Terminal=false
Categories=Office;
EOF
    
    chmod +x ~/.local/share/applications/boodesk.desktop
    print_success "Atalho criado: ~/.local/share/applications/boodesk.desktop"
}

# Função para configurar variáveis de ambiente
setup_environment() {
    print_status "Configurando variáveis de ambiente..."
    
    # Adicionar ao .bashrc se não existir
    if ! grep -q "WINEPREFIX=~/.wine_boodesk" ~/.bashrc; then
        echo "" >> ~/.bashrc
        echo "# Boodesk Wine Configuration" >> ~/.bashrc
        echo "export WINEPREFIX=~/.wine_boodesk" >> ~/.bashrc
        echo "export WINEARCH=win64" >> ~/.bashrc
        print_success "Variáveis de ambiente adicionadas ao ~/.bashrc"
    else
        print_warning "Variáveis de ambiente já configuradas"
    fi
}

# Função para testar instalação
test_installation() {
    print_status "Testando instalação..."
    
    # Verificar se Wine está funcionando
    if wine --version > /dev/null 2>&1; then
        print_success "Wine está funcionando: $(wine --version)"
    else
        print_error "Wine não está funcionando"
        return 1
    fi
    
    # Verificar se Python está funcionando
    if wine python --version > /dev/null 2>&1; then
        print_success "Python está funcionando: $(wine python --version)"
    else
        print_error "Python não está funcionando"
        return 1
    fi
    
    # Verificar se arquivo existe
    if [ -f ~/Boodesk/boodesk_latest.exe ]; then
        print_success "Executável do Boodesk encontrado"
    else
        print_error "Executável do Boodesk não encontrado"
        return 1
    fi
    
    print_success "Teste de instalação concluído!"
}

# Função para mostrar informações finais
show_final_info() {
    echo ""
    echo "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
    echo ""
    echo "📋 INFORMAÇÕES IMPORTANTES:"
    echo "   • Wine instalado e configurado"
    echo "   • Python 3.11 instalado no Wine"
    echo "   • Dependências Python instaladas"
    echo "   • Boodesk baixado em: ~/Boodesk/"
    echo "   • Script de inicialização: ~/boodesk.sh"
    echo "   • Atalho no menu: Boodesk"
    echo ""
    echo "🚀 COMO USAR:"
    echo "   1. Execute: ~/boodesk.sh"
    echo "   2. Ou procure por 'Boodesk' no menu de aplicações"
    echo "   3. Ou execute: wine ~/Boodesk/boodesk_latest.exe"
    echo ""
    echo "🔧 COMANDOS ÚTEIS:"
    echo "   • Configurar Wine: WINEPREFIX=~/.wine_boodesk winecfg"
    echo "   • Ver logs: WINEDEBUG=+all wine ~/Boodesk/boodesk_latest.exe"
    echo "   • Limpar cache: wineserver -k"
    echo "   • Verificar Python: wine python --version"
    echo "   • Verificar dependências: wine pip list"
    echo ""
    echo "🐛 RESOLUÇÃO DE PROBLEMAS:"
    echo "   • Se o Boodesk não abrir, verifique: wine python --version"
    echo "   • Se faltar dependências: wine pip install requests psycopg2-binary"
    echo "   • Se problemas de interface: winetricks corefonts"
    echo ""
    echo "📚 DOCUMENTAÇÃO:"
    echo "   • Guia completo: guia_wine_linux.md"
    echo "   • WineHQ: https://www.winehq.org/"
    echo "   • Python no Wine: https://wiki.winehq.org/Python"
    echo ""
}

# Função principal
main() {
    echo "🍷 INSTALADOR AUTOMATIZADO - BOODESK NO LINUX VIA WINE"
    echo "=================================================="
    echo ""
    
    # Verificar se é root
    if [ "$EUID" -eq 0 ]; then
        print_error "Não execute este script como root"
        exit 1
    fi
    
    # Verificar se Wine já está instalado
    if command -v wine > /dev/null 2>&1; then
        print_warning "Wine já está instalado: $(wine --version)"
        read -p "Deseja continuar com a configuração? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Instalação cancelada"
            exit 0
        fi
    else
        install_wine
    fi
    
    # Configurar Wine
    setup_wine
    
    # Instalar Python no Wine
    install_python_wine
    
    # Instalar Boodesk
    install_boodesk
    
    # Criar launcher
    create_launcher
    
    # Criar atalho
    create_desktop_shortcut
    
    # Configurar ambiente
    setup_environment
    
    # Testar instalação
    test_installation
    
    # Mostrar informações finais
    show_final_info
}

# Executar função principal
main "$@"

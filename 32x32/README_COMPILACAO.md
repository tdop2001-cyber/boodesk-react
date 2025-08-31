# 🚀 Compilação do BoodeskApp

Este documento contém instruções para compilar o **BoodeskApp** (app23a.py) em executáveis para Windows e Linux.

## 📋 Pré-requisitos

### Para Windows:
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- Conexão com internet para download das dependências

### Para Linux:
- Python 3.8 ou superior
- pip3 (gerenciador de pacotes Python)
- Dependências do sistema (serão instaladas automaticamente)
- Conexão com internet para download das dependências

## 🛠️ Dependências

O aplicativo utiliza as seguintes dependências principais:

```
pandas>=1.3.0
Pillow>=8.0.0
matplotlib>=3.3.0
tkcalendar>=1.6.0
ttkthemes>=3.2.0
google-auth>=2.0.0
google-auth-oauthlib>=0.4.0
google-auth-httplib2>=0.1.0
google-api-python-client>=2.0.0
requests>=2.25.0
psutil
```

## 📁 Arquivos Necessários

Certifique-se de que os seguintes arquivos estão presentes no diretório:

- `app23a.py` - Arquivo principal da aplicação
- `app23a.spec` - Especificação do PyInstaller
- `requirements.txt` - Lista de dependências
- `*.png` - Arquivos de ícones
- `*.db` - Banco de dados SQLite (se existir)
- `*.json` - Arquivos de configuração (se existir)

## 🪟 Compilação para Windows

### Método 1: Script Automático (Recomendado)

1. **Execute o script de compilação:**
   ```cmd
   compile_windows.bat
   ```

2. **O script irá:**
   - Verificar se Python e pip estão instalados
   - Instalar/atualizar PyInstaller
   - Instalar todas as dependências
   - Compilar o executável
   - Abrir a pasta com o resultado

### Método 2: Compilação Manual

1. **Instalar PyInstaller:**
   ```cmd
   pip install --upgrade pyinstaller
   ```

2. **Instalar dependências:**
   ```cmd
   pip install -r requirements.txt
   ```

3. **Compilar o executável:**
   ```cmd
   pyinstaller --clean app23a.spec
   ```

4. **Resultado:**
   - O executável será criado em: `dist\BoodeskApp.exe`

## 🐧 Compilação para Linux

### Método 1: Script Automático (Recomendado)

1. **Torne o script executável:**
   ```bash
   chmod +x compile_linux.sh
   ```

2. **Execute o script de compilação:**
   ```bash
   ./compile_linux.sh
   ```

3. **O script irá:**
   - Verificar se Python3 e pip3 estão instalados
   - Instalar dependências do sistema
   - Instalar/atualizar PyInstaller
   - Instalar todas as dependências Python
   - Compilar o executável
   - Configurar permissões de execução

### Método 2: Compilação Manual

1. **Instalar dependências do sistema (Ubuntu/Debian):**
   ```bash
   sudo apt-get update
   sudo apt-get install -y python3-dev python3-pip python3-venv
   sudo apt-get install -y libgl1-mesa-glx libglib2.0-0
   sudo apt-get install -y libsm6 libxext6 libxrender-dev
   ```

2. **Instalar PyInstaller:**
   ```bash
   pip3 install --upgrade pyinstaller
   ```

3. **Instalar dependências Python:**
   ```bash
   pip3 install -r requirements.txt
   ```

4. **Compilar o executável:**
   ```bash
   pyinstaller --clean app23a.spec
   ```

5. **Configurar permissões:**
   ```bash
   chmod +x dist/BoodeskApp
   ```

6. **Resultado:**
   - O executável será criado em: `dist/BoodeskApp`

## 📦 Distribuição

### Para Windows:
1. Copie a pasta `dist` completa
2. Inclua o banco de dados SQLite (se necessário)
3. Inclua os arquivos de configuração JSON
4. Distribua a pasta completa

### Para Linux:
1. Copie a pasta `dist` completa
2. Inclua o banco de dados SQLite (se necessário)
3. Inclua os arquivos de configuração JSON
4. Certifique-se de que o executável tem permissões de execução
5. Distribua a pasta completa

## 🔧 Solução de Problemas

### Erro: "Python não encontrado"
- Instale o Python 3.8 ou superior
- Certifique-se de que Python está no PATH do sistema

### Erro: "pip não encontrado"
- Instale o pip: `python -m ensurepip --upgrade`
- Ou use: `python -m pip install --upgrade pip`

### Erro: "Módulo não encontrado"
- Verifique se todas as dependências foram instaladas
- Execute: `pip install -r requirements.txt`

### Erro: "Permissão negada" (Linux)
- Execute: `chmod +x dist/BoodeskApp`
- Ou execute com sudo se necessário

### Erro: "Dependências do sistema" (Linux)
- Execute o script com sudo: `sudo ./compile_linux.sh`
- Ou instale manualmente as dependências listadas

### Erro: "Arquivo não encontrado"
- Certifique-se de estar no diretório correto
- Verifique se todos os arquivos necessários estão presentes

## 📊 Informações do Executável

### Tamanho:
- Windows: ~50-100 MB
- Linux: ~40-80 MB

### Dependências incluídas:
- Python runtime
- Todas as bibliotecas Python necessárias
- Arquivos de ícones e recursos
- Banco de dados SQLite (se presente)

### Compatibilidade:
- Windows: Windows 7/8/10/11 (64-bit)
- Linux: Ubuntu 18.04+, Debian 9+, CentOS 7+

## 🚀 Execução

### Windows:
```cmd
dist\BoodeskApp.exe
```

### Linux:
```bash
./dist/BoodeskApp
```

## 📝 Notas Importantes

1. **Primeira execução:** O aplicativo pode demorar alguns segundos para iniciar
2. **Banco de dados:** Certifique-se de que o banco SQLite está presente
3. **Configurações:** Os arquivos JSON de configuração devem estar na mesma pasta
4. **Ícones:** Todos os arquivos PNG de ícones devem estar presentes
5. **Permissões:** No Linux, o executável precisa ter permissões de execução

## 🆘 Suporte

Se encontrar problemas durante a compilação:

1. Verifique se todas as dependências estão instaladas
2. Certifique-se de que está usando Python 3.8+
3. Execute os scripts com privilégios de administrador se necessário
4. Verifique os logs de erro para mais detalhes

---

**Desenvolvido para o Sistema Boodesk** 🎯



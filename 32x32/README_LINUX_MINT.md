# 🐧 **Guia de Instalação e Execução - Linux Mint**

## 📋 **Informações do Aplicativo**
- **Nome**: BoodeskApp
- **Versão**: 1.0
- **Tamanho**: 14 MB
- **Plataforma**: Linux 64-bit
- **Dependências**: Incluídas no executável

## 🚀 **Método 1: Execução Direta (Recomendado)**

### **Passo 1: Copiar o arquivo**
```bash
# Copie o arquivo BoodeskApp para seu computador Linux Mint
# Exemplo: para o Desktop
cp BoodeskApp ~/Desktop/
cd ~/Desktop
```

### **Passo 2: Dar permissão de execução**
```bash
chmod +x BoodeskApp
```

### **Passo 3: Executar**
```bash
./BoodeskApp
```

## 🔧 **Método 2: Instalação Automática**

### **Passo 1: Executar script de instalação**
```bash
# Dar permissão ao script
chmod +x install_linux_mint.sh

# Executar o instalador
./install_linux_mint.sh
```

### **Passo 2: Seguir as instruções**
O script irá:
- ✅ Verificar o sistema
- ✅ Instalar dependências necessárias
- ✅ Configurar permissões
- ✅ Executar o aplicativo (opcional)

## 🎯 **Método 3: Interface Gráfica**

### **Passo 1: Navegar até o arquivo**
1. Abra o **Gerenciador de Arquivos**
2. Navegue até a pasta onde está o `BoodeskApp`
3. Clique com o botão direito no arquivo

### **Passo 2: Configurar permissões**
1. Selecione **Propriedades**
2. Vá para a aba **Permissões**
3. Marque **Permitir execução como programa**
4. Clique em **Fechar**

### **Passo 3: Executar**
1. Clique duas vezes no arquivo `BoodeskApp`
2. Ou clique com botão direito → **Executar**

## 📦 **Dependências Incluídas**
O executável já inclui todas as bibliotecas necessárias:
- ✅ **Python 3.12** (embutido)
- ✅ **Tkinter** (interface gráfica)
- ✅ **ttkthemes** (temas modernos)
- ✅ **tkcalendar** (calendário)
- ✅ **pandas** (análise de dados)
- ✅ **matplotlib** (gráficos)
- ✅ **PIL/Pillow** (imagens)
- ✅ **psutil** (sistema)
- ✅ **requests** (internet)

## 🔍 **Solução de Problemas**

### **Problema: "Permissão negada"**
```bash
chmod +x BoodeskApp
```

### **Problema: "Biblioteca não encontrada"**
```bash
# Instalar dependências básicas
sudo apt update
sudo apt install -y python3-tk tk8.6 libtk8.6
```

### **Problema: "Erro de execução"**
```bash
# Verificar se é executável
ls -la BoodeskApp

# Executar com debug
./BoodeskApp 2>&1 | tee debug.log
```

### **Problema: "Interface não aparece"**
```bash
# Verificar variável DISPLAY
echo $DISPLAY

# Se estiver vazio, definir
export DISPLAY=:0
```

## 📁 **Estrutura de Arquivos**
```
📁 Seu_Diretório/
├── 🐧 BoodeskApp (executável principal)
├── 📄 install_linux_mint.sh (script de instalação)
└── 📄 README_LINUX_MINT.md (este arquivo)
```

## 🎉 **Recursos do Aplicativo**
- 🎨 **Interface moderna** com temas
- 📅 **Calendário integrado**
- 📊 **Gráficos e relatórios**
- 🎯 **Gerenciamento de tarefas**
- ⏰ **Timer Pomodoro**
- 💾 **Backup automático**

## 📞 **Suporte**
Se encontrar problemas:
1. Verifique se está no Linux 64-bit
2. Execute o script de instalação
3. Verifique as permissões do arquivo
4. Consulte o log de debug se necessário

## 🏆 **Status de Compatibilidade**
- ✅ **Linux Mint 20+**
- ✅ **Ubuntu 20.04+**
- ✅ **Debian 11+**
- ✅ **Fedora 35+**
- ✅ **Arch Linux**

---
**🎯 Desenvolvido com ❤️ para Linux Mint**


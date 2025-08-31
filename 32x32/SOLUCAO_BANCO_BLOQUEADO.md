# 🔧 SOLUÇÃO PARA "DATABASE IS LOCKED"

## 🚨 Problema
O erro "database is locked" ocorre quando múltiplos processos Python tentam acessar o banco SQLite simultaneamente.

## ✅ Soluções Rápidas

### 1. **Script Automático (Recomendado)**
```bash
python fix_database.py
```

### 2. **Script Batch (Windows)**
```bash
cleanup_processes.bat
```

### 3. **Comandos Manuais**

#### Parar todos os processos Python:
```bash
taskkill /f /im python.exe
taskkill /f /im python3.12.exe
```

#### Remover arquivos de banco bloqueados:
```bash
del boodesk_new.db*
del boodesk.db*
```

#### Verificar se ainda há processos:
```bash
tasklist | findstr python
```

## 🔍 Como Identificar o Problema

### Sintomas:
- ❌ "database is locked" no terminal
- ❌ App não inicia
- ❌ Múltiplas janelas do app abertas
- ❌ Processos Python rodando em background

### Verificar Processos:
```bash
tasklist | findstr python
```

## 🛠️ Solução Completa

### Passo 1: Parar Processos
```bash
# Parar todos os processos Python
taskkill /f /im python.exe
taskkill /f /im python3.12.exe
```

### Passo 2: Limpar Arquivos
```bash
# Remover arquivos de banco
del boodesk_new.db*
del boodesk.db*
```

### Passo 3: Aguardar
```bash
# Aguardar 3-5 segundos
timeout /t 5
```

### Passo 4: Testar
```bash
# Executar o app
python app22a.py
```

## 🎯 Prevenção

### 1. **Sempre feche o app corretamente**
- Use o botão "Sair" do menu
- Não force o fechamento com Ctrl+C

### 2. **Não execute múltiplas instâncias**
- Verifique se já há uma janela aberta
- Feche a anterior antes de abrir nova

### 3. **Use os scripts de limpeza**
- Execute `fix_database.py` se houver problemas
- Use `cleanup_processes.bat` para limpeza rápida

## 📋 Checklist de Resolução

- [ ] Parar todos os processos Python
- [ ] Remover arquivos de banco bloqueados
- [ ] Aguardar alguns segundos
- [ ] Executar o app novamente
- [ ] Verificar se funciona

## 🆘 Se o Problema Persistir

1. **Reinicie o computador**
2. **Execute o script de limpeza**
3. **Verifique permissões de pasta**
4. **Execute como administrador**

## 📞 Suporte

Se o problema persistir após todas as soluções:
1. Execute `python fix_database.py`
2. Verifique a saída do script
3. Reporte o erro específico

---

**💡 Dica:** Mantenha apenas uma instância do app rodando por vez!

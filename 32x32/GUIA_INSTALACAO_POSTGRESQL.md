# 🐘 Guia de Instalação PostgreSQL para Boodesk

## 📋 Pré-requisitos
- Windows 10/11
- Python 3.8+ (já instalado)
- Acesso de administrador

## 🔧 Passo a Passo

### 1. **Instalar PostgreSQL**

#### Opção A: Download Manual (Recomendado)
1. Acesse: https://www.postgresql.org/download/windows/
2. Clique em "Download the installer"
3. Baixe a versão mais recente (15.x ou 16.x)
4. Execute o instalador como **Administrador**

#### Configurações de Instalação:
- **Porta**: 5432 (padrão)
- **Senha do usuário postgres**: `boodesk123`
- **Locale**: Default
- **Stack Builder**: ❌ Não marque

### 2. **Configurar o Banco**

Após instalar o PostgreSQL, execute:

```bash
python setup_database_after_install.py
```

Este script irá:
- ✅ Verificar a instalação
- ✅ Criar o banco `boodesk_db`
- ✅ Criar o usuário `boodesk_app`
- ✅ Conceder privilégios
- ✅ Criar todas as tabelas

### 3. **Migrar Dados Existentes**

```bash
python database_migration.py
```

Este script irá migrar todos os dados dos arquivos JSON/Excel para o PostgreSQL.

### 4. **Testar a Integração**

```bash
python test_postgresql_integration.py
```

### 5. **Executar o App**

```bash
python app20a.py
```

## 🔍 Solução de Problemas

### Erro: "psql não é reconhecido"
- **Solução**: Adicione o PostgreSQL ao PATH do Windows
- **Caminho típico**: `C:\Program Files\PostgreSQL\15\bin`

### Erro: "Connection refused"
- **Solução**: Verifique se o serviço PostgreSQL está rodando
- **Comando**: `services.msc` → Procure por "postgresql"

### Erro: "Authentication failed"
- **Solução**: Verifique a senha do usuário postgres
- **Padrão**: `boodesk123`

## 📊 Configurações do Banco

| Item | Valor |
|------|-------|
| **Banco** | boodesk_db |
| **Usuário** | boodesk_app |
| **Senha** | boodesk123 |
| **Host** | localhost |
| **Porta** | 5432 |

## 🎯 Próximos Passos

1. ✅ Instalar PostgreSQL
2. ✅ Configurar banco
3. ✅ Migrar dados
4. ✅ Testar integração
5. ✅ Executar app

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais
3. Execute os testes novamente
4. Consulte os logs de erro

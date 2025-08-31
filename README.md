# 🚀 Boodesk React - Sistema Kanban Avançado

Um sistema completo de gerenciamento de projetos com Kanban, subtarefas, integração com Google Calendar e armazenamento em nuvem.

## ✨ Funcionalidades

- 📋 **Kanban Board** - Quadros visuais para gerenciamento de tarefas
- ✅ **Subtarefas** - Sistema completo de subtarefas com prioridades
- 📅 **Google Calendar** - Integração com calendário do Google
- ☁️ **Cloudflare R2** - Armazenamento de arquivos em nuvem
- 🔐 **Supabase** - Banco de dados PostgreSQL em nuvem
- 🎨 **Interface Moderna** - Design responsivo com Tailwind CSS
- 🔄 **Sincronização em Tempo Real** - Atualizações automáticas
- 📊 **Dashboard** - Métricas e relatórios em tempo real

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Calendar**: Google Calendar API
- **Deploy**: GitHub Pages

## 🚀 Deploy

### GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages.

1. **Fazer push para o GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy:**
```bash
npm run deploy
```

3. **Configurar GitHub Pages:**
   - Vá para Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

## 🔧 Configuração Local

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/thall/boodesk-react.git
cd boodesk-react

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar em desenvolvimento
npm start
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima

# Cloudflare R2
REACT_APP_R2_ACCESS_KEY_ID=sua_access_key
REACT_APP_R2_SECRET_ACCESS_KEY=sua_secret_key
REACT_APP_R2_BUCKET=seu_bucket
REACT_APP_R2_ENDPOINT=sua_url_endpoint
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── CardDetailModal.tsx
│   ├── SubtaskManager.tsx
│   └── ...
├── contexts/           # Contextos React
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ...
├── pages/             # Páginas da aplicação
│   ├── KanbanBoard.tsx
│   ├── Dashboard.tsx
│   └── ...
├── services/          # Serviços e APIs
│   └── database.ts
├── types/             # Definições TypeScript
│   └── index.ts
└── utils/             # Utilitários
    └── databaseMigration.ts
```

## 🎯 Funcionalidades Principais

### Kanban Board
- Criação e gerenciamento de quadros
- Drag & drop de cards
- Filtros e busca
- Templates de quadros

### Subtarefas
- Criação de subtarefas detalhadas
- Prioridades e categorias
- Progresso visual
- Integração com cards

### Integrações
- **Google Calendar**: Criação automática de eventos
- **Cloudflare R2**: Upload e gerenciamento de arquivos
- **Supabase**: Banco de dados em tempo real

## 🔒 Segurança

- Autenticação via Supabase
- Controle de permissões
- Variáveis de ambiente seguras
- HTTPS obrigatório

## 📈 Performance

- Lazy loading de componentes
- Otimização de imagens
- Cache inteligente
- Compressão de assets

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📧 Email: suporte@boodesk.com
- 📖 Documentação: [docs.boodesk.com](https://docs.boodesk.com)
- 🐛 Issues: [GitHub Issues](https://github.com/thall/boodesk-react/issues)

---

**Desenvolvido com ❤️ pela equipe Boodesk**

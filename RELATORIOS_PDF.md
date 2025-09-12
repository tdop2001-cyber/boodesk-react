# 📄 Sistema de Relatórios em HTML/PDF

## 🎯 Funcionalidades Implementadas

### ✅ **Tipos de Relatórios Disponíveis**

1. **Relatório Mensal** - Métricas gerais de performance
2. **Relatório por Projeto** - Performance detalhada por board/projeto
3. **Relatório da Equipe** - Produtividade individual dos usuários
4. **Relatório Completo** - Todos os relatórios em um único PDF

### 🔧 **Como Usar**

#### 1. **Botão Principal**
- **Localização:** Topo da página de métricas
- **Função:** Gera relatório completo com todas as métricas
- **Arquivo:** `relatorio-completo-YYYY-MM-DD.pdf`

#### 2. **Botões por Seção**
- **Produtividade por Usuário:** Botão PDF vermelho ao lado do CSV
- **Performance por Projeto:** Botão PDF vermelho ao lado do CSV
- **Relatório Mensal:** Botão PDF vermelho ao lado do CSV

### 📊 **Conteúdo dos Relatórios**

#### **Relatório Mensal**
- Total de Cards
- Cards Concluídos
- Taxa de Conclusão
- Tempo Médio de Conclusão
- Total de Subtasks
- Subtasks Concluídas
- Taxa de Conclusão de Subtasks

#### **Relatório por Projeto**
- ID do Board
- Nome do Projeto
- Total de Cards
- Cards Concluídos
- Taxa de Conclusão (%)
- Tempo Médio (dias)

#### **Relatório da Equipe**
- ID do Usuário
- Nome de Usuário
- Nome Completo
- Total de Cards
- Cards Concluídos
- Taxa de Conclusão (%)
- Tempo Médio (dias)

#### **Relatório Completo**
- Página 1: Relatório Mensal
- Página 2: Performance por Projeto
- Página 3: Produtividade da Equipe

### 🎨 **Características dos PDFs**

- **Formato:** A4
- **Cores:** Azul para cabeçalhos, cinza para linhas alternadas
- **Fonte:** Helvetica
- **Layout:** Profissional com tabelas organizadas
- **Resumo:** Seção executiva com métricas principais
- **Rodapé:** Informações de geração e sistema

### 🔧 **Arquivos Implementados**

1. **`src/utils/htmlPdfGenerator.ts`** - Classe principal para geração de relatórios HTML
2. **`src/components/PerformanceMetrics.tsx`** - Interface com botões de exportação
3. **Sem dependências externas** - Usa apenas HTML/CSS nativo

### 📱 **Interface do Usuário**

#### **Botões Disponíveis:**
- 🔴 **HTML** - Gera relatório em HTML (pode ser impresso como PDF)
- 🔵 **CSV** - Gera relatório em CSV (funcionalidade existente)

#### **Cores dos Botões:**
- **CSV:** Azul, Verde, Laranja (conforme seção)
- **HTML:** Vermelho (padrão para todos)

### 🚀 **Como Funciona**

1. **Usuário clica no botão HTML**
2. **Sistema coleta dados das métricas**
3. **Gera arquivo HTML com formatação profissional**
4. **Download automático do arquivo HTML**
5. **Usuário abre o arquivo e usa Ctrl+P para imprimir como PDF**
6. **Notificação de sucesso**

### 📋 **Exemplo de Uso**

```typescript
// Geração de relatório mensal
generateMonthlyHTML(monthlyData, '2024-01 - 2024-01');

// Geração de relatório completo
generateCompleteHTML(
  monthlyData,
  projectData,
  userData,
  '2024-01-01 - 2024-01-31'
);
```

### 🎯 **Benefícios**

- ✅ **Relatórios Profissionais** - Layout limpo e organizado
- ✅ **Múltiplos Formatos** - PDF e CSV disponíveis
- ✅ **Fácil Compartilhamento** - PDFs são universais
- ✅ **Dados Completos** - Todas as métricas incluídas
- ✅ **Resumo Executivo** - Métricas principais destacadas
- ✅ **Download Automático** - Sem necessidade de configuração

### 🔍 **Estrutura dos Arquivos PDF**

```
📄 Relatório Completo
├── 📊 Página 1: Relatório Mensal
│   ├── Cabeçalho com título e período
│   ├── Resumo executivo
│   └── Tabela de métricas
├── 📈 Página 2: Performance por Projeto
│   ├── Cabeçalho com título e período
│   ├── Resumo executivo
│   └── Tabela de projetos
└── 👥 Página 3: Produtividade da Equipe
    ├── Cabeçalho com título e período
    ├── Resumo executivo
    └── Tabela de usuários
```

### 🛠️ **Tecnologias Utilizadas**

- **HTML5** - Estrutura dos relatórios
- **CSS3** - Formatação e layout profissional
- **TypeScript** - Tipagem segura
- **React** - Interface reativa
- **Sem dependências externas** - Solução nativa

### 📝 **Notas Importantes**

- Os relatórios HTML são gerados no navegador (client-side)
- Não requer servidor para geração
- Funciona offline após carregar os dados
- Compatível com todos os navegadores modernos
- Arquivos são nomeados automaticamente com data
- Para PDF: Abra o HTML e use Ctrl+P → "Salvar como PDF"

---

**Status:** ✅ Implementado e funcional
**Versão:** 1.0
**Data:** $(date)

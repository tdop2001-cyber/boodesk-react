export interface ReportData {
  title: string;
  subtitle?: string;
  period?: string;
  data: any[];
  columns: {
    header: string;
    dataKey: string;
  }[];
  summary?: {
    label: string;
    value: string | number;
  }[];
}

export class HTMLPDFGenerator {
  // Gerar relatório de métricas mensais
  generateMonthlyReport(data: any[], period: string): void {
    const reportData: ReportData = {
      title: 'Relatório Mensal de Performance',
      subtitle: 'Métricas de Produtividade e Conclusão',
      period: period,
      data: data,
      columns: [
        { header: 'Métrica', dataKey: 'metric_name' },
        { header: 'Descrição', dataKey: 'metric_description' },
        { header: 'Valor', dataKey: 'metric_value' },
        { header: 'Unidade', dataKey: 'metric_unit' }
      ],
      summary: this.calculateMonthlySummary(data)
    };

    this.generateReport(reportData, 'relatorio-mensal');
  }

  // Gerar relatório mensal como PDF
  generateMonthlyPDF(data: any[], period: string): void {
    const reportData: ReportData = {
      title: 'Relatório Mensal de Performance',
      subtitle: 'Métricas de Produtividade e Conclusão',
      period: period,
      data: data,
      columns: [
        { header: 'Métrica', dataKey: 'metric_name' },
        { header: 'Descrição', dataKey: 'metric_description' },
        { header: 'Valor', dataKey: 'metric_value' },
        { header: 'Unidade', dataKey: 'metric_unit' }
      ],
      summary: this.calculateMonthlySummary(data)
    };

    const html = this.generateHTML(reportData);
    this.saveAsPDF(html, 'relatorio-mensal');
  }

  // Gerar relatório de performance por projeto
  generateProjectReport(data: any[], period: string): void {
    const reportData: ReportData = {
      title: 'Relatório de Performance por Projeto',
      subtitle: 'Análise de Produtividade por Board',
      period: period,
      data: data,
      columns: [
        { header: 'ID do Board', dataKey: 'board_id' },
        { header: 'Nome do Projeto', dataKey: 'board_name' },
        { header: 'Total de Cards', dataKey: 'total_cards' },
        { header: 'Cards Concluídos', dataKey: 'completed_cards' },
        { header: 'Taxa de Conclusão (%)', dataKey: 'completion_rate' },
        { header: 'Tempo Médio (dias)', dataKey: 'avg_completion_days' }
      ],
      summary: this.calculateProjectSummary(data)
    };

    this.generateReport(reportData, 'relatorio-projetos');
  }

  // Gerar relatório de projetos como PDF
  generateProjectPDF(data: any[], period: string): void {
    const reportData: ReportData = {
      title: 'Relatório de Performance por Projeto',
      subtitle: 'Análise de Produtividade por Board',
      period: period,
      data: data,
      columns: [
        { header: 'ID do Board', dataKey: 'board_id' },
        { header: 'Nome do Projeto', dataKey: 'board_name' },
        { header: 'Total de Cards', dataKey: 'total_cards' },
        { header: 'Cards Concluídos', dataKey: 'completed_cards' },
        { header: 'Taxa de Conclusão (%)', dataKey: 'completion_rate' },
        { header: 'Tempo Médio (dias)', dataKey: 'avg_completion_days' }
      ],
      summary: this.calculateProjectSummary(data)
    };

    const html = this.generateHTML(reportData);
    this.saveAsPDF(html, 'relatorio-projetos');
  }

  // Gerar relatório de produtividade da equipe
  generateUserReport(data: any[], period: string): void {
    const reportData: ReportData = {
      title: 'Relatório de Produtividade da Equipe',
      subtitle: 'Performance Individual dos Membros',
      period: period,
      data: data,
      columns: [
        { header: 'ID do Usuário', dataKey: 'user_id' },
        { header: 'Nome de Usuário', dataKey: 'username' },
        { header: 'Nome Completo', dataKey: 'nome_completo' },
        { header: 'Total de Cards', dataKey: 'total_cards' },
        { header: 'Cards Concluídos', dataKey: 'completed_cards' },
        { header: 'Taxa de Conclusão (%)', dataKey: 'completion_rate' },
        { header: 'Tempo Médio (dias)', dataKey: 'avg_completion_days' }
      ],
      summary: this.calculateUserSummary(data)
    };

    this.generateReport(reportData, 'relatorio-equipe');
  }

  // Gerar relatório de usuários como PDF
  generateUserPDF(data: any[], period: string): void {
    const reportData: ReportData = {
      title: 'Relatório de Produtividade da Equipe',
      subtitle: 'Performance Individual dos Membros',
      period: period,
      data: data,
      columns: [
        { header: 'ID do Usuário', dataKey: 'user_id' },
        { header: 'Nome de Usuário', dataKey: 'username' },
        { header: 'Nome Completo', dataKey: 'nome_completo' },
        { header: 'Total de Cards', dataKey: 'total_cards' },
        { header: 'Cards Concluídos', dataKey: 'completed_cards' },
        { header: 'Taxa de Conclusão (%)', dataKey: 'completion_rate' },
        { header: 'Tempo Médio (dias)', dataKey: 'avg_completion_days' }
      ],
      summary: this.calculateUserSummary(data)
    };

    const html = this.generateHTML(reportData);
    this.saveAsPDF(html, 'relatorio-equipe');
  }

  // Gerar relatório completo
  generateCompleteReport(
    monthlyData: any[],
    projectData: any[],
    userData: any[],
    period: string
  ): void {
    const html = this.generateCompleteHTML(monthlyData, projectData, userData, period);
    this.downloadHTML(html, 'relatorio-completo');
  }

  // Gerar relatório completo como PDF
  generateCompletePDF(
    monthlyData: any[],
    projectData: any[],
    userData: any[],
    period: string
  ): void {
    const html = this.generateCompleteHTML(monthlyData, projectData, userData, period);
    this.saveAsPDF(html, 'relatorio-completo');
  }

  // Método principal para gerar relatórios
  private generateReport(reportData: ReportData, filename: string): void {
    const html = this.generateHTML(reportData);
    this.downloadHTML(html, filename);
  }

  // Gerar HTML para relatório individual
  private generateHTML(reportData: ReportData): string {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    const tableRows = reportData.data.map(row => 
      `<tr>
        ${reportData.columns.map(col => 
          `<td>${row[col.dataKey] || ''}</td>`
        ).join('')}
      </tr>`
    ).join('');

    const summaryHTML = reportData.summary ? `
      <div class="summary">
        <h3>Resumo Executivo</h3>
        ${reportData.summary.map(item => 
          `<div class="summary-item">
            <strong>${item.label}:</strong> ${item.value}
          </div>`
        ).join('')}
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title}</title>
        <style>
          ${this.getCSS()}
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>${reportData.title}</h1>
            ${reportData.subtitle ? `<h2>${reportData.subtitle}</h2>` : ''}
            ${reportData.period ? `<p class="period">Período: ${reportData.period}</p>` : ''}
            <p class="date">Gerado em: ${currentDate}</p>
          </header>
          
          ${summaryHTML}
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  ${reportData.columns.map(col => `<th>${col.header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
          
          <footer>
            <p>🎅 Relatório gerado automaticamente pelo sistema Boodesk 🎄</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }

  // Gerar HTML para relatório completo
  private generateCompleteHTML(
    monthlyData: any[],
    projectData: any[],
    userData: any[],
    period: string
  ): string {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    const monthlyHTML = this.generateSectionHTML(
      'Relatório Mensal de Performance',
      'Métricas de Produtividade e Conclusão',
      monthlyData,
      [
        { header: 'Métrica', dataKey: 'metric_name' },
        { header: 'Descrição', dataKey: 'metric_description' },
        { header: 'Valor', dataKey: 'metric_value' },
        { header: 'Unidade', dataKey: 'metric_unit' }
      ]
    );

    const projectHTML = this.generateSectionHTML(
      'Performance por Projeto',
      'Análise de Produtividade por Board',
      projectData,
      [
        { header: 'ID do Board', dataKey: 'board_id' },
        { header: 'Nome do Projeto', dataKey: 'board_name' },
        { header: 'Total de Cards', dataKey: 'total_cards' },
        { header: 'Cards Concluídos', dataKey: 'completed_cards' },
        { header: 'Taxa de Conclusão (%)', dataKey: 'completion_rate' },
        { header: 'Tempo Médio (dias)', dataKey: 'avg_completion_days' }
      ]
    );

    const userHTML = this.generateSectionHTML(
      'Produtividade da Equipe',
      'Performance Individual dos Membros',
      userData,
      [
        { header: 'ID do Usuário', dataKey: 'user_id' },
        { header: 'Nome de Usuário', dataKey: 'username' },
        { header: 'Nome Completo', dataKey: 'nome_completo' },
        { header: 'Total de Cards', dataKey: 'total_cards' },
        { header: 'Cards Concluídos', dataKey: 'completed_cards' },
        { header: 'Taxa de Conclusão (%)', dataKey: 'completion_rate' },
        { header: 'Tempo Médio (dias)', dataKey: 'avg_completion_days' }
      ]
    );

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Completo de Performance</title>
        <style>
          ${this.getCSS()}
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>🎄 Relatório Completo de Performance 🎅</h1>
            <h2>Análise Completa de Métricas e Produtividade</h2>
            <p class="period">Período: ${period}</p>
            <p class="date">Gerado em: ${currentDate}</p>
          </header>
          
          ${monthlyHTML}
          
          <div class="page-break"></div>
          ${projectHTML}
          
          <div class="page-break"></div>
          ${userHTML}
          
          <footer>
            <p>🎅 Relatório gerado automaticamente pelo sistema Boodesk 🎄</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }

  // Gerar HTML para seção individual
  private generateSectionHTML(
    title: string,
    subtitle: string,
    data: any[],
    columns: { header: string; dataKey: string }[]
  ): string {
    const tableRows = data.map(row => 
      `<tr>
        ${columns.map(col => 
          `<td>${row[col.dataKey] || ''}</td>`
        ).join('')}
      </tr>`
    ).join('');

    // Adicionar emojis natalinos baseado no tipo de seção
    let emoji = '📊';
    if (title.toLowerCase().includes('mensal')) emoji = '🎄';
    if (title.toLowerCase().includes('projeto')) emoji = '🎁';
    if (title.toLowerCase().includes('equipe') || title.toLowerCase().includes('usuário')) emoji = '🎅';

    return `
      <section>
        <h3>${emoji} ${title}</h3>
        <p class="subtitle">${subtitle}</p>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  // CSS para formatação
  private getCSS(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #e8e8e8;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        min-height: 100vh;
        padding: 20px;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: linear-gradient(145deg, #2d2d44 0%, #1e1e2e 100%);
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
        overflow: hidden;
        border: 2px solid rgba(34, 197, 94, 0.2);
      }
      
      header {
        text-align: center;
        margin-bottom: 40px;
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
        color: white;
        padding: 50px 40px;
        position: relative;
        border-bottom: 3px solid #22c55e;
      }
      
      header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="snow" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="2" fill="white" opacity="0.3"/><circle cx="75" cy="75" r="1.5" fill="white" opacity="0.2"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.4"/><circle cx="10" cy="60" r="1" fill="white" opacity="0.3"/><circle cx="90" cy="40" r="1.5" fill="white" opacity="0.2"/><circle cx="30" cy="80" r="1" fill="white" opacity="0.3"/><circle cx="70" cy="20" r="1" fill="white" opacity="0.4"/></pattern></defs><rect width="100" height="100" fill="url(%23snow)"/></svg>');
        opacity: 0.4;
      }
      
      h1 {
        color: white;
        font-size: 3rem;
        margin-bottom: 15px;
        font-weight: 800;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
        position: relative;
        z-index: 1;
        background: linear-gradient(45deg, #ffffff, #f0f0f0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      h2 {
        color: #fef2f2;
        font-size: 1.4rem;
        margin-bottom: 15px;
        font-weight: 400;
        position: relative;
        z-index: 1;
      }
      
      h3 {
        color: #22c55e;
        font-size: 1.6rem;
        margin: 40px 0 25px 0;
        border-bottom: 3px solid #22c55e;
        padding-bottom: 15px;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      .period {
        font-size: 1.1rem;
        color: #fecaca;
        margin-bottom: 10px;
        font-weight: 500;
        position: relative;
        z-index: 1;
      }
      
      .date {
        font-size: 1rem;
        color: #fecaca;
        position: relative;
        z-index: 1;
      }
      
      .subtitle {
        color: #fef2f2;
        font-style: italic;
        margin-bottom: 20px;
        position: relative;
        z-index: 1;
      }
      
      .summary {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        padding: 40px;
        border-radius: 16px;
        margin-bottom: 50px;
        border-left: 6px solid #22c55e;
        border-right: 6px solid #dc2626;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      
      .summary h3 {
        color: #22c55e;
        margin-bottom: 25px;
        font-size: 1.6rem;
        font-weight: 700;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        border: none;
        padding: 0;
      }
      
      .summary-item {
        margin-bottom: 12px;
        font-size: 1.1rem;
        color: #e8e8e8;
        background: linear-gradient(145deg, #374151 0%, #1f2937 100%);
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #22c55e;
      }
      
      .table-container {
        overflow-x: auto;
        margin-bottom: 40px;
        background: linear-gradient(145deg, #374151 0%, #1f2937 100%);
        border-radius: 16px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        border: 2px solid rgba(34, 197, 94, 0.3);
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        background: transparent;
      }
      
      th {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        padding: 25px 20px;
        text-align: left;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        font-size: 1rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      td {
        padding: 20px;
        border-bottom: 1px solid rgba(34, 197, 94, 0.2);
        font-size: 1rem;
        color: #e8e8e8;
        font-weight: 500;
      }
      
      tr:nth-child(even) {
        background: rgba(34, 197, 94, 0.05);
      }
      
      tr:hover {
        background: rgba(34, 197, 94, 0.1);
        transform: translateY(-2px);
        transition: all 0.3s ease;
      }
      
      footer {
        text-align: center;
        margin-top: 50px;
        padding: 40px;
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        color: #9ca3af;
        font-size: 1.1rem;
        border-top: 3px solid #22c55e;
      }
      
      footer p {
        margin-bottom: 10px;
      }
      
      @media print {
        body {
          background: white;
          padding: 0;
          font-size: 12px;
        }
        
        .container {
          max-width: none;
          padding: 0;
          box-shadow: none;
          border-radius: 0;
          border: none;
        }
        
        header {
          background: #dc2626 !important;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        th {
          background: #dc2626 !important;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .summary {
          background: #1f2937 !important;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        table {
          box-shadow: none;
        }
      }
    `;
  }

  // Download do HTML como arquivo
  private downloadHTML(html: string, filename: string): void {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  // Salvar diretamente como PDF usando window.print()
  private saveAsPDF(html: string, filename: string): void {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para gerar o PDF');
      return;
    }

    // Adicionar CSS específico para impressão
    const printCSS = `
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          table { page-break-inside: avoid; }
          h1, h2, h3 { page-break-after: avoid; }
        }
        @page {
          margin: 1cm;
          size: A4;
        }
      </style>
    `;

    // Escrever o HTML na nova janela
    printWindow.document.write(printCSS + html);
    printWindow.document.close();

    // Aguardar o carregamento e abrir diálogo de impressão
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Fechar a janela após impressão
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);
    };
  }

  // Calcular resumo mensal
  private calculateMonthlySummary(data: any[]): { label: string; value: string | number }[] {
    const summary = [];
    
    const totalCards = data.find(item => item.metric_name === 'Total de Cards')?.metric_value || 0;
    const completedCards = data.find(item => item.metric_name === 'Cards Concluídos')?.metric_value || 0;
    const completionRate = data.find(item => item.metric_name === 'Taxa de Conclusão')?.metric_value || 0;
    const avgTime = data.find(item => item.metric_name === 'Tempo Médio de Conclusão')?.metric_value || 0;

    summary.push(
      { label: 'Total de Cards', value: totalCards },
      { label: 'Cards Concluídos', value: completedCards },
      { label: 'Taxa de Conclusão', value: `${completionRate}%` },
      { label: 'Tempo Médio de Conclusão', value: `${avgTime} dias` }
    );

    return summary;
  }

  // Calcular resumo de projetos
  private calculateProjectSummary(data: any[]): { label: string; value: string | number }[] {
    const summary = [];
    
    const totalProjects = data.length;
    const totalCards = data.reduce((sum, item) => sum + (item.total_cards || 0), 0);
    const totalCompleted = data.reduce((sum, item) => sum + (item.completed_cards || 0), 0);
    const avgCompletionRate = totalProjects > 0 ? 
      (data.reduce((sum, item) => sum + (item.completion_rate || 0), 0) / totalProjects).toFixed(1) : 0;

    summary.push(
      { label: 'Total de Projetos', value: totalProjects },
      { label: 'Total de Cards', value: totalCards },
      { label: 'Cards Concluídos', value: totalCompleted },
      { label: 'Taxa Média de Conclusão', value: `${avgCompletionRate}%` }
    );

    return summary;
  }

  // Calcular resumo de usuários
  private calculateUserSummary(data: any[]): { label: string; value: string | number }[] {
    const summary = [];
    
    const totalUsers = data.length;
    const totalCards = data.reduce((sum, item) => sum + (item.total_cards || 0), 0);
    const totalCompleted = data.reduce((sum, item) => sum + (item.completed_cards || 0), 0);
    const avgCompletionRate = totalUsers > 0 ? 
      (data.reduce((sum, item) => sum + (item.completion_rate || 0), 0) / totalUsers).toFixed(1) : 0;

    summary.push(
      { label: 'Total de Usuários', value: totalUsers },
      { label: 'Total de Cards', value: totalCards },
      { label: 'Cards Concluídos', value: totalCompleted },
      { label: 'Taxa Média de Conclusão', value: `${avgCompletionRate}%` }
    );

    return summary;
  }
}

// Funções utilitárias para uso direto
export const generateMonthlyHTML = (data: any[], period: string) => {
  const generator = new HTMLPDFGenerator();
  generator.generateMonthlyReport(data, period);
};

export const generateProjectHTML = (data: any[], period: string) => {
  const generator = new HTMLPDFGenerator();
  generator.generateProjectReport(data, period);
};

export const generateUserHTML = (data: any[], period: string) => {
  const generator = new HTMLPDFGenerator();
  generator.generateUserReport(data, period);
};

export const generateCompleteHTML = (
  monthlyData: any[],
  projectData: any[],
  userData: any[],
  period: string
) => {
  const generator = new HTMLPDFGenerator();
  generator.generateCompleteReport(monthlyData, projectData, userData, period);
};

// Funções para gerar PDFs diretamente
export const generateMonthlyPDF = (data: any[], period: string) => {
  const generator = new HTMLPDFGenerator();
  generator.generateMonthlyPDF(data, period);
};

export const generateProjectPDF = (data: any[], period: string) => {
  const generator = new HTMLPDFGenerator();
  generator.generateProjectPDF(data, period);
};

export const generateUserPDF = (data: any[], period: string) => {
  const generator = new HTMLPDFGenerator();
  generator.generateUserPDF(data, period);
};

export const generateCompletePDF = (
  monthlyData: any[],
  projectData: any[],
  userData: any[],
  period: string
) => {
  const generator = new HTMLPDFGenerator();
  generator.generateCompletePDF(monthlyData, projectData, userData, period);
};

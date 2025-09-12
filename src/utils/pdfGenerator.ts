import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFReportData {
  title: string;
  subtitle?: string;
  date: string;
  content: any[];
  summary?: string;
}

export class PDFGenerator {
  protected doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  /**
   * Gera um PDF a partir de dados estruturados
   */
  generateReportFromData(data: PDFReportData): void {
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.title, 20, 30);

    if (data.subtitle) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(data.subtitle, 20, 45);
    }

    // Data do relatório
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(`Gerado em: ${data.date}`, 20, 60);

    let yPosition = 80;

    // Resumo se fornecido
    if (data.summary) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Resumo:', 20, yPosition);
      yPosition += 10;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const summaryLines = this.doc.splitTextToSize(data.summary, 170);
      this.doc.text(summaryLines, 20, yPosition);
      yPosition += summaryLines.length * 5 + 10;
    }

    // Conteúdo dos dados
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Dados do Relatório:', 20, yPosition);
    yPosition += 10;

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');

    data.content.forEach((item, index) => {
      if (yPosition > 250) {
        this.doc.addPage();
        yPosition = 20;
      }

      // Formatar dados de forma mais legível
      if (typeof item === 'object') {
        const itemLines = this.formatMetricItem(item);
        itemLines.forEach(line => {
          this.doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 5; // Espaço entre itens
      } else {
        const itemText = String(item);
        const lines = this.doc.splitTextToSize(itemText, 170);
        this.doc.text(lines, 20, yPosition);
        yPosition += lines.length * 4 + 5;
      }
    });

    this.downloadPDF(`${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Gera um PDF a partir de um elemento HTML
   */
  async generatePDFFromHTML(elementId: string, filename: string = 'relatorio.pdf'): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Elemento com ID '${elementId}' não encontrado`);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      this.doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        this.doc.addPage();
        this.doc.addImage(imgData, 'PNG', 0, -heightLeft, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      this.downloadPDF(filename);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  /**
   * Gera um PDF de relatório de métricas
   */
  generateMetricsReport(metricsData: any[], title: string = 'Relatório de Métricas'): void {
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 20, 30);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Relatório de Performance e Métricas do Sistema', 20, 45);

    // Data do relatório
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 60);

    let yPosition = 80;

    // Resumo
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Resumo:', 20, yPosition);
    yPosition += 10;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Este relatório contém ${metricsData.length} registros de métricas do sistema.`, 20, yPosition);
    yPosition += 20;

    // Dados formatados em tabela
    yPosition = this.addMetricsTable(metricsData, 20, yPosition, 'Dados do Relatório');

    this.downloadPDF(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Formata um item de métrica para exibição
   */
  private formatMetricItem(item: any): string[] {
    const lines: string[] = [];
    
    // Verificar se é um item de projeto
    if (item.board_id !== undefined) {
      lines.push(`Projeto: ${item.board_name || `ID ${item.board_id}`}`);
      lines.push(`  • Total de Cards: ${item.total_cards || 0}`);
      lines.push(`  • Cards Concluídos: ${item.completed_cards || 0}`);
      lines.push(`  • Taxa de Conclusão: ${item.completion_rate || 0}%`);
      if (item.avg_completion_days) {
        lines.push(`  • Tempo Médio: ${item.avg_completion_days} dias`);
      }
    }
    // Verificar se é um item de usuário
    else if (item.user_id !== undefined) {
      lines.push(`Usuário: ${item.nome_completo || item.username || `ID ${item.user_id}`}`);
      lines.push(`  • Total de Cards: ${item.total_cards || 0}`);
      lines.push(`  • Cards Concluídos: ${item.completed_cards || 0}`);
      lines.push(`  • Taxa de Conclusão: ${item.completion_rate || 0}%`);
      if (item.avg_completion_days) {
        lines.push(`  • Tempo Médio: ${item.avg_completion_days} dias`);
      }
    }
    // Verificar se é uma métrica mensal
    else if (item.metric_name !== undefined) {
      lines.push(`${item.metric_name}: ${item.metric_value || item.value} ${item.metric_unit || ''}`);
    }
    // Verificar se tem categoria (relatório completo)
    else if (item.categoria !== undefined) {
      lines.push(`[${item.categoria}] ${item.name || item.metric_name || 'Item'}: ${item.value || item.metric_value || 'N/A'}`);
    }
    // Formato genérico
    else {
      const keys = Object.keys(item);
      if (keys.length > 0) {
        lines.push(`Item ${keys[0]}: ${item[keys[0]]}`);
        keys.slice(1).forEach(key => {
          lines.push(`  • ${key}: ${item[key]}`);
        });
      }
    }
    
    return lines;
  }

  /**
   * Gera um PDF de teste de funcionalidades
   */
  generateTestReport(testResults: any[], title: string = 'Relatório de Testes'): void {
    const reportData: PDFReportData = {
      title,
      subtitle: 'Resultados dos Testes de Funcionalidades',
      date: new Date().toLocaleDateString('pt-BR'),
      content: testResults,
      summary: `Relatório contendo ${testResults.length} resultados de testes executados.`
    };

    this.generateReportFromData(reportData);
  }

  /**
   * Baixa o PDF gerado
   */
  protected downloadPDF(filename: string): void {
    this.doc.save(filename);
  }

  /**
   * Adiciona uma nova página ao PDF
   */
  addNewPage(): void {
    this.doc.addPage();
  }

  /**
   * Adiciona texto ao PDF
   */
  addText(text: string, x: number, y: number, options?: {
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic';
    color?: string;
  }): void {
    if (options?.fontSize) this.doc.setFontSize(options.fontSize);
    if (options?.fontStyle) this.doc.setFont('helvetica', options.fontStyle);
    if (options?.color) this.doc.setTextColor(options.color);
    
    this.doc.text(text, x, y);
  }

  /**
   * Adiciona uma tabela ao PDF
   */
  addTable(data: string[][], startX: number, startY: number, options?: {
    headerStyle?: 'bold';
    fontSize?: number;
    cellPadding?: number;
    columnWidths?: number[];
  }): number {
    const fontSize = options?.fontSize || 10;
    const cellPadding = options?.cellPadding || 5;
    const columnWidths = options?.columnWidths || [50, 50, 50, 50]; // Larguras padrão
    
    this.doc.setFontSize(fontSize);
    
    let currentY = startY;
    
    data.forEach((row, rowIndex) => {
      let currentX = startX;
      
      row.forEach((cell, cellIndex) => {
        if (rowIndex === 0 && options?.headerStyle === 'bold') {
          this.doc.setFont('helvetica', 'bold');
        } else {
          this.doc.setFont('helvetica', 'normal');
        }
        
        // Quebrar texto se necessário
        const cellWidth = columnWidths[cellIndex] || 50;
        const lines = this.doc.splitTextToSize(cell, cellWidth - 5);
        
        lines.forEach((line: string, lineIndex: number) => {
          this.doc.text(line, currentX, currentY + (lineIndex * (fontSize + 2)));
        });
        
        currentX += cellWidth;
      });
      
      // Calcular altura da linha baseada no maior número de linhas
      const maxLines = Math.max(...row.map(cell => 
        this.doc.splitTextToSize(cell, columnWidths[0] || 50).length
      ));
      
      currentY += (fontSize + cellPadding) * maxLines;
    });
    
    return currentY;
  }

  /**
   * Cria uma tabela formatada para dados de métricas
   */
  addMetricsTable(data: any[], startX: number, startY: number, title: string): number {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, startX, startY);
    
    let currentY = startY + 15;
    
    if (data.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Nenhum dado disponível', startX, currentY);
      return currentY + 10;
    }
    
    // Determinar tipo de dados e criar cabeçalhos apropriados
    const firstItem = data[0];
    let headers: string[] = [];
    let columnWidths: number[] = [];
    
    if (firstItem.board_id !== undefined) {
      // Dados de projeto
      headers = ['Projeto', 'Total Cards', 'Concluídos', 'Taxa (%)', 'Tempo Médio'];
      columnWidths = [60, 25, 25, 20, 30];
    } else if (firstItem.user_id !== undefined) {
      // Dados de usuário
      headers = ['Usuário', 'Total Cards', 'Concluídos', 'Taxa (%)', 'Tempo Médio'];
      columnWidths = [60, 25, 25, 20, 30];
    } else if (firstItem.metric_name !== undefined) {
      // Dados de métrica
      headers = ['Métrica', 'Valor', 'Unidade'];
      columnWidths = [80, 30, 20];
    } else {
      // Dados genéricos
      const keys = Object.keys(firstItem);
      headers = keys.slice(0, 5); // Máximo 5 colunas
      columnWidths = headers.map(() => 30);
    }
    
    // Criar dados da tabela
    const tableData: string[][] = [headers];
    
    data.forEach(item => {
      const row: string[] = [];
      
      if (item.board_id !== undefined) {
        row.push(item.board_name || `ID ${item.board_id}`);
        row.push(String(item.total_cards || 0));
        row.push(String(item.completed_cards || 0));
        row.push(`${item.completion_rate || 0}%`);
        row.push(item.avg_completion_days ? `${item.avg_completion_days} dias` : 'N/A');
      } else if (item.user_id !== undefined) {
        row.push(item.nome_completo || item.username || `ID ${item.user_id}`);
        row.push(String(item.total_cards || 0));
        row.push(String(item.completed_cards || 0));
        row.push(`${item.completion_rate || 0}%`);
        row.push(item.avg_completion_days ? `${item.avg_completion_days} dias` : 'N/A');
      } else if (item.metric_name !== undefined) {
        row.push(item.metric_name);
        row.push(String(item.metric_value || item.value || 'N/A'));
        row.push(item.metric_unit || '');
      } else {
        // Dados genéricos
        headers.forEach(header => {
          row.push(String(item[header] || 'N/A'));
        });
      }
      
      tableData.push(row);
    });
    
    return this.addTable(tableData, startX, currentY, {
      headerStyle: 'bold',
      fontSize: 9,
      cellPadding: 3,
      columnWidths: columnWidths
    });
  }
}

// Função utilitária para gerar PDF rapidamente
export const generateQuickPDF = (data: any, title: string = 'Relatório'): void => {
  const generator = new PDFGenerator();
  generator.generateReportFromData({
    title,
    date: new Date().toLocaleDateString('pt-BR'),
    content: Array.isArray(data) ? data : [data]
  });
};

// Função para gerar PDF de elemento HTML
export const generateHTMLToPDF = async (elementId: string, filename?: string): Promise<void> => {
  const generator = new PDFGenerator();
  await generator.generatePDFFromHTML(elementId, filename);
};

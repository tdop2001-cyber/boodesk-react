import { PDFGenerator } from './pdfGenerator';

export interface DashboardMetrics {
  totalCards: number;
  totalSubtasks: number;
  completedCards: number;
  completedSubtasks: number;
  inProgressCards: number;
  inProgressSubtasks: number;
  pendingCards: number;
  pendingSubtasks: number;
  overdueCards: number;
  overdueSubtasks: number;
  totalUsers: number;
  activeUsers: number;
  totalBoards: number;
  averageCompletionTime: number;
  productivityScore: number;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface TimeSeriesData {
  date: string;
  completed: number;
  created: number;
  inProgress: number;
}

export class DashboardPDFGenerator extends PDFGenerator {
  
  /**
   * Gera relatório executivo completo do dashboard
   */
  generateExecutiveReport(
    metrics: DashboardMetrics,
    chartData: ChartData[],
    timeSeriesData: TimeSeriesData[],
    timeRange: string,
    selectedUser?: string
  ): void {
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Dashboard Executivo', 20, 30);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Relatório de Performance e Produtividade', 20, 45);

    // Data e período
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 60);
    this.doc.text(`Período: ${timeRange}`, 20, 70);
    
    if (selectedUser && selectedUser !== 'all') {
      this.doc.text(`Usuário: ${selectedUser}`, 20, 80);
    }

    let yPosition = 100;

    // Resumo Executivo
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Resumo Executivo', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const completionRate = metrics.totalCards + metrics.totalSubtasks > 0 
      ? Math.round(((metrics.completedCards + metrics.completedSubtasks) / (metrics.totalCards + metrics.totalSubtasks)) * 100)
      : 0;

    const summaryItems = [
      `Taxa de Conclusão: ${completionRate}%`,
      `Total de Tarefas: ${metrics.totalCards + metrics.totalSubtasks}`,
      `Tarefas Concluídas: ${metrics.completedCards + metrics.completedSubtasks}`,
      `Usuários Ativos: ${metrics.activeUsers}`,
      `Quadros Ativos: ${metrics.totalBoards}`,
      `Produtividade: ${metrics.productivityScore}%`
    ];

    summaryItems.forEach(item => {
      this.doc.text(`• ${item}`, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Métricas Principais
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Métricas Principais', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const mainMetrics = [
      { label: 'Total de Cards', value: metrics.totalCards },
      { label: 'Total de Subtarefas', value: metrics.totalSubtasks },
      { label: 'Cards Concluídos', value: metrics.completedCards },
      { label: 'Subtarefas Concluídas', value: metrics.completedSubtasks },
      { label: 'Em Progresso', value: metrics.inProgressCards + metrics.inProgressSubtasks },
      { label: 'Pendentes', value: metrics.pendingCards + metrics.pendingSubtasks },
      { label: 'Em Atraso', value: metrics.overdueCards + metrics.overdueSubtasks }
    ];

    mainMetrics.forEach(metric => {
      this.doc.text(`${metric.label}: ${metric.value}`, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Distribuição por Status
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Distribuição por Status', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    chartData.forEach(item => {
      this.doc.text(`${item.name}: ${item.value}`, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Dados Temporais (últimos 7 dias)
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Atividade Recente (Últimos 7 dias)', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const recentData = timeSeriesData.slice(-7);
    recentData.forEach(data => {
      this.doc.text(`${data.date}: ${data.completed} concluídos, ${data.created} criados`, 20, yPosition);
      yPosition += 8;
    });

    // Adicionar informações do sistema
    yPosition += 20;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('Relatório gerado automaticamente pelo sistema Boodesk', 20, yPosition);
    this.doc.text(`Sistema: Dashboard Executivo v1.0`, 20, yPosition + 8);

    this.downloadPDF(`dashboard_executivo_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Gera relatório de métricas de performance
   */
  generatePerformanceReport(
    monthlyData: any[],
    projectData: any[],
    userData: any[],
    period: string
  ): void {
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Relatório de Performance', 20, 30);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Análise Detalhada de Métricas', 20, 45);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(`Período: ${period}`, 20, 60);
    this.doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 70);

    let yPosition = 90;

    // Relatório Mensal
    if (monthlyData && monthlyData.length > 0) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Métricas Mensais', 20, yPosition);
      yPosition += 15;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');

      monthlyData.forEach(item => {
        if (yPosition > 250) {
          this.doc.addPage();
          yPosition = 20;
        }
        this.doc.text(`${item.metric_name || item.name}: ${item.metric_value || item.value}`, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 10;
    }

    // Performance por Projeto
    if (projectData && projectData.length > 0) {
      if (yPosition > 200) {
        this.doc.addPage();
        yPosition = 20;
      }

      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Performance por Projeto', 20, yPosition);
      yPosition += 15;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');

      projectData.forEach(item => {
        if (yPosition > 250) {
          this.doc.addPage();
          yPosition = 20;
        }
        this.doc.text(`Projeto ${item.board_name || item.board_id}: ${item.completion_rate || 0}% conclusão`, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 10;
    }

    // Produtividade da Equipe
    if (userData && userData.length > 0) {
      if (yPosition > 200) {
        this.doc.addPage();
        yPosition = 20;
      }

      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Produtividade da Equipe', 20, yPosition);
      yPosition += 15;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');

      userData.forEach(item => {
        if (yPosition > 250) {
          this.doc.addPage();
          yPosition = 20;
        }
        this.doc.text(`${item.nome_completo || item.username}: ${item.completion_rate || 0}% conclusão`, 20, yPosition);
        yPosition += 8;
      });
    }

    this.downloadPDF(`relatorio_performance_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Gera relatório de gráficos e visualizações
   */
  generateChartsReport(
    chartData: ChartData[],
    timeSeriesData: TimeSeriesData[],
    timeRange: string
  ): void {
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Relatório de Gráficos', 20, 30);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Análise Visual de Dados', 20, 45);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(`Período: ${timeRange}`, 20, 60);
    this.doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 70);

    let yPosition = 90;

    // Distribuição por Status
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Distribuição por Status', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    chartData.forEach(item => {
      this.doc.text(`${item.name}: ${item.value}`, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Dados Temporais
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Evolução Temporal', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    timeSeriesData.slice(-10).forEach(data => {
      if (yPosition > 250) {
        this.doc.addPage();
        yPosition = 20;
      }
      this.doc.text(`${data.date}: Concluídos: ${data.completed}, Criados: ${data.created}`, 20, yPosition);
      yPosition += 8;
    });

    this.downloadPDF(`relatorio_graficos_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}

// Funções utilitárias para uso direto
export const generateExecutivePDF = (
  metrics: DashboardMetrics,
  chartData: ChartData[],
  timeSeriesData: TimeSeriesData[],
  timeRange: string,
  selectedUser?: string
) => {
  const generator = new DashboardPDFGenerator();
  generator.generateExecutiveReport(metrics, chartData, timeSeriesData, timeRange, selectedUser);
};

export const generatePerformancePDF = (
  monthlyData: any[],
  projectData: any[],
  userData: any[],
  period: string
) => {
  const generator = new DashboardPDFGenerator();
  generator.generatePerformanceReport(monthlyData, projectData, userData, period);
};

export const generateChartsPDF = (
  chartData: ChartData[],
  timeSeriesData: TimeSeriesData[],
  timeRange: string
) => {
  const generator = new DashboardPDFGenerator();
  generator.generateChartsReport(chartData, timeSeriesData, timeRange);
};

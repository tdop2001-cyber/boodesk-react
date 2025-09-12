import React from 'react';
import { PDFGenerator, generateQuickPDF, generateHTMLToPDF } from '../utils/pdfGenerator';

interface PDFExportButtonProps {
  data?: any;
  title?: string;
  elementId?: string;
  filename?: string;
  variant?: 'test-report' | 'metrics-report' | 'html-to-pdf' | 'custom';
  className?: string;
  children?: React.ReactNode;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  data,
  title = 'Relatório',
  elementId,
  filename,
  variant = 'custom',
  className = '',
  children
}) => {
  const handleExport = async () => {
    try {
      const generator = new PDFGenerator();

      switch (variant) {
        case 'test-report':
          if (data) {
            generator.generateTestReport(data, title);
          } else {
            // Dados de exemplo para teste
            const testData = [
              { test: 'Teste 1', status: 'Sucesso', timestamp: new Date().toISOString() },
              { test: 'Teste 2', status: 'Sucesso', timestamp: new Date().toISOString() }
            ];
            generator.generateTestReport(testData, title);
          }
          break;

        case 'metrics-report':
          if (data) {
            generator.generateMetricsReport(data, title);
          } else {
            // Dados de exemplo para métricas
            const metricsData = [
              { metric: 'Performance', value: '95%', date: new Date().toISOString() },
              { metric: 'Uptime', value: '99.9%', date: new Date().toISOString() }
            ];
            generator.generateMetricsReport(metricsData, title);
          }
          break;

        case 'html-to-pdf':
          if (elementId) {
            await generateHTMLToPDF(elementId, filename);
          } else {
            throw new Error('elementId é obrigatório para html-to-pdf');
          }
          break;

        case 'custom':
        default:
          if (data) {
            generateQuickPDF(data, title);
          } else {
            throw new Error('Dados são obrigatórios para custom');
          }
          break;
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF: ' + (error as Error).message);
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}
      title="Exportar para PDF"
    >
      {children || '📄 Exportar PDF'}
    </button>
  );
};

// Componente específico para relatórios de métricas
export const MetricsPDFButton: React.FC<{ metricsData: any[]; title?: string }> = ({
  metricsData,
  title = 'Relatório de Métricas'
}) => {
  return (
    <PDFExportButton
      data={metricsData}
      title={title}
      variant="metrics-report"
      className="bg-green-500 hover:bg-green-700"
    >
      📊 Exportar Métricas
    </PDFExportButton>
  );
};

// Componente específico para relatórios de testes
export const TestReportPDFButton: React.FC<{ testData: any[]; title?: string }> = ({
  testData,
  title = 'Relatório de Testes'
}) => {
  return (
    <PDFExportButton
      data={testData}
      title={title}
      variant="test-report"
      className="bg-purple-500 hover:bg-purple-700"
    >
      🧪 Exportar Testes
    </PDFExportButton>
  );
};

// Componente para converter HTML para PDF
export const HTMLToPDFButton: React.FC<{ 
  elementId: string; 
  filename?: string; 
  children?: React.ReactNode;
}> = ({ elementId, filename, children }) => {
  return (
    <PDFExportButton
      elementId={elementId}
      filename={filename}
      variant="html-to-pdf"
      className="bg-orange-500 hover:bg-orange-700"
    >
      {children || '📋 Converter HTML'}
    </PDFExportButton>
  );
};

export default PDFExportButton;

import React, { useState } from 'react';
import { PDFExportButton, MetricsPDFButton, TestReportPDFButton, HTMLToPDFButton } from '../components/PDFExportButton';
import { PDFGenerator } from '../utils/pdfGenerator';

export const PDFExample: React.FC = () => {
  const [sampleData, setSampleData] = useState([
    { id: 1, name: 'Projeto A', status: 'Ativo', progress: 75 },
    { id: 2, name: 'Projeto B', status: 'Concluído', progress: 100 },
    { id: 3, name: 'Projeto C', status: 'Em Andamento', progress: 45 }
  ]);

  const [testResults, setTestResults] = useState([
    { test: 'Teste de Conexão', status: 'Sucesso', duration: '1.2s' },
    { test: 'Teste de Performance', status: 'Sucesso', duration: '0.8s' },
    { test: 'Teste de Validação', status: 'Falha', duration: '2.1s' }
  ]);

  const [metricsData, setMetricsData] = useState([
    { metric: 'Uptime', value: '99.9%', trend: 'up' },
    { metric: 'Performance', value: '95%', trend: 'up' },
    { metric: 'Erros', value: '0.1%', trend: 'down' }
  ]);

  const handleCustomPDF = () => {
    const generator = new PDFGenerator();
    
    // Exemplo de PDF customizado
    generator.addText('Relatório Customizado', 20, 30, { fontSize: 20, fontStyle: 'bold' });
    generator.addText('Este é um exemplo de PDF gerado programaticamente', 20, 50, { fontSize: 12 });
    
    // Adicionar uma tabela
    const tableData = [
      ['ID', 'Nome', 'Status', 'Progresso'],
      ['1', 'Projeto A', 'Ativo', '75%'],
      ['2', 'Projeto B', 'Concluído', '100%'],
      ['3', 'Projeto C', 'Em Andamento', '45%']
    ];
    
    generator.addTable(tableData, 20, 80, { headerStyle: 'bold', fontSize: 10 });
    
    // Salvar o PDF
    (generator as any).downloadPDF('relatorio_customizado.pdf');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Exemplos de Geração de PDF</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de Relatórios de Testes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">🧪 Relatórios de Testes</h2>
          <p className="text-gray-600 mb-4">
            Exporte resultados de testes para PDF com formatação profissional.
          </p>
          <TestReportPDFButton testData={testResults} title="Relatório de Testes do Sistema" />
        </div>

        {/* Seção de Relatórios de Métricas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📊 Relatórios de Métricas</h2>
          <p className="text-gray-600 mb-4">
            Gere relatórios de performance e métricas do sistema.
          </p>
          <MetricsPDFButton metricsData={metricsData} title="Métricas de Performance" />
        </div>

        {/* Seção de PDF Customizado */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">🎨 PDF Customizado</h2>
          <p className="text-gray-600 mb-4">
            Crie PDFs personalizados com dados específicos.
          </p>
          <PDFExportButton
            data={sampleData}
            title="Relatório de Projetos"
            variant="custom"
            className="bg-indigo-500 hover:bg-indigo-700"
          >
            📋 Exportar Projetos
          </PDFExportButton>
        </div>

        {/* Seção de HTML para PDF */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">🖼️ HTML para PDF</h2>
          <p className="text-gray-600 mb-4">
            Converta elementos HTML para PDF mantendo a formatação.
          </p>
          <HTMLToPDFButton 
            elementId="sample-content" 
            filename="conteudo_html.pdf"
          >
            📄 Converter HTML
          </HTMLToPDFButton>
        </div>
      </div>

      {/* Exemplo de PDF Programático */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">⚙️ PDF Programático</h2>
        <p className="text-gray-600 mb-4">
          Exemplo de geração de PDF usando a API programática com tabelas e formatação customizada.
        </p>
        <button
          onClick={handleCustomPDF}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          🔧 Gerar PDF Programático
        </button>
      </div>

      {/* Conteúdo de exemplo para conversão HTML */}
      <div id="sample-content" className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Conteúdo de Exemplo</h3>
        <p className="mb-4">
          Este é um exemplo de conteúdo que pode ser convertido para PDF usando a funcionalidade HTML-to-PDF.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-100 p-4 rounded">
            <h4 className="font-semibold">Seção 1</h4>
            <p>Conteúdo da primeira seção com formatação.</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <h4 className="font-semibold">Seção 2</h4>
            <p>Conteúdo da segunda seção com cores diferentes.</p>
          </div>
        </div>
        <table className="mt-4 w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Item</th>
              <th className="border border-gray-300 p-2">Valor</th>
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Item 1</td>
              <td className="border border-gray-300 p-2">R$ 100,00</td>
              <td className="border border-gray-300 p-2">Ativo</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Item 2</td>
              <td className="border border-gray-300 p-2">R$ 200,00</td>
              <td className="border border-gray-300 p-2">Inativo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Instruções de uso */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📖 Como Usar</h2>
        <div className="space-y-2 text-sm">
          <p><strong>1. Relatórios de Testes:</strong> Use para exportar resultados de testes automatizados.</p>
          <p><strong>2. Relatórios de Métricas:</strong> Ideal para relatórios de performance e KPIs.</p>
          <p><strong>3. PDF Customizado:</strong> Para dados específicos com formatação padrão.</p>
          <p><strong>4. HTML para PDF:</strong> Mantém a formatação visual do HTML original.</p>
          <p><strong>5. PDF Programático:</strong> Controle total sobre layout e conteúdo.</p>
        </div>
      </div>
    </div>
  );
};

export default PDFExample;

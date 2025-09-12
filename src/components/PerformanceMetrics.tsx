import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Users, 
  BarChart3, 
  Download,
  Calendar,
  Target,
  Activity,
  PieChart,
  LineChart,
  FileText
} from 'lucide-react';
import { db } from '../services/database';
import { useToast } from '../contexts/ToastContext';
import { PDFGenerator } from '../utils/pdfGenerator';

interface PerformanceMetricsProps {
  startDate?: string;
  endDate?: string;
  boardId?: number;
  className?: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  startDate,
  endDate,
  boardId,
  className = ''
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [userProductivity, setUserProductivity] = useState<any[]>([]);
  const [projectPerformance, setProjectPerformance] = useState<any[]>([]);
  const [productivityTrends, setProductivityTrends] = useState<any[]>([]);
  const [subtaskMetrics, setSubtaskMetrics] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);

  useEffect(() => {
    loadMetrics();
  }, [startDate, endDate, boardId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Converter boardId para integer se necessário, mas tratar como string se for muito grande
      let numericBoardId: number | undefined;
      if (boardId) {
        const cleanId = boardId.toString().replace('board-', '');
        const parsed = parseInt(cleanId);
        // Verificar se o valor está dentro do range de integer
        if (!isNaN(parsed) && parsed >= -2147483648 && parsed <= 2147483647) {
          numericBoardId = parsed;
        } else {
          // Se for muito grande ou inválido, usar null para evitar overflow
          numericBoardId = undefined;
        }
      }
      
      // Carregar todas as métricas em paralelo
      const [
        completionTime,
        completionRate,
        userProd,
        projectPerf,
        trends,
        subtasks,
        monthly
      ] = await Promise.all([
        db.getAverageCompletionTime(startDate, endDate, numericBoardId),
        db.getCompletionRate(startDate, endDate, numericBoardId),
        db.getUserProductivity(startDate, endDate, numericBoardId),
        db.getProjectPerformance(startDate, endDate, boardId),
        db.getProductivityTrends('month', startDate, endDate, numericBoardId),
        db.getSubtaskMetrics(startDate, endDate, numericBoardId),
        db.getMonthlyReport(startDate)
      ]);

      // Configurar métricas principais
      const mainMetrics: MetricCard[] = [
        {
          title: 'Tempo Médio de Conclusão',
          value: `${completionTime.avg_completion_days} dias`,
          subtitle: `${completionTime.completed_cards} cards concluídos`,
          icon: <Clock className="w-6 h-6" />,
          color: 'bg-blue-500'
        },
        {
          title: 'Taxa de Conclusão',
          value: `${completionRate.completion_rate}%`,
          subtitle: `${completionRate.completed_cards}/${completionRate.total_cards} cards`,
          icon: <CheckCircle className="w-6 h-6" />,
          color: 'bg-green-500'
        },
        {
          title: 'Produtividade da Equipe',
          value: userProd.length,
          subtitle: 'membros ativos',
          icon: <Users className="w-6 h-6" />,
          color: 'bg-purple-500'
        },
        {
          title: 'Subtasks Concluídas',
          value: `${subtasks.completion_rate}%`,
          subtitle: `${subtasks.completed_subtasks}/${subtasks.total_subtasks} subtasks`,
          icon: <Target className="w-6 h-6" />,
          color: 'bg-orange-500'
        }
      ];

      setMetrics(mainMetrics);
      setUserProductivity(userProd);
      setProjectPerformance(projectPerf);
      setProductivityTrends(trends);
      setSubtaskMetrics(subtasks);
      setMonthlyReport(monthly);

    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar métricas de performance'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type: 'monthly' | 'project' | 'user') => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'monthly':
          data = monthlyReport;
          filename = `relatorio-mensal-${new Date().toISOString().slice(0, 7)}`;
          break;
        case 'project':
          data = projectPerformance;
          filename = `relatorio-projetos-${new Date().toISOString().slice(0, 10)}`;
          break;
        case 'user':
          data = userProductivity;
          filename = `relatorio-usuarios-${new Date().toISOString().slice(0, 10)}`;
          break;
      }

      await db.exportReportToCSV(type, data, filename);
      addToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Relatório exportado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao exportar relatório'
      });
    }
  };


  const exportToPDF = (type: 'monthly' | 'project' | 'user' | 'complete') => {
    try {
      const period = `${startDate || 'Início'} - ${endDate || 'Fim'}`;
      const generator = new PDFGenerator();
      
      switch (type) {
        case 'monthly':
          generator.generateMetricsReport(monthlyReport, `Relatório Mensal - ${period}`);
          break;
        case 'project':
          generator.generateMetricsReport(projectPerformance, `Relatório de Projetos - ${period}`);
          break;
        case 'user':
          generator.generateMetricsReport(userProductivity, `Relatório de Usuários - ${period}`);
          break;
        case 'complete':
          // Gerar relatório completo combinando todos os dados
          const completeData = [
            ...monthlyReport.map(item => ({ ...item, categoria: 'Mensal' })),
            ...projectPerformance.map(item => ({ ...item, categoria: 'Projeto' })),
            ...userProductivity.map(item => ({ ...item, categoria: 'Usuário' }))
          ];
          generator.generateMetricsReport(completeData, `Relatório Completo - ${period}`);
          break;
      }
      
      addToast({
        type: 'success',
        title: 'Sucesso',
        message: 'PDF gerado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao gerar PDF: ' + (error as Error).message
      });
    }
  };

  if (loading) {
    return (
      <div className={`${className} space-y-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="w-24 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-8`}>
      {/* Cabeçalho com Botão de Relatório Completo */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Métricas de Performance</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => exportToPDF('complete')}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${metric.color} p-3 rounded-lg text-white`}>
                {metric.icon}
              </div>
              {metric.trend && (
                <div className={`flex items-center space-x-1 text-sm ${
                  metric.trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${!metric.trend.isPositive ? 'rotate-180' : ''}`} />
                  <span>{metric.trend.value}%</span>
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metric.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Produtividade por Usuário */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Produtividade por Usuário
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => exportReport('user')}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => exportToPDF('user')}
                className="flex items-center space-x-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {userProductivity.slice(0, 5).map((user, index) => (
              <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.nome_completo}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{user.completed_cards} cards</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.completion_rate}% concluído</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance por Projeto */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              Performance por Projeto
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => exportReport('project')}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => exportToPDF('project')}
                className="flex items-center space-x-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {projectPerformance.slice(0, 5).map((project, index) => (
              <div key={project.board_id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{project.board_name}</h4>
                  <span className="text-sm font-semibold text-green-600">{project.completion_rate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{project.completed_cards}/{project.total_cards} cards</span>
                  <span>{project.avg_completion_days} dias médios</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.completion_rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tendências de Produtividade */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <LineChart className="w-5 h-5 mr-2 text-purple-500" />
            Tendências de Produtividade
          </h3>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="month">Mensal</option>
              <option value="week">Semanal</option>
              <option value="day">Diário</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {productivityTrends.slice(0, 6).map((trend, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{trend.period_label}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{trend.completion_rate}%</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Criados: {trend.total_cards}</span>
                  <span>Concluídos: {trend.completed_cards}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${trend.completion_rate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relatório Mensal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-orange-500" />
            Relatório Mensal
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('monthly')}
              className="flex items-center space-x-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => exportToPDF('monthly')}
              className="flex items-center space-x-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthlyReport.map((metric, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{metric.metric_name}</h4>
              <p className="text-2xl font-bold text-orange-500 mb-1">{metric.metric_value}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{metric.metric_description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;

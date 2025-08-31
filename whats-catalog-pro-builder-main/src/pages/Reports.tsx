import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, Package, ShoppingBag, TrendingUp, Users, Download, BarChart3, FileText, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { DateRange } from "react-day-picker";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

const Reports = () => {
  const [period, setPeriod] = useState("month");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [],
    salesByPeriod: [],
    ordersByStatus: {
      completed: 0,
      pending: 0,
      cancelled: 0
    }
  });
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, period, customDateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      let startDate: Date, endDate: Date;
      
      if (period === "custom" && customDateRange?.from && customDateRange?.to) {
        startDate = customDateRange.from;
        endDate = customDateRange.to;
      } else {
        endDate = new Date();
        startDate = new Date();
        
        switch (period) {
          case "week":
            startDate.setDate(startDate.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case "quarter":
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case "year":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }
      }

      // Fetch orders and products in parallel
      const [ordersResult, productsResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('products')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (productsResult.error) throw productsResult.error;

      const orders = ordersResult.data || [];
      setProducts(productsResult.data || []);

      // Calculate stats
      const completedOrders = orders.filter(o => o.status === 'completed');
      const pendingOrders = orders.filter(o => o.status === 'pending');
      const cancelledOrders = orders.filter(o => o.status === 'cancelled');

      const totalSales = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const avgOrderValue = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;

      // Get product stats
      const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
      completedOrders.forEach(order => {
        if (Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productName = item.product_name || item.name || 'Produto sem nome';
            if (!productStats[productName]) {
              productStats[productName] = { name: productName, quantity: 0, revenue: 0 };
            }
            productStats[productName].quantity += Number(item.quantity || 0);
            productStats[productName].revenue += Number(item.price || 0) * Number(item.quantity || 0);
          });
        }
      });

      const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Create chart data for sales by period
      const salesByDay = completedOrders.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toLocaleDateString('pt-BR');
        if (!acc[date]) {
          acc[date] = { date, sales: 0, orders: 0 };
        }
        acc[date].sales += Number(order.total_amount);
        acc[date].orders += 1;
        return acc;
      }, {});

      const salesByPeriod = Object.values(salesByDay).slice(0, 30);

      setStats({
        totalSales,
        totalOrders: orders.length,
        avgOrderValue,
        topProducts,
        salesByPeriod,
        ordersByStatus: {
          completed: completedOrders.length,
          pending: pendingOrders.length,
          cancelled: cancelledOrders.length
        }
      });

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = () => {
    const reportData = {
      period,
      generated_at: new Date().toISOString(),
      stats
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${period}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast.success("Relatório JSON exportado com sucesso!");
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Sales summary sheet
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Vendas Totais', `R$ ${stats.totalSales.toFixed(2)}`],
      ['Total de Pedidos', stats.totalOrders],
      ['Ticket Médio', `R$ ${stats.avgOrderValue.toFixed(2)}`],
      ['Pedidos Concluídos', stats.ordersByStatus.completed],
      ['Pedidos Pendentes', stats.ordersByStatus.pending],
      ['Pedidos Cancelados', stats.ordersByStatus.cancelled]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
    
    // Top products sheet
    const productsData = [
      ['Produto', 'Quantidade Vendida', 'Receita'],
      ...stats.topProducts.map((product: any) => [
        product.name,
        product.quantity,
        `R$ ${product.revenue.toFixed(2)}`
      ])
    ];
    const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'Produtos Mais Vendidos');
    
    XLSX.writeFile(workbook, `relatorio-${period}-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Relatório Excel exportado com sucesso!");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório de Vendas', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Período: ${period === 'custom' ? 'Personalizado' : period}`, 20, 50);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 60);
    
    doc.text('Resumo:', 20, 80);
    doc.text(`Vendas Totais: R$ ${stats.totalSales.toFixed(2)}`, 20, 95);
    doc.text(`Total de Pedidos: ${stats.totalOrders}`, 20, 105);
    doc.text(`Ticket Médio: R$ ${stats.avgOrderValue.toFixed(2)}`, 20, 115);
    
    doc.text('Status dos Pedidos:', 20, 135);
    doc.text(`Concluídos: ${stats.ordersByStatus.completed}`, 20, 150);
    doc.text(`Pendentes: ${stats.ordersByStatus.pending}`, 20, 160);
    doc.text(`Cancelados: ${stats.ordersByStatus.cancelled}`, 20, 170);
    
    if (stats.topProducts.length > 0) {
      doc.text('Top 5 Produtos:', 20, 190);
      stats.topProducts.slice(0, 5).forEach((product: any, index) => {
        doc.text(`${index + 1}. ${product.name}: ${product.quantity} vendidos (R$ ${product.revenue.toFixed(2)})`, 20, 205 + (index * 10));
      });
    }
    
    doc.save(`relatorio-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Relatório PDF exportado com sucesso!");
  };

  const exportProducts = () => {
    const workbook = XLSX.utils.book_new();
    
    const productsData = [
      ['ID', 'Nome', 'Preço', 'Categoria', 'Em Estoque', 'Ativo', 'Vendas'],
      ...products.map((product: any) => [
        product.id,
        product.name,
        `R$ ${product.price.toFixed(2)}`,
        product.category || 'Sem categoria',
        product.in_stock ? 'Sim' : 'Não',
        product.active ? 'Sim' : 'Não',
        product.sales
      ])
    ];
    const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'Produtos');
    
    XLSX.writeFile(workbook, `produtos-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Produtos exportados com sucesso!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Análise detalhada do seu negócio</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {period === "custom" && (
              <DatePickerWithRange
                date={customDateRange}
                onDateChange={setCustomDateRange}
              />
            )}
            
            <div className="flex items-center space-x-2">
              <Button onClick={exportToJSON} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={exportProducts} variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Produtos
              </Button>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalSales.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.avgOrderValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Concluídos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersByStatus.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {stats.salesByPeriod.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.salesByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']} />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Concluídos', value: stats.ordersByStatus.completed, fill: '#10B981' },
                        { name: 'Pendentes', value: stats.ordersByStatus.pending, fill: '#F59E0B' },
                        { name: 'Cancelados', value: stats.ordersByStatus.cancelled, fill: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%" 
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {[
                        { name: 'Concluídos', value: stats.ordersByStatus.completed, fill: '#10B981' },
                        { name: 'Pendentes', value: stats.ordersByStatus.pending, fill: '#F59E0B' },
                        { name: 'Cancelados', value: stats.ordersByStatus.cancelled, fill: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Products Chart */}
        {stats.topProducts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top 10 Produtos - Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats.topProducts.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Status dos Pedidos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Concluídos
                  </span>
                  <span className="font-semibold">{stats.ordersByStatus.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    Pendentes
                  </span>
                  <span className="font-semibold">{stats.ordersByStatus.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    Cancelados
                  </span>
                  <span className="font-semibold">{stats.ordersByStatus.cancelled}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts.length > 0 ? (
                  stats.topProducts.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} vendidos</p>
                      </div>
                      <span className="font-semibold">R$ {product.revenue.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Nenhum produto vendido no período</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
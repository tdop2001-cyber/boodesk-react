
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip
} from "recharts";

// Mock data
const salesData = [
  { day: "Seg", sales: 2400 },
  { day: "Ter", sales: 1398 },
  { day: "Qua", sales: 4800 },
  { day: "Qui", sales: 3908 },
  { day: "Sex", sales: 4800 },
  { day: "Sáb", sales: 5500 },
  { day: "Dom", sales: 2000 },
];

const ordersData = [
  { status: "Pendente", count: 4 },
  { status: "Confirmado", count: 8 },
  { status: "Em preparo", count: 2 },
  { status: "Enviado", count: 6 },
  { status: "Entregue", count: 12 },
  { status: "Cancelado", count: 1 },
];

const DashboardTab = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user?.id) return;
    
    try {
      // Get completed orders only for sales calculation
      const { data: completedOrders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (ordersError) throw ordersError;

      // Get all orders count
      const { data: allOrders, error: allOrdersError } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id);

      if (allOrdersError) throw allOrdersError;

      // Get active products count
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("user_id", user.id)
        .eq("active", true);

      if (productsError) throw productsError;

      const totalSales = completedOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      setStats({
        totalSales,
        totalOrders: allOrders?.length || 0,
        activeProducts: products?.length || 0,
        completedOrders: completedOrders?.length || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando estatísticas...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Quick Stats Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Total de Vendas</CardTitle>
          <CardDescription className="text-xs md:text-sm">Este mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-brand-gray">
            R$ {stats.totalSales.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-xs md:text-sm text-green-600 flex items-center mt-1">
            <span>Apenas pedidos concluídos</span>
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Pedidos</CardTitle>
          <CardDescription className="text-xs md:text-sm">Este mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-brand-gray">
            {stats.totalOrders}
          </div>
          <p className="text-xs md:text-sm text-green-600 flex items-center mt-1">
            <span>{stats.completedOrders} concluídos</span>
          </p>
        </CardContent>
      </Card>
      
      {/* Status de Pedidos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Status de Pedidos</CardTitle>
          <CardDescription className="text-xs md:text-sm">Visão geral dos pedidos ativos</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {ordersData.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-brand-gray">{item.status}</span>
                <div className="flex items-center space-x-2">
                  <div className="bg-brand-light-gray h-2 w-24 md:w-32 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${(item.count / Math.max(...ordersData.map(d => d.count))) * 100}%`,
                        backgroundColor: 
                          item.status === "Entregue" ? "#2E8B57" : 
                          item.status === "Cancelado" ? "#B70404" : "#9CA3AF"
                      }} 
                    />
                  </div>
                  <span className="text-xs font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Sales Chart */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Vendas na Semana</CardTitle>
          <CardDescription className="text-xs md:text-sm">Performance das suas vendas na última semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ChartContainer
              config={{
                sales: {
                  label: "Vendas",
                  color: "#2E8B57",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0, 
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: '0.75rem' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false} 
                    tick={{ fontSize: '0.75rem' }}
                    tickFormatter={(value) => `R$${value}`} 
                    width={60}
                  />
                  <Tooltip 
                    content={({active, payload}) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
                            <p className="font-medium">R$ {payload[0].value}</p>
                            <p className="text-gray-500">{payload[0].payload.day}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sales" fill="#2E8B57" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;

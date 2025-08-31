
import { 
  Users, CreditCard, TrendingDown,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";

// Sample data for the growth chart
const growthData = [
  { month: 'Jan', users: 20, revenue: 2000 },
  { month: 'Fev', users: 35, revenue: 3500 },
  { month: 'Mar', users: 45, revenue: 5000 },
  { month: 'Abr', users: 60, revenue: 6500 },
  { month: 'Mai', users: 75, revenue: 8000 },
  { month: 'Jun', users: 90, revenue: 9500 },
];

const OverviewTab = () => {
  // These would be fetched from the backend in a real app
  const totalCustomers = 256;
  const totalMRR = 15600;
  const churnRate = 2.5;
  const customerGrowth = 12.8;
  const revenueGrowth = 15.3;
  const churnTrend = -0.5;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Customers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {customerGrowth > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{customerGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{customerGrowth}%</span>
                </>
              )}
              <span className="ml-1">em 30 dias</span>
            </div>
          </CardContent>
        </Card>

        {/* MRR Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Receita Mensal)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalMRR.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {revenueGrowth > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{revenueGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{revenueGrowth}%</span>
                </>
              )}
              <span className="ml-1">em 30 dias</span>
            </div>
          </CardContent>
        </Card>

        {/* Churn Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {churnTrend < 0 ? (
                <>
                  <ArrowDownRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">{churnTrend}%</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">+{churnTrend}%</span>
                </>
              )}
              <span className="ml-1">em 30 dias</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Crescimento no Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                users: {
                  label: "Usuários",
                  theme: {
                    light: "#3B82F6",
                    dark: "#60A5FA",
                  },
                },
                revenue: {
                  label: "Receita (R$)",
                  theme: {
                    light: "#10B981",
                    dark: "#34D399",
                  },
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={growthData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-sm text-muted-foreground"
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    className="text-sm text-muted-foreground"
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    className="text-sm text-muted-foreground"
                    tickMargin={10}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="dataKey" />}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;

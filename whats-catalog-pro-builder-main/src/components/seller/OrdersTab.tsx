
import { useState, useEffect } from "react";
import { Clock, Filter, ArrowRight, MessageCircle, Package, TrendingUp, XCircle, CheckCircle, Pause, DollarSign, Calendar, BarChart3, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import OrderStatusBadge from "./OrderStatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Mock orders data
const mockOrders = [
  {
    id: "#1234",
    date: "10/04/2025 - 14:30",
    customer: "Maria Silva",
    items: ["Camiseta Estampada", "Caneca Personalizada"],
    total: 89.80,
    status: "pending" // pending, confirmed, delivered, canceled
  },
  {
    id: "#1235",
    date: "10/04/2025 - 10:15",
    customer: "João Santos",
    items: ["Kit de Maquiagem"],
    total: 89.90,
    status: "confirmed"
  },
  {
    id: "#1236",
    date: "09/04/2025 - 16:45",
    customer: "Ana Costa",
    items: ["Tênis Esportivo", "Meia Esportiva"],
    total: 169.80,
    status: "delivered"
  },
  {
    id: "#1237",
    date: "09/04/2025 - 09:20",
    customer: "Pedro Alves",
    items: ["Chaveiro Personalizado", "Pulseira Artesanal"],
    total: 41.80,
    status: "canceled"
  }
];

const OrdersTab = () => {
  const { user } = useAuth();
  const [orderFilter, setOrderFilter] = useState("today");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    completed: 0,
    pending: 0,
    canceled: 0,
    total_revenue: 0,
    avg_order_value: 0,
    orders_today: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
      
      // Calculate stats
      const completedOrders = data?.filter(order => order.status === 'completed') || [];
      const pendingOrders = data?.filter(order => order.status === 'pending') || [];
      const canceledOrders = data?.filter(order => order.status === 'canceled') || [];
      const todayOrders = data?.filter(order => {
        const orderDate = new Date(order.created_at);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }) || [];
      
      const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
      
      const stats = {
        completed: completedOrders.length,
        pending: pendingOrders.length,
        canceled: canceledOrders.length,
        total_revenue: totalRevenue,
        avg_order_value: avgOrderValue,
        orders_today: todayOrders.length
      };
      
      setOrderStats(stats);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chat with customer via WhatsApp
  const handleWhatsAppChat = (orderId: string) => {
    toast.success(`Abrindo chat para o pedido ${orderId}`);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando pedidos...</div>;
  }

  return (
    <>
      {/* Mini Dashboard */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Dashboard de Pedidos</CardTitle>
              <CardDescription>Resumo completo dos seus pedidos</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatório Completo
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Concluídos</p>
                  <p className="text-xl font-bold text-green-600">{orderStats.completed}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Pause className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Pendentes</p>
                  <p className="text-xl font-bold text-yellow-600">{orderStats.pending}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Cancelados</p>
                  <p className="text-xl font-bold text-red-600">{orderStats.canceled}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Receita Total</p>
                  <p className="text-lg font-bold text-blue-600">R$ {orderStats.total_revenue.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Ticket Médio</p>
                  <p className="text-lg font-bold text-purple-600">R$ {orderStats.avg_order_value.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Hoje</p>
                  <p className="text-xl font-bold text-orange-600">{orderStats.orders_today}</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Lista de Pedidos</CardTitle>
              <CardDescription>Gerencie os pedidos recebidos</CardDescription>
            </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button 
              variant={orderFilter === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderFilter("today")}
              className={orderFilter === "today" ? "bg-brand-red" : ""}
            >
              Hoje
            </Button>
            <Button 
              variant={orderFilter === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderFilter("week")}
              className={orderFilter === "week" ? "bg-brand-red" : ""}
            >
              Esta Semana
            </Button>
            <Button 
              variant={orderFilter === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderFilter("month")}
              className={orderFilter === "month" ? "bg-brand-red" : ""}
            >
              Este Mês
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-500">Seus pedidos aparecerão aqui quando forem feitos.</p>
            </div>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-medium text-brand-gray">#{order.id.slice(0, 8)}</h3>
                      <OrderStatusBadge status={order.status as any} />
                      <span className="text-sm text-brand-gray/70 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-brand-gray/70">Cliente: {order.customer_name}</p>
                    <p className="text-sm">
                      {Array.isArray(order.items) && order.items.length > 0 
                        ? `${order.items.length} item(s)`
                        : "Itens não especificados"}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <span className="font-medium text-brand-green">
                      R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                    </span>
                    <Button 
                      onClick={() => handleWhatsAppChat(order.id)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-border pt-4 flex flex-col md:flex-row justify-between space-y-2 md:space-y-0">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avançados
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Relatório Detalhado
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" size="sm">
            Ver Todos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardFooter>
    </Card>
    </>
  );
};

export default OrdersTab;

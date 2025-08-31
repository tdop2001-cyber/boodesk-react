
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Phone, Calendar, DollarSign, Eye, ChevronDown, ChevronUp, CheckCircle, Pause, XCircle, TrendingUp, BarChart3, FileText, Download, Filter, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
}

const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orderStats, setOrderStats] = useState({
    completed: 0,
    pending: 0,
    canceled: 0,
    waiting: 0,
    total_revenue: 0,
    avg_order_value: 0,
    orders_today: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as Order[] || []);
      
      // Calculate stats
      const completedOrders = data?.filter(order => order.status === 'completed') || [];
      const pendingOrders = data?.filter(order => order.status === 'pending') || [];
      const canceledOrders = data?.filter(order => order.status === 'cancelled') || [];
      const waitingOrders = data?.filter(order => order.status === 'waiting') || [];
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
        waiting: waitingOrders.length,
        total_revenue: totalRevenue,
        avg_order_value: avgOrderValue,
        orders_today: todayOrders.length
      };
      
      setOrderStats(stats);
    } catch (error) {
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success("Status do pedido atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waiting': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'waiting': return 'Em Espera';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mini Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Dashboard de Pedidos</CardTitle>
              <CardDescription>Resumo completo dos seus pedidos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <Package className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Pendentes</p>
                  <p className="text-xl font-bold text-yellow-600">{orderStats.pending}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Pause className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Em Espera</p>
                  <p className="text-xl font-bold text-blue-600">{orderStats.waiting}</p>
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Lista de Pedidos</CardTitle>
              <CardDescription>Gerencie todos os seus pedidos</CardDescription>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{orders.length} pedidos total</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido ainda</h3>
              <p className="text-muted-foreground text-center">
                Quando você receber pedidos pelo WhatsApp, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Pedido #{order.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{order.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer_phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-lg">
                          R$ {order.total_amount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'waiting')}
                              variant="outline"
                            >
                              Em Espera
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Concluir
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        {order.status === 'waiting' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Concluir
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        {(order.status === 'completed' || order.status === 'cancelled') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                          >
                            Reabrir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {order.items && order.items.length > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between p-0 h-auto font-normal"
                          onClick={() => toggleOrderExpansion(order.id)}
                        >
                          <span className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Ver itens do pedido ({order.items.length} {order.items.length === 1 ? 'item' : 'itens'})
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <h4 className="font-medium text-sm text-gray-700 mb-3">Itens do pedido:</h4>
                          {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {item.product_name || item.name}
                                </p>
                                {item.variation && (
                                  <p className="text-xs text-gray-600">
                                    Variação: {item.variation.name}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Quantidade: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">
                                  R$ {parseFloat(item.price || 0).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Total: R$ {(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
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
    </div>
  );
};

export default OrdersTab;

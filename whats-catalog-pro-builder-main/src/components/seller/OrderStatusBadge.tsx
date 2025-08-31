
import { Badge } from "@/components/ui/badge";

type OrderStatus = "pending" | "confirmed" | "delivered" | "canceled";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const statusConfig = {
    pending: { label: "Pendente", class: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    confirmed: { label: "Confirmado", class: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    delivered: { label: "Entregue", class: "bg-green-100 text-green-800 hover:bg-green-100" },
    canceled: { label: "Cancelado", class: "bg-red-100 text-red-800 hover:bg-red-100" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="outline" className={config.class}>
      {config.label}
    </Badge>
  );
};

export default OrderStatusBadge;

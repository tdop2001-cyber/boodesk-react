
import { useState, useEffect } from "react";
import { Send, X, User, Phone, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  onSubmit: (couponCode?: string) => void;
  cartTotal: number;
  storeUserId?: string;
}

const CheckoutForm = ({
  isOpen,
  onClose,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  onSubmit,
  cartTotal,
  storeUserId
}: CheckoutFormProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [finalTotal, setFinalTotal] = useState(cartTotal);

  useEffect(() => {
    setFinalTotal(cartTotal);
    setAppliedCoupon(null);
    setCouponCode("");
  }, [cartTotal, isOpen]);

  if (!isOpen) return null;

  const applyCoupon = async () => {
    if (!couponCode.trim() || !storeUserId) {
      toast.error("Digite um código de cupom válido");
      return;
    }

    setCouponLoading(true);
    
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('user_id', storeUserId)
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast.error("Cupom não encontrado ou inválido");
        return;
      }

      // Verificar se o cupom expirou
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error("Este cupom já expirou");
        return;
      }

      // Verificar limite de uso
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        toast.error("Este cupom já atingiu o limite de uso");
        return;
      }

      // Verificar valor mínimo do pedido
      if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
        toast.error(`Valor mínimo do pedido: R$ ${coupon.min_order_amount.toFixed(2)}`);
        return;
      }

      // Calcular desconto
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (cartTotal * coupon.discount_value) / 100;
      } else {
        discount = coupon.discount_value;
      }

      const newTotal = Math.max(0, cartTotal - discount);
      setFinalTotal(newTotal);
      setAppliedCoupon(coupon);
      toast.success(`Cupom aplicado! Desconto: R$ ${discount.toFixed(2)}`);
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error("Erro ao aplicar cupom");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setFinalTotal(cartTotal);
    toast.info("Cupom removido");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(appliedCoupon?.code);
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setCustomerPhone(formatted);
  };
  
  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white shadow-lg rounded-lg p-6 z-50 mx-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-brand-gray">Finalizar Pedido</h3>
            <p className="text-sm text-brand-gray/70 mt-1">
              Informe seus dados para enviar o pedido via WhatsApp
            </p>
          </div>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-gray/70">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name" className="text-sm font-medium text-brand-gray flex items-center gap-2">
              <User className="h-4 w-4" />
              Seu Nome Completo *
            </Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex: João Silva"
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-phone" className="text-sm font-medium text-brand-gray flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Seu WhatsApp *
            </Label>
            <Input
              id="customer-phone"
              value={customerPhone}
              onChange={handlePhoneChange}
              placeholder="(11) 98765-4321"
              required
              maxLength={15}
              className="w-full"
            />
            <p className="text-xs text-brand-gray/60">
              Seu pedido será enviado para o WhatsApp da loja
            </p>
          </div>

          {/* Cupom de Desconto */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-brand-gray flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Cupom de Desconto
            </Label>
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Digite o código do cupom"
                className="flex-1"
                disabled={!!appliedCoupon}
              />
              {appliedCoupon ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={removeCoupon}
                  className="px-3"
                >
                  Remover
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-3"
                >
                  {couponLoading ? "..." : "Aplicar"}
                </Button>
              )}
            </div>
            {appliedCoupon && (
              <p className="text-xs text-green-600">
                Cupom "{appliedCoupon.code}" aplicado! Desconto: R$ {(cartTotal - finalTotal).toFixed(2)}
              </p>
            )}
          </div>

          {/* Resumo do Pedido */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto:</span>
                <span>- R$ {(cartTotal - finalTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total:</span>
              <span>R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white h-12 text-base font-medium"
              disabled={!customerName.trim() || !customerPhone.trim()}
            >
              <Send className="h-5 w-5 mr-2" />
              Enviar Pedido pelo WhatsApp
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-center text-brand-gray/60">
            Ao enviar o pedido, você será redirecionado para o WhatsApp da loja para finalizar a compra
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;

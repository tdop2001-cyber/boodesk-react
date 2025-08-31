
import { Package, Send, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/seller";

interface CartItem {
  product: Product;
  variation?: { id: string; name: string; price: number };
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveFromCart: (index: number) => void;
  calculateTotal: () => number;
  onCheckout: () => void;
}

const CartDrawer = ({
  isOpen,
  onClose,
  cart,
  onRemoveFromCart,
  calculateTotal,
  onCheckout
}: CartDrawerProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      <div className="absolute top-0 right-0 w-full md:w-96 h-full bg-white shadow-lg z-50 overflow-y-auto">
        <div className="p-4 border-b border-brand-light-gray flex justify-between items-center">
          <span className="font-semibold text-lg flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-brand-green" />
            Seu Pedido
          </span>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-brand-gray" />
          </button>
        </div>
        
        <div className="p-4">
          {cart.length > 0 ? (
            <>
              <div className="divide-y divide-brand-light-gray">
                {cart.map((item, index) => (
                  <div key={index} className="py-4 flex items-start">
                    <div className="w-12 h-12 bg-brand-light-gray/30 rounded-md flex-shrink-0 mr-3">
                      {item.product.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-brand-gray/30" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-brand-gray">{item.product.name}</h3>
                        <button
                          onClick={() => onRemoveFromCart(index)}
                          className="text-brand-red hover:text-brand-red/80 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {item.variation && (
                        <p className="text-xs text-brand-gray/70 mt-1">
                          Opção: {item.variation.name}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm">
                          <span className="text-brand-gray/70">Qtd: </span>
                          <span className="font-medium">{item.quantity}</span>
                        </p>
                        <p className="font-medium text-brand-green">
                          R$ {((item.variation?.price || item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-brand-light-gray mt-4 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-medium text-lg text-brand-gray">Total</span>
                  <span className="font-bold text-xl text-brand-green">R$ {calculateTotal().toFixed(2)}</span>
                </div>
                
                <Button
                  className="w-full bg-[#2E8B57] hover:bg-[#2E8B57]/90 h-auto py-3"
                  onClick={onCheckout}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Finalizar Pedido
                </Button>
                
                <p className="text-xs text-center text-brand-gray/70 mt-3">
                  Ao finalizar, seu pedido será enviado para nosso WhatsApp para confirmação.
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <ShoppingBag className="h-12 w-12 text-brand-gray/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-brand-gray mb-2">Seu carrinho está vazio</h3>
              <p className="text-brand-gray/70 mb-6">
                Adicione produtos ao seu pedido para enviar pelo WhatsApp.
              </p>
              <Button 
                variant="outline"
                className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                onClick={onClose}
              >
                Continuar Comprando
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;

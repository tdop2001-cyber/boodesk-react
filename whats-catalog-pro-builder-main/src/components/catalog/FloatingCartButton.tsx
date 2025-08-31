
import { ShoppingBag } from "lucide-react";

interface FloatingCartButtonProps {
  cartItemsCount: number;
  onClick: () => void;
}

const FloatingCartButton = ({ cartItemsCount, onClick }: FloatingCartButtonProps) => {
  if (cartItemsCount === 0) return null;
  
  return (
    <div className="fixed bottom-6 right-6 md:hidden z-30">
      <button
        onClick={onClick}
        className="bg-gradient-to-r from-brand-green to-brand-green/90 text-white rounded-full p-4 shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-2 border-white/20"
      >
        <ShoppingBag className="h-7 w-7" />
        <span className="absolute -top-2 -right-2 bg-brand-red text-white text-sm rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white">
          {cartItemsCount}
        </span>
      </button>
    </div>
  );
};

export default FloatingCartButton;

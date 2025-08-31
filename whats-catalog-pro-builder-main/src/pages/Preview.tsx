
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Product } from "@/types/seller";
import { supabase } from "@/integrations/supabase/client";
import ProductDetailModal from "@/components/ProductDetailModal";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import CategoryFilter from "@/components/catalog/CategoryFilter";
import ProductGrid from "@/components/catalog/ProductGrid";
import CartDrawer from "@/components/catalog/CartDrawer";
import CheckoutForm from "@/components/catalog/CheckoutForm";
import CatalogFooter from "@/components/catalog/CatalogFooter";
import FloatingCartButton from "@/components/catalog/FloatingCartButton";

interface CartItem {
  product: Product;
  variation?: { id: string; name: string; price: number };
  quantity: number;
}

const Preview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Mock categories and products data
  const categories = [
    "Todos", "Roupas", "Acessórios", "Eletrônicos", "Casa", "Beleza"
  ];
  
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const convertedProducts = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || "",
        image: product.image || "",
        price: product.price,
        variations: Array.isArray(product.variations) ? product.variations : [],
        inStock: product.in_stock,
        sales: product.sales || 0
      }));
      
      setProducts(convertedProducts as any);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddToCart = (product: Product, variation?: any, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex(item => 
      item.product.id === product.id && 
      (!variation || item.variation?.id === variation.id)
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already in cart
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, { product, variation, quantity }]);
    }
    
    toast.success("Produto adicionado ao carrinho!");
    if (!isCartOpen) {
      setIsCartOpen(true);
    }
  };
  
  const handleRemoveFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    
    if (newCart.length === 0) {
      setIsCartOpen(false);
    }
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.variation ? item.variation.price : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };
  
  const formatCartForWhatsApp = () => {
    let message = "📦 *PEDIDO* - Loja Modelo\n";
    
    if (customerName) {
      message += `Cliente: ${customerName}\n`;
    }
    
    if (customerPhone) {
      message += `WhatsApp: ${customerPhone}\n`;
    }
    
    message += "\nItens:\n";
    
    cart.forEach((item) => {
      const price = item.variation ? item.variation.price : item.product.price;
      const variationText = item.variation ? ` (${item.variation.name})` : '';
      
      message += `- ${item.quantity}x ${item.product.name}${variationText} → R$ ${(price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total: R$ ${calculateTotal().toFixed(2)}*\n\n`;
    
    return encodeURIComponent(message);
  };
  
  const sendOrderToWhatsApp = (couponCode?: string) => {
    const phoneNumber = "5511999999999"; // Replace with the actual WhatsApp number
    const message = formatCartForWhatsApp();
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    setIsCheckoutOpen(false);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    toast.success("Pedido enviado com sucesso!");
  };
  
  const handleProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };
  
  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
  };
  
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };
  
  // Event handlers for opening/closing menus and drawers
  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <div className="min-h-screen bg-brand-light-gray/20 relative">
      {/* Header */}
      <CatalogHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.length}
        openMenu={openMenu}
        openCart={openCart}
      />
      
      {/* Category Menu */}
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isMenuOpen={isMenuOpen}
        closeMenu={closeMenu}
      />
      
      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={closeCart}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        calculateTotal={calculateTotal}
        onCheckout={handleCheckout}
      />
      
      {/* Checkout Form */}
      <CheckoutForm 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        onSubmit={sendOrderToWhatsApp}
        cartTotal={calculateTotal()}
        storeUserId={undefined}
      />
      
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isProductDetailOpen}
          onClose={() => setIsProductDetailOpen(false)}
          onAddToCart={handleAddToCart}
        />
      )}
      
      <main className="container mx-auto px-4 py-6">
        <ProductGrid 
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          filteredProducts={filteredProducts}
          onProductClick={handleProductDetail}
          resetFilters={resetFilters}
        />
      </main>
      
      <CatalogFooter />
      
      {/* Floating Cart Button (Mobile) */}
      <FloatingCartButton 
        cartItemsCount={cart.length}
        onClick={openCart}
      />
    </div>
  );
};

export default Preview;

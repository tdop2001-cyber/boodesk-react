
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Product } from "@/types/seller";
import { supabase } from "@/integrations/supabase/client";
import ProductDetailModal from "@/components/ProductDetailModal";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import CategoryFilter from "@/components/catalog/CategoryFilter";
import ProductGridImproved from "@/components/catalog/ProductGridImproved";
import CartDrawer from "@/components/catalog/CartDrawer";
import CheckoutForm from "@/components/catalog/CheckoutForm";
import CatalogFooter from "@/components/catalog/CatalogFooter";
import FloatingCartButton from "@/components/catalog/FloatingCartButton";

interface CartItem {
  product: Product;
  variation?: { id: string; name: string; price: number };
  quantity: number;
}

interface StoreProfile {
  catalog_name: string;
  catalog_slug: string;
  display_name?: string;
  store_name?: string;
  phone?: string;
  logo_url?: string;
  user_id?: string;
}

const CatalogPage = () => {
  const { slug } = useParams();
  const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (slug) {
      fetchStoreAndProducts(slug);
    }
  }, [slug]);

  const fetchStoreAndProducts = async (catalogSlug: string) => {
    try {
      // First, find the store by slug
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("catalog_name, catalog_slug, display_name, store_name, phone, logo_url, user_id")
        .eq("catalog_slug", catalogSlug)
        .maybeSingle(); // Use maybeSingle to handle no results gracefully

      if (profileError || !profileData) {
        console.log("Store not found for slug:", catalogSlug);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setStoreProfile(profileData);

      // Register a catalog visit
      await supabase
        .from("analytics")
        .insert([{
          user_id: profileData.user_id,
          event_type: "catalog_visit",
          metadata: {
            catalog_slug: catalogSlug,
            timestamp: new Date().toISOString()
          }
        }]);

      // Then fetch products for this store
      console.log("Fetching products for user:", profileData.user_id);
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", profileData.user_id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      
      console.log("Products fetched:", productsData);
      
      const convertedProducts = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || "",
        image: product.image || "",
        price: Number(product.price) || 0,
        variations: Array.isArray(product.variations) ? product.variations : [],
        inStock: product.in_stock,
        sales: product.sales || 0,
        category: product.category
      }));
      
      setProducts(convertedProducts as any);

      // Extract unique categories from products
      const usedCategories = [...new Set(convertedProducts
        .map(p => p.category)
        .filter(Boolean))] as string[];
      
      setCategories(["Todos", ...usedCategories]);
      
    } catch (error) {
      console.error("Error fetching store data:", error);
      toast.error("Erro ao carregar loja");
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product, variation?: any, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex(item => 
      item.product.id === product.id && 
      (!variation || item.variation?.id === variation.id)
    );
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
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
      const basePrice = Number(item.product.price) || 0;
      const variationPrice = item.variation ? (Number(item.variation.price) || basePrice) : basePrice;
      return total + (variationPrice * item.quantity);
    }, 0);
  };

  const formatCartForWhatsApp = (couponCode?: string) => {
    let message = `📦 *PEDIDO* - ${storeProfile?.catalog_name || 'Loja'}\n\n`;
    
    if (customerName) {
      message += `👤 *Cliente:* ${customerName}\n`;
    }
    
    if (customerPhone) {
      message += `📱 *WhatsApp:* ${customerPhone}\n`;
    }
    
    message += "\n📋 *Itens do Pedido:*\n";
    
    const subtotal = calculateTotal();
    
    cart.forEach((item, index) => {
      const price = item.variation ? item.variation.price : item.product.price;
      const variationText = item.variation ? ` (${item.variation.name})` : '';
      
      message += `${index + 1}. ${item.quantity}x ${item.product.name}${variationText}\n`;
      message += `   💰 R$ ${(price * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += `💰 *Subtotal: R$ ${subtotal.toFixed(2)}*\n`;
    
    if (couponCode) {
      message += `🎟️ *Cupom aplicado:* ${couponCode}\n`;
    }
    
    message += `💳 *Total: R$ ${subtotal.toFixed(2)}*\n\n`;
    message += `🛒 Pedido feito através do catálogo online`;
    
    return encodeURIComponent(message);
  };

  const sendOrderToWhatsApp = async (couponCode?: string) => {
    // Validation
    if (!customerName.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }

    if (!customerPhone.trim()) {
      toast.error("Por favor, informe seu WhatsApp");
      return;
    }

    try {
      let finalTotal = calculateTotal();
      let appliedCoupon = null;

      // Se um cupom foi fornecido, aplicar o desconto
      if (couponCode && storeProfile?.user_id) {
        const { data: coupon, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', couponCode.toUpperCase())
          .eq('user_id', storeProfile.user_id)
          .eq('active', true)
          .maybeSingle();

        if (!couponError && coupon) {
          let discount = 0;
          if (coupon.discount_type === 'percentage') {
            discount = (finalTotal * coupon.discount_value) / 100;
          } else {
            discount = coupon.discount_value;
          }
          finalTotal = Math.max(0, finalTotal - discount);
          appliedCoupon = coupon;

          // Incrementar contador de uso do cupom
          await supabase
            .from('coupons')
            .update({ used_count: coupon.used_count + 1 })
            .eq('id', coupon.id);
        }
      }

      // Save order to database
      const orderData = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        total_amount: finalTotal,
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.variation ? item.variation.price : item.product.price,
          variation: item.variation || null
        })),
        user_id: storeProfile?.user_id,
        status: 'pending',
        coupon_code: appliedCoupon?.code || null
      };

      const { error: orderError } = await supabase
        .from('orders')
        .insert([orderData]);

      if (orderError) throw orderError;

      const phoneNumber = storeProfile?.phone || "5511999999999";
      const message = formatCartForWhatsApp(appliedCoupon?.code);
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
      
      setIsCheckoutOpen(false);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      toast.success("Pedido enviado com sucesso!");
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error("Erro ao salvar pedido, mas WhatsApp foi aberto");
      const phoneNumber = storeProfile?.phone || "5511999999999";
      const message = formatCartForWhatsApp(couponCode);
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
      setIsCheckoutOpen(false);
    }
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

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando loja...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light-gray/10 to-white relative">
      {/* Header with store name */}
      <CatalogHeader 
        storeName={storeProfile?.catalog_name}
        logoUrl={storeProfile?.logo_url}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.length}
        openMenu={openMenu}
        openCart={openCart}
      />
      
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isMenuOpen={isMenuOpen}
        closeMenu={closeMenu}
      />
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={closeCart}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        calculateTotal={calculateTotal}
        onCheckout={handleCheckout}
      />
      
      <CheckoutForm 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        onSubmit={sendOrderToWhatsApp}
        cartTotal={calculateTotal()}
        storeUserId={storeProfile?.user_id}
      />
      
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isProductDetailOpen}
          onClose={() => setIsProductDetailOpen(false)}
          onAddToCart={handleAddToCart}
        />
      )}
      
      <main className="container mx-auto px-4 py-8">
        <ProductGridImproved 
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          filteredProducts={filteredProducts}
          onProductClick={handleProductDetail}
          resetFilters={resetFilters}
        />
      </main>
      
      <CatalogFooter />
      
      <FloatingCartButton 
        cartItemsCount={cart.length}
        onClick={openCart}
      />
    </div>
  );
};

export default CatalogPage;

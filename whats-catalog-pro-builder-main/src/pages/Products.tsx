import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Package, 
  BarChart, 
  Tag, 
  MessageCircle, 
  ChevronDown,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Product } from "@/types/seller"; // Import Product type
import ProductCard from "@/components/ProductCard";
import AddProductForm from "@/components/AddProductForm";

const Products = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Mock products data
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Camiseta Estampada",
      description: "Camiseta com estampa exclusiva, material 100% algodão.",
      image: "",
      price: 59.90,
      variations: [
        { id: "1-1", name: "Tamanho P", price: 59.90 },
        { id: "1-2", name: "Tamanho M", price: 59.90 },
        { id: "1-3", name: "Tamanho G", price: 59.90 }
      ],
      in_stock: true,
      sales: 0
    },
    {
      id: "2",
      name: "Caneca Personalizada",
      description: "Caneca de cerâmica com impressão personalizada, capacidade 350ml.",
      image: "",
      price: 29.90,
      variations: [],
      in_stock: true,
      sales: 0
    },
    {
      id: "3",
      name: "Kit de Maquiagem",
      description: "Kit completo com sombras, batons e pincéis.",
      image: "",
      price: 89.90,
      variations: [],
      in_stock: true,
      sales: 0
    },
    {
      id: "4",
      name: "Tênis Esportivo",
      description: "Tênis confortável para corrida e academia.",
      image: "",
      price: 149.90,
      variations: [
        { id: "4-1", name: "Tamanho 38", price: 149.90 },
        { id: "4-2", name: "Tamanho 39", price: 149.90 },
        { id: "4-3", name: "Tamanho 40", price: 149.90 },
        { id: "4-4", name: "Tamanho 41", price: 149.90 }
      ],
      in_stock: false,
      sales: 0
    }
  ]);
  
  const handleAddProduct = (productData: any) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      sales: 0
    };
    
    setProducts([...products, newProduct]);
    setAddDialogOpen(false);
    toast.success("Produto adicionado com sucesso!");
  };
  
  const handleEditProduct = (productData: any) => {
    if (!selectedProduct) return;
    
    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id ? { ...productData, id: selectedProduct.id, sales: p.sales } : p
    );
    
    setProducts(updatedProducts);
    setEditDialogOpen(false);
    setSelectedProduct(null);
    toast.success("Produto atualizado com sucesso!");
  };
  
  const handleDeleteProduct = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      setProducts(products.filter(p => p.id !== id));
      toast.success("Produto excluído com sucesso!");
    }
  };
  
  const handleEditClick = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setSelectedProduct(product);
      setEditDialogOpen(true);
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-light-gray/20 flex">
      {/* Sidebar */}
      <div className="hidden md:block w-64 bg-white shadow-md">
        <div className="p-4 border-b border-brand-light-gray">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-brand-red" />
            <span className="font-semibold text-lg">
              WhatsCatalog<span className="text-brand-green">Pro</span>
            </span>
          </Link>
        </div>
        
        <div className="py-6 px-4">
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <BarChart className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/products" className="flex items-center space-x-3 text-brand-red font-medium p-3 rounded-md bg-brand-red/10">
              <Package className="h-5 w-5" />
              <span>Produtos</span>
            </Link>
            <Link to="/orders" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <ShoppingBag className="h-5 w-5" />
              <span>Pedidos</span>
            </Link>
            <Link to="/coupons" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <Tag className="h-5 w-5" />
              <span>Cupons</span>
            </Link>
            <Link to="/messages" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <MessageCircle className="h-5 w-5" />
              <span>Mensagens</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-brand-light-gray mt-auto">
          <Link to="/logout" className="flex items-center space-x-3 text-brand-gray hover:text-brand-red transition-colors p-3 rounded-md hover:bg-brand-red/5">
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-brand-red" />
            <span className="font-semibold text-lg">
              WhatsCatalog<span className="text-brand-green">Pro</span>
            </span>
          </Link>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-1 text-brand-gray"
          >
            <span>Menu</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="bg-white shadow-md">
            <nav className="p-4 space-y-3">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/products" 
                className="flex items-center space-x-3 text-brand-red font-medium p-2 rounded-md bg-brand-red/10"
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="h-5 w-5" />
                <span>Produtos</span>
              </Link>
              <Link 
                to="/orders" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Pedidos</span>
              </Link>
              <Link 
                to="/coupons" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Tag className="h-5 w-5" />
                <span>Cupons</span>
              </Link>
              <Link 
                to="/messages" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="h-5 w-5" />
                <span>Mensagens</span>
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </Link>
              <Link 
                to="/logout" 
                className="flex items-center space-x-3 text-brand-gray p-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 pt-20 md:pt-0">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-brand-gray">Produtos</h1>
              <p className="text-brand-gray/70">Gerencie os produtos do seu catálogo</p>
            </div>
            
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-brand-green hover:bg-brand-green/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Produto</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do produto para adicioná-lo ao seu catálogo.
                  </DialogDescription>
                </DialogHeader>
                <AddProductForm 
                  onSubmit={handleAddProduct}
                  onCancel={() => setAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Produto</DialogTitle>
                  <DialogDescription>
                    Atualize os detalhes do produto.
                  </DialogDescription>
                </DialogHeader>
                {selectedProduct && (
                  <AddProductForm 
                    initialData={selectedProduct}
                    onSubmit={handleEditProduct}
                    onCancel={() => {
                      setEditDialogOpen(false);
                      setSelectedProduct(null);
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray/50 h-4 w-4" />
                <Input
                  placeholder="Procurar produtos..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="border-brand-light-gray">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Filtrar</span>
                </Button>
                <Button variant="outline" className="border-brand-light-gray">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ordenar</span>
                </Button>
                <div className="border border-brand-light-gray rounded-md flex">
                  <button
                    className={`p-2 ${viewMode === 'grid' ? 'bg-brand-light-gray/30 text-brand-red' : 'text-brand-gray'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    className={`p-2 ${viewMode === 'list' ? 'bg-brand-light-gray/30 text-brand-red' : 'text-brand-gray'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products List */}
          {filteredProducts.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  {viewMode === 'grid' ? (
                    <ProductCard 
                      product={product} 
                      viewMode="admin"
                      onEdit={handleEditClick}
                      onDelete={handleDeleteProduct}
                    />
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-brand-light-gray p-4 flex">
                      <div className="w-24 h-24 bg-brand-light-gray/30 rounded-md flex-shrink-0 mr-4">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-brand-gray/30" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-brand-gray">{product.name}</h3>
                          <p className="font-medium text-brand-green">R$ {product.price.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-brand-gray/70 mb-2 line-clamp-1">{product.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {product.variations.length > 0 && (
                            <span className="text-xs bg-brand-light-gray/50 px-2 py-1 rounded">
                              {product.variations.length} variações
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            product.in_stock 
                              ? 'bg-brand-green/10 text-brand-green' 
                              : 'bg-brand-red/10 text-brand-red'
                          }`}>
                            {product.in_stock ? 'Em estoque' : 'Esgotado'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                          onClick={() => handleEditClick(product.id)}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-brand-red text-brand-red hover:bg-brand-red hover:text-white"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Package className="h-12 w-12 text-brand-gray/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-brand-gray mb-2">Nenhum produto encontrado</h3>
              <p className="text-brand-gray/70 mb-6">
                {searchQuery 
                  ? `Não encontramos produtos para "${searchQuery}". Tente outros termos.` 
                  : "Você ainda não cadastrou nenhum produto no seu catálogo."}
              </p>
              
              <Button 
                onClick={() => setAddDialogOpen(true)}
                className="bg-brand-green hover:bg-brand-green/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;

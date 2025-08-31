import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Percent, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CouponFormModal from "./CouponFormModal";
import DeleteCouponModal from "./DeleteCouponModal";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  active: boolean;
  created_at: string;
}

const CouponsTab = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons((data || []).map(coupon => ({
        ...coupon,
        discount_type: coupon.discount_type as "percentage" | "fixed"
      })));
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Erro ao carregar cupons");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setIsFormModalOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCoupon = async (couponData: any) => {
    try {
      const dbCoupon = {
        code: couponData.code.toUpperCase(),
        discount_type: couponData.discountType,
        discount_value: couponData.discountValue,
        min_order_amount: couponData.minOrderAmount || null,
        usage_limit: couponData.usageLimit || null,
        expires_at: couponData.expiresAt || null,
        active: couponData.active,
        user_id: user?.id
      };

      if (selectedCoupon) {
        // Update existing coupon
        const { error } = await supabase
          .from("coupons")
          .update(dbCoupon)
          .eq("id", selectedCoupon.id);

        if (error) throw error;
        toast.success("Cupom atualizado com sucesso!");
      } else {
        // Create new coupon
        const { error } = await supabase
          .from("coupons")
          .insert([dbCoupon]);

        if (error) throw error;
        toast.success("Cupom criado com sucesso!");
      }
      
      fetchCoupons();
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Erro ao salvar cupom");
    }
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;

    try {
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", couponToDelete.id);

      if (error) throw error;

      setCoupons(coupons.filter(c => c.id !== couponToDelete.id));
      toast.success("Cupom excluído com sucesso!");
      setIsDeleteModalOpen(false);
      setCouponToDelete(null);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Erro ao excluir cupom");
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}%`;
    } else {
      return `R$ ${coupon.discount_value.toFixed(2)}`;
    }
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expires_at) return false;
    return new Date(coupon.expires_at) < new Date();
  };

  const isUsageLimitReached = (coupon: Coupon) => {
    if (!coupon.usage_limit) return false;
    return coupon.used_count >= coupon.usage_limit;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:justify-between md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-brand-gray">Cupons de Desconto</h2>
            <p className="text-sm text-brand-gray/70">Gerencie seus cupons de desconto</p>
          </div>
          
          <Button 
            className="bg-[#2E8B57] hover:bg-[#2E8B57]/90 w-full md:w-auto"
            onClick={handleAddCoupon}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cupom
          </Button>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <Card 
            key={coupon.id} 
            className={`overflow-hidden hover:shadow-md transition-all hover:scale-[1.02] ${
              !coupon.active || isExpired(coupon) || isUsageLimitReached(coupon) ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-brand-gray">
                    {coupon.code}
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-[#2E8B57] mt-1">
                    {formatDiscount(coupon)}
                  </CardDescription>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-7 w-7 bg-white hover:bg-[#2E8B57] hover:text-white text-[#2E8B57] border-[#2E8B57]"
                    onClick={() => handleEditCoupon(coupon)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-7 w-7 bg-white hover:bg-[#B70404] hover:text-white text-[#B70404] border-[#B70404]"
                    onClick={() => handleDeleteClick(coupon)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Status badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {!coupon.active && (
                  <Badge variant="destructive">Desativado</Badge>
                )}
                {isExpired(coupon) && (
                  <Badge variant="destructive">Expirado</Badge>
                )}
                {isUsageLimitReached(coupon) && (
                  <Badge variant="destructive">Limite atingido</Badge>
                )}
                {coupon.active && !isExpired(coupon) && !isUsageLimitReached(coupon) && (
                  <Badge variant="default" className="bg-[#2E8B57]">Ativo</Badge>
                )}
              </div>

              {/* Coupon details */}
              <div className="space-y-2 text-sm">
                {coupon.min_order_amount && (
                  <div className="flex items-center gap-2 text-brand-gray/70">
                    <Percent className="h-4 w-4" />
                    <span>Pedido mínimo: R$ {coupon.min_order_amount.toFixed(2)}</span>
                  </div>
                )}
                
                {coupon.usage_limit && (
                  <div className="flex items-center gap-2 text-brand-gray/70">
                    <Users className="h-4 w-4" />
                    <span>Usos: {coupon.used_count}/{coupon.usage_limit}</span>
                  </div>
                )}
                
                {coupon.expires_at && (
                  <div className="flex items-center gap-2 text-brand-gray/70">
                    <Calendar className="h-4 w-4" />
                    <span>Expira: {new Date(coupon.expires_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Empty state */}
      {coupons.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Percent className="h-12 w-12 mx-auto text-brand-gray/40 mb-3" />
          <h3 className="text-lg font-medium text-brand-gray">Nenhum cupom encontrado</h3>
          <p className="text-sm text-brand-gray/70 mt-1 mb-4">
            Comece criando seu primeiro cupom de desconto
          </p>
          <Button 
            onClick={handleAddCoupon}
            className="bg-[#2E8B57] hover:bg-[#2E8B57]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cupom
          </Button>
        </div>
      )}
      
      {/* Coupon Form Modal */}
      <CouponFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveCoupon}
        coupon={selectedCoupon}
      />
      
      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <DeleteCouponModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          couponCode={couponToDelete.code}
        />
      )}
    </>
  );
};

export default CouponsTab;
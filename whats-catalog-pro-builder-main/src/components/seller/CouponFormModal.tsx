import { useState, useEffect, ChangeEvent } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CouponFormData {
  id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  usageLimit?: number;
  expiresAt?: string;
  active: boolean;
}

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (coupon: CouponFormData) => void;
  coupon?: any;
}

const CouponFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  coupon 
}: CouponFormModalProps) => {
  const defaultCoupon: CouponFormData = {
    code: "",
    discountType: "percentage",
    discountValue: 0,
    active: true
  };

  const [formData, setFormData] = useState<CouponFormData>(coupon || defaultCoupon);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (coupon) {
      setFormData({
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        minOrderAmount: coupon.min_order_amount || undefined,
        usageLimit: coupon.usage_limit || undefined,
        expiresAt: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : undefined,
        active: coupon.active
      });
    } else {
      setFormData(defaultCoupon);
    }
    setErrors({});
  }, [coupon, isOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;
    
    if (type === "number") {
      parsedValue = value ? parseFloat(value) : 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      discountType: value as "percentage" | "fixed"
    }));
  };

  const handleActiveToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.code.trim()) {
      newErrors.code = "Código do cupom é obrigatório";
    } else if (formData.code.length < 3) {
      newErrors.code = "Código deve ter pelo menos 3 caracteres";
    }
    
    if (formData.discountValue <= 0) {
      newErrors.discountValue = "Valor do desconto deve ser maior que zero";
    }
    
    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      newErrors.discountValue = "Desconto percentual não pode ser maior que 100%";
    }
    
    if (formData.minOrderAmount && formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = "Valor mínimo do pedido deve ser positivo";
    }
    
    if (formData.usageLimit && formData.usageLimit < 1) {
      newErrors.usageLimit = "Limite de uso deve ser pelo menos 1";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-[#2E8B57] text-white p-4 -mx-6 -mt-6 rounded-t-lg">
          <DialogTitle className="text-xl font-bold">
            {coupon ? "Editar Cupom" : "Novo Cupom"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-medium text-md border-b pb-2">Informações do Cupom</h3>
            
            <div className="space-y-2">
              <Label htmlFor="code" className="font-medium">
                Código do Cupom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Ex: DESCONTO10"
                className={errors.code ? "border-red-500" : ""}
                maxLength={20}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && (
                <p className="text-red-500 text-sm">{errors.code}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">Tipo de Desconto</Label>
                <Select value={formData.discountType} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discountValue" className="font-medium">
                  Valor do Desconto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === "percentage" ? "10" : "50.00"}
                  className={errors.discountValue ? "border-red-500" : ""}
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  step={formData.discountType === "percentage" ? "1" : "0.01"}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-sm">{errors.discountValue}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount" className="font-medium">
                Valor Mínimo do Pedido (opcional)
              </Label>
              <Input
                id="minOrderAmount"
                name="minOrderAmount"
                type="number"
                value={formData.minOrderAmount || ''}
                onChange={handleInputChange}
                placeholder="Ex: 100.00"
                className={errors.minOrderAmount ? "border-red-500" : ""}
                min="0"
                step="0.01"
              />
              {errors.minOrderAmount && (
                <p className="text-red-500 text-sm">{errors.minOrderAmount}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit" className="font-medium">
                  Limite de Uso (opcional)
                </Label>
                <Input
                  id="usageLimit"
                  name="usageLimit"
                  type="number"
                  value={formData.usageLimit || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 100"
                  className={errors.usageLimit ? "border-red-500" : ""}
                  min="1"
                />
                {errors.usageLimit && (
                  <p className="text-red-500 text-sm">{errors.usageLimit}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiresAt" className="font-medium">
                  Data de Expiração (opcional)
                </Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="date"
                  value={formData.expiresAt || ''}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch 
                id="active-status" 
                checked={formData.active}
                onCheckedChange={handleActiveToggle}
              />
              <Label htmlFor="active-status" className="font-medium">
                Cupom Ativo
              </Label>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {formData.active ? "Cupom disponível" : "Cupom indisponível"}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2 sm:space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            style={{ backgroundColor: "#B70404" }}
            className="hover:bg-[#B70404]/90 text-white"
          >
            Salvar Cupom
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CouponFormModal;
export interface Variation {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface VariationOption {
  id: string;
  variation_id: string;
  name: string;
  price_adjustment: number;
  created_at: string;
}

export interface ProductVariationLink {
  id: string;
  product_id: string;
  variation_id: string;
  option_id: string;
  created_at: string;
}

export interface VariationWithOptions extends Variation {
  options: VariationOption[];
}

export interface ProductVariationData {
  variation: Variation;
  option: VariationOption;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  storeCover: string;
  products: Product[];
}

export interface ProductVariation {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  variations: ProductVariation[]; // Changed from optional to required
  in_stock: boolean;
  category?: string;
  sales: number;
  averageRating?: number;
  reviewCount?: number;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
}

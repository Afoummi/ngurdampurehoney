import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  size: string | null;
  package_size: string | null;
  container_type: string | null;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CONTAINER_TYPES = [
  "Square Handle Bottle",
  "Classic Round Bottle",
  "Glass Jar",
  "Plastic Jar",
  "Squeeze Bottle",
  "Gift Pack",
] as const;

export const PACKAGE_SIZES = [
  "250 ml",
  "500 ml",
  "1 Litre",
  "2 Litres",
  "5 Litres",
  "10 Litres",
  "20 Litres",
] as const;

export async function fetchProducts(limit = 12): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return (data as Product[]) || [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data as Product | null;
}

export function formatPrice(amount: number, currency = "NGN"): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString()}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

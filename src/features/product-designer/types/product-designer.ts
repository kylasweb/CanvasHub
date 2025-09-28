export interface ProductTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category: 'album' | 'print' | 'merchandise' | 'digital';
  thumbnail_url: string;
  preview_url: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'in' | 'cm' | 'mm';
  };
  price: number;
  is_active: boolean;
  settings: TemplateSettings;
  created_at: Date;
  updated_at: Date;
}

export interface TemplateSettings {
  allow_custom_layout: boolean;
  min_photos: number;
  max_photos: number;
  default_spacing: number;
  default_margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  available_customizations: CustomizationOption[];
}

export interface ProductDesign {
  id: string;
  tenant_id: string;
  template_id: string;
  client_id: string;
  name: string;
  description?: string;
  photos: string[];
  layout: LayoutSettings;
  customizations: CustomizationOption[];
  status: 'draft' | 'pending_review' | 'approved' | 'in_production' | 'completed';
  price: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface LayoutSettings {
  rows: number;
  cols: number;
  spacing: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'cover' | 'paper' | 'finish' | 'binding' | 'size' | 'other';
  value: string;
  price_impact?: number;
  options?: CustomizationOption[];
}

export interface ProductOrder {
  id: string;
  tenant_id: string;
  client_id: string;
  template_id: string;
  design_id?: string;
  items: OrderItem[];
  status: 'cart' | 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
  shipping_address?: Address;
  order_date: Date;
  estimated_delivery?: Date;
  tracking_number?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  specifications?: Record<string, any>;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface DesignAnalytics {
  template_id: string;
  total_designs: number;
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  conversion_rate: number;
  average_order_value: number;
  last_activity: Date;
}
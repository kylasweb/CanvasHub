"use client";

import ProductDesigner from '@/features/product-designer/components/ProductDesigner';

export default function Products() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Designer</h1>
        <p className="text-muted-foreground">
          Create and design custom products
        </p>
      </div>
      <ProductDesigner />
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { InvoiceService } from '../services/invoice-service';
import { Invoice, InvoiceFilters } from '../types';

export function useInvoices(filters?: InvoiceFilters) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // For demo purposes, we'll use a mock tenant ID
      // In a real app, this would come from the auth context
      const tenantId = 'demo-tenant-id';
      const invoiceList = await InvoiceService.getInstance().getInvoices(tenantId, filters);

      setInvoices(invoiceList);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  return {
    invoices,
    loading,
    error,
    refetch: loadInvoices
  };
}
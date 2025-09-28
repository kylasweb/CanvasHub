export interface Invoice {
  id: string;
  tenantId: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  description?: string;
  items: InvoiceItem[];
  totalAmount: number;
  dueDate: Date;
  issueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  clientName: string;
  clientEmail: string;
  clientAddress?: Address;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface InvoiceFormData {
  clientId: string;
  projectId?: string;
  amount: number;
  dueDate: Date;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
}

export interface InvoiceFilters {
  search?: string;
  clientId?: string;
  projectId?: string;
  status?: Invoice['status'];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface InvoiceStats {
  total: number;
  paid: number;
  sent: number;
  overdue: number;
  draft: number;
  totalAmount: number;
  paidAmount: number;
  overdueAmount: number;
  averageInvoiceValue: number;
  topClients: Array<{ clientId: string; clientName: string; revenue: number }>;
}

export interface Payment {
  id?: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
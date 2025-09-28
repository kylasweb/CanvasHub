import { firestoreService } from '@/lib/firebase';
import { Invoice, InvoiceItem, InvoiceFilters, InvoiceStats } from '../types';
import { Timestamp } from 'firebase/firestore';

export class InvoiceService {
  private static instance: InvoiceService;

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  async getInvoices(tenantId: string, filters?: InvoiceFilters): Promise<Invoice[]> {
    try {
      const baseFilters = [{ field: 'tenantId', operator: '==', value: tenantId }];

      if (filters?.status) {
        baseFilters.push({ field: 'status', operator: '==', value: filters.status });
      }

      if (filters?.clientId) {
        baseFilters.push({ field: 'clientId', operator: '==', value: filters.clientId });
      }

      if (filters?.dateFrom) {
        baseFilters.push({ field: 'invoiceDate', operator: '>=', value: Timestamp.fromDate(filters.dateFrom) as any });
      }

      if (filters?.dateTo) {
        baseFilters.push({ field: 'invoiceDate', operator: '<=', value: Timestamp.fromDate(filters.dateTo) as any });
      }

      const invoices = await firestoreService.readAll('invoices', baseFilters) as Invoice[];

      // Client-side filtering for search
      let filteredInvoices = invoices;

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredInvoices = filteredInvoices.filter(invoice =>
          (invoice.invoiceNumber?.toLowerCase() || '').includes(searchLower) ||
          (invoice.description?.toLowerCase() || '').includes(searchLower) ||
          (invoice.clientName?.toLowerCase() || '').includes(searchLower)
        );
      }

      return filteredInvoices as Invoice[];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoice(tenantId: string, invoiceId: string): Promise<Invoice | null> {
    try {
      const invoice = await firestoreService.read('invoices', invoiceId);
      return invoice as Invoice;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async createInvoice(tenantId: string, invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const invoice: Omit<Invoice, 'id'> = {
        ...invoiceData,
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      };

      const invoiceId = await firestoreService.create('invoices', invoice);
      return invoiceId;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async updateInvoice(tenantId: string, invoiceId: string, invoiceData: Partial<Invoice>): Promise<void> {
    try {
      await firestoreService.update('invoices', invoiceId, {
        ...invoiceData,
        updatedAt: new Date() as any
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<void> {
    try {
      await firestoreService.update('invoices', invoiceId, {
        status: status,
        updatedAt: new Date() as any
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  async deleteInvoice(tenantId: string, invoiceId: string): Promise<void> {
    try {
      // In a real app, you might want to soft delete instead of hard delete
      console.log('Deleting invoice:', invoiceId);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  async addInvoiceItem(invoiceId: string, itemData: Omit<InvoiceItem, 'id'>): Promise<string> {
    try {
      const item: InvoiceItem = {
        ...itemData,
        id: `item-${Date.now()}`
      };

      const invoice = await this.getInvoice('', invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const updatedItems = [...invoice.items, item];
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

      await this.updateInvoice('', invoiceId, {
        items: updatedItems,
        totalAmount: newTotal
      });

      return item.id;
    } catch (error) {
      console.error('Error adding invoice item:', error);
      throw error;
    }
  }

  async removeInvoiceItem(invoiceId: string, itemId: string): Promise<void> {
    try {
      const invoice = await this.getInvoice('', invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const updatedItems = invoice.items.filter(item => item.id !== itemId);
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

      await this.updateInvoice('', invoiceId, {
        items: updatedItems,
        totalAmount: newTotal
      });
    } catch (error) {
      console.error('Error removing invoice item:', error);
      throw error;
    }
  }

  async sendInvoice(invoiceId: string): Promise<void> {
    try {
      await this.updateInvoiceStatus(invoiceId, 'sent');
      // In a real app, this would trigger an email service
      console.log('Sending invoice:', invoiceId);
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  async generateInvoicePDF(invoiceId: string): Promise<string> {
    try {
      // In a real app, this would generate an actual PDF
      // For now, we'll return a mock URL
      const pdfUrl = `https://api.example.com/invoices/${invoiceId}/pdf`;
      console.log('Generating PDF for invoice:', invoiceId);
      return pdfUrl;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  async getInvoiceStats(tenantId: string): Promise<InvoiceStats> {
    try {
      const invoices = await this.getInvoices(tenantId);

      const stats: InvoiceStats = {
        total: invoices.length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        sent: invoices.filter(inv => inv.status === 'sent').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length,
        draft: invoices.filter(inv => inv.status === 'draft').length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0),
        overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0),
        averageInvoiceValue: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / invoices.length : 0,
        topClients: [] // This would require more complex aggregation in a real app
      };

      return stats;
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      throw error;
    }
  }

  generateInvoiceNumber(tenantId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${tenantId.slice(0, 4)}-${year}${month}-${random}`;
  }
}
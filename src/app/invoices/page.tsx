"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Download,
  Send,
  Eye,
  DollarSign,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock invoice data
const mockInvoices = [
  {
    id: 'INV-001',
    clientId: '1',
    clientName: 'Acme Corp',
    project: 'Website Redesign',
    amount: 15000,
    status: 'paid',
    issueDate: '2024-01-01',
    dueDate: '2024-01-15',
    paidDate: '2024-01-10',
    items: [
      { description: 'Design Services', quantity: 40, rate: 100, amount: 4000 },
      { description: 'Development', quantity: 80, rate: 125, amount: 10000 },
      { description: 'Project Management', quantity: 10, rate: 100, amount: 1000 }
    ],
    notes: 'Payment received via bank transfer'
  },
  {
    id: 'INV-002',
    clientId: '2',
    clientName: 'Tech Solutions',
    project: 'Mobile App Development',
    amount: 25000,
    status: 'pending',
    issueDate: '2024-01-05',
    dueDate: '2024-01-20',
    paidDate: null,
    items: [
      { description: 'UI/UX Design', quantity: 60, rate: 150, amount: 9000 },
      { description: 'iOS Development', quantity: 100, rate: 120, amount: 12000 },
      { description: 'Android Development', quantity: 100, rate: 120, amount: 4000 }
    ],
    notes: 'Awaiting client approval'
  },
  {
    id: 'INV-003',
    clientId: '3',
    clientName: 'Startup Inc',
    project: 'Brand Identity Package',
    amount: 5000,
    status: 'overdue',
    issueDate: '2023-12-01',
    dueDate: '2023-12-15',
    paidDate: null,
    items: [
      { description: 'Logo Design', quantity: 20, rate: 100, amount: 2000 },
      { description: 'Brand Guidelines', quantity: 15, rate: 100, amount: 1500 },
      { description: 'Business Cards', quantity: 5, rate: 100, amount: 1500 }
    ],
    notes: 'Payment overdue - follow up required'
  }
];

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' }
];

export default function Invoices() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddInvoice = (invoiceData: any) => {
    const newInvoice = {
      ...invoiceData,
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      status: 'draft',
      paidDate: null
    };
    setInvoices([...invoices, newInvoice]);
    setIsAddDialogOpen(false);
    toast({
      title: "Invoice Created",
      description: `Invoice ${newInvoice.id} has been created successfully.`,
    });
  };

  const handleEditInvoice = (invoiceData: any) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === invoiceData.id ? invoiceData : invoice
    ));
    setEditingInvoice(null);
    toast({
      title: "Invoice Updated",
      description: `Invoice ${invoiceData.id} has been updated successfully.`,
    });
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
    toast({
      title: "Invoice Deleted",
      description: "Invoice has been removed successfully.",
    });
  };

  const handleSendInvoice = (invoiceId: string) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, status: 'pending' } : invoice
    ));
    toast({
      title: "Invoice Sent",
      description: `Invoice ${invoiceId} has been sent to the client.`,
    });
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === invoiceId ? { 
        ...invoice, 
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0]
      } : invoice
    ));
    toast({
      title: "Invoice Paid",
      description: `Invoice ${invoiceId} has been marked as paid.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    const variant = status === 'paid' ? 'default' : 
                   status === 'overdue' ? 'destructive' : 
                   status === 'pending' ? 'secondary' : 'outline';
    return (
      <Badge variant={variant} className="text-xs">
        {statusOption?.label || status}
      </Badge>
    );
  };

  const InvoiceForm = ({ invoice, onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState(invoice || {
      clientId: '',
      clientName: '',
      project: '',
      amount: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const addItem = () => {
      setFormData({
        ...formData,
        items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
      });
    };

    const removeItem = (index: number) => {
      setFormData({
        ...formData,
        items: formData.items.filter((_: any, i: number) => i !== index)
      });
    };

    const updateItem = (index: number, field: string, value: any) => {
      const updatedItems = formData.items.map((item: any, i: number) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      });
      
      const total = updatedItems.reduce((sum: number, item: any) => sum + item.amount, 0);
      setFormData({ ...formData, items: updatedItems, amount: total });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="project">Project</Label>
            <Input
              id="project"
              value={formData.project}
              onChange={(e) => setFormData({...formData, project: e.target.value})}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="issueDate">Issue Date *</Label>
            <Input
              id="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Invoice Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
          <div className="space-y-2">
            {formData.items.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Rate</Label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs">Amount</Label>
                  <Input value={`$${item.amount}`} readOnly />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <Label className="text-lg font-semibold">Total Amount</Label>
            <p className="text-2xl font-bold">${formData.amount.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes or payment terms..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your billing and payments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Create a new invoice for your client
              </DialogDescription>
            </DialogHeader>
            <InvoiceForm
              onSubmit={handleAddInvoice}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{invoices.filter(i => i.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{invoices.filter(i => i.status === 'paid').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${invoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>View and manage all your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{invoice.project}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingInvoice(invoice)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
                          window.open(pdfUrl, '_blank');
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={() => setEditingInvoice(invoice)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Invoice</DialogTitle>
                              <DialogDescription>
                                Update invoice information
                              </DialogDescription>
                            </DialogHeader>
                            <InvoiceForm
                              invoice={editingInvoice}
                              onSubmit={handleEditInvoice}
                              onCancel={() => setEditingInvoice(null)}
                            />
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice View Dialog */}
      <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice {viewingInvoice?.id}</DialogTitle>
            <DialogDescription>
              {viewingInvoice?.project} - {viewingInvoice?.clientName}
            </DialogDescription>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{new Date(viewingInvoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(viewingInvoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(viewingInvoice.status)}
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-lg">${viewingInvoice.amount.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Invoice Items</p>
                <div className="space-y-2">
                  {viewingInvoice.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} qty × ${item.rate}</p>
                      </div>
                      <p className="font-medium">${item.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {viewingInvoice.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{viewingInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Customer {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'GPay' | 'Cash';
  reference?: string;
  notes?: string;
  invoiceNumber?: string;
  screenshot?: string; // Base64 encoded image for GPay payments
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  
  // Buyer Information (Customer)
  customerId?: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Totals
  total: number;
  
  // Payment tracking
  payments: Payment[];
  amountPaid: number;
  balance: number;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  
  // Additional
  notes?: string;
  terms?: string;
}

# Safetex Invoice Generator - Features

## Overview
A React-based invoice generator specifically designed for Safetex Enterprises with customer management and PDF export capabilities.

## Key Features

### 1. Fixed Seller Information
The seller information is hardcoded and always displays:
- **Company Name:** Safetex Enterprises
- **Address:** No. 167, Sri Ram Samaj Nagar, 1st Main Road, Vellanur, Avadi, Chennai Tamil Nadu 600062, India
- **Phone:** 9164103412
- **Email:** marketing@safetexindia.com

### 2. Customer Database
- **Add New Customers:** Click "Add New Customer" button to add customers to the database
- **Customer Fields:**
  - Customer Name (required)
  - Full Address (required)
  - Phone Number (required)
  - Email (optional)
- **Storage:** Customers are stored in browser's localStorage
- **Select Customers:** Dropdown to quickly select existing customers for invoices
- **Persistent Data:** Customer data persists across sessions

### 3. Invoice Features
- **No Tax Calculations:** Tax has been completely removed from invoices
- **Simple Total:** Total = Sum of all line items
- **Line Items:** Add multiple products/services with:
  - Description
  - Quantity
  - Rate
  - Auto-calculated Amount
- **Invoice Details:**
  - Auto-generated invoice number
  - Invoice date
  - Due date
  - Notes
  - Terms & Conditions

### 4. PDF Export
- Professional PDF generation with jsPDF
- Includes Safetex branding
- Customer details
- Itemized list
- Total amount
- Notes and terms

### 5. User Interface
- **Edit Mode:** Form to create/edit invoices
- **Preview Mode:** See invoice before downloading
- **Customer Modal:** Popup to add new customers
- **Responsive Design:** Works on desktop and mobile

## Technical Details

### Data Storage
- **Customer Database:** Browser localStorage (`safetex_customers` key)
- **Format:** JSON array of customer objects

### Customer Object Structure
```typescript
{
  id: string,
  name: string,
  address: string,
  phone: string,
  email?: string
}
```

### Invoice Object Structure
```typescript
{
  invoiceNumber: string,
  invoiceDate: string,
  dueDate: string,
  customerId?: string,
  buyerName: string,
  buyerAddress: string,
  buyerPhone: string,
  buyerEmail?: string,
  items: InvoiceItem[],
  total: number,
  notes?: string,
  terms?: string
}
```

## Usage Instructions

1. **Start the App:**
   ```bash
   npm run dev
   ```

2. **Add a Customer:**
   - Click "Add New Customer" button
   - Fill in customer details
   - Click "Add Customer"

3. **Create an Invoice:**
   - Select a customer from dropdown (or enter manually)
   - Add invoice items
   - Fill in notes/terms if needed
   - Click "Preview" to review
   - Click "Download PDF" to export

4. **Manage Customers:**
   - All customers are saved automatically
   - Select from dropdown for quick access
   - Customer data persists in browser

## Files Modified/Created

### New Files:
- `src/components/CustomerModal.tsx` - Customer add/edit modal
- `src/utils/customerStorage.ts` - LocalStorage management
- `SAFETEX_FEATURES.md` - This documentation

### Modified Files:
- `src/types/invoice.ts` - Updated types
- `src/components/InvoiceForm.tsx` - Added customer selection
- `src/components/InvoicePreview.tsx` - Removed tax, added Safetex info
- `src/components/InvoiceGenerator.tsx` - Updated initial state
- `src/utils/pdfGenerator.ts` - Removed tax, added Safetex info

## Future Enhancements (Optional)
- Edit existing customers
- Delete customers
- Search/filter customers
- Export customer list
- Invoice history
- Multiple invoice templates

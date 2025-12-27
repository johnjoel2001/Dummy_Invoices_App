# Dummy Invoice Generator

A modern React application for generating professional-looking dummy invoices with PDF export functionality.

## Features

- ✨ Modern, responsive UI built with React and TailwindCSS
- 📝 Easy-to-use invoice form with real-time calculations
- 👁️ Live preview of invoices before downloading
- 📥 PDF export functionality using jsPDF
- 🎨 Beautiful gradient design with smooth animations
- 💼 Professional invoice layout
- 🔢 Automatic tax calculations
- 📋 Multiple line items support
- 📱 Mobile-friendly responsive design

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **jsPDF** - PDF generation
- **Lucide React** - Icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Fill in the invoice details (invoice number, dates)
2. Enter seller (your company) information
3. Enter buyer (client) information
4. Add line items with descriptions, quantities, and rates
5. Set tax rate if applicable
6. Add notes and terms & conditions
7. Click "Preview" to see the invoice
8. Click "Download PDF" to export as PDF

## Project Structure

```
src/
├── components/
│   ├── InvoiceGenerator.tsx  # Main component
│   ├── InvoiceForm.tsx        # Form for editing invoice
│   └── InvoicePreview.tsx     # Preview component
├── types/
│   └── invoice.ts             # TypeScript interfaces
├── utils/
│   └── pdfGenerator.ts        # PDF generation logic
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
└── index.css                  # Global styles
```

## License

MIT

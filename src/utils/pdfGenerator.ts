import jsPDF from 'jspdf'
import { InvoiceData } from '../types/invoice'

export const generatePDF = (invoiceData: InvoiceData) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  
  // Set font
  doc.setFont('helvetica')
  
  // Header Section
  let y = 30
  
  // Left: INVOICE title and number
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', margin, y)
  
  // Invoice number - always bold and visible
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`#${invoiceData.invoiceNumber || ''}`, margin, y + 8)
  
  // Right: Dates
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('INVOICE DATE', pageWidth - margin, y - 5, { align: 'right' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(new Date(invoiceData.invoiceDate).toLocaleDateString(), pageWidth - margin, y + 1, { align: 'right' })
  
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('DUE DATE', pageWidth - margin, y + 9, { align: 'right' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(new Date(invoiceData.dueDate).toLocaleDateString(), pageWidth - margin, y + 15, { align: 'right' })
  
  // Horizontal line under header
  y += 28
  doc.setLineWidth(1)
  doc.setDrawColor(0, 0, 0)
  doc.line(margin, y, pageWidth - margin, y)
  
  // FROM and BILL TO Section
  y += 15
  const leftCol = margin
  const rightCol = pageWidth / 2 + 5
  
  // FROM
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)
  doc.text('FROM', leftCol, y)
  
  y += 7
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Safetex Enterprises', leftCol, y)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  y += 6
  doc.text('No. 167, Sri Ram Samaj Nagar, 1st Main Road', leftCol, y)
  y += 5
  doc.text('Vellanur, Avadi', leftCol, y)
  y += 5
  doc.text('Chennai Tamil Nadu 600062', leftCol, y)
  y += 5
  doc.text('India', leftCol, y)
  y += 8
  doc.text('9164103412', leftCol, y)
  y += 5
  doc.text('marketing@safetexindia.com', leftCol, y)
  
  // BILL TO
  let buyerY = y - 46 // Reset to same starting position as FROM
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)
  doc.text('BILL TO', rightCol, buyerY)
  
  buyerY += 7
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(invoiceData.buyerName, rightCol, buyerY)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  buyerY += 6
  
  // Split address into lines
  const addressLines = doc.splitTextToSize(invoiceData.buyerAddress, 85)
  addressLines.forEach((line: string) => {
    doc.text(line, rightCol, buyerY)
    buyerY += 5
  })
  
  buyerY += 3
  doc.text(invoiceData.buyerPhone, rightCol, buyerY)
  if (invoiceData.buyerEmail) {
    buyerY += 5
    doc.text(invoiceData.buyerEmail, rightCol, buyerY)
  }
  
  // Items Table
  y += 20
  
  // Table Header
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(50, 50, 50)
  
  doc.text('DESCRIPTION', margin, y)
  doc.text('QTY', pageWidth - 115, y, { align: 'center' })
  doc.text('RATE', pageWidth - 70, y, { align: 'right' })
  doc.text('AMOUNT', pageWidth - margin, y, { align: 'right' })
  
  // Header underline
  doc.setLineWidth(1)
  doc.setDrawColor(0, 0, 0)
  doc.line(margin, y + 3, pageWidth - margin, y + 3)
  
  y += 12
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  
  // Table Rows
  invoiceData.items.forEach((item, index) => {
    // Left-align description
    doc.text(item.description.substring(0, 50), margin, y)
    doc.text(item.quantity.toString(), pageWidth - 115, y, { align: 'center' })
    doc.text(`Rs.${item.rate.toFixed(2)}`, pageWidth - 70, y, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(`Rs.${item.amount.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    
    y += 10
    
    // Light row separator
    if (index < invoiceData.items.length - 1) {
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(margin, y - 3, pageWidth - margin, y - 3)
    }
    
    // Add new page if needed
    if (y > 250) {
      doc.addPage()
      y = 20
    }
  })
  
  // Total Section (right-aligned)
  y += 15
  const totalBoxX = pageWidth - 90
  
  // Subtotal
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text('Subtotal', totalBoxX, y)
  doc.setFont('helvetica', 'bold')
  doc.text(`Rs.${invoiceData.total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
  
  // Light separator
  y += 4
  doc.setLineWidth(0.5)
  doc.setDrawColor(180, 180, 180)
  doc.line(totalBoxX, y, pageWidth - margin, y)
  
  y += 10
  
  // Total Amount (bold and larger)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Amount', totalBoxX, y)
  doc.text(`Rs.${invoiceData.total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
  
  // Bold separator above total
  doc.setLineWidth(1)
  doc.setDrawColor(0, 0, 0)
  doc.line(totalBoxX, y - 6, pageWidth - margin, y - 6)
  
  // Notes and Terms Section
  if (invoiceData.notes || invoiceData.terms) {
    y += 25
    
    // Top border
    doc.setLineWidth(0.5)
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, y, pageWidth - margin, y)
    
    y += 12
    
    const notesX = margin
    const termsX = pageWidth / 2 + 5
    
    if (invoiceData.notes) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(50, 50, 50)
      doc.text('NOTES', notesX, y)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      const notesLines = doc.splitTextToSize(invoiceData.notes, 85)
      doc.text(notesLines, notesX, y + 6)
    }
    
    if (invoiceData.terms) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(50, 50, 50)
      doc.text('TERMS & CONDITIONS', termsX, y)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      const termsLines = doc.splitTextToSize(invoiceData.terms, 85)
      doc.text(termsLines, termsX, y + 6)
    }
  }
  
  // Save PDF
  doc.save(`Invoice-${invoiceData.invoiceNumber}.pdf`)
}

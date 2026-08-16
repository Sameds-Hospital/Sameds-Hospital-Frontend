import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Invoice, Prescription, Admission } from '../types'

const HOSPITAL = 'Sameds Hospital – Main Campus'
const ADDR = 'Accra, Ghana | Tel: +233 30 277 1000 | admin@gmail.com'

function header(doc: jsPDF, title: string) {
  doc.setFillColor(11, 18, 32)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(232, 240, 254)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(HOSPITAL, 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(ADDR, 14, 19)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 130, 246)
  doc.text(title, 14, 37)
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(14, 40, 196, 40)
  doc.setTextColor(30, 30, 30)
}

function footer(doc: jsPDF) {
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Generated: ${new Date().toLocaleString()} | Page ${i}/${pages}`, 14, 290)
      doc.text('Sameds Hospital HMS — Confidential', 196, 290, { align: 'right' })
  }
}

// ── Invoice PDF ──────────────────────────────────────────────────────────────
export function exportInvoicePDF(inv: Invoice) {
  const doc = new jsPDF()
  header(doc, 'TAX INVOICE')

  let y = 46
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(`Invoice #: ${inv.id}`, 14, y)
  doc.text(`Date: ${new Date(inv.issuedAt).toLocaleDateString()}`, 140, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.text(`Patient: ${inv.patientName} (${inv.patientId})`, 14, y)
  doc.text(`Status: ${inv.status}`, 140, y)
  y += 7
  doc.text(`Due: ${inv.dueAt}`, 14, y)
  doc.text(`Branch: ${inv.department}`, 140, y)
  y += 10

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Qty', 'Unit Price (₵)', 'Total (₵)']],
    body: inv.items.map(item => [
      item.description,
      item.quantity,
      item.unitPrice.toFixed(2),
      (item.quantity * item.unitPrice).toFixed(2),
    ]),
    foot: [
      ['', '', 'Subtotal', `₵${inv.subtotal.toFixed(2)}`],
      ['', '', 'Amount Paid', `₵${(inv.total - inv.amountDue).toFixed(2)}`],
      ['', '', 'Balance Due', `₵${inv.amountDue.toFixed(2)}`],
    ],
    headStyles: { fillColor: [11, 18, 32], textColor: [232, 240, 254] },
    footStyles: { fillColor: [240, 245, 255], fontStyle: 'bold' },
    styles: { fontSize: 10 },
    theme: 'striped',
  })

  footer(doc)
  doc.save(`invoice-${inv.id}.pdf`)
}

// ── Prescription PDF ─────────────────────────────────────────────────────────
export function exportPrescriptionPDF(rx: Prescription) {
  const doc = new jsPDF()
  header(doc, 'PRESCRIPTION')

  let y = 46
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Rx ID: ${rx.id}`, 14, y)
  doc.text(`Date: ${new Date(rx.prescribedAt).toLocaleDateString()}`, 140, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.text(`Patient: ${rx.patientName} (${rx.patientId})`, 14, y)
  doc.text(`Status: ${rx.status}`, 140, y)
  y += 7
  doc.text(`Doctor: ${rx.doctorName}`, 14, y)
  y += 12

  autoTable(doc, {
    startY: y,
    head: [['Field', 'Details']],
    body: [
      ['Medication', rx.medication],
      ['Dosage', rx.dosage],
      ['Frequency', rx.frequency],
      ['Duration', rx.duration],
      ['Instructions', rx.instructions || '—'],
    ],
    headStyles: { fillColor: [11, 18, 32], textColor: [232, 240, 254] },
    styles: { fontSize: 11 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
  })

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20
  doc.setDrawColor(100)
  doc.line(14, finalY, 80, finalY)
  doc.setFontSize(9)
  doc.text("Doctor's Signature", 14, finalY + 5)
  doc.line(130, finalY, 196, finalY)
  doc.text("Pharmacist's Signature", 130, finalY + 5)

  footer(doc)
  doc.save(`prescription-${rx.id}.pdf`)
}

// ── Discharge Summary PDF ────────────────────────────────────────────────────
export function exportDischargePDF(adm: Admission, _patientName: string, _dob: string, _ward: string) {
  const doc = new jsPDF()
  header(doc, 'DISCHARGE SUMMARY')

  let y = 46
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Admission ID: ${adm.id}`, 14, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.text(`Patient: ${adm.patientName} (${adm.patientId})`, 14, y)
  doc.text(`DOB: N/A`, 140, y)
  y += 7
  doc.text(`Ward: ${adm.wardName} | Bed: ${adm.bedNumber}`, 14, y)
  doc.text(`Doctor: ${adm.attendingDoctor}`, 140, y)
  y += 7
  doc.text(`Admitted: ${new Date(adm.admittedAt).toLocaleString()}`, 14, y)
  doc.text(`Discharged: ${adm.dischargedAt ? new Date(adm.dischargedAt).toLocaleString() : 'N/A'}`, 140, y)
  y += 12

  autoTable(doc, {
    startY: y,
    head: [['Section', 'Details']],
    body: [
      ['Admission Diagnosis', adm.diagnosis],
      ['Nursing Notes', adm.nursingNotes || '—'],
      ['Planned Discharge Date', adm.dischargePlanned || '—'],
      ['Discharge Status', adm.status],
    ],
    headStyles: { fillColor: [11, 18, 32], textColor: [232, 240, 254] },
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  })

  footer(doc)
  doc.save(`discharge-${adm.id}.pdf`)
}

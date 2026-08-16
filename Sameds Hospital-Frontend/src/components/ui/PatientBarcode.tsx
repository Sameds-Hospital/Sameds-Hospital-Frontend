import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Patient } from '../../types'
import { Printer, Download } from 'lucide-react'

interface PatientBarcodeProps {
  patient: Patient
  size?: number
}

export function PatientBarcode({ patient, size = 160 }: PatientBarcodeProps) {
  const ref = useRef<HTMLDivElement>(null)

  // QR encodes structured patient identity data
  const qrData = JSON.stringify({
    id: patient.id,
    barcode: patient.barcode,
    name: patient.name,
    dob: patient.dob,
    bloodGroup: patient.bloodGroup,
    branch: patient.branchId,
  })

  const handlePrint = () => {
    const content = ref.current
    if (!content) return
    const win = window.open('', '_blank', 'width=400,height=500')
    if (!win) return
    win.document.write(`
      <html><head><title>Patient ID – ${patient.name}</title>
      <style>
        body { font-family: sans-serif; padding: 24px; text-align: center; color: #111; }
        h2 { margin: 0 0 4px; font-size: 1.1rem; }
        p  { margin: 2px 0; font-size: 0.82rem; color: #555; }
        .barcode-val { font-family: monospace; font-size: 0.9rem; font-weight: 700; margin-top: 8px; letter-spacing: 0.08em; }
        svg { margin: 12px auto; display: block; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>`)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const handleDownload = () => {
    const svg = ref.current?.querySelector('svg')
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patient-qr-${patient.id}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="patient-barcode-card">
      <div ref={ref} className="patient-barcode-inner">
        <h2>{patient.name}</h2>
        <p>ID: {patient.id} &nbsp;|&nbsp; {patient.gender} &nbsp;|&nbsp; DOB: {patient.dob}</p>
        <p>Blood: {patient.bloodGroup} &nbsp;|&nbsp; {patient.branchId}</p>
        <QRCodeSVG
          value={qrData}
          size={size}
          level="H"
          includeMargin
          imageSettings={{
            src: '',
            height: 0,
            width: 0,
            excavate: false,
          }}
        />
        <div className="barcode-val">{patient.barcode}</div>
      </div>
      <div className="patient-barcode-actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={handlePrint}>
          <Printer size={13} /> Print
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={handleDownload}>
          <Download size={13} /> Download SVG
        </button>
      </div>
    </div>
  )
}

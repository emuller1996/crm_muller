/* eslint-disable prettier/prettier */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ViewDollar } from '../utils'

export const useFacturaCompraPDF = () => {
  const generarPDF = (factura) => {
    const doc = new jsPDF()

    // --- Encabezado ---
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURA DE COMPRA', 105, 18, { align: 'center' })

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° FC-${factura?.numero_factura ?? ''}`, 105, 26, { align: 'center' })

    doc.setLineWidth(0.5)
    doc.line(14, 30, 196, 30)

    // --- Datos factura ---
    doc.setFontSize(10)
    const fechaCreacion = new Date(factura?.createdTime)

    doc.setFont('helvetica', 'bold')
    doc.text('Proveedor:', 14, 38)
    doc.setFont('helvetica', 'normal')
    doc.text(factura?.proveedor?.nombre ?? '-', 44, 38)

    doc.setFont('helvetica', 'bold')
    doc.text('Estado:', 130, 38)
    doc.setFont('helvetica', 'normal')
    doc.text(factura?.status ?? '-', 152, 38)

    doc.setFont('helvetica', 'bold')
    doc.text('Fecha:', 14, 45)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `${fechaCreacion.toLocaleDateString()} ${fechaCreacion.toLocaleTimeString()}`,
      40,
      45,
    )

    doc.setFont('helvetica', 'bold')
    doc.text('Método pago:', 130, 45)
    doc.setFont('helvetica', 'normal')
    doc.text(factura?.metodo_pago ?? '-', 165, 45)

    if (factura?.fecha_vencimiento) {
      doc.setFont('helvetica', 'bold')
      doc.text('Vencimiento:', 14, 52)
      doc.setFont('helvetica', 'normal')
      doc.text(factura.fecha_vencimiento, 46, 52)
    }

    if (factura?.user_create?.name) {
      doc.setFont('helvetica', 'bold')
      doc.text('Creado por:', 130, 52)
      doc.setFont('helvetica', 'normal')
      doc.text(factura.user_create.name, 162, 52)
    }

    doc.line(14, 56, 196, 56)

    // --- Tabla de productos ---
    const rows = (factura?.productos ?? []).map((p) => [
      p?.product_name ?? '-',
      p?.cantidad ?? 0,
      ViewDollar(p?.price ?? 0),
      ViewDollar((p?.price ?? 0) * (p?.cantidad ?? 0)),
    ])

    autoTable(doc, {
      startY: 60,
      head: [['Producto', 'Cant.', 'Precio Unit.', 'Total']],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 40 },
        3: { halign: 'right', cellWidth: 40 },
      },
    })

    // --- Total ---
    const finalY = doc.lastAutoTable.finalY + 6
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total: ${ViewDollar(factura?.total_monto ?? 0)}`, 196, finalY, { align: 'right' })

    // --- Nota ---
    if (factura?.nota) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Notas:', 14, finalY + 12)
      doc.setFont('helvetica', 'normal')
      const notaLines = doc.splitTextToSize(factura.nota, 180)
      doc.text(notaLines, 14, finalY + 18)
    }

    window.open(doc.output("bloburl"));
  }

  return { generarPDF }
}

/* eslint-disable prettier/prettier */
import { useContext } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import axios from 'axios'
import { ViewDollar } from '../utils'
import AuthContext from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// Convierte una URL de imagen a DataURL (base64) para jsPDF
const toDataURL = (url) =>
  new Promise((resolve) => {
    fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
      .catch(() => resolve(null))
  })

export const useFacturaPDF = () => {
  const { Token } = useContext(AuthContext)

  const fetchEmpresa = async () => {
    try {
      const res = await axios.get('/empresa', { headers: { 'access-token': Token } })
      return res.data || null
    } catch {
      return null
    }
  }

  const generarPDF = async (factura) => {
    const doc = new jsPDF()
    const empresa = await fetchEmpresa()

    // --- Encabezado Empresa ---
    let headerY = 15

    // Logo
    if (empresa?.logo) {
      try {
        const logoUrl = empresa.logo.startsWith('http') ? empresa.logo : `${API_BASE}${empresa.logo}`
        const logoDataUrl = await toDataURL(logoUrl)
        if (logoDataUrl) {
          // Convertir webp a png via canvas (jsPDF no soporta webp directo)
          const img = new Image()
          await new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
            img.src = logoDataUrl
          })
          if (img.width > 0) {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            const pngDataUrl = canvas.toDataURL('image/png')
            doc.addImage(pngDataUrl, 'PNG', 14, 10, 28, 28)
          }
        }
      } catch {
        // ignore
      }
    }

    if (empresa) {
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(empresa.razon_social || empresa.nombre_comercial || '', 48, headerY)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const dv = empresa.digito_verificacion ? `-${empresa.digito_verificacion}` : ''
      if (empresa.numero_documento) {
        doc.text(`${empresa.tipo_documento || 'NIT'}: ${empresa.numero_documento}${dv}`, 48, headerY + 5)
      }
      if (empresa.direccion) {
        const ubic = [empresa.direccion, empresa.ciudad, empresa.departamento].filter(Boolean).join(', ')
        doc.text(ubic, 48, headerY + 10)
      }
      const contacto = [empresa.telefono, empresa.celular, empresa.correo].filter(Boolean).join(' | ')
      if (contacto) {
        doc.text(contacto, 48, headerY + 15)
      }
      if (empresa.sitio_web) {
        doc.text(empresa.sitio_web, 48, headerY + 20)
      }
    }

    // --- Titulo Factura ---
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURA DE VENTA', 196, headerY, { align: 'right' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° FV-${factura?.numero_factura ?? ''}`, 196, headerY + 6, { align: 'right' })

    doc.setLineWidth(0.5)
    doc.line(14, 42, 196, 42)

    // --- Datos factura ---
    doc.setFontSize(10)
    const fechaCreacion = new Date(factura?.createdTime)
    const baseY = 50

    doc.setFont('helvetica', 'bold')
    doc.text('Cliente:', 14, baseY)
    doc.setFont('helvetica', 'normal')
    doc.text(factura?.client?.name ?? '-', 40, baseY)

    doc.setFont('helvetica', 'bold')
    doc.text('Estado:', 130, baseY)
    doc.setFont('helvetica', 'normal')
    doc.text(factura?.status ?? '-', 152, baseY)

    doc.setFont('helvetica', 'bold')
    doc.text('Fecha:', 14, baseY + 7)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `${fechaCreacion.toLocaleDateString()} ${fechaCreacion.toLocaleTimeString()}`,
      40,
      baseY + 7,
    )

    doc.setFont('helvetica', 'bold')
    doc.text('Método pago:', 130, baseY + 7)
    doc.setFont('helvetica', 'normal')
    doc.text(factura?.metodo_pago ?? '-', 165, baseY + 7)

    if (factura?.fecha_vencimiento) {
      doc.setFont('helvetica', 'bold')
      doc.text('Vencimiento:', 14, baseY + 14)
      doc.setFont('helvetica', 'normal')
      doc.text(factura.fecha_vencimiento, 46, baseY + 14)
    }

    if (factura?.user_create?.name) {
      doc.setFont('helvetica', 'bold')
      doc.text('Creado por:', 130, baseY + 14)
      doc.setFont('helvetica', 'normal')
      doc.text(factura.user_create.name, 162, baseY + 14)
    }

    doc.line(14, baseY + 18, 196, baseY + 18)

    // --- Tabla de productos ---
    const rows = (factura?.productos ?? []).map((p) => [
      p?.product_name ?? '-',
      p?.cantidad ?? 0,
      ViewDollar(p?.price ?? 0),
      ViewDollar((p?.price ?? 0) * (p?.cantidad ?? 0)),
    ])

    autoTable(doc, {
      startY: baseY + 22,
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

    // --- Representante Legal (footer) ---
    if (empresa?.representante_legal) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(120)
      doc.text(
        `Representante Legal: ${empresa.representante_legal}`,
        105,
        285,
        { align: 'center' },
      )
      doc.setTextColor(0)
    }

    window.open(doc.output('bloburl'))
  }

  return { generarPDF }
}

/* eslint-disable prettier/prettier */
import { useContext } from 'react'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
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

// Convierte un logo (posiblemente webp) a PNG DataURL + dimensiones, via canvas
const logoToPng = async (logo) => {
  try {
    const logoUrl = logo.startsWith('http') ? logo : `${API_BASE}${logo}`
    const logoDataUrl = await toDataURL(logoUrl)
    if (!logoDataUrl) return null
    const img = new Image()
    await new Promise((resolve) => {
      img.onload = resolve
      img.onerror = resolve
      img.src = logoDataUrl
    })
    if (!img.width) return null
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    canvas.getContext('2d').drawImage(img, 0, 0)
    return { dataUrl: canvas.toDataURL('image/png'), w: img.width, h: img.height }
  } catch {
    return null
  }
}

export const useFacturaTicket = () => {
  const { Token } = useContext(AuthContext)

  const fetchEmpresa = async () => {
    try {
      const res = await axios.get('/empresa', { headers: { 'access-token': Token } })
      return res.data || null
    } catch {
      return null
    }
  }

  const imprimirTicket = async (factura, ancho = 80) => {
    try {
      const empresa = await fetchEmpresa()
      const logo = empresa?.logo ? await logoToPng(empresa.logo) : null

      // --- Parametros de layout segun ancho (58mm vs 80mm) ---
      const small = Number(ancho) <= 58
      const margin = 5
      const W = Number(ancho)
      const contentW = W - margin * 2
      const cx = W / 2
      const fs = {
        empresa: small ? 8 : 9,
        small: small ? 6 : 7,
        normal: small ? 7 : 8,
        item: small ? 7 : 8,
        total: small ? 10 : 12,
      }
      const lh = small ? 3 : 3.5 // alto de linea base

      const productos = factura?.productos ?? []
      const fecha = new Date(factura?.createdTime)

      // --- Doc de medicion (mismo ancho) para calcular alto exacto ---
      const measure = new jsPDF({ unit: 'mm', format: [W, 400] })
      const wrap = (text, size, style = 'normal') => {
        measure.setFontSize(size)
        measure.setFont('helvetica', style)
        return measure.splitTextToSize(String(text ?? ''), contentW)
      }

      // Pre-calcular lineas envueltas reutilizables
      const nombreLines = productos.map((p) => wrap(p?.product_name ?? '-', fs.item))
      const notaLines = factura?.nota ? wrap(`Nota: ${factura.nota}`, fs.small) : []

      // --- Calculo de altura total ---
      let h = margin
      if (logo) h += 20 + 2 // logo ~18mm alto + espacio
      h += lh // razon social
      h += lh * 3 // documento + direccion + contacto (aprox)
      h += 2 // separador
      h += lh // titulo FACTURA
      h += lh * 4 // fecha, cliente, estado, metodo/atendio
      h += 2 // separador
      productos.forEach((_, i) => {
        h += nombreLines[i].length * lh // nombre(s)
        h += lh // linea cantidad x precio ... total
        h += 1
      })
      h += 2 // separador
      h += fs.total * 0.45 + 2 // total
      if (notaLines.length) h += notaLines.length * lh + 2
      h += lh * 2 // pie
      h += margin

      // --- Doc real ---
      const doc = new jsPDF({ unit: 'mm', format: [W, Math.max(h, 40)] })
      let y = margin

      const center = (text, size, style = 'normal') => {
        doc.setFontSize(size)
        doc.setFont('helvetica', style)
        doc.text(String(text ?? ''), cx, y, { align: 'center' })
        y += lh
      }
      const sep = () => {
        doc.setFontSize(fs.small)
        doc.setFont('helvetica', 'normal')
        doc.text('-'.repeat(small ? 40 : 48), cx, y, { align: 'center' })
        y += 2.5
      }

      // Logo
      if (logo) {
        const logoW = small ? 16 : 20
        const logoH = (logo.h / logo.w) * logoW
        doc.addImage(logo.dataUrl, 'PNG', cx - logoW / 2, y, logoW, logoH)
        y += logoH + 2
      }

      // Encabezado empresa
      if (empresa) {
        center(empresa.razon_social || empresa.nombre_comercial || '', fs.empresa, 'bold')
        const dv = empresa.digito_verificacion ? `-${empresa.digito_verificacion}` : ''
        if (empresa.numero_documento) {
          center(`${empresa.tipo_documento || 'NIT'}: ${empresa.numero_documento}${dv}`, fs.small)
        }
        const ubic = [empresa.direccion, empresa.ciudad].filter(Boolean).join(', ')
        if (ubic) center(ubic, fs.small)
        const contacto = [empresa.telefono, empresa.celular].filter(Boolean).join(' - ')
        if (contacto) center(`Tel: ${contacto}`, fs.small)
      }

      sep()

      // Titulo + datos factura
      center('FACTURA DE VENTA', fs.normal, 'bold')
      center(`N° FV-${factura?.numero_factura ?? ''}`, fs.small)

      doc.setFontSize(fs.small)
      doc.setFont('helvetica', 'normal')
      const left = (label, value) => {
        doc.text(`${label}: ${value ?? '-'}`, margin, y)
        y += lh
      }
      left('Fecha', `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`)
      left('Cliente', factura?.client?.name ?? '-')
      left('Estado', factura?.status ?? '-')
      left('Metodo pago', factura?.metodo_pago ?? '-')
      if (factura?.user_create?.name) left('Atendio', factura.user_create.name)

      sep()

      // Items
      productos.forEach((p, i) => {
        doc.setFontSize(fs.item)
        doc.setFont('helvetica', 'bold')
        doc.text(nombreLines[i], margin, y)
        y += nombreLines[i].length * lh

        const cant = Number(p?.cantidad) || 0
        const precio = Number(p?.price) || 0
        doc.setFont('helvetica', 'normal')
        doc.text(`${cant} x ${ViewDollar(precio)}`, margin, y)
        doc.text(ViewDollar(precio * cant), W - margin, y, { align: 'right' })
        y += lh + 1
      })

      sep()

      // Total
      doc.setFontSize(fs.total)
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL', margin, y)
      doc.text(ViewDollar(factura?.total_monto ?? 0), W - margin, y, { align: 'right' })
      y += fs.total * 0.45 + 2

      // Nota
      if (notaLines.length) {
        doc.setFontSize(fs.small)
        doc.setFont('helvetica', 'normal')
        doc.text(notaLines, margin, y)
        y += notaLines.length * lh + 2
      }

      // Pie
      doc.setFontSize(fs.small)
      doc.setFont('helvetica', 'italic')
      doc.text('¡Gracias por su compra!', cx, y, { align: 'center' })

      // Imprimir
      doc.autoPrint()
      window.open(doc.output('bloburl'))
    } catch (error) {
      console.log(error)
      toast.error('Error al generar el ticket')
    }
  }

  return { imprimirTicket }
}

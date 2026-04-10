/* eslint-disable prettier/prettier */
import React, { useRef, useState } from 'react'
import { Alert, Button, Spinner, Table } from 'react-bootstrap'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { useProductos } from '../../../hooks/useProductos'
import * as XLSX from 'xlsx'

const COLUMNAS_PLANTILLA = ['name', 'description', 'price', 'costo', 'gender', 'reference']
const COLUMNAS_LABELS = {
  name: 'Nombre',
  description: 'Descripcion',
  price: 'Precio',
  costo: 'Costo',
  gender: 'Genero (men/women/kid)',
  reference: 'Referencia',
}

export default function FormImportProductos({ onHide, onSuccess }) {
  FormImportProductos.propTypes = {
    onHide: PropTypes.func,
    onSuccess: PropTypes.func,
  }

  const { importProductos } = useProductos()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [resumen, setResumen] = useState(null)

  const handleDescargarPlantilla = () => {
    const ws = XLSX.utils.aoa_to_sheet([COLUMNAS_PLANTILLA])
    ws['!cols'] = COLUMNAS_PLANTILLA.map(() => ({ wch: 22 }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Productos')
    XLSX.writeFile(wb, 'plantilla_productos.xlsx')
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResumen(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet)
      setPreview(json.slice(0, 10))
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  const handleSubir = async () => {
    if (!file) {
      toast.error('Selecciona un archivo primero')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await importProductos(formData)
      setResumen(res.data)
      toast.success(res.data.message)
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al importar')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResumen(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <p className="text-center border-bottom pb-2 fw-bold mb-3">Importar Productos desde Excel</p>

      {/* Paso 1 */}
      <div className="mb-3">
        <h6>
          <span className="badge bg-primary me-2">1</span>
          Descargar Plantilla
        </h6>
        <p className="text-muted small mb-2">
          Descarga la plantilla Excel y llena los datos de los productos. Las columnas son:
          <br />
          <strong>{COLUMNAS_PLANTILLA.map((c) => COLUMNAS_LABELS[c]).join(', ')}</strong>
        </p>
        <Button variant="outline-primary" size="sm" onClick={handleDescargarPlantilla}>
          <i className="fa-solid fa-download me-1"></i>
          Descargar Plantilla (.xlsx)
        </Button>
      </div>

      <hr />

      {/* Paso 2 */}
      <div className="mb-3">
        <h6>
          <span className="badge bg-primary me-2">2</span>
          Subir Archivo
        </h6>
        <input
          ref={fileInputRef}
          type="file"
          className="form-control form-control-sm"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
        />
      </div>

      {/* Preview */}
      {preview && preview.length > 0 && !resumen && (
        <div className="mb-3">
          <h6>
            <span className="badge bg-secondary me-2">Vista previa</span>
            {preview.length} filas (max 10 mostradas)
          </h6>
          <div className="table-responsive" style={{ maxHeight: '250px' }}>
            <Table striped bordered size="sm" className="small">
              <thead className="table-light">
                <tr>
                  {Object.keys(preview[0]).map((col) => (
                    <th key={col}>{COLUMNAS_LABELS[col] || col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="text-center mt-3">
            <Button
              variant="success"
              className="text-white px-4"
              onClick={handleSubir}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Importando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-upload me-1"></i>
                  Importar Productos
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Resumen */}
      {resumen && (
        <div className="mb-3">
          <h6>
            <span className="badge bg-success me-2">3</span>
            Resumen de Importacion
          </h6>
          <div className="row g-2 mb-2">
            <div className="col-4">
              <div className="card border-primary text-center p-2">
                <div className="text-muted small">Total Filas</div>
                <div className="fw-bold fs-5">{resumen.total_filas}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="card border-success text-center p-2">
                <div className="text-muted small">Insertados</div>
                <div className="fw-bold fs-5 text-success">{resumen.insertados}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="card border-danger text-center p-2">
                <div className="text-muted small">Errores</div>
                <div className="fw-bold fs-5 text-danger">{resumen.errores_count}</div>
              </div>
            </div>
          </div>

          {resumen.errores_count > 0 && (
            <Alert variant="warning" className="small">
              <strong>Errores encontrados:</strong>
              <ul className="mb-0 mt-1">
                {resumen.errores.map((err, i) => (
                  <li key={i}>
                    Fila {err.fila}: {err.error}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          <div className="text-center mt-3">
            <Button variant="outline-secondary" size="sm" onClick={handleReset}>
              <i className="fa-solid fa-rotate-left me-1"></i>
              Importar Otro Archivo
            </Button>
          </div>
        </div>
      )}

      <hr />
      <div className="text-center">
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cerrar
        </Button>
      </div>
    </div>
  )
}

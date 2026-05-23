/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import AsyncSelect from 'react-select/async'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { useMetricasDetalle } from '../../../hooks/useMetricasDetalle'
import { useProveedores } from '../../../hooks/useProveedores'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import KPICard from '../components/KPICard'

const initialFilter = { proveedor_id: '', fecha_desde: '', fecha_hasta: '' }

export default function ProveedoresTab() {
  const { proveedores, loadingProveedores, loadProveedores } = useMetricasDetalle()
  const { getAllProveedoresPaginationPromise } = useProveedores()
  const [filter, setFilter] = useState(initialFilter)
  const [proveedorSelected, setProveedorSelected] = useState(null)

  useEffect(() => {
    loadProveedores(filter)
  }, [filter])

  const handleClear = () => {
    setFilter(initialFilter)
    setProveedorSelected(null)
  }

  const searchProveedorOptions = async (value) => {
    try {
      const result = await getAllProveedoresPaginationPromise({ search: value, page: 1 })
      return result.data.data.map((p) => ({
        label: `${p.nombre ?? ''} - ${p.numero_documento ?? ''} - ${p.telefono ?? ''}`,
        value: p._id,
      }))
    } catch {
      return []
    }
  }

  return (
    <div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <Form.Label className="small fw-semibold mb-1">Proveedor especifico</Form.Label>
          <AsyncSelect
            isClearable cacheOptions defaultOptions
            value={proveedorSelected}
            loadOptions={searchProveedorOptions}
            placeholder="Buscar proveedor..."
            onChange={(opt) => {
              setProveedorSelected(opt || null)
              setFilter((s) => ({ ...s, proveedor_id: opt?.value || '' }))
            }}
            styles={stylesSelect} theme={themeSelect}
            noOptionsMessage={() => 'Escribe para buscar'}
          />
        </div>
        <div className="col-md-3">
          <Form.Label className="small fw-semibold mb-1">Fecha desde</Form.Label>
          <Form.Control size="sm" type="date" value={filter.fecha_desde}
            onChange={(e) => setFilter((s) => ({ ...s, fecha_desde: e.target.value }))} />
        </div>
        <div className="col-md-3">
          <Form.Label className="small fw-semibold mb-1">Fecha hasta</Form.Label>
          <Form.Control size="sm" type="date" value={filter.fecha_hasta}
            onChange={(e) => setFilter((s) => ({ ...s, fecha_hasta: e.target.value }))} />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <Button variant="outline-secondary" size="sm" className="w-100" onClick={handleClear}>
            <i className="fa-solid fa-rotate-left me-1"></i>Limpiar
          </Button>
        </div>
      </div>

      {loadingProveedores && !proveedores ? (
        <div className="text-center py-5">
          <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        </div>
      ) : (
        <>
          <CRow className="g-3 mb-3">
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Total Compras" value={ViewDollar(proveedores?.kpis?.total_compras || 0)}
                subtitle="En el rango" icon="fa-solid fa-truck-ramp-box" color="#3399ff" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Proveedores Activos" value={proveedores?.kpis?.proveedores_activos || 0}
                icon="fa-solid fa-truck-field" color="#2eb85c" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="N° Facturas" value={proveedores?.kpis?.total_facturas || 0}
                icon="fa-solid fa-file-invoice" color="#f9b115" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Ticket Promedio" value={ViewDollar(proveedores?.kpis?.ticket_promedio || 0)}
                icon="fa-solid fa-receipt" color="#9c27b0" />
            </CCol>
          </CRow>

          <CRow className="g-3 mb-3">
            <CCol xs={12} lg={6}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Top Proveedores</strong></CCardHeader>
                <CCardBody>
                  {proveedores?.top_proveedores?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Proveedor</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Facturas</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Promedio</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {proveedores.top_proveedores.map((p, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{p.nombre}</CTableDataCell>
                            <CTableDataCell className="text-center">{p.count}</CTableDataCell>
                            <CTableDataCell className="text-end fw-bold">{ViewDollar(p.total)}</CTableDataCell>
                            <CTableDataCell className="text-end text-muted">{ViewDollar(p.ticket_promedio)}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : <div className="text-center text-muted py-4">Sin datos</div>}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} lg={6}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom">
                  <strong>Productos Comprados</strong>
                  {filter.proveedor_id && (
                    <div className="small text-muted">Filtrado por proveedor seleccionado</div>
                  )}
                </CCardHeader>
                <CCardBody>
                  {proveedores?.productos_por_proveedor?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Producto</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {proveedores.productos_por_proveedor.map((p, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{p.name || '-'}</CTableDataCell>
                            <CTableDataCell className="text-center">{p.cantidad}</CTableDataCell>
                            <CTableDataCell className="text-end">{ViewDollar(p.total)}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : <div className="text-center text-muted py-4">Sin datos</div>}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

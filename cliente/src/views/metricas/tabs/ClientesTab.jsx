/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import AsyncSelect from 'react-select/async'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { useMetricasDetalle } from '../../../hooks/useMetricasDetalle'
import { useClientes } from '../../../hooks/useClientes'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import KPICard from '../components/KPICard'

const initialFilter = { client_id: '', fecha_desde: '', fecha_hasta: '' }

export default function ClientesTab() {
  const { clientes, loadingClientes, loadClientes } = useMetricasDetalle()
  const { getAllClientesPaginationPromise } = useClientes()
  const [filter, setFilter] = useState(initialFilter)
  const [clienteSelected, setClienteSelected] = useState(null)

  useEffect(() => {
    loadClientes(filter)
  }, [filter])

  const handleClear = () => {
    setFilter(initialFilter)
    setClienteSelected(null)
  }

  const searchClienteOptions = async (value) => {
    try {
      const result = await getAllClientesPaginationPromise({ search: value, page: 1 })
      return result.data.data.map((c) => ({
        label: `${c.name ?? ''} - ${c.alias ?? ''} - ${c.telefono ?? ''}`,
        value: c._id,
      }))
    } catch {
      return []
    }
  }

  return (
    <div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <Form.Label className="small fw-semibold mb-1">Cliente especifico</Form.Label>
          <AsyncSelect
            isClearable cacheOptions defaultOptions
            value={clienteSelected}
            loadOptions={searchClienteOptions}
            placeholder="Buscar cliente..."
            onChange={(opt) => {
              setClienteSelected(opt || null)
              setFilter((s) => ({ ...s, client_id: opt?.value || '' }))
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

      {loadingClientes && !clientes ? (
        <div className="text-center py-5">
          <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        </div>
      ) : (
        <>
          <CRow className="g-3 mb-3">
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Clientes Activos" value={clientes?.kpis?.total_clientes_activos || 0}
                subtitle="En el rango" icon="fa-solid fa-users" color="#3399ff" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Clientes Nuevos" value={clientes?.kpis?.nuevos || 0}
                subtitle="Primera compra" icon="fa-solid fa-user-plus" color="#2eb85c" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Recurrentes" value={clientes?.kpis?.recurrentes || 0}
                subtitle="Con compras previas" icon="fa-solid fa-rotate" color="#f9b115" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Ticket Promedio" value={ViewDollar(clientes?.kpis?.ticket_promedio_general || 0)}
                icon="fa-solid fa-receipt" color="#9c27b0" />
            </CCol>
          </CRow>

          <CRow className="g-3 mb-3">
            <CCol xs={12} lg={7}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Top Clientes (por monto)</strong></CCardHeader>
                <CCardBody>
                  {clientes?.top_clientes?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Cliente</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Facturas</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Ticket Prom.</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {clientes.top_clientes.map((c, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{c.nombre}</CTableDataCell>
                            <CTableDataCell className="text-center">{c.count}</CTableDataCell>
                            <CTableDataCell className="text-end fw-bold text-success">{ViewDollar(c.total)}</CTableDataCell>
                            <CTableDataCell className="text-end">{ViewDollar(c.ticket_promedio)}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : <div className="text-center text-muted py-4">Sin datos</div>}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} lg={5}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom">
                  <strong>Clientes sin Actividad</strong>
                  <div className="small text-muted">Sin compras en los ultimos 90 dias</div>
                </CCardHeader>
                <CCardBody>
                  {clientes?.sin_actividad?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Cliente</CTableHeaderCell>
                          <CTableHeaderCell>Telefono</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {clientes.sin_actividad.map((c) => (
                          <CTableRow key={c._id}>
                            <CTableDataCell>{c.nombre || '-'}</CTableDataCell>
                            <CTableDataCell className="text-muted">{c.telefono || '-'}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : <div className="text-center text-muted py-4">Todos los clientes activos</div>}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

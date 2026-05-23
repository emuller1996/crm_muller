/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import Select from 'react-select'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { CChartLine, CChartDoughnut } from '@coreui/react-chartjs'
import { useMetricasDetalle } from '../../../hooks/useMetricasDetalle'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import KPICard from '../components/KPICard'

const METODO_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Transferencia', value: 'transferencia' },
]

const METODO_COLORS = {
  efectivo: '#2eb85c',
  tarjeta: '#3399ff',
  transferencia: '#f9b115',
}

const initialFilter = { fecha_desde: '', fecha_hasta: '', metodo_pago: '' }

export default function ComprasTab() {
  const { compras, loadingCompras, loadCompras } = useMetricasDetalle()
  const [filter, setFilter] = useState(initialFilter)

  useEffect(() => {
    loadCompras(filter)
  }, [filter])

  const handleClear = () => setFilter(initialFilter)

  return (
    <div>
      <div className="row g-2 mb-3">
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
        <div className="col-md-3">
          <Form.Label className="small fw-semibold mb-1">Metodo de pago</Form.Label>
          <Select
            options={METODO_OPTIONS}
            value={METODO_OPTIONS.find((o) => o.value === filter.metodo_pago) || METODO_OPTIONS[0]}
            onChange={(opt) => setFilter((s) => ({ ...s, metodo_pago: opt?.value || '' }))}
            styles={stylesSelect} theme={themeSelect} isSearchable={false}
          />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <Button variant="outline-secondary" size="sm" className="w-100" onClick={handleClear}>
            <i className="fa-solid fa-rotate-left me-1"></i>Limpiar Filtros
          </Button>
        </div>
      </div>

      {loadingCompras && !compras ? (
        <div className="text-center py-5">
          <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        </div>
      ) : (
        <>
          <CRow className="g-3 mb-3">
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Total Compras" value={ViewDollar(compras?.kpis?.total_compras || 0)}
                subtitle={`${compras?.kpis?.total_facturas || 0} facturas`}
                icon="fa-solid fa-truck-ramp-box" color="#3399ff" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Ticket Promedio" value={ViewDollar(compras?.kpis?.ticket_promedio || 0)}
                icon="fa-solid fa-receipt" color="#2eb85c" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Mercancia Recibida" value={compras?.kpis?.recibidas || 0}
                subtitle="Facturas con remision" icon="fa-solid fa-circle-check" color="#2eb85c" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Remision Pendiente" value={compras?.kpis?.pendientes_remision || 0}
                subtitle="Por recibir" icon="fa-solid fa-hourglass-half" color="#f9b115" />
            </CCol>
          </CRow>

          <CRow className="g-3 mb-3">
            <CCol xs={12} lg={8}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Compras por dia</strong></CCardHeader>
                <CCardBody>
                  {compras?.por_dia?.length > 0 ? (
                    <CChartLine height={260}
                      data={{
                        labels: compras.por_dia.map((d) => d.fecha),
                        datasets: [{
                          label: 'Compras',
                          backgroundColor: 'rgba(46, 184, 92, 0.1)',
                          borderColor: '#2eb85c',
                          pointBackgroundColor: '#2eb85c',
                          pointRadius: 4, fill: true, tension: 0.3,
                          data: compras.por_dia.map((d) => d.total),
                        }],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: { callbacks: { label: (ctx) => ViewDollar(ctx.raw) } },
                        },
                        scales: { y: { beginAtZero: true, ticks: { callback: (v) => ViewDollar(v) } } },
                      }}
                    />
                  ) : <div className="text-center text-muted py-4">Sin datos</div>}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} lg={4}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Por Metodo de Pago</strong></CCardHeader>
                <CCardBody className="d-flex align-items-center justify-content-center">
                  {compras?.por_metodo_pago?.length > 0 ? (
                    <CChartDoughnut height={200}
                      data={{
                        labels: compras.por_metodo_pago.map((m) => m.metodo),
                        datasets: [{
                          data: compras.por_metodo_pago.map((m) => m.total),
                          backgroundColor: compras.por_metodo_pago.map((m) => METODO_COLORS[m.metodo] || '#8c8c8c'),
                        }],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ViewDollar(ctx.raw)}` } },
                        },
                      }}
                    />
                  ) : <div className="text-muted">Sin datos</div>}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <CRow className="g-3">
            <CCol xs={12} lg={6}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Top Proveedores</strong></CCardHeader>
                <CCardBody>
                  {compras?.por_proveedor?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Proveedor</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Compras</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {compras.por_proveedor.map((p, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{p.nombre}</CTableDataCell>
                            <CTableDataCell className="text-center">{p.count}</CTableDataCell>
                            <CTableDataCell className="text-end fw-semibold">{ViewDollar(p.total)}</CTableDataCell>
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
                <CCardHeader className="bg-white border-bottom"><strong>Productos mas comprados</strong></CCardHeader>
                <CCardBody>
                  {compras?.top_productos_comprados?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Producto</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {compras.top_productos_comprados.map((p, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{p.name || '-'}</CTableDataCell>
                            <CTableDataCell className="text-center">{p.cantidad}</CTableDataCell>
                            <CTableDataCell className="text-end fw-semibold">{ViewDollar(p.total)}</CTableDataCell>
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

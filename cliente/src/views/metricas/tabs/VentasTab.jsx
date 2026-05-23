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
  { label: 'Transferencia', value: 'Transferencia' },
]

const METODO_COLORS = {
  efectivo: '#2eb85c',
  tarjeta: '#3399ff',
  transferencia: '#f9b115',
  Transferencia: '#f9b115',
}

const initialFilter = { fecha_desde: '', fecha_hasta: '', metodo_pago: '' }

export default function VentasTab() {
  const { ventas, loadingVentas, loadVentas } = useMetricasDetalle()
  const [filter, setFilter] = useState(initialFilter)

  useEffect(() => {
    loadVentas(filter)
  }, [filter])

  const handleClear = () => setFilter(initialFilter)

  return (
    <div>
      {/* Filtros */}
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

      {loadingVentas && !ventas ? (
        <div className="text-center py-5">
          <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <CRow className="g-3 mb-3">
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Total Ventas" value={ViewDollar(ventas?.kpis?.total_ventas || 0)}
                subtitle={`${ventas?.kpis?.total_facturas || 0} facturas`}
                icon="fa-solid fa-cash-register" color="#2eb85c" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Ticket Promedio" value={ViewDollar(ventas?.kpis?.ticket_promedio || 0)}
                icon="fa-solid fa-receipt" color="#3399ff" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="N° Facturas" value={ventas?.kpis?.total_facturas || 0}
                icon="fa-solid fa-file-invoice-dollar" color="#f9b115" />
            </CCol>
            <CCol xs={12} sm={6} lg={3}>
              <KPICard title="Anuladas" value={ventas?.kpis?.anuladas || 0}
                icon="fa-solid fa-ban" color="#e55353" />
            </CCol>
          </CRow>

          {/* Graficos */}
          <CRow className="g-3 mb-3">
            <CCol xs={12} lg={8}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Ventas por dia</strong></CCardHeader>
                <CCardBody>
                  {ventas?.por_dia?.length > 0 ? (
                    <CChartLine height={260}
                      data={{
                        labels: ventas.por_dia.map((d) => d.fecha),
                        datasets: [{
                          label: 'Ventas',
                          backgroundColor: 'rgba(51, 153, 255, 0.1)',
                          borderColor: '#3399ff',
                          pointBackgroundColor: '#3399ff',
                          pointRadius: 4, fill: true, tension: 0.3,
                          data: ventas.por_dia.map((d) => d.total),
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
                  {ventas?.por_metodo_pago?.length > 0 ? (
                    <CChartDoughnut height={200}
                      data={{
                        labels: ventas.por_metodo_pago.map((m) => m.metodo),
                        datasets: [{
                          data: ventas.por_metodo_pago.map((m) => m.total),
                          backgroundColor: ventas.por_metodo_pago.map((m) => METODO_COLORS[m.metodo] || '#8c8c8c'),
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

          {/* Tablas */}
          <CRow className="g-3">
            <CCol xs={12} lg={6}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Top Productos Vendidos</strong></CCardHeader>
                <CCardBody>
                  {ventas?.top_productos?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Producto</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {ventas.top_productos.map((p, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{p.name || '-'}</CTableDataCell>
                            <CTableDataCell className="text-center">{p.cantidad}</CTableDataCell>
                            <CTableDataCell className="text-end fw-semibold">{ViewDollar(p.total)}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : <div className="text-center text-muted py-4">Sin ventas</div>}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} lg={6}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Top Clientes</strong></CCardHeader>
                <CCardBody>
                  {ventas?.top_clientes?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Cliente</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Facturas</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {ventas.top_clientes.map((c, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{c.nombre}</CTableDataCell>
                            <CTableDataCell className="text-center">{c.count}</CTableDataCell>
                            <CTableDataCell className="text-end fw-semibold text-success">{ViewDollar(c.total)}</CTableDataCell>
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

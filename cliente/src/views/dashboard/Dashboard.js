/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
} from '@coreui/react'
import { CChartLine, CChartDoughnut } from '@coreui/react-chartjs'
import PropTypes from 'prop-types'
import { useMetrics } from '../../hooks/useMetrics'
import { ViewDollar } from '../../utils'

const METODO_COLORS = {
  efectivo: '#2eb85c',
  tarjeta: '#3399ff',
  transferencia: '#f9b115',
  Transferencia: '#f9b115',
  consignacion: '#e55353',
}

const Dashboard = () => {
  const {
    kpis,
    ventasPorDia,
    topProductos,
    ventasPorMetodo,
    topClientes,
    stockBajo,
    cajaHoy,
    loading,
    loadAll,
  } = useMetrics()

  useEffect(() => {
    loadAll()
  }, [])

  if (loading && !kpis) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    )
  }

  return (
    <CContainer fluid>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="mb-0 fw-bold">Dashboard</h4>
          <small className="text-muted">Resumen de indicadores clave</small>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadAll}>
          <i className="fa-solid fa-rotate me-1"></i>
          Actualizar
        </button>
      </div>

      {/* KPIs principales */}
      <CRow className="g-3 mb-4">
        <CCol xs={12} sm={6} lg={3}>
          <KPICard
            title="Ventas Hoy"
            value={ViewDollar(kpis?.ventas_hoy?.total || 0)}
            subtitle={`${kpis?.ventas_hoy?.count || 0} facturas`}
            icon="fa-solid fa-cash-register"
            color="#2eb85c"
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <KPICard
            title="Ventas del Mes"
            value={ViewDollar(kpis?.ventas_mes?.total || 0)}
            subtitle={`${kpis?.ventas_mes?.count || 0} facturas`}
            icon="fa-solid fa-chart-line"
            color="#3399ff"
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <KPICard
            title="Por Cobrar"
            value={ViewDollar(kpis?.pendientes?.total || 0)}
            subtitle={`${kpis?.pendientes?.count || 0} pendientes`}
            icon="fa-solid fa-hourglass-half"
            color="#f9b115"
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <KPICard
            title="Balance Caja Hoy"
            value={ViewDollar(cajaHoy?.balance || 0)}
            subtitle={`Ing ${ViewDollar(cajaHoy?.ingresos || 0)} / Egr ${ViewDollar(cajaHoy?.egresos || 0)}`}
            icon="fa-solid fa-scale-balanced"
            color={cajaHoy?.balance >= 0 ? '#2eb85c' : '#e55353'}
          />
        </CCol>
      </CRow>

      {/* Contadores secundarios */}
      <CRow className="g-3 mb-4">
        <CCol xs={6} md={4}>
          <SimpleCard
            label="Productos"
            value={kpis?.totales?.productos || 0}
            icon="fa-solid fa-box"
          />
        </CCol>
        <CCol xs={6} md={4}>
          <SimpleCard
            label="Clientes"
            value={kpis?.totales?.clientes || 0}
            icon="fa-solid fa-users"
          />
        </CCol>
        <CCol xs={12} md={4}>
          <SimpleCard
            label="Proveedores"
            value={kpis?.totales?.proveedores || 0}
            icon="fa-solid fa-truck-field"
          />
        </CCol>
      </CRow>

      {/* Grafico ventas ultimos 7 dias */}
      <CRow className="g-3 mb-4">
        <CCol xs={12} lg={8}>
          <CCard className="h-100">
            <CCardHeader className="bg-white border-bottom">
              <strong>Ventas - Ultimos 7 dias</strong>
            </CCardHeader>
            <CCardBody>
              <CChartLine
                height={280}
                data={{
                  labels: ventasPorDia.map((v) => {
                    const d = new Date(v.timestamp || v.fecha)
                    if (isNaN(d.getTime())) return ''
                    return d.toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      timeZone: 'America/Bogota',
                    })
                  }),
                  datasets: [
                    {
                      label: 'Ventas',
                      backgroundColor: 'rgba(51, 153, 255, 0.1)',
                      borderColor: '#3399ff',
                      pointBackgroundColor: '#3399ff',
                      pointRadius: 4,
                      fill: true,
                      tension: 0.3,
                      data: ventasPorDia.map((v) => v.total),
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ViewDollar(ctx.raw),
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (val) => ViewDollar(val),
                      },
                    },
                  },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>

        {/* Ventas por metodo de pago */}
        <CCol xs={12} lg={4}>
          <CCard className="h-100">
            <CCardHeader className="bg-white border-bottom">
              <strong>Ventas por Metodo de Pago</strong>
              <div className="small text-muted">Ultimos 30 dias</div>
            </CCardHeader>
            <CCardBody className="d-flex flex-column justify-content-center">
              {ventasPorMetodo.length === 0 ? (
                <div className="text-center text-muted py-4">Sin datos</div>
              ) : (
                <CChartDoughnut
                  height={200}
                  data={{
                    labels: ventasPorMetodo.map((m) => m.metodo),
                    datasets: [
                      {
                        data: ventasPorMetodo.map((m) => m.total),
                        backgroundColor: ventasPorMetodo.map(
                          (m) => METODO_COLORS[m.metodo] || '#8c8c8c',
                        ),
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `${ctx.label}: ${ViewDollar(ctx.raw)}`,
                        },
                      },
                    },
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Top productos y top clientes */}
      <CRow className="g-3 mb-4">
        <CCol xs={12} lg={6}>
          <CCard className="h-100">
            <CCardHeader className="bg-white border-bottom">
              <strong>Top Productos Vendidos</strong>
            </CCardHeader>
            <CCardBody>
              {topProductos.length === 0 ? (
                <div className="text-center text-muted py-4">Sin ventas aun</div>
              ) : (
                <CTable hover responsive small>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Producto</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {topProductos.map((p, i) => (
                      <CTableRow key={i}>
                        <CTableDataCell>
                          <strong>{p.name || '-'}</strong>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color="info">{p.cantidad}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-end fw-semibold">
                          {ViewDollar(p.total)}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} lg={6}>
          <CCard className="h-100">
            <CCardHeader className="bg-white border-bottom">
              <strong>Top Clientes</strong>
              <div className="small text-muted">Ultimos 30 dias</div>
            </CCardHeader>
            <CCardBody>
              {topClientes.length === 0 ? (
                <div className="text-center text-muted py-4">Sin datos</div>
              ) : (
                <CTable hover responsive small>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Cliente</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Facturas</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {topClientes.map((c, i) => (
                      <CTableRow key={i}>
                        <CTableDataCell>
                          <strong>{c.nombre}</strong>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color="primary">{c.count}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-end fw-semibold text-success">
                          {ViewDollar(c.total)}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Stock bajo */}
      <CRow className="g-3 mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="bg-white border-bottom d-flex align-items-center">
              <i className="fa-solid fa-triangle-exclamation text-warning me-2"></i>
              <strong>Alerta de Stock Bajo</strong>
              <CBadge color="danger" className="ms-2">
                {stockBajo.length}
              </CBadge>
            </CCardHeader>
            <CCardBody>
              {stockBajo.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fa-solid fa-circle-check text-success me-2"></i>
                  Todos los productos tienen stock suficiente
                </div>
              ) : (
                <CTable hover responsive small>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Producto</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Stock Actual</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {stockBajo.map((p) => (
                      <CTableRow key={p._id}>
                        <CTableDataCell>{p.nombre}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          <strong className={p.stock <= 0 ? 'text-danger' : 'text-warning'}>
                            {p.stock}
                          </strong>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={p.stock <= 0 ? 'danger' : 'warning'}>
                            {p.stock <= 0 ? 'Sin Stock' : 'Stock Bajo'}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

function KPICard({ title, value, subtitle, icon, color }) {
  return (
    <CCard className="h-100 border-0 shadow-sm">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-muted small text-uppercase fw-semibold">{title}</div>
            <div className="fs-4 fw-bold mt-1">{value}</div>
            <div className="text-muted small mt-1">{subtitle}</div>
          </div>
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: `${color}1A`,
            }}
          >
            <i className={icon} style={{ fontSize: 20, color }}></i>
          </div>
        </div>
      </CCardBody>
    </CCard>
  )
}

KPICard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.string,
}

function SimpleCard({ label, value, icon }) {
  return (
    <CCard className="border-0 shadow-sm">
      <CCardBody className="d-flex align-items-center gap-3 py-3">
        <div
          className="d-flex align-items-center justify-content-center text-primary"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: 'rgba(51, 153, 255, 0.12)',
          }}
        >
          <i className={icon}></i>
        </div>
        <div>
          <div className="text-muted small">{label}</div>
          <div className="fs-5 fw-bold">{value}</div>
        </div>
      </CCardBody>
    </CCard>
  )
}

SimpleCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
}

export default Dashboard

/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import Select from 'react-select'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { CChartDoughnut } from '@coreui/react-chartjs'
import { useMetricasDetalle } from '../../../hooks/useMetricasDetalle'
import { useCategorias } from '../../../hooks/useCategorias'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import KPICard from '../components/KPICard'

const PALETTE = ['#3399ff', '#2eb85c', '#f9b115', '#e55353', '#9c27b0', '#00bcd4', '#ff9800', '#8bc34a', '#673ab7', '#795548']
const initialFilter = { category_id: '', fecha_desde: '', fecha_hasta: '' }

export default function ProductosTab() {
  const { productos, loadingProductos, loadProductos } = useMetricasDetalle()
  const { getAllCategorias, data: categorias } = useCategorias()
  const [filter, setFilter] = useState(initialFilter)

  useEffect(() => {
    getAllCategorias()
  }, [])

  useEffect(() => {
    loadProductos(filter)
  }, [filter])

  const handleClear = () => setFilter(initialFilter)

  const categoriaOptions = [
    { label: 'Todas las categorias', value: '' },
    ...(categorias || []).map((c) => ({ label: c.name, value: c._id })),
  ]

  return (
    <div>
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <Form.Label className="small fw-semibold mb-1">Categoria</Form.Label>
          <Select
            options={categoriaOptions}
            value={categoriaOptions.find((o) => o.value === filter.category_id) || categoriaOptions[0]}
            onChange={(opt) => setFilter((s) => ({ ...s, category_id: opt?.value || '' }))}
            styles={stylesSelect} theme={themeSelect}
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
        <div className="col-md-3 d-flex align-items-end">
          <Button variant="outline-secondary" size="sm" className="w-100" onClick={handleClear}>
            <i className="fa-solid fa-rotate-left me-1"></i>Limpiar Filtros
          </Button>
        </div>
      </div>

      {loadingProductos && !productos ? (
        <div className="text-center py-5">
          <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        </div>
      ) : (
        <>
          <CRow className="g-3 mb-3">
            <CCol xs={12} sm={6} lg={4}>
              <KPICard title="Productos en Catalogo" value={productos?.kpis?.total_productos_catalogo || 0}
                icon="fa-solid fa-box" color="#3399ff" />
            </CCol>
            <CCol xs={12} sm={6} lg={4}>
              <KPICard title="Productos Vendidos" value={productos?.kpis?.productos_vendidos || 0}
                icon="fa-solid fa-arrow-trend-up" color="#2eb85c" />
            </CCol>
            <CCol xs={12} sm={6} lg={4}>
              <KPICard title="Sin Venta" value={productos?.kpis?.productos_sin_venta || 0}
                icon="fa-solid fa-circle-exclamation" color="#f9b115" />
            </CCol>
          </CRow>

          <CRow className="g-3 mb-3">
            <CCol xs={12} lg={6}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Top por Cantidad Vendida</strong></CCardHeader>
                <CCardBody>
                  {productos?.top_por_cantidad?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Producto</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Ingresos</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {productos.top_por_cantidad.map((p, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{p.name || '-'}</CTableDataCell>
                            <CTableDataCell className="text-center fw-bold">{p.cantidad}</CTableDataCell>
                            <CTableDataCell className="text-end">{ViewDollar(p.ingresos)}</CTableDataCell>
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
                <CCardHeader className="bg-white border-bottom"><strong>Top por Ingresos</strong></CCardHeader>
                <CCardBody>
                  {productos?.top_por_ingresos?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Producto</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Ingresos</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {productos.top_por_ingresos.map((p, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>{p.name || '-'}</CTableDataCell>
                            <CTableDataCell className="text-center">{p.cantidad}</CTableDataCell>
                            <CTableDataCell className="text-end fw-bold text-success">{ViewDollar(p.ingresos)}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : <div className="text-center text-muted py-4">Sin datos</div>}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <CRow className="g-3 mb-3">
            <CCol xs={12} lg={7}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Margen / Utilidad (Price - Costo)</strong></CCardHeader>
                <CCardBody>
                  {productos?.margen?.length > 0 ? (
                    <CTable hover responsive small>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Producto</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Precio</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Costo</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Margen</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">%</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {productos.margen.map((p) => (
                          <CTableRow key={p._id}>
                            <CTableDataCell>{p.name}</CTableDataCell>
                            <CTableDataCell className="text-end">{ViewDollar(p.price)}</CTableDataCell>
                            <CTableDataCell className="text-end text-muted">{ViewDollar(p.costo)}</CTableDataCell>
                            <CTableDataCell className="text-end fw-bold text-success">{ViewDollar(p.margen)}</CTableDataCell>
                            <CTableDataCell className="text-end">{p.margen_pct.toFixed(1)}%</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : <div className="text-center text-muted py-4">Sin productos con precio/costo</div>}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} lg={5}>
              <CCard className="h-100">
                <CCardHeader className="bg-white border-bottom"><strong>Distribucion por Categoria</strong></CCardHeader>
                <CCardBody className="d-flex align-items-center justify-content-center">
                  {productos?.por_categoria?.length > 0 ? (
                    <CChartDoughnut height={220}
                      data={{
                        labels: productos.por_categoria.map((c) => c.nombre),
                        datasets: [{
                          data: productos.por_categoria.map((c) => c.ingresos),
                          backgroundColor: productos.por_categoria.map((_, i) => PALETTE[i % PALETTE.length]),
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
        </>
      )}
    </div>
  )
}

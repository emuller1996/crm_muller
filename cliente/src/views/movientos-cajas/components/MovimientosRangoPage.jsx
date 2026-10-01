/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Badge, Button, Form } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import toast from 'react-hot-toast'
import { paginationComponentOptions } from '../../../utils/optionsConfig'
import { useCaja } from '../../../hooks/useCaja'
import ResumenCaja from './ResumenCaja'
import PropTypes from 'prop-types'

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value || 0)
}

const origenLabels = {
  manual: 'Manual',
  factura_venta: 'Factura Venta',
  pago_factura: 'Pago Factura',
  anulacion: 'Anulacion',
}

const metodoPagoIcons = {
  efectivo: 'fa-solid fa-money-bill-wave text-success',
  tarjeta: 'fa-solid fa-credit-card text-primary',
  transferencia: 'fa-solid fa-building-columns text-info',
  consignacion: 'fa-solid fa-receipt text-warning',
}

export default function MovimientosRangoPage({ draw }) {
  MovimientosRangoPage.propTypes = {
    draw: PropTypes.number,
  }

  const today = new Date().toISOString().split('T')[0]
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0]

  const [fechaDesde, setFechaDesde] = useState(firstDay)
  const [fechaHasta, setFechaHasta] = useState(today)
  const [searched, setSearched] = useState(false)
  const { getResumenRango, resumenRango, loading, anularMovimiento } = useCaja()
  const [localDraw, setLocalDraw] = useState(1)

  const handleBuscar = () => {
    if (!fechaDesde || !fechaHasta) {
      toast.error('Seleccione ambas fechas')
      return
    }
    if (fechaDesde > fechaHasta) {
      toast.error('La fecha inicio debe ser menor a la fecha fin')
      return
    }
    getResumenRango(fechaDesde, fechaHasta)
    setSearched(true)
  }

  useEffect(() => {
    if (searched && fechaDesde && fechaHasta) {
      getResumenRango(fechaDesde, fechaHasta)
    }
  }, [draw, localDraw])

  const handleAnular = async (row) => {
    if (!window.confirm(`¿Anular el movimiento "${row.descripcion}"?`)) return
    try {
      const res = await anularMovimiento(row._id)
      toast.success(res.data.message)
      setLocalDraw((s) => ++s)
    } catch (error) {
      toast.error('Error al anular movimiento')
    }
  }

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <Form.Label className="mb-0 fw-bold">Desde:</Form.Label>
        <Form.Control
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          style={{ maxWidth: '180px' }}
        />
        <Form.Label className="mb-0 fw-bold">Hasta:</Form.Label>
        <Form.Control
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          style={{ maxWidth: '180px' }}
        />
        <Button variant="primary" onClick={handleBuscar}>
          <i className="fa-solid fa-magnifying-glass me-1"></i>
          Consultar
        </Button>
      </div>

      {resumenRango && (
        <>
          <ResumenCaja resumen={resumenRango?.resumen} />

          {/* Resumen por dia */}
          {resumenRango?.resumen?.por_dia?.length > 0 && (
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="text-muted mb-2">
                  <i className="fa-solid fa-calendar-week me-1"></i>
                  Resumen por Dia
                </h6>
                <div className="table-responsive">
                  <table className="table table-sm table-striped table-bordered mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Fecha</th>
                        <th className="text-end">Ingresos</th>
                        <th className="text-end">Egresos</th>
                        <th className="text-end">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenRango.resumen.por_dia.map((dia) => (
                        <tr key={dia.fecha}>
                          <td>{dia.fecha}</td>
                          <td className="text-end text-success">{formatMoney(dia.ingresos)}</td>
                          <td className="text-end text-danger">{formatMoney(dia.egresos)}</td>
                          <td
                            className={`text-end fw-bold ${dia.balance >= 0 ? 'text-success' : 'text-danger'}`}
                          >
                            {formatMoney(dia.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-secondary">
                      <tr className="fw-bold">
                        <td>TOTAL</td>
                        <td className="text-end text-success">
                          {formatMoney(resumenRango.resumen.total_ingresos)}
                        </td>
                        <td className="text-end text-danger">
                          {formatMoney(resumenRango.resumen.total_egresos)}
                        </td>
                        <td
                          className={`text-end ${resumenRango.resumen.balance >= 0 ? 'text-success' : 'text-danger'}`}
                        >
                          {formatMoney(resumenRango.resumen.balance)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de movimientos */}
          <div className="rounded overflow-hidden border border-ligth shadow-sm">
            <DataTable
              className="MyDataTableEvent"
              striped
              columns={[
                {
                  cell: (row) => {
                    if (row.origen === 'manual' && row.estado !== 'anulado') {
                      return (
                        <button
                          type="button"
                          onClick={() => handleAnular(row)}
                          className="btn btn-outline-danger btn-sm"
                          title="Anular"
                        >
                          <i className="fa-solid fa-ban"></i>
                        </button>
                      )
                    }
                    return null
                  },
                  width: '60px',
                },
                {
                  name: 'Tipo',
                  width: '110px',
                  cell: (row) => (
                    <Badge bg={row.tipo === 'ingreso' ? 'success' : 'danger'} className="p-2">
                      <i
                        className={`fa-solid ${
                          row.tipo === 'ingreso' ? 'fa-arrow-up' : 'fa-arrow-down'
                        } me-1`}
                      ></i>
                      {row.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                    </Badge>
                  ),
                },
                {
                  name: 'Monto',
                  width: '150px',
                  cell: (row) => (
                    <span
                      className={`fw-bold ${row.tipo === 'ingreso' ? 'text-success' : 'text-danger'}`}
                    >
                      {row.tipo === 'ingreso' ? '+' : '-'} {formatMoney(row.monto)}
                    </span>
                  ),
                },
                {
                  name: 'Metodo',
                  width: '140px',
                  cell: (row) => (
                    <span>
                      <i className={`${metodoPagoIcons[row.metodo_pago] || ''} me-1`}></i>
                      <span className="text-capitalize">{row.metodo_pago}</span>
                    </span>
                  ),
                },
                {
                  name: 'Descripcion',
                  selector: (row) => row?.descripcion ?? '',
                  width: '250px',
                },
                {
                  name: 'Origen',
                  width: '140px',
                  cell: (row) => (
                    <Badge
                      bg={
                        row.origen === 'manual'
                          ? 'secondary'
                          : row.origen === 'anulacion'
                            ? 'warning'
                            : 'info'
                      }
                      className="text-white"
                    >
                      {origenLabels[row.origen] || row.origen}
                    </Badge>
                  ),
                },
                {
                  name: 'Estado',
                  width: '100px',
                  cell: (row) => (
                    <Badge bg={row.estado === 'anulado' ? 'danger' : 'success'}>
                      {row.estado === 'anulado' ? 'Anulado' : 'Activo'}
                    </Badge>
                  ),
                },
                {
                  name: 'Fecha',
                  selector: (row) => row?.fecha ?? '',
                  width: '120px',
                },
                {
                  name: 'Hora',
                  selector: (row) => row?.hora ?? '',
                  width: '100px',
                },
                {
                  name: 'Referencia',
                  selector: (row) => row?.referencia ?? '',
                  width: '160px',
                },
                { name: 'Nota', selector: (row) => row?.nota ?? '', width: '180px' },
                {
                  name: 'Creado por',
                  cell: (row) => (
                    <span className="text-muted">
                      <i className="fa-solid fa-user me-1"></i>
                      {row?.user_create?.name ?? 'No registrado'}
                    </span>
                  ),
                },
              ]}
              progressPending={loading}
              data={resumenRango?.movimientos}
              pagination
              paginationComponentOptions={paginationComponentOptions}
              paginationPerPage={10}
              noDataComponent="No hay movimientos en este rango"
              progressComponent={
                <div className="d-flex justify-content-center my-5">
                  <div
                    className="spinner-border text-primary"
                    style={{ width: '3em', height: '3em' }}
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              }
              conditionalRowStyles={[
                {
                  when: (row) => row.estado === 'anulado',
                  style: { opacity: 0.5, textDecoration: 'line-through' },
                },
              ]}
            />
          </div>
        </>
      )}

      {!resumenRango && !loading && (
        <div className="text-center text-muted py-5">
          <i className="fa-solid fa-calendar-days fa-3x mb-3"></i>
          <p>Seleccione un rango de fechas y presione "Consultar"</p>
        </div>
      )}
    </div>
  )
}

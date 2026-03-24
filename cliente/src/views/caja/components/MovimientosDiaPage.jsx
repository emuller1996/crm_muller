/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Badge, Form } from 'react-bootstrap'
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

export default function MovimientosDiaPage({ draw }) {
  MovimientosDiaPage.propTypes = {
    draw: PropTypes.number,
  }

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const { getResumenDia, resumenDia, loading, anularMovimiento } = useCaja()
  const [localDraw, setLocalDraw] = useState(1)

  useEffect(() => {
    if (fecha) {
      getResumenDia(fecha)
    }
  }, [fecha, draw, localDraw])

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
      <div className="d-flex align-items-center gap-3 mb-3">
        <Form.Label className="mb-0 fw-bold">Fecha:</Form.Label>
        <Form.Control
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={{ maxWidth: '200px' }}
        />
      </div>

      <ResumenCaja resumen={resumenDia?.resumen} />

      <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
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
          data={resumenDia?.movimientos}
          pagination
          paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={10}
          noDataComponent="No hay movimientos para este dia"
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
    </div>
  )
}

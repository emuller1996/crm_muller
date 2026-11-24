/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Badge, Button, Form } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import AsyncSelect from 'react-select/async'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { paginationComponentOptions, stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import { useFacturas } from '../../../hooks/useFacturas'
import { useFacturaTicket } from '../../../hooks/useFacturaTicket'
import { useClientes } from '../../../hooks/useClientes'

const initialFilter = {
  perPage: 10,
  page: 1,
  status: 'Pendiente',
  client_id: '',
  fecha_desde: '',
  fecha_hasta: '',
}

// Estado del vencimiento respecto a hoy (zona Bogota)
const estadoVencimiento = (fecha) => {
  if (!fecha) return null
  const hoy = moment.tz('America/Bogota').startOf('day')
  const vence = moment.tz(fecha, 'YYYY-MM-DD', 'America/Bogota').startOf('day')
  const dias = vence.diff(hoy, 'days')
  if (dias < 0) return { bg: 'danger', text: `Vencida hace ${Math.abs(dias)} dia(s)` }
  if (dias === 0) return { bg: 'warning', text: 'Vence hoy' }
  return { bg: 'success', text: `Vence en ${dias} dia(s)` }
}

export default function FacturasPendientesPage({ draw, onViewFactura, onPayment }) {
  FacturasPendientesPage.propTypes = {
    draw: PropTypes.number,
    onViewFactura: PropTypes.func,
    onPayment: PropTypes.func,
  }

  const [dataFilter, setDataFilter] = useState(initialFilter)
  const [clienteSelected, setClienteSelected] = useState(null)

  const { getAllFacturasPagination, dataP, loading } = useFacturas()
  const { imprimirTicket } = useFacturaTicket()
  const { getAllClientesPaginationPromise } = useClientes()

  useEffect(() => {
    getAllFacturasPagination(dataFilter)
  }, [dataFilter, draw])

  // Al cambiar un filtro se vuelve a la primera pagina
  const updateFilter = (changes) => {
    setDataFilter((s) => ({ ...s, ...changes, page: 1 }))
  }

  const handleClearFilters = () => {
    setDataFilter(initialFilter)
    setClienteSelected(null)
  }

  const searchClienteOptions = async (value) => {
    try {
      const result = await getAllClientesPaginationPromise({ search: value, page: 1 })
      return [
        { label: 'CLIENTE DE MOSTRADOR', value: 'cliente_mostrador' },
        ...result.data.data.map((c) => ({
          label: `${c.name ?? ''} - ${c.alias ?? ''} - ${c.telefono ?? ''}`,
          value: c._id,
        })),
      ]
    } catch (error) {
      console.log(error)
      return []
    }
  }

  const totalPagina = (dataP?.data ?? []).reduce((acc, f) => acc + (Number(f.total_monto) || 0), 0)

  return (
    <>
      {/* Filtros */}
      <div className="card card-body mt-3">
        <div className="row g-3">
          <div className="col-md-3">
            <Form.Label className="small fw-semibold mb-1">Fecha desde</Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={dataFilter.fecha_desde}
              onChange={(e) => updateFilter({ fecha_desde: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <Form.Label className="small fw-semibold mb-1">Fecha hasta</Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={dataFilter.fecha_hasta}
              onChange={(e) => updateFilter({ fecha_hasta: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <Form.Label className="small fw-semibold mb-1">Cliente</Form.Label>
            <AsyncSelect
              isClearable
              cacheOptions
              defaultOptions
              value={clienteSelected}
              loadOptions={searchClienteOptions}
              placeholder="Buscar cliente..."
              onChange={(opt) => {
                setClienteSelected(opt || null)
                updateFilter({ client_id: opt?.value || '' })
              }}
              styles={stylesSelect}
              theme={themeSelect}
              noOptionsMessage={() => 'Escribe para buscar clientes'}
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <Button variant="outline-secondary" size="sm" className="w-100" onClick={handleClearFilters}>
              <i className="fa-solid fa-rotate-left me-1"></i>
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="d-flex flex-wrap gap-3 mt-3">
        <div className="px-3 py-2 rounded border bg-warning bg-opacity-10">
          <div className="small text-body-secondary">Facturas pendientes</div>
          <div className="fw-bold fs-5">{dataP?.total ?? 0}</div>
        </div>
        <div className="px-3 py-2 rounded border bg-warning bg-opacity-10">
          <div className="small text-body-secondary">Total en esta pagina</div>
          <div className="fw-bold fs-5">{ViewDollar(totalPagina)}</div>
        </div>
      </div>

      <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
        <DataTable
          className="MyDataTableEvent"
          striped
          columns={[
            {
              name: 'Acciones',
              width: '140px',
              cell: (row) => (
                <div className="btn-group" role="group">
                  <button
                    onClick={() => onViewFactura(row)}
                    title="Ver Factura"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  <button
                    onClick={() => onPayment(row)}
                    title="Registrar Pagos"
                    className="btn btn-outline-success btn-sm"
                  >
                    <i className="fa-solid fa-comment-dollar"></i>
                  </button>
                  <button
                    onClick={() =>
                      imprimirTicket(row, Number(localStorage.getItem('ticket_ancho_mm')) || 80)
                    }
                    title="Imprimir Ticket"
                    className="btn btn-outline-dark btn-sm"
                  >
                    <i className="fa-solid fa-receipt"></i>
                  </button>
                </div>
              ),
            },
            {
              name: 'N° Factura',
              selector: (row) => `FV-${row?.numero_factura ?? ''}`,
              width: '120px',
            },
            {
              name: 'Cliente',
              selector: (row) => row?.client?.name ?? '',
              minWidth: '200px',
              cell: (row) => (
                <span className="fw-semibold text-secondary">
                  {row.client_id === 'cliente_mostrador'
                    ? 'CLIENTE DE MOSTRADOR'
                    : row?.client?.name ?? ''}
                </span>
              ),
            },
            {
              name: 'Telefono',
              selector: (row) => row?.client?.telefono ?? '',
              width: '140px',
            },
            {
              name: 'Total',
              selector: (row) => row?.total_monto ?? 0,
              format: (row) => ViewDollar(row?.total_monto) ?? '',
              width: '140px',
            },
            {
              name: 'Fecha Venta',
              selector: (row) => row?.dia_venta ?? '',
              width: '130px',
            },
            {
              name: 'Vencimiento',
              selector: (row) => row?.fecha_vencimiento ?? '',
              minWidth: '220px',
              cell: (row) => {
                const estado = estadoVencimiento(row?.fecha_vencimiento)
                if (!estado) return <span className="text-muted">Sin fecha</span>
                return (
                  <div className="d-flex align-items-center gap-2">
                    <span>{row.fecha_vencimiento}</span>
                    <Badge bg={estado.bg} text={estado.bg === 'warning' ? 'dark' : undefined}>
                      {estado.text}
                    </Badge>
                  </div>
                )
              },
            },
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
          data={dataP?.data ?? []}
          pagination
          paginationServer
          progressPending={loading}
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
          paginationTotalRows={dataP?.total ?? 0}
          paginationPerPage={dataFilter.perPage}
          paginationComponentOptions={paginationComponentOptions}
          noDataComponent={
            <div className="d-flex flex-column align-items-center my-5 text-muted">
              <i className="fa-solid fa-circle-check fs-2 text-success mb-2"></i>
              No hay facturas pendientes con estos filtros.
            </div>
          }
          onChangeRowsPerPage={(perPage) => {
            setDataFilter((s) => ({ ...s, perPage, page: 1 }))
          }}
          onChangePage={(page) => {
            setDataFilter((s) => ({ ...s, page }))
          }}
        />
      </div>
    </>
  )
}

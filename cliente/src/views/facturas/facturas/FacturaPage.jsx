/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Accordion, Button, Form, Modal } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import AsyncSelect from 'react-select/async'
import Select from 'react-select'
import { paginationComponentOptions, stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import toast from 'react-hot-toast'
import { useFacturas } from '../../../hooks/useFacturas'
import { useFacturaPDF } from '../../../hooks/useFacturaPDF'
import { useClientes } from '../../../hooks/useClientes'
import PropTypes from 'prop-types'
import Chip from '@mui/material/Chip'

const STATUS_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Pagada', value: 'Pagada' },
  { label: 'Anulada', value: 'Anulada' },
]

const METODO_PAGO_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Transferencia', value: 'Transferencia' },
]

const initialFilter = {
  perPage: 10,
  page: 1,
  search: '',
  status: '',
  metodo_pago: '',
  client_id: '',
  fecha_desde: '',
  fecha_hasta: '',
}

export default function FacturaPage({ draw, onViewFactura, onPayment }) {
  FacturaPage.propTypes = {
    setDraw: PropTypes.func,
    draw: PropTypes.number,
    onViewFactura: PropTypes.func,
    onPayment: PropTypes.func,
  }

  const [facturaToAnular, setFacturaToAnular] = useState(null)
  const [loadingAnular, setLoadingAnular] = useState(false)
  const [dataFilter, setDataFilter] = useState(initialFilter)
  const [clienteSelected, setClienteSelected] = useState(null)

  const { getAllFacturasPagination, dataP, anularFactura, loading } = useFacturas()
  const { generarPDF } = useFacturaPDF()
  const { getAllClientesPaginationPromise } = useClientes()

  const handleAnular = async () => {
    if (!facturaToAnular) return
    try {
      setLoadingAnular(true)
      await anularFactura(facturaToAnular._id)
      toast.success('Factura anulada')
      setFacturaToAnular(null)
      getAllFacturasPagination(dataFilter)
    } catch (error) {
      toast.error('Error al anular la factura')
    } finally {
      setLoadingAnular(false)
    }
  }

  useEffect(() => {
    getAllFacturasPagination(dataFilter)
  }, [dataFilter, draw])

  // Helper para resetear pagina al cambiar filtros
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
      return result.data.data.map((c) => ({
        label: `${c.name ?? ''} - ${c.alias ?? ''} - ${c.telefono ?? ''}`,
        value: c._id,
      }))
    } catch (error) {
      console.log(error)
      return []
    }
  }

  return (
    <>
      {/* Filtros */}
      <Accordion className="mt-3" defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <i className="fa-solid fa-filter me-2"></i>
            Filtros
          </Accordion.Header>
          <Accordion.Body>
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
              <div className="col-md-3">
                <Form.Label className="small fw-semibold mb-1">Estado</Form.Label>
                <Select
                  options={STATUS_OPTIONS}
                  value={STATUS_OPTIONS.find((o) => o.value === dataFilter.status) || STATUS_OPTIONS[0]}
                  onChange={(opt) => updateFilter({ status: opt?.value || '' })}
                  styles={stylesSelect}
                  theme={themeSelect}
                  isSearchable={false}
                />
              </div>
              <div className="col-md-3">
                <Form.Label className="small fw-semibold mb-1">Metodo de pago</Form.Label>
                <Select
                  options={METODO_PAGO_OPTIONS}
                  value={
                    METODO_PAGO_OPTIONS.find((o) => o.value === dataFilter.metodo_pago) ||
                    METODO_PAGO_OPTIONS[0]
                  }
                  onChange={(opt) => updateFilter({ metodo_pago: opt?.value || '' })}
                  styles={stylesSelect}
                  theme={themeSelect}
                  isSearchable={false}
                />
              </div>
              <div className="col-md-9">
                <Form.Label className="small fw-semibold mb-1">Cliente</Form.Label>
                <AsyncSelect
                  isClearable
                  cacheOptions
                  defaultOptions
                  value={clienteSelected}
                  loadOptions={searchClienteOptions}
                  placeholder="Buscar cliente por nombre, alias o telefono..."
                  onChange={(opt) => {
                    setClienteSelected(opt || null)
                    updateFilter({ client_id: opt?.value || '' })
                  }}
                  styles={stylesSelect}
                  theme={themeSelect}
                  noOptionsMessage={() => 'Escribe para buscar clientes'}
                />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="w-100"
                  onClick={handleClearFilters}
                >
                  <i className="fa-solid fa-rotate-left me-1"></i>
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
        <DataTable
          className="MyDataTableEvent"
          striped
          columns={[
            {
              name: 'Acciones',
              width: '190px',
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
                    onClick={() => generarPDF(row)}
                    title="Descargar PDF"
                    className="btn btn-outline-secondary btn-sm"
                  >
                    <i className="fa-solid fa-file-pdf"></i>
                  </button>
                  {row.status === 'Pendiente' && (
                    <button
                      onClick={() => onPayment(row)}
                      title="Registrar Pagos"
                      className="btn btn-outline-success btn-sm"
                    >
                      <i className="fa-solid fa-comment-dollar"></i>
                    </button>
                  )}
                  {row.status !== 'Anulada' && (
                    <button
                      onClick={() => setFacturaToAnular(row)}
                      title="Anular Factura"
                      className="btn btn-outline-danger btn-sm"
                    >
                      <i className="fa-solid fa-ban"></i>
                    </button>
                  )}
                </div>
              ),
            },
            { name: 'N° Factura', selector: (row) => `FV-${row?.numero_factura}` ?? '' },
            {
              name: 'Cliente',
              selector: (row) => row?.client?.name ?? '',
              minWidth: '200px',
              cell: (row) => {
                if (row.client_id === 'cliente_mostrador') {
                  return <span className="fw-semibold text-secondary">CLIENTE DE MOSTRADOR</span>
                }
                return <span>{row?.client?.name ?? ''}</span>
              },
            },
            {
              name: 'Total',
              selector: (row) => row?.total_monto ?? 0,
              format: (row) => ViewDollar(row?.total_monto) ?? '',
            },
            {
              name: 'Estado',
              selector: (row) => row?.status ?? '',
              cell: (row) => {
                const translateColor = {
                  Pendiente: { color: '#f0e54c' },
                  Pagada: { color: '#4cf05a' },
                  Anulada: { color: '#f04c4c' },
                }
                return (
                  <Chip
                    sx={{ backgroundColor: translateColor?.[row.status]?.color }}
                    label={row.status}
                    variant="outlined"
                    size="small"
                  />
                )
              },
            },
            {
              name: 'Metodo Pago',
              selector: (row) => row?.metodo_pago ?? '',
              cell: (row) => (
                <span className="text-capitalize">
                  {row?.metodo_pago === 'efectivo' && (
                    <i className="fa-solid fa-money-bill me-1 text-success"></i>
                  )}
                  {row?.metodo_pago === 'tarjeta' && (
                    <i className="fa-solid fa-credit-card me-1 text-primary"></i>
                  )}
                  {row?.metodo_pago === 'Transferencia' && (
                    <i className="fa-solid fa-money-bill-transfer me-1 text-warning"></i>
                  )}
                  {row?.metodo_pago ?? '-'}
                </span>
              ),
            },
            {
              name: 'Creado por',
              cell: (row) => (
                <div>
                  <span className="text-muted">
                    <i className="fa-solid fa-user me-1"></i>
                    {row?.user_create?.name ?? 'No registrado'}
                  </span>
                </div>
              ),
            },
            {
              name: 'Fecha Venta',
              selector: (row) => row?.dia_venta ?? '',
            },
            {
              name: 'Fecha Creacion',
              selector: (row) =>
                row?.createdTime
                  ? `${new Date(row.createdTime).toLocaleDateString()} ${new Date(row.createdTime).toLocaleTimeString()}`
                  : '',
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
            <div className="d-flex justify-content-center my-5">
              No hay facturas que coincidan con los filtros.
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

      {/* Modal confirmar anular */}
      <Modal show={!!facturaToAnular} onHide={() => setFacturaToAnular(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Anular Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Está seguro que desea anular la factura{' '}
            <strong>FV-{facturaToAnular?.numero_factura}</strong>?
          </p>
          <p className="text-muted small">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setFacturaToAnular(null)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handleAnular} disabled={loadingAnular}>
            {loadingAnular ? (
              <span className="spinner-border spinner-border-sm me-1" />
            ) : (
              <i className="fa-solid fa-ban me-1"></i>
            )}
            Anular
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

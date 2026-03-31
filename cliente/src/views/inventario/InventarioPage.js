/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { Badge, Button, Form, Modal, Tab, Tabs } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import toast from 'react-hot-toast'
import { paginationComponentOptions } from '../../utils/optionsConfig'
import { useInventario } from '../../hooks/useInventario'
import FormMovimientoInventario from './components/FormMovimientoInventario'
import PropTypes from 'prop-types'

const origenLabels = {
  manual: 'Manual',
  factura_venta: 'Factura Venta',
  factura_compra: 'Factura Compra',
  anulacion_factura_venta: 'Anul. Venta',
  anulacion_factura_compra: 'Anul. Compra',
}

const InventarioPage = () => {
  const [show, setShow] = useState(false)
  const [draw, setDraw] = useState(1)

  return (
    <div className="">
      <CContainer fluid>
        <div className="card">
          <div className="card-body">
            <div className="my-2">
              <Button variant="success" className="text-white" onClick={() => setShow(true)}>
                <i className="fa-solid fa-plus me-1"></i>
                Registrar Movimiento
              </Button>
            </div>
            <Tabs defaultActiveKey="resumen" id="inventario-tabs">
              <Tab eventKey="resumen" title="Resumen de Inventario">
                <ResumenTab draw={draw} />
              </Tab>
              <Tab eventKey="movimientos" title="Movimientos">
                <MovimientosTab draw={draw} />
              </Tab>
            </Tabs>
          </div>
        </div>

        <Modal backdrop={'static'} size="lg" centered show={show} onHide={() => setShow(false)}>
          <Modal.Body>
            <FormMovimientoInventario
              onHide={() => setShow(false)}
              onSuccess={() => setDraw((s) => ++s)}
            />
          </Modal.Body>
        </Modal>
      </CContainer>
    </div>
  )
}

ResumenTab.propTypes = {
  draw: PropTypes.number,
}

function ResumenTab({ draw }) {
  const { getResumenInventario, resumen, loading } = useInventario()

  const [dataFilter, setDataFilter] = useState({
    perPage: 15,
    page: 1,
    search: '',
  })

  useEffect(() => {
    getResumenInventario(dataFilter)
  }, [dataFilter, draw])

  return (
    <div className="mt-3">
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              placeholder="Buscar producto..."
              type="text"
              className="form-control"
              onChange={(e) => setDataFilter((s) => ({ ...s, search: e.target.value, page: 1 }))}
            />
          </div>
        </div>
      </div>
      <div className="rounded overflow-hidden border shadow-sm">
        <DataTable
          className="MyDataTableEvent"
          striped
          columns={[
            { name: 'Producto', selector: (row) => row?.nombre ?? '', width: '300px' },
            {
              name: 'Stock Actual',
              width: '150px',
              selector: (row) => row?.stock_actual ?? 0,
              cell: (row) => (
                <span
                  className={`fw-bold ${
                    row.stock_actual > 0
                      ? 'text-success'
                      : row.stock_actual === 0
                        ? 'text-warning'
                        : 'text-danger'
                  }`}
                >
                  {row.stock_actual}
                </span>
              ),
            },
            {
              name: 'Total Entradas',
              selector: (row) => row?.total_entradas ?? 0,
              width: '150px',
              cell: (row) => (
                <span className="text-success">
                  <i className="fa-solid fa-arrow-up me-1"></i>
                  {row.total_entradas}
                </span>
              ),
            },
            {
              name: 'Total Salidas',
              selector: (row) => row?.total_salidas ?? 0,
              width: '150px',
              cell: (row) => (
                <span className="text-danger">
                  <i className="fa-solid fa-arrow-down me-1"></i>
                  {row.total_salidas}
                </span>
              ),
            },
            {
              name: 'Estado',
              width: '130px',
              cell: (row) => {
                if (row.stock_actual <= 0)
                  return <Badge bg="danger">Sin Stock</Badge>
                if (row.stock_actual <= 5)
                  return <Badge bg="warning" className="text-dark">Stock Bajo</Badge>
                return <Badge bg="success">Disponible</Badge>
              },
            },
          ]}
          data={resumen?.data}
          pagination
          paginationServer
          progressPending={loading}
          paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={dataFilter.perPage}
          paginationTotalRows={resumen?.total}
          noDataComponent="No hay productos para mostrar"
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
          onChangeRowsPerPage={(perPage) => {
            setDataFilter((s) => ({ ...s, perPage }))
          }}
          onChangePage={(page) => {
            setDataFilter((s) => ({ ...s, page }))
          }}
        />
      </div>
    </div>
  )
}

MovimientosTab.propTypes = {
  draw: PropTypes.number,
}

function MovimientosTab({ draw }) {
  const { getMovimientosPagination, movimientos, loading, anularMovimiento } = useInventario()

  const [dataFilter, setDataFilter] = useState({
    perPage: 15,
    page: 1,
    search: '',
    tipo: '',
    origen: '',
  })

  const [movToAnular, setMovToAnular] = useState(null)
  const [loadingAnular, setLoadingAnular] = useState(false)

  useEffect(() => {
    getMovimientosPagination(dataFilter)
  }, [dataFilter, draw])

  const handleAnular = async () => {
    if (!movToAnular) return
    try {
      setLoadingAnular(true)
      const res = await anularMovimiento(movToAnular._id)
      toast.success(res.data.message)
      setMovToAnular(null)
      getMovimientosPagination(dataFilter)
    } catch {
      toast.error('Error al anular movimiento')
    } finally {
      setLoadingAnular(false)
    }
  }

  return (
    <div className="mt-3">
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              placeholder="Buscar por descripcion, producto, referencia..."
              type="text"
              className="form-control"
              onChange={(e) => setDataFilter((s) => ({ ...s, search: e.target.value, page: 1 }))}
            />
          </div>
        </div>
        <div className="col-md-2">
          <Form.Select
            value={dataFilter.tipo}
            onChange={(e) => setDataFilter((s) => ({ ...s, tipo: e.target.value, page: 1 }))}
          >
            <option value="">Todos los tipos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </Form.Select>
        </div>
        <div className="col-md-2">
          <Form.Select
            value={dataFilter.origen}
            onChange={(e) => setDataFilter((s) => ({ ...s, origen: e.target.value, page: 1 }))}
          >
            <option value="">Todos los origenes</option>
            <option value="manual">Manual</option>
            <option value="factura_venta">Factura Venta</option>
            <option value="factura_compra">Factura Compra</option>
            <option value="anulacion_factura_venta">Anul. Venta</option>
            <option value="anulacion_factura_compra">Anul. Compra</option>
          </Form.Select>
        </div>
      </div>
      <div className="rounded overflow-hidden border shadow-sm">
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
                      onClick={() => setMovToAnular(row)}
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
                <Badge bg={row.tipo === 'entrada' ? 'success' : 'danger'} className="p-2">
                  <i
                    className={`fa-solid ${
                      row.tipo === 'entrada' ? 'fa-arrow-up' : 'fa-arrow-down'
                    } me-1`}
                  ></i>
                  {row.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                </Badge>
              ),
            },
            {
              name: 'Producto',
              selector: (row) => row?.nombre_producto ?? '',
              width: '220px',
            },
            {
              name: 'Cantidad',
              width: '110px',
              cell: (row) => (
                <span
                  className={`fw-bold ${row.tipo === 'entrada' ? 'text-success' : 'text-danger'}`}
                >
                  {row.tipo === 'entrada' ? '+' : '-'} {row.cantidad}
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
                      : row.origen?.includes('anulacion')
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
              name: 'Referencia',
              selector: (row) => row?.referencia ?? '',
              width: '160px',
            },
            {
              name: 'Fecha',
              selector: (row) =>
                row?.createdTime
                  ? `${new Date(row.createdTime).toLocaleDateString()} ${new Date(row.createdTime).toLocaleTimeString()}`
                  : '',
              width: '180px',
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
          progressPending={loading}
          data={movimientos?.data}
          pagination
          paginationServer
          paginationComponentOptions={paginationComponentOptions}
          paginationPerPage={dataFilter.perPage}
          noDataComponent="No hay movimientos para mostrar"
          paginationTotalRows={movimientos?.total}
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
          onChangeRowsPerPage={(perPage) => {
            setDataFilter((s) => ({ ...s, perPage }))
          }}
          onChangePage={(page) => {
            setDataFilter((s) => ({ ...s, page }))
          }}
          conditionalRowStyles={[
            {
              when: (row) => row.estado === 'anulado',
              style: { opacity: 0.5, textDecoration: 'line-through' },
            },
          ]}
        />
      </div>

      {/* Modal confirmar anular */}
      <Modal show={!!movToAnular} onHide={() => setMovToAnular(null)} centered size="sm">
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <i
              className="fa-solid fa-triangle-exclamation text-warning"
              style={{ fontSize: '2.5rem' }}
            ></i>
          </div>
          <h6 className="fw-bold">Anular Movimiento</h6>
          <p className="text-muted mb-0">
            ¿Anular el movimiento <strong>{movToAnular?.descripcion}</strong>?
            <br />
            <small>Producto: {movToAnular?.nombre_producto}</small>
            <br />
            <small>Cantidad: {movToAnular?.cantidad}</small>
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pt-0">
          <button className="btn btn-secondary btn-sm px-3" onClick={() => setMovToAnular(null)}>
            Cancelar
          </button>
          <button
            className="btn btn-danger btn-sm px-3"
            onClick={handleAnular}
            disabled={loadingAnular}
          >
            {loadingAnular ? (
              <span className="spinner-border spinner-border-sm me-1" />
            ) : (
              <i className="fa-solid fa-ban me-1"></i>
            )}
            Anular
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default InventarioPage

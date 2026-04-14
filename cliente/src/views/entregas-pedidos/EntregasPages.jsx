/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { ViewDollar } from '../../utils'
import { useState } from 'react'
import Chip from '@mui/material/Chip'
import { paginationComponentOptions } from '../../utils/optionsConfig'
import FormPedidos from './components/FormPedidos'
import FormSignedPedido from './components/FormSignedPedido'
import FormFacturaPedido from './components/FormFacturaPedido'
import { usePedidos } from '../../hooks/usePedidos'

const statusColors = {
  Pendiente: '#f0e54c',
  'En Proceso': '#4c8ff0',
  'En Camino': '#f0a04c',
  Entregada: '#4cf05a',
  Facturado: '#2eb85c',
  Cancelada: '#f04c4c',
}

export default function EntregasPages() {
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showFirma, setShowFirma] = useState(false)
  const [showFactura, setShowFactura] = useState(false)
  const [selected, setSelected] = useState(null)
  const [Draw, setDraw] = useState(1)

  const { getAllPedidos, data: ListPedidos, loading } = usePedidos()

  useEffect(() => {
    getAllPedidos()
  }, [Draw])

  const refresh = () => setDraw((s) => ++s)

  return (
    <>
      <div className="my-2">
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="btn btn-primary"
        >
          <i className="fa-solid fa-plus me-1"></i>
          Nuevo Pedido
        </button>
      </div>
      <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
        <DataTable
          className="MyDataTableEvent"
          striped
          columns={[
            {
              name: 'Acciones',
              width: '220px',
              cell: (row) => (
                <div className="btn-group" role="group">
                  <button
                    onClick={() => { setSelected(row); setShowDetail(true) }}
                    title="Ver Detalle"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  {!row.signature && row.status !== 'Cancelada' && (
                    <button
                      onClick={() => { setSelected(row); setShowFirma(true) }}
                      title="Firmar Entrega"
                      className="btn btn-outline-success btn-sm"
                    >
                      <i className="fa-solid fa-signature"></i>
                    </button>
                  )}
                  {row.signature && !row.factura_generada && (
                    <button
                      onClick={() => { setSelected(row); setShowFactura(true) }}
                      title="Generar Factura"
                      className="btn btn-outline-warning btn-sm"
                    >
                      <i className="fa-solid fa-file-invoice-dollar"></i>
                    </button>
                  )}
                </div>
              ),
            },
            {
              name: 'N° Pedido',
              width: '110px',
              cell: (row) => (
                <span className="fw-bold">
                  {row?.numero_pedido ? `PD-${row.numero_pedido}` : '-'}
                </span>
              ),
            },
            { name: 'Cliente', selector: (row) => row?.client?.name ?? '', width: '200px' },
            {
              name: 'Total',
              selector: (row) => row?.total_monto ?? 0,
              format: (row) => ViewDollar(row?.total_monto) ?? '',
              width: '130px',
            },
            {
              name: 'Estado',
              width: '130px',
              cell: (row) => (
                <Chip
                  sx={{ backgroundColor: statusColors[row?.status] || '#ccc' }}
                  label={row?.status ?? ''}
                  variant="outlined"
                  size="small"
                />
              ),
            },
            {
              name: 'Firma',
              width: '80px',
              cell: (row) => (
                row.signature
                  ? <i className="fa-solid fa-circle-check text-success"></i>
                  : <i className="fa-solid fa-circle-xmark text-muted"></i>
              ),
            },
            {
              name: 'Factura',
              width: '80px',
              cell: (row) => (
                row.factura_generada
                  ? <i className="fa-solid fa-circle-check text-success"></i>
                  : <i className="fa-solid fa-circle-xmark text-muted"></i>
              ),
            },
            {
              name: 'Creado por',
              width: '140px',
              cell: (row) => (
                <span className="text-muted">
                  <i className="fa-solid fa-user me-1"></i>
                  {row?.user_create?.name ?? 'No registrado'}
                </span>
              ),
            },
            {
              name: 'Fecha Entrega',
              selector: (row) => row?.fecha_entrega ?? '',
              width: '130px',
            },
            {
              name: 'Fecha Creacion',
              selector: (row) =>
                row?.createdTime
                  ? `${new Date(row.createdTime).toLocaleDateString()} ${new Date(row.createdTime).toLocaleTimeString()}`
                  : '',
              width: '170px',
            },
          ]}
          data={ListPedidos ?? []}
          pagination
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
          paginationComponentOptions={paginationComponentOptions}
          noDataComponent={
            <div className="d-flex justify-content-center my-5">No hay Pedidos.</div>
          }
        />
      </div>

      {/* Modal Crear Pedido */}
      <Modal backdrop={'static'} size="xl" fullscreen centered show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormPedidos
            onHide={() => setShowCreate(false)}
            onSuccess={refresh}
          />
        </Modal.Body>
      </Modal>

      {/* Modal Detalle Pedido */}
      <Modal size="lg" centered show={showDetail} onHide={() => setShowDetail(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Detalle Pedido {selected?.numero_pedido ? `PD-${selected.numero_pedido}` : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="px-3">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <p className="m-0 text-muted small">Cliente</p>
                  <p className="m-0 fs-5 fw-bold">{selected.client?.name}</p>
                </div>
                <div className="col-md-6">
                  <p className="m-0 text-muted small">Estado</p>
                  <Chip
                    sx={{ backgroundColor: statusColors[selected.status] || '#ccc' }}
                    label={selected.status}
                    variant="outlined"
                    size="small"
                  />
                </div>
                <div className="col-md-6">
                  <p className="m-0 text-muted small">Fecha de Entrega</p>
                  <p className="m-0">{selected.fecha_entrega || '-'}</p>
                </div>
                <div className="col-md-6">
                  <p className="m-0 text-muted small">Direccion</p>
                  <p className="m-0">{selected.direccion || '-'}</p>
                </div>
              </div>

              <DataTable
                className="MyDataTableEvent"
                striped
                columns={[
                  { name: 'Producto', selector: (row) => row?.product_name ?? '' },
                  { name: 'Cant.', selector: (row) => row?.cantidad ?? '' },
                  { name: 'Precio', format: (row) => ViewDollar(row?.price) ?? '' },
                  { name: 'Total', format: (row) => ViewDollar(row?.price * row?.cantidad) ?? '' },
                ]}
                noDataComponent={<p className="my-3">Sin productos</p>}
                data={selected.productos}
              />
              <div className="text-center mt-2">
                <span className="me-2">Total</span>
                <span className="fw-bold fs-4">{ViewDollar(selected.total_monto)}</span>
              </div>

              {selected.signature && (
                <>
                  <hr />
                  <p className="text-center mb-1 fw-semibold">Firma de Entrega</p>
                  <div className="d-flex justify-content-center overflow-auto">
                    <div style={{ border: '1px solid #c2c2c2', width: '450px', borderRadius: 8 }}>
                      <img src={selected.signature} alt="Firma entrega" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <p className="text-center text-muted small mt-1">
                    Firmado el {new Date(selected.signature_date).toLocaleDateString()} -{' '}
                    {new Date(selected.signature_date).toLocaleTimeString()}
                  </p>
                </>
              )}

              {selected.nota && (
                <>
                  <hr />
                  <label className="form-label text-muted small">Notas</label>
                  <textarea defaultValue={selected.nota} disabled className="form-control" rows="2"></textarea>
                </>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Firma */}
      <Modal size="lg" centered show={showFirma} onHide={() => setShowFirma(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Firmar Entrega</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <FormSignedPedido
              pedido={selected}
              onSuccess={() => { setShowFirma(false); refresh() }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Generar Factura */}
      <Modal size="lg" centered show={showFactura} onHide={() => setShowFactura(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generar Factura desde Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <FormFacturaPedido
              pedido={selected}
              onHide={() => setShowFactura(false)}
              onSuccess={refresh}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  )
}

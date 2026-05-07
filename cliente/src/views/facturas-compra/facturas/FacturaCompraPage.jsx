/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useFacturasCompra } from '../../../hooks/useFacturasCompra'
import { useFacturaCompraPDF } from '../../../hooks/useFacturaCompraPDF'
import PropTypes from 'prop-types'
import Chip from '@mui/material/Chip'

export default function FacturaCompraPage({ draw, onViewFactura, onPayment }) {
  FacturaCompraPage.propTypes = {
    setDraw: PropTypes.func,
    draw: PropTypes.number,
    onViewFactura: PropTypes.func,
    onPayment: PropTypes.func,
  }

  const [facturaToAnular, setFacturaToAnular] = useState(null)
  const [loadingAnular, setLoadingAnular] = useState(false)
  const [facturaToReceive, setFacturaToReceive] = useState(null)
  const [loadingReceive, setLoadingReceive] = useState(false)

  const {
    getAllFacturaCompra,
    data: ListFacturas,
    anularFacturaCompra,
    marcarComoRecibida,
    loading,
  } = useFacturasCompra()
  const { generarPDF } = useFacturaCompraPDF()

  const handleAnular = async () => {
    if (!facturaToAnular) return
    try {
      setLoadingAnular(true)
      await anularFacturaCompra(facturaToAnular._id)
      toast.success('Factura de compra anulada')
      setFacturaToAnular(null)
      getAllFacturaCompra()
    } catch (error) {
      toast.error('Error al anular la factura de compra')
    } finally {
      setLoadingAnular(false)
    }
  }

  const handleRecibir = async () => {
    if (!facturaToReceive) return
    try {
      setLoadingReceive(true)
      const res = await marcarComoRecibida(facturaToReceive._id)
      toast.success(res.data?.message || 'Mercancia recibida')
      setFacturaToReceive(null)
      getAllFacturaCompra()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al registrar recepcion')
    } finally {
      setLoadingReceive(false)
    }
  }

  useEffect(() => {
    getAllFacturaCompra()
  }, [draw])

  return (
    <>
      <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
        <DataTable
          className="MyDataTableEvent"
          striped
          columns={[
            {
              name: 'Acciones',
              width: '230px',
              cell: (row) => {
                const remisionPendiente =
                  !row.estado_remision || row.estado_remision === 'Pendiente'
                return (
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
                    {row.status !== 'Anulada' && remisionPendiente && (
                      <button
                        onClick={() => setFacturaToReceive(row)}
                        title="Recibir Mercancia"
                        className="btn btn-outline-warning btn-sm"
                      >
                        <i className="fa-solid fa-truck-ramp-box"></i>
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
                )
              },
            },
            { name: 'Proveedor', selector: (row) => row?.proveedor?.nombre ?? '', width: '250px' },
            {
              name: 'Total',
              selector: (row) => row?.price ?? '',
              format: (row) => ViewDollar(row?.total_monto) ?? '',
              width: '150px',
            },
            {
              name: 'Estado',
              selector: (row) => row?.status ?? '',
              format: (row) => row?.status ?? '',
              width: '130px',
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
              name: 'Remision',
              width: '140px',
              cell: (row) => {
                const remision = row.estado_remision || 'Pendiente'
                const color = remision === 'Recibida' ? '#4cf05a' : '#f0a04c'
                return (
                  <Chip
                    sx={{ backgroundColor: color }}
                    label={remision}
                    variant="outlined"
                    size="small"
                  />
                )
              },
            },
            {
              name: 'Creado por',
              selector: (row) => row?.user_create ?? '',
              format: (row) => (
                <>
                  <div>
                    <span className="text-muted">
                      <i className=" fa-solid fa-user me-1"></i>
                      {row?.user_create?.name ?? ' No registrado '}
                    </span>
                  </div>
                </>
              ),
            },
            {
              name: 'Fecha de Creacion.',
              selector: (row) =>
                `${new Date(row?.createdTime).toLocaleDateString() ?? ''} ${new Date(row?.createdTime).toLocaleTimeString() ?? ''}`,
              width: '160px',
            },
            {
              name: 'Fecha de Actua',
              selector: (row) =>
                `${new Date(row?.updatedTime).toLocaleDateString() ?? ''} ${new Date(row?.updatedTime).toLocaleTimeString() ?? ''}`,
              width: '160px',
            },

            { name: '', selector: (row) => row?.city ?? '' },
          ]}
          data={ListFacturas ? ListFacturas : []}
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
          paginationTotalRows={0}
          paginationComponentOptions={paginationComponentOptions}
          noDataComponent={
            <div className="d-flex justify-content-center my-5">No hay Facturas de Compra.</div>
          }
        />
      </div>
      {/* Modal confirmar recepcion de mercancia */}
      <Modal show={!!facturaToReceive} onHide={() => setFacturaToReceive(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fa-solid fa-truck-ramp-box text-warning me-2"></i>
            Recibir Mercancia
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Confirmar recepcion de la mercancia de la factura{' '}
            <strong>FC-{facturaToReceive?.numero_factura}</strong>?
          </p>
          <p className="text-muted small mb-0">
            Se registrara automaticamente la entrada en el inventario por cada producto de la
            factura. Esta accion se puede revertir solo anulando la factura.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setFacturaToReceive(null)}>
            Cancelar
          </button>
          <button
            className="btn btn-warning text-white"
            onClick={handleRecibir}
            disabled={loadingReceive}
          >
            {loadingReceive ? (
              <span className="spinner-border spinner-border-sm me-1" />
            ) : (
              <i className="fa-solid fa-check me-1"></i>
            )}
            Confirmar Recepcion
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmar anular */}
      <Modal show={!!facturaToAnular} onHide={() => setFacturaToAnular(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Anular Factura de Compra</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Está seguro que desea anular la factura de compra{' '}
            <strong>FC-{facturaToAnular?.numero_factura}</strong>?
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

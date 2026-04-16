/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useFacturas } from '../../../hooks/useFacturas'
import { useFacturaPDF } from '../../../hooks/useFacturaPDF'
import PropTypes from 'prop-types'
import FormFactura from './components/FormFactura'
import DetalleFactura from './components/DetalleFactura'
import FormPagosFactura from './components/FormPagosFactura'
import Chip from '@mui/material/Chip'

export default function FacturaPage({ draw, onViewFactura, onPayment }) {
  FacturaPage.propTypes = {
    setDraw: PropTypes.func,
    draw: PropTypes.number,
    onViewFactura: PropTypes.func,
    onPayment: PropTypes.func,
  }

  const [showDelete, setShowDelete] = useState(false)
  const [facturaToAnular, setFacturaToAnular] = useState(null)
  const [loadingAnular, setLoadingAnular] = useState(false)

  const { getAllFactura, data: ListFacturas, anularFactura, loading } = useFacturas()
  const { generarPDF } = useFacturaPDF()

  const handleAnular = async () => {
    if (!facturaToAnular) return
    try {
      setLoadingAnular(true)
      await anularFactura(facturaToAnular._id)
      toast.success('Factura anulada')
      setFacturaToAnular(null)
      getAllFactura()
    } catch (error) {
      toast.error('Error al anular la factura')
    } finally {
      setLoadingAnular(false)
    }
  }

  useEffect(() => {
    getAllFactura()
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
              width: '190px',
              cell: (row) => {
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
            {
              name: 'Cliente',
              selector: (row) => row?.client?.name ?? '',
              minWidth:"200px",
              format: (row) => {
                if (row.client_id === 'cliente_mostrador') {
                  return 'CLIENTE DE MOSTRADOR'
                }
              },
            },

            {
              name: 'Total',
              selector: (row) => row?.price ?? '',
              format: (row) => ViewDollar(row?.total_monto) ?? '',
            },
            {
              name: 'Estado',
              selector: (row) => row?.status ?? '',
              format: (row) => row?.status ?? '',
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
            },
            {
              name: 'Fecha de Actua',
              selector: (row) =>
                `${new Date(row?.updatedTime).toLocaleDateString() ?? ''} ${new Date(row?.updatedTime).toLocaleTimeString() ?? ''}`,
            },

            { name: '', selector: (row) => row?.city ?? '' },
          ]}
          data={ListFacturas ? ListFacturas : []}
          pagination
          //paginationServer
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
            <div className="d-flex justify-content-center my-5">No hay Facturas.</div>
          }
          /* onChangeRowsPerPage={(perPage, page) => {
            console.log(perPage, page)
            setdataFilter((status) => {
              return { ...status, perPage }
            })
          }} */
          /* onChangePage={(page) => {
            setdataFilter((status) => {
              return { ...status, page }
            })
          }} */
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

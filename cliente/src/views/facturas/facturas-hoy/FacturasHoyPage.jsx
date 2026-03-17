/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import moment from 'moment-timezone'
import { useFacturas } from '../../../hooks/useFacturas'
import { useFacturaPDF } from '../../../hooks/useFacturaPDF'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import Chip from '@mui/material/Chip'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import toast from 'react-hot-toast'

FacturasHoyPage.propTypes = {
  draw: PropTypes.number,
  onPayment: PropTypes.func,
  onViewFactura: PropTypes.func,
}

export default function FacturasHoyPage({ onViewFactura, onPayment, draw }) {
  const currentDate = moment.utc()
  const localDate = currentDate.tz('America/Bogota')

  const [date, setDate] = useState(localDate.format().split('T')[0])
  const [DataFacturaHoy, setDataFacturaHoy] = useState([])

  const { getAllFacturaPerDay, anularFactura } = useFacturas()
  const { generarPDF } = useFacturaPDF()
  const [loading, setLoading] = useState(false)
  const [facturaToAnular, setFacturaToAnular] = useState(null)
  const [loadingAnular, setLoadingAnular] = useState(false)

  const handleAnular = async () => {
    if (!facturaToAnular) return
    try {
      setLoadingAnular(true)
      await anularFactura(facturaToAnular._id)
      toast.success('Factura anulada')
      setFacturaToAnular(null)
      getFacturasPerDay(date)
    } catch {
      toast.error('Error al anular la factura')
    } finally {
      setLoadingAnular(false)
    }
  }

  useEffect(() => {
    getFacturasPerDay(date)
  }, [date, draw])

  const getFacturasPerDay = async (dateS) => {
    try {
      setLoading(true)
      const result = await getAllFacturaPerDay(dateS)
      setDataFacturaHoy(result.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className="mt-2">
      <div className="row mb-2">
        <div className="col-md-3">
          <input
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
            }}
            className="form-control"
            type="date"
          />
        </div>
      </div>
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
            { name: 'N° Factura', selector: (row) => `FV-${row?.numero_factura}` ?? '' },

            { name: 'Cliente', selector: (row) => row?.client?.name ?? '', width: '250px' },
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
              width: '150px',
              cell: (row) => {
                const translateColor = {
                  Pendiente: { color: '#f0e54c' },
                  Pagada: { color: '#4cf05a' },
                  Anulada: { color: '#f04c4c' },
                }

                return (
                  <Chip
                    sx={{ backgroundColor: translateColor[row.status].color }}
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
          data={DataFacturaHoy}
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
    </div>

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

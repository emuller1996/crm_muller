/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useFacturas } from '../../../hooks/useFacturas'
import PropTypes from 'prop-types'
import FormFactura from './components/FormFactura'
import DetalleFactura from './components/DetalleFactura'
import FormPagosFactura from './components/FormPagosFactura'

export default function FacturaPage({ draw, setDraw }) {
  FacturaPage.propTypes = {
    setDraw: PropTypes.func,
    draw: PropTypes.number,
  }
  const [show, setShow] = useState(false)
  const [showView, setShowView] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showPago, setShowPago] = useState(false)

  const [CotiSelecionada, setCotiSelecionada] = useState(null)

  //const [draw, setDraw] = useState(1)

  const { getAllFactura, data: ListFacturas, actualizarFactura, loading } = useFacturas()

  useEffect(() => {
    getAllFactura()
  }, [draw])

  return (
    <>
      <div className="my-2">
        <button
          type="button"
          onClick={() => {
            setCotiSelecionada(null)
            setShow(true)
          }}
          className="btn btn-primary"
          aria-pressed="false"
        >
          Nueva Factura
        </button>
      </div>
      <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
        <DataTable
          className="MyDataTableEvent"
          striped
          columns={[
            {
              name: 'Acciones',
              width: '150px',
              cell: (row) => {
                return (
                  <>
                    <div className="btn-group" role="group" aria-label="Basic outlined example">
                      <button
                        onClick={() => {
                          setShowView(true)
                          setCotiSelecionada(row)
                        }}
                        title="Ver Cotización"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      {row.status === 'Pendiente' && (
                        <button
                          onClick={() => {
                            setShowPago(true)
                            setCotiSelecionada(row)
                          }}
                          title="Registrar Pagos"
                          className="btn btn-outline-success btn-sm"
                        >
                          <i className="fa-solid fa-comment-dollar"></i>
                        </button>
                      )}
                    </div>
                  </>
                )
              },
            },
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
      <Modal backdrop={'static'} size="xl" centered show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormFactura
            getAllFactura={() => {
              setShow(false)
              setDraw((status) => ++status)
            }}
            //ProductoCotizacion={ProductoCotizacion}
          />
        </Modal.Body>
      </Modal>
      
      <Modal
        backdrop={'static'}
        size="xl"
        centered
        show={showView}
        onHide={() => setShowView(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalle Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DetalleFactura Factura={CotiSelecionada} />
        </Modal.Body>
      </Modal>
      <Modal
        backdrop={'static'}
        size="xl"
        centered
        show={showPago}
        onHide={() => setShowPago(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Pagos de Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormPagosFactura Factura={CotiSelecionada} />
        </Modal.Body>
      </Modal>
    </>
  )
}

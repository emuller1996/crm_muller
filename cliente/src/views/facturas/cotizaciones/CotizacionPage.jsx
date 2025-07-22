/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import { useState } from 'react'
import FormCotizacion from './components/FormCotizacion'
import FormProductoCotizacion from './components/FormProductoCotizacion'
import { useCotizacion } from '../../../hooks/useCotizacion'
export default function CotizacionPage() {
  const [show, setShow] = useState(false)
  const [draw, setDraw] = useState(1)
  const [ProductoCotizacion, setProductoCotizacion] = useState([])

  const { getAllCotizacion, data: ListCotizaciones } = useCotizacion()

  useEffect(() => {
    getAllCotizacion()
  }, [draw])

  return (
    <>
      <div className="my-2">
        <button
          type="button"
          onClick={() => setShow(true)}
          className="btn btn-primary"
          aria-pressed="false"
        >
          Nueva Cotización
        </button>
      </div>
      <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
        <DataTable
          className="MyDataTableEvent"
          striped
          columns={[
            {
              name: 'Acciones',
              cell: (row) => {
                return (
                  <>
                    <button
                      onClick={() => {
                        setProductoSelecionado(row)
                        handleShow()
                      }}
                      title="Editar Producto."
                      className="btn btn-primary btn-sm me-2"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      onClick={() => {
                        setProductoSelecionado(row)
                        setShowSize(true)
                      }}
                      title="Editar Producto."
                      className="btn btn-info btn-sm me-2"
                    >
                      <i className="text-white fa-regular fa-images"></i>
                    </button>
                    <button
                      to={`${row._id}/gestion-tallas`}
                      onClick={() => {
                        setProductoSelecionado(row)
                        setShowSizeTallas(true)
                        //handleShow()
                      }}
                      title="Gestion de Tallas del Producto."
                      className="btn btn-secondary btn-sm"
                    >
                      <i className="fa-solid fa-tags"></i>
                    </button>
                  </>
                )
              },
            },
            //{ name: 'Id', selector: (row) => row._id, width: '100px' },
            { name: 'Cliente', selector: (row) => row?.name ?? '', width: '250px' },

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
          data={ListCotizaciones ? ListCotizaciones : []}
          pagination
          paginationServer
          //progressPending={loading}
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
            <div className="d-flex justify-content-center my-5">No hay Cotizaciones.</div>
          }
          onChangeRowsPerPage={(perPage, page) => {
            console.log(perPage, page)
            setdataFilter((status) => {
              return { ...status, perPage }
            })
          }}
          onChangePage={(page) => {
            setdataFilter((status) => {
              return { ...status, page }
            })
          }}
        />
      </div>
      <Modal backdrop={'static'} size="xl" centered show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Cotización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-4">
            <div className="col-md-6">
              <FormCotizacion
                getAllCotizacion={() => {
                  setShow(false)
                  setDraw((status) => ++status)
                }}
                ProductoCotizacion={ProductoCotizacion}
              />
            </div>
            <div className="col-md-6">
              <FormProductoCotizacion setProductoCotizacion={setProductoCotizacion} />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

/* eslint-disable prettier/prettier */
import React from 'react'
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import { useState } from 'react'
import FormCotizacion from './components/FormCotizacion'
import FormProductoCotizacion from './components/FormProductoCotizacion'
export default function CotizacionPage(second) {
  const [show, setShow] = useState(true)

  const [ProductoCotizacion, setProductoCotizacion] = useState([])
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
              name: 'Precio',
              selector: (row) => row?.price ?? '',
              format: (row) => ViewDollar(row?.price) ?? '',
              width: '150px',
            },
            { name: 'Valor', selector: (row) => ViewDollar(row?.cost) ?? '', width: '150px' },
            {
              name: 'Estado',
              selector: (row) => row?.price ?? '',
              format: (row) => row?.price ?? '',
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
          data={[{}]}
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
              <FormCotizacion ProductoCotizacion={ProductoCotizacion} />
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

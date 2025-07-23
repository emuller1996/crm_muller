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
  const [showView, setShowView] = useState(false)
  const [CotiSelecionada, setCotiSelecionada] = useState(null)

  const [draw, setDraw] = useState(1)

  const { getAllCotizacion, data: ListCotizaciones } = useCotizacion()

  useEffect(() => {
    getAllCotizacion()
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
                      <button
                        onClick={() => {
                          setShow(true)
                          setCotiSelecionada(row)
                        }}
                        type="button"
                        className="btn btn-outline-info  btn-sm"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button type="button" className="btn btn-outline-danger  btn-sm">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </>
                )
              },
            },
            //{ name: 'Id', selector: (row) => row._id, width: '100px' },
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
          <FormCotizacion
            CotiSelecionada={CotiSelecionada}
            getAllCotizacion={() => {
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
          <Modal.Title>
            Cotización Detalle <span className="fw-bold">#{CotiSelecionada?._id}</span>{' '}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="px-3">
            <div className="row">
              <div className="col-md-6">
                <p className="m-0">Datos Cliente.</p>
                <p className="m-0 fs-5">{CotiSelecionada?.client?.name}</p>
              </div>
              <div className="col-md-6">
                <p className="m-0">Fecha Generada.</p>
                <p className="m-0 fs-5">
                  {new Date(CotiSelecionada?.createdTime).toLocaleDateString()}{' '}
                  {new Date(CotiSelecionada?.createdTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
          <div className="px-3">
            <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
              <DataTable
                className="MyDataTableEvent"
                striped
                columns={[
                  {
                    name: 'Nombre Producto',
                    selector: (row) => row?.product_name ?? '',
                  },
                  {
                    name: 'Cant.',
                    selector: (row) => row?.cantidad ?? '',
                  },
                  {
                    name: 'Precio',
                    selector: (row) => row?.price ?? '',
                    format: (row) => ViewDollar(row?.price) ?? '',
                  },
                  {
                    name: 'Precio',
                    selector: (row) => row?.price ?? '',
                    format: (row) => ViewDollar(row?.price * row?.cantidad) ?? '',
                  },
                ]}
                noDataComponent={<p className="my-4">No hay Productos en la Cotización.</p>}
                data={CotiSelecionada?.productos}
              />
            </div>
            <div className="text-center mt-2">
              <span className="me-2">Total </span>
              <span className="fw-bold fs-4">{ViewDollar(CotiSelecionada?.total_monto)}</span>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

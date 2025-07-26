/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useFacturas } from '../../../hooks/useFacturas'

export default function FacturaPage() {
  const [show, setShow] = useState(false)
  const [showView, setShowView] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showFirma, setShowFirma] = useState(false)
  const [showFactura, setShowFactura] = useState(false)

  const [CotiSelecionada, setCotiSelecionada] = useState(null)

  const [draw, setDraw] = useState(1)

  const { getAllFactura, data: ListFacturas, actualizarFactura } = useFacturas()

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
                      {!row.signature && (
                        <>
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
                          <button
                            onClick={() => {
                              setShowFirma(true)
                              setCotiSelecionada(row)
                            }}
                            type="button"
                            className="btn btn-outline-secondary  btn-sm"
                          >
                            <i className="fa-solid fa-signature"></i>
                          </button>
                          <button
                            onClick={() => {
                              setShowDelete(true)
                              setCotiSelecionada(row)
                            }}
                            type="button"
                            className="btn btn-outline-danger  btn-sm"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </>
                      )}
                      {row.signature && (
                        <button
                          onClick={() => {
                            setShowFactura(true)
                            setCotiSelecionada(row)
                          }}
                          title="Generar Factura"
                          className="btn btn-outline-success btn-sm"
                        >
                          <i className="fa-solid fa-file-invoice-dollar"></i>
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
                      <i  className=" fa-solid fa-user me-1"></i>
                      {row?.user_create?.name ?? " No registrado "}
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
    

 
    </>
  )
}

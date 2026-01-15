/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import moment from 'moment-timezone'
import { useFacturas } from '../../../hooks/useFacturas'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import Chip from '@mui/material/Chip'

export default function FacturasHoyPage() {
  const currentDate = moment.utc()
  const localDate = currentDate.tz('America/Bogota')

  const [date, setDate] = useState(localDate.format().split('T')[0])
  const [DataFacturaHoy, setDataFacturaHoy] = useState([])

  const { getAllFacturaPerDay } = useFacturas()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getFacturasPerDay(date)
  }, [date])

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
              cell: (row) => {
                const translateColor = {
                  Pendiente: {
                    color: '#f0e54c',
                  },
                  Pagada: {
                    color: '#4cf05a',
                  },
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
  )
}

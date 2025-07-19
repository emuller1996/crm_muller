/* eslint-disable prettier/prettier */
import React from 'react'
import DataTable from 'react-data-table-component'
import { useProductos } from '../../../../hooks/useProductos'
import { useEffect } from 'react'
import { useState } from 'react'
import { paginationComponentOptions } from '../../../../utils/optionsConfig'
import { ViewDollar } from '../../../../utils'
import { Button, Card, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import CurrencyInput from 'react-currency-input-field'
import FormDetailProducto from './FormDetailProducto'

export default function FormProductoCotizacion({ setProductoCotizacion }) {
  const {
    getAllProductos,
    data: ListProductos,
    getAllProductosPagination,
    dataP,
    loading,
  } = useProductos()

  const [ProductoSelecionado, setProductoSelecionado] = useState(null)

  const [dataFilter, setdataFilter] = useState({
    perPage: 10,
    search: '',
    page: 1,
    draw: 1,
  })

  useEffect(() => {
    getAllProductosPagination(dataFilter)
  }, [dataFilter])

  return (
    <>
      {!ProductoSelecionado && (
        <>
          <div className="col-md-12">
            <div className="w-100">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  placeholder="Busque Producto por Nombre, Categoria y Marca"
                  type="text"
                  aria-label="First name"
                  className="form-control"
                  onChange={(e) => {
                    setdataFilter((status) => {
                      return { ...status, search: e.target.value }
                    })
                  }}
                />
              </div>
            </div>
          </div>
          <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
            <DataTable
              className="MyDataTableEvent"
              striped
              columns={[
                {
                  name: '',
                  cell: (row) => {
                    return (
                      <>
                        <button
                          onClick={() => {
                            console.log(row.price)
                            setProductoSelecionado(row)
                          }}
                          title="Editar Producto."
                          className="btn btn-primary btn-sm me-2"
                        >
                          <i className="fa-solid fa-cart-plus"></i>
                        </button>
                      </>
                    )
                  },
                },
                { name: 'Nombre Producto', selector: (row) => row?.name ?? '', width: '250px' },
                
                {
                  name: 'Precio',
                  selector: (row) => row?.price ?? '',
                  format: (row) => ViewDollar(row?.price) ?? '',
                  width: '150px',
                },
                {
                  name: 'Fecha de Actua',
                  selector: (row) =>
                    `${new Date(row?.updatedTime).toLocaleDateString() ?? ''} ${new Date(row?.updatedTime).toLocaleTimeString() ?? ''}`,
                  width: '160px',
                },
              ]}
              data={dataP?.data}
              pagination
              paginationServer
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
              paginationTotalRows={dataP?.total}
              paginationComponentOptions={paginationComponentOptions}
              noDataComponent={
                <div className="d-flex justify-content-center my-5">No hay productos.</div>
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
        </>
      )}

      {ProductoSelecionado && (
        <>
          <FormDetailProducto
            setProductoSelecionado={setProductoSelecionado}
            ProductoSelecionado={ProductoSelecionado}
            setProductoCotizacion={setProductoCotizacion}
          />
        </>
      )}
    </>
  )
}

/* eslint-disable prettier/prettier */
import React from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import CurrencyInput from 'react-currency-input-field'
import { Controller, useForm } from 'react-hook-form'
import AsyncSelect from 'react-select/async'
import { useClientes } from '../../../../hooks/useClientes'
import { stylesSelect, themeSelect } from '../../../../utils/optionsConfig'
import DataTable from 'react-data-table-component'
import { ViewDollar } from '../../../../utils'

export default function FormCotizacion({ ProductoCotizacion }) {
  const { getAllClientesPaginationPromise } = useClientes()

  console.log(ProductoCotizacion)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    data.productos = ProductoCotizacion
    console.log(data)
  }

  const searchLeadOptions = async (value) => {
    try {
      const result = await getAllClientesPaginationPromise({
        search: value,
        page: 1,
      })
      return result.data.data.map((c) => {
        return {
          label: `${c.name ?? ''} - ${c.alias ?? ''} - ${c.telefono ?? ''}`,
          value: c._id,
        }
      })
    } catch (error) {
      console.log(error)
      return []
    }
  }
  return (
    <>
      <Card>
        <Card.Body>
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <Form.Label htmlFor="client_id">Cliente</Form.Label>
              <Controller
                name="client_id"
                rules={{ required: true }}
                control={control}
                render={({ field: { name, onChange, ref } }) => {
                  return (
                    <AsyncSelect
                      isClearable
                      cacheOptions
                      defaultOptions
                      inputId="client_id"
                      loadOptions={searchLeadOptions}
                      placeholder="Selecionar Cliente"
                      onChange={(e) => {
                        onChange(e?.value)
                      }}
                      name={name}
                      ref={ref}
                      styles={stylesSelect}
                      theme={themeSelect}
                    />
                  )
                }}
              />
            </div>
            <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
              <DataTable
                className="MyDataTableEvent"
                striped
                columns={[
                  {
                    name: '',
                    width: '50px',
                    cell: (row) => {
                      return (
                        <>
                          <button
                            onClick={() => {
                              console.log(row.price)
                              //setProductoSelecionado(row)
                            }}
                            title="Editar Producto."
                            className="btn btn-danger btn-sm me-2"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </>
                      )
                    },
                  },
                  {
                    name: 'Nombre Producto',
                    selector: (row) => row?.product_name ?? '',
                    width: '200px',
                  },
                  {
                    name: 'Cant.',
                    selector: (row) => row?.cantidad ?? '',
                    width: '70px',
                  },
                  {
                    name: 'Precio',
                    selector: (row) => row?.price ?? '',
                    format: (row) => ViewDollar(row?.price) ?? '',
                    width: '150px',
                  },
                  {
                    name: 'Precio',
                    selector: (row) => row?.price ?? '',
                    format: (row) => ViewDollar(row?.price *row?.cantidad ) ?? '',
                    width: '150px',
                  },
                ]}
                noDataComponent={<p className="my-4">No hay Productos en la Cotización.</p>}
                data={ProductoCotizacion}
              />
            </div>

            <div className="mt-5 d-flex gap-4 justify-content-center">
              <Button type="submit" className="text-white" variant="success">
                Guardar Cotización
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </>
  )
}

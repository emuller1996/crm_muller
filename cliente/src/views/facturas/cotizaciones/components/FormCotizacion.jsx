/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import CurrencyInput from 'react-currency-input-field'
import { Controller, useForm } from 'react-hook-form'
import AsyncSelect from 'react-select/async'
import { useClientes } from '../../../../hooks/useClientes'
import { stylesSelect, themeSelect } from '../../../../utils/optionsConfig'
import DataTable from 'react-data-table-component'
import { ViewDollar } from '../../../../utils'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import { useCotizacion } from '../../../../hooks/useCotizacion'
import FormProductoCotizacion from './FormProductoCotizacion'

export default function FormCotizacion({ getAllCotizacion, CotiSelecionada }) {
  FormCotizacion.propTypes = {
    getAllCotizacion: PropTypes.func,
    CotiSelecionada: PropTypes.object,
  }
  const { getAllClientesPaginationPromise } = useClientes()

  const [ProductoCotizacion, setProductoCotizacion] = useState(
    CotiSelecionada ? CotiSelecionada.productos : [],
  )

  const { crearCotizacion, actualizarCotizacion } = useCotizacion()
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    if (ProductoCotizacion.length === 0) {
      toast.error(`Selecione al menos un producto a la Cotización`)
      return
    }
    data.productos = ProductoCotizacion
    data.total_monto = ProductoCotizacion?.reduce((preVal, currentVal) => {
      return preVal + currentVal.price * currentVal.cantidad
    }, 0)
    if (CotiSelecionada) {
      try {
        await actualizarCotizacion(data,CotiSelecionada._id)
        toast.success(`Cotizacion Actualizada`)
        getAllCotizacion()
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await crearCotizacion(data)
        toast.success(`Cotizacion Creada`)
        getAllCotizacion()
      } catch (error) {
        console.log(error)
      }
    }
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
      <div className="row g-4">
        <div className="col-md-6">
          <Card>
            <Card.Body>
              <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <Form.Label htmlFor="client_id">Cliente</Form.Label>
                  <Controller
                    name="client_id"
                    rules={{ required: true }}
                    control={control}
                    defaultValue={CotiSelecionada ? CotiSelecionada.client_id : undefined}                    
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
                          defaultValue={
                            CotiSelecionada && {
                              value: CotiSelecionada?.client.id,
                              label: CotiSelecionada?.client.name,
                            }
                          }
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
                        format: (row) => ViewDollar(row?.price * row?.cantidad) ?? '',
                        width: '150px',
                      },
                    ]}
                    noDataComponent={<p className="my-4">No hay Productos en la Cotización.</p>}
                    data={ProductoCotizacion}
                  />
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <span>Total</span>
                  <span>
                    {ProductoCotizacion &&
                      ViewDollar(
                        ProductoCotizacion?.reduce((preVal, currentVal) => {
                          return preVal + currentVal.price * currentVal.cantidad
                        }, 0),
                      )}
                  </span>
                </div>

                <div className="mt-5 d-flex gap-4 justify-content-center">
                  <Button type="submit" className="text-white" variant="success">
                    Guardar Cotización
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <FormProductoCotizacion setProductoCotizacion={setProductoCotizacion} />
        </div>
      </div>
    </>
  )
}

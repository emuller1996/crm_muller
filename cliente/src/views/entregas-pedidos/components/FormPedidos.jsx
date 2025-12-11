/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import CurrencyInput from 'react-currency-input-field'
import { Controller, useForm } from 'react-hook-form'
import AsyncSelect from 'react-select/async'
import DataTable from 'react-data-table-component'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import Select from 'react-select'
import { useClientes } from '../../../hooks/useClientes'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import { ViewDollar } from '../../../utils'
import { usePedidos } from '../../../hooks/usePedidos'
import FormProductoCotizacion from '../../cotizaciones/components/FormProductoCotizacion'

export default function FormPedidos({ getAllPedido, PedidoSelect }) {
  FormPedidos.propTypes = {
    getAllPedido: PropTypes.func,
    PedidoSelect: PropTypes.object,
  }
  const { getAllClientesPaginationPromise, getClientesById } = useClientes()
  const { crearPedidos, actualizarPedidos } = usePedidos()

  const [ProductoCotizacion, setProductoCotizacion] = useState(
    PedidoSelect ? PedidoSelect.productos : [],
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const [isPending, setPending] = useState(false)
  const onSubmit = async (data) => {
    if (ProductoCotizacion?.length === 0) {
      toast.error(`Selecione al menos un producto al Pedido!`)
      return
    }
    data.productos = ProductoCotizacion
    data.total_monto = ProductoCotizacion?.reduce((preVal, currentVal) => {
      return preVal + currentVal.price * currentVal.cantidad
    }, 0)
    console.log(data)
    if (PedidoSelect) {
      try {
        await actualizarPedidos(data, PedidoSelect._id)
        toast.success(`Pedido Actualizado`)
        //getAllCotizacion()
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await crearPedidos(data)
        toast.success(`Pedido Creado`)
        //getAllFactura()
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
                    defaultValue={PedidoSelect ? PedidoSelect.client_id : undefined}
                    render={({ field: { name, onChange, ref } }) => {
                      return (
                        <AsyncSelect
                          isClearable
                          cacheOptions
                          defaultOptions
                          inputId="client_id"
                          loadOptions={searchLeadOptions}
                          placeholder="Selecionar Cliente"
                          onChange={async (e) => {
                            onChange(e?.value)
                            if (e?.value) {
                              const result = await getClientesById(e?.value)
                              console.log(result.data.direccion)
                              setValue('direccion', result.data.direccion)
                            } else {
                              setValue('direccion', '')
                            }
                          }}
                          name={name}
                          defaultValue={
                            PedidoSelect && {
                              value: PedidoSelect?.client.id,
                              label: PedidoSelect?.client.name,
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

                <div className="row g-3 mb-3">
                  <div className="col-md-12">
                    <Form.Group className="" controlId="name">
                      <Form.Label>Dirrecion</Form.Label>
                      <Form.Control
                        {...register('direccion', { required: true })}
                        type="text"
                        placeholder=""
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-12">
                    <Form.Group className="" controlId="name">
                      <Form.Label>Fecha de Entrega</Form.Label>
                      <Form.Control
                        {...register('fecha_entrega', { required: true })}
                        type="date"
                        placeholder=""
                      />
                    </Form.Group>
                  </div>
                </div>
                <p className="text-center">Lista de Productos</p>
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
                                  console.log(row.product_id)

                                  console.log(
                                    ProductoCotizacion.filter(
                                      (ele) => ele.product_id !== row.product_id,
                                    ),
                                  )

                                  setProductoCotizacion((status) => {
                                    return status.filter((ele) => ele.product_id !== row.product_id)
                                  })
                                  //setProductoSelecionado(row)
                                }}
                                type="button"
                                title="Remover Producto."
                                className="btn btn-danger btn-sm me-2 text-white"
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
                        name: 'Total',
                        selector: (row) => row?.price ?? '',
                        format: (row) => ViewDollar(row?.price * row?.cantidad) ?? '',
                        width: '150px',
                      },
                    ]}
                    noDataComponent={<p className="my-4">No hay Productos en el Pedido.</p>}
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
                <div className="col-12">
                  <Form.Group className="mb-3 mt-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label className="text-center w-100">Notas</Form.Label>
                    <Form.Control
                      {...register('nota')}
                      as="textarea"
                      placeholder="Agrega una nota aca ..."
                      rows={2}
                    />
                  </Form.Group>
                </div>
                <div className="mt-5 d-flex gap-4 justify-content-center">
                  <Button type="submit" className="text-white" variant="success">
                    Guardar Pedido / Entrega
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

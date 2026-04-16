/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import CurrencyInput from 'react-currency-input-field'
import { Controller, useForm } from 'react-hook-form'
import AsyncSelect from 'react-select/async'
import { useClientes } from '../../../../hooks/useClientes'
import { stylesSelect, themeSelect } from '../../../../utils/optionsConfig'
import DataTable from 'react-data-table-component'
import { ViewDollar } from '../../../../utils'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import Select from 'react-select'
import { useFacturas } from '../../../../hooks/useFacturas'
import FormProductoCotizacion from '../../../cotizaciones/components/FormProductoCotizacion'
import moment from 'moment-timezone'
export default function FormFactura({ getAllFactura, FacturaSelect }) {
  FormFactura.propTypes = {
    getAllFactura: PropTypes.func,
    FacturaSelect: PropTypes.object,
  }
  const { getAllClientesPaginationPromise } = useClientes()

  const currentDate = moment.utc()
  const localDate = currentDate.tz('America/Bogota')

  const [ProductoCotizacion, setProductoCotizacion] = useState(
    FacturaSelect ? FacturaSelect.productos : [],
  )

  const { crearFactura } = useFacturas()
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const [isPending, setPending] = useState(false)
  const onSubmit = async (data) => {
    if (ProductoCotizacion.length === 0) {
      toast.error(`Selecione al menos un producto a la Factura`)
      return
    }
    data.productos = ProductoCotizacion
    data.dia_venta = localDate.format().split('T')[0]
    data.total_monto = ProductoCotizacion?.reduce((preVal, currentVal) => {
      return preVal + currentVal.price * currentVal.cantidad
    }, 0)
    console.log(data)
    try {
      await crearFactura(data)
      toast.success(`Factura Creada`)
      getAllFactura()
    } catch (error) {
      console.log(error)
    }
  }

  const searchLeadOptions = async (value) => {
    try {
      const mostradorOption = {
        label: 'CLIENTE DE MOSTRADORA',
        value: 'cliente_mostrador',
      }

      const result = await getAllClientesPaginationPromise({
        search: value,
        page: 1,
      })

      const clientesOptions = result.data.data.map((c) => {
        return {
          label: `${c.name ?? ''} - ${c.alias ?? ''} - ${c.telefono ?? ''}`,
          value: c._id,
        }
      })

      // Siempre incluir la opción de mostrador al inicio
      return [mostradorOption, ...clientesOptions]
    } catch (error) {
      console.log(error)
      return [
        {
          label: 'CLIENTE DE MOSTRADORA',
          value: 'cliente_mostrador',
        },
      ]
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
                    defaultValue={FacturaSelect ? FacturaSelect.client_id : undefined}
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
                            FacturaSelect && {
                              value: FacturaSelect?.client.id,
                              label: FacturaSelect?.client.name,
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

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="">
                      <Form.Label htmlFor="status">Estado</Form.Label>
                      <Controller
                        name="status"
                        rules={{
                          required: { value: true, message: 'Selecione el Estado de la Factura' },
                        }}
                        control={control}
                        defaultValue={'Pagada'}
                        render={({ field: { name, onChange, ref } }) => {
                          return (
                            <Select
                              options={[
                                { label: 'Pendiente', value: 'Pendiente' },
                                { label: 'Pagada', value: 'Pagada' },
                              ]}
                              defaultValue={{ label: 'Pagada', value: 'Pagada' }}
                              placeholder="Selecione un Estado"
                              inputId="status"
                              onChange={(tar) => {
                                onChange(tar.value)
                                if (tar.value === 'Pendiente') {
                                  setPending(true)
                                } else {
                                  setPending(false)
                                }
                              }}
                              ref={ref}
                              styles={stylesSelect}
                              theme={themeSelect}
                            />
                          )
                        }}
                      />
                      <Form.Text className="text-danger"> {errors?.metodo_pago?.message}</Form.Text>
                    </div>
                  </div>
                  {/* <div className="col-md-6">
                    <div className="">
                      <Form.Label htmlFor="metodo_pago">Metodo de Pago</Form.Label>
                      <Controller
                        name="metodo_pago"
                        rules={{
                          required: { value: true, message: 'Selecione el Metodo de Pago' },
                        }}
                        control={control}
                        //defaultValue={CotiSelecionada ? CotiSelecionada.client_id : undefined}
                        render={({ field: { name, onChange, ref } }) => {
                          return (
                            <Select
                              inputId="metodo_pago"
                              options={[
                                { label: 'Efectivo', value: 'efectivo' },
                                { label: 'Tarjeta', value: 'tarjeta' },
                                { label: 'Transferencia', value: 'transferencia' },
                              ]}
                              placeholder="Selecione Medio de Pago"
                              onChange={(tar) => {
                                onChange(tar.value)
                              }}
                              ref={ref}
                              styles={stylesSelect}
                              theme={themeSelect}
                            />
                          )
                        }}
                      />
                      <Form.Text className="text-danger"> {errors?.metodo_pago?.message}</Form.Text>
                    </div>
                  </div> */}
                  <label className='text-center'>Metodo de Pago</label>
                  <div className="mt-1 mb-2 d-flex gap-3">
                    <Form.Check className="p-0">
                      <Form.Check.Input
                        {...register('metodo_pago', { required: true })}
                        type={'radio'}
                        hidden
                        name="metodo_pago"
                        id={`efectivo`}
                        value={'efectivo'}
                      />
                      <Form.Check.Label
                        className=" p-2"
                        style={{
                          border: '1px solid',
                          borderRadius: '0.4em',
                          cursor: 'pointer',
                          borderColor: watch().metodo_pago === 'efectivo' ? '#436efd' : '#acacac',
                          color: watch().metodo_pago === 'efectivo' ? '#436efd' : '#303030',
                        }}
                        htmlFor="efectivo"
                      >
                        {`Efectivo`}
                        <i className="ms-2 fa-xl fa-solid fa-money-bill"></i>
                      </Form.Check.Label>
                    </Form.Check>
                    <Form.Check className="p-0">
                      <Form.Check.Input
                        {...register('metodo_pago', { required: true })}
                        type={'radio'}
                        id={`tarjeta`}
                        name="metodo_pago"
                        value={'tarjeta'}
                        hidden
                      />
                      <Form.Check.Label
                        className=" p-2"
                        style={{
                          border: '1px solid',
                          borderRadius: '0.4em',
                          cursor: 'pointer',
                          borderColor: watch().metodo_pago === 'tarjeta' ? '#436efd' : '#acacac',
                          color: watch().metodo_pago === 'tarjeta' ? '#436efd' : '#303030',
                        }}
                        htmlFor="tarjeta"
                      >
                        Tarjeta
                        <i className="fa-xl fa-solid fa-credit-card ms-2"></i>
                      </Form.Check.Label>
                    </Form.Check>
                    <Form.Check className="p-0">
                      <Form.Check.Input
                        {...register('metodo_pago', { required: true })}
                        type={'radio'}
                        id={`Transferencia`}
                        name="metodo_pago"
                        value={'Transferencia'}
                        hidden
                      />
                      <Form.Check.Label
                        className="p-2"
                        style={{
                          border: '1px solid',
                          borderRadius: '0.4em',
                          cursor: 'pointer',
                          borderColor:
                            watch().metodo_pago === 'Transferencia' ? '#436efd' : '#acacac',
                          color: watch().metodo_pago === 'Transferencia' ? '#436efd' : '#303030',
                        }}
                        htmlFor="Transferencia"
                      >
                        Transferencia
                        <i className="fa-xl fa-solid fa-money-bill-transfer ms-2"></i>
                      </Form.Check.Label>
                    </Form.Check>
                  </div>
                  {errors?.metodo_pago && (
                    <div>
                      <Alert variant={'warning'}>Elige un Metodo de Pago.</Alert>
                    </div>
                  )}
                  {isPending && (
                    <div className="col-md-6">
                      <Form.Group className="" controlId="name">
                        <Form.Label>Fecha de Vencimiento</Form.Label>
                        <Form.Control
                          {...register('fecha_vencimiento', { required: true })}
                          type="date"
                          placeholder=""
                        />
                      </Form.Group>
                    </div>
                  )}
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
                    noDataComponent={<p className="my-4">No hay Productos en la Factura.</p>}
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
                    {/* <Form.Label>Nota</Form.Label> */}
                    <Form.Control
                      {...register('nota')}
                      as="textarea"
                      placeholder="Agrega una nota aca ..."
                      rows={2}
                    />
                  </Form.Group>
                </div>
                <div className="mt-5 d-flex gap-4 justify-content-center">
                  <Button
                    disabled={isSubmitting}
                    variant="success"
                    type="submit"
                    className="px-4 text-white"
                  >
                    {/* <Link to={'/d/dashboard'}> */}
                    {isSubmitting ? (
                      <Spinner
                        style={{
                          width: '15px',
                          height: '15px',
                          marginLeft: '0.7em',
                          marginRight: '0.7em',
                        }}
                      ></Spinner>
                    ) : (
                      ' Guardar Factura'
                    )}
                    {/* </Link> */}
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

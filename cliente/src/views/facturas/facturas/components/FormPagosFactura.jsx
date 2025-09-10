/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import CurrencyInput from 'react-currency-input-field'
import { Controller, useForm } from 'react-hook-form'
import { ViewDollar } from '../../../../utils'
import PropTypes from 'prop-types'
import { useFacturas } from '../../../../hooks/useFacturas'
import toast from 'react-hot-toast'

export default function FormPagosFactura({ Factura }) {
  FormPagosFactura.propTypes = {
    Factura: PropTypes.object,
  }

  const [Pagos, setPagos] = useState(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm()

  const { crearPagoByFactura, getPagosByFactura } = useFacturas()

  useEffect(() => {
    getPagos(Factura._id)
  }, [Factura?._id])

  const getPagos = async (id) => {
    try {
      const result = await getPagosByFactura(id)
      console.log(result.data)
      setPagos(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const onSubmit = async (data) => {
    console.log(data)
    try {
      const result = await crearPagoByFactura(data, Factura._id)
      console.log(result)
      toast.success(result?.data?.message)
      await getPagos(Factura._id)
    } catch (error) {
      console.log(error)
      toast.error(`Error : ${error?.message}`)
    }
  }

  return (
    <>
      <div className="row g-4">
        <div className="col-12">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex justify-content-between">
                <span>Cliente</span>
                <span>{Factura?.client?.name}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Monto</span>
                <span>{ViewDollar(Factura?.total_monto)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Saldo a Pagar</span>
                {Pagos && (
                  <span className="text-center">
                    {ViewDollar(Factura?.total_monto - Pagos?.suma?.value)}
                  </span>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-between">
                <span>Estado</span>
                <span>{Factura?.status}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Fecha de Vencimiento</span>
                <span>{Factura?.fecha_vencimiento}</span>
              </div>
            </div>
          </div>
          <hr />
        </div>
        <div className="col-md-6">
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Form.Label>Monto de Pago</Form.Label>
              <Controller
                control={control}
                name="monto"
                rules={{ required: 'Monto del Pago es requerido' }}
                render={({ field: { name, onChange, ref, value } }) => {
                  return (
                    <CurrencyInput
                      ref={ref}
                      className="form-control"
                      id={name}
                      name={name}
                      value={value}
                      placeholder=""
                      decimalsLimit={2}
                      prefix="$"
                      intlConfig={{ locale: 'en-US', currency: 'GBP' }}
                      onValueChange={(value, name, values) => {
                        console.log(value, name, values)
                        onChange(values.float)
                      }}
                    />
                  )
                }}
              />
            </div>
            <div className="mt-3 mb-2 d-flex gap-3">
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
                    borderColor: watch().metodo_pago === 'Transferencia' ? '#436efd' : '#acacac',
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
            <div className="mt-3 text-center">
              <Button variant="primary" className="ms-2" type="submit">
                Agregar
              </Button>
            </div>
          </form>
        </div>
        <div className="col-md-6">
          <p className="text-center mb-2">Pagos Realizados</p>
          <div className="row">
            {Pagos && Array.isArray(Pagos) && Pagos.length === 0 && (
              <div>
                <div className="alert alert-secondary" role="alert">
                  <strong>No hay Pagos Registrado en esta Facturas.</strong>
                </div>
              </div>
            )}
            {Pagos &&
              Array.isArray(Pagos.pagos) &&
              Pagos.pagos.map((pay) => (
                <div key={pay._id} className="col-12 mb-2">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <span>Monto</span>
                        <span style={{ fontWeight: '600', color: 'green' }}>
                          {ViewDollar(pay.monto)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Fecha Y Hora</span>
                        <span>
                          {new Date(pay.createdTime).toLocaleDateString()} -{' '}
                          {new Date(pay.createdTime).toLocaleTimeString()}{' '}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Metodo de Pago</span>
                        <span className="text-capitalize">
                          {pay.metodo_pago}
                          {pay.metodo_pago === 'tarjeta' && (
                            <i className="fa-xl fa-solid fa-credit-card ms-2"></i>
                          )}
                          {pay.metodo_pago === 'efectivo' && (
                            <i className="ms-2 fa-xl fa-solid fa-money-bill"></i>
                          )}
                          {pay.metodo_pago === 'Transferencia' && (
                            <i className="fa-xl fa-solid fa-money-bill-transfer ms-2"></i>
                          )}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Registrado por</span>
                        <span>{pay.user_create.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {Pagos && (
              <p className="text-center">
                Total Pagos :{' '}
                <span className="fw-semibold text-success fs-4">
                  {ViewDollar(Pagos?.suma?.value)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

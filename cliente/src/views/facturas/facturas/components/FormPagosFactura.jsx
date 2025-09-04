/* eslint-disable prettier/prettier */
import React from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import CurrencyInput from 'react-currency-input-field'
import { Controller, useForm } from 'react-hook-form'

export default function FormPagosFactura() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm()

  console.log(watch().metodo_pago)
  console.log(errors)

  const onSubmit = async (data) => {
    console.log(data)
  }

  return (
    <>
      <div className="row g-4">
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
      </div>
    </>
  )
}

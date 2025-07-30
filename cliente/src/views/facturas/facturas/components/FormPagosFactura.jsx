/* eslint-disable prettier/prettier */
import React from 'react'
import { Button, Form } from 'react-bootstrap'
import CurrencyInput from 'react-currency-input-field'
import { Controller, useForm } from 'react-hook-form'

export default function FormPagosFactura() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()
  return (
    <>
      <div className="row g-4">
        <div className="col-md-6">
          <form>
            <div>
              <Form.Label>Monto de Pago</Form.Label>
              <Controller
                control={control}
                name="price"
                rules={{ required: 'el Precio es requerido' }}
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
            <div className="my-3 d-flex gap-3">
              <Form.Check className="border p-2" type={'radio'} id={`efectivo`}>
                <Form.Check.Input type={'radio'} name="metodo_pago" value={'efectivo'} />
                <Form.Check.Label>
                  {`Efectivo`}
                  <i className="fa-xl fa-solid fa-money-bill"></i>
                </Form.Check.Label>
              </Form.Check>
              <Form.Check className="border  p-2" type={'radio'} id={`tarjeta`}>
                <Form.Check.Input type={'radio'} name="metodo_pago" value={'tarjeta'} />
                <Form.Check.Label htmlFor="tarjeta">
                  Tarjeta
                  <i className="fa-xl fa-solid fa-credit-card"></i>
                </Form.Check.Label>
              </Form.Check>
              <Form.Check className="border  p-2" type={'radio'} id={`Transferencia`}>
                <Form.Check.Input type={'radio'} name="metodo_pago" value={'Transferencia'} />
                <Form.Check.Label htmlFor="Transferencia">
                  Transferencia
                  <i className="fa-xl fa-solid fa-money-bill-transfer"></i>
                </Form.Check.Label>
              </Form.Check>
            </div>
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

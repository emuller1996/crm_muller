/* eslint-disable prettier/prettier */

import { Button, Card, Form } from 'react-bootstrap'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import CurrencyInput from 'react-currency-input-field'
import PropTypes from 'prop-types'

export default function FormDetailProducto({ ProductoSelecionado, setProductoSelecionado,setProductoCotizacion }) {
  FormDetailProducto.propTypes = {
    ProductoSelecionado: PropTypes.object,
    setProductoSelecionado: PropTypes.func,
    setProductoCotizacion: PropTypes.func,
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    data.product_id = ProductoSelecionado._id
    data.product_name = ProductoSelecionado.name

    console.log(data);

    setProductoCotizacion(status =>{
        return [...status,{...data}]
    })
    setProductoSelecionado(null)
  }
  return (
    <Card>
      <Card.Body>
        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="text-center">
            Producto Selecionado SKU <b>#{ProductoSelecionado?._id}</b>
          </p>
          <div className="mb-3">
            <Form.Label>Nombre Producto</Form.Label>
            <Form.Control value={ProductoSelecionado?.name} type="text" placeholder="" disabled />
          </div>
          <div className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              id="cantidad"
              defaultValue={1}
              {...register('cantidad', { required: true })}
              placeholder=""
            />
          </div>
          <div>
            <Form.Label>Precio</Form.Label>
            <Controller
              control={control}
              name="price"
              defaultValue={ProductoSelecionado ? ProductoSelecionado?.price : 0}
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

          <div className="mt-3 text-center">
            <Button variant="danger" onClick={() => setProductoSelecionado(null)}>
              Cancelar
            </Button>
            <Button variant="primary" className='ms-2' type='submit' >
              Agregar
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  )
}

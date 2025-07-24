/* eslint-disable prettier/prettier */

import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'
import { stylesSelect, themeSelect } from '../../../../utils/optionsConfig'
import { useFacturas } from '../../../../hooks/useFacturas'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'

export default function FormFacturaCotizacion({ CotiSelecionada, getAllCotizacion }) {
  FormFacturaCotizacion.propTypes = {
    CotiSelecionada: PropTypes.object,
    getAllCotizacion: PropTypes.func,
  }
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm()

  const { crearFactura } = useFacturas()

  const onSubmit = async (data) => {
    data.productos = CotiSelecionada.productos
    data.client_id = CotiSelecionada.client_id
    data.cotizacion_id = CotiSelecionada._id
    data.total_monto = CotiSelecionada.total_monto
    try {
      await crearFactura(data)
      getAllCotizacion()
      toast.success(`Factura Generada.`)
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  return (
    <div>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-3">
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
          <div className="col-md-6">
            <div className="">
              <Form.Label htmlFor="metodo_pago">Metodo de Pago</Form.Label>
              <Controller
                name="metodo_pago"
                rules={{ required: true }}
                control={control}
                //defaultValue={CotiSelecionada ? CotiSelecionada.client_id : undefined}
                render={({ field: { name, onChange, ref } }) => {
                  return (
                    <Select
                      options={[
                        { label: 'Efectivo', value: 'efectivo' },
                        { label: 'Tarjeta', value: 'tarjeta' },
                        { label: 'Transferencia', value: 'transferencia' },
                      ]}
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
            </div>
          </div>
          <div className="col-12">
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Nota</Form.Label>
              <Form.Control {...register('nota')} as="textarea" rows={3} />
            </Form.Group>
          </div>
          <div className="mt-5 d-flex gap-4 justify-content-center">
            <button type="button" /* onClick={onHide}  */ className="btn btn-danger text-white">
              Cancelar
            </button>
            <Button type="submit" className="text-white" variant="success">
              Generar Facturas
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

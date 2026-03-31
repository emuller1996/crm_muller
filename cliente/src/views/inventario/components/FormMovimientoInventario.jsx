/* eslint-disable prettier/prettier */
import React, { useContext, useState } from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import AsyncSelect from 'react-select/async'
import Select from 'react-select'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import { useInventario } from '../../../hooks/useInventario'
import { useProductos } from '../../../hooks/useProductos'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'

export default function FormMovimientoInventario({ onHide, onSuccess }) {
  FormMovimientoInventario.propTypes = {
    onHide: PropTypes.func,
    onSuccess: PropTypes.func,
  }

  const { registrarMovimiento } = useInventario()
  const { getAllProductosPaginationPromise } = useProductos()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm()

  const searchProductoOptions = async (value) => {
    try {
      const result = await getAllProductosPaginationPromise({ search: value, page: 1, perPage: 20 })
      return (result?.data?.data ?? []).map((p) => ({
        label: p.name ?? '',
        value: p._id,
      }))
    } catch (error) {
      console.log(error)
      return []
    }
  }

  const onSubmit = async (data) => {
    try {
      const result = await registrarMovimiento(data)
      toast.success(result.data.message)
      onHide()
      onSuccess()
    } catch (error) {
      console.log(error)
      toast.error('Error al registrar movimiento')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-center border-bottom pb-2 fw-bold">Registrar Movimiento de Inventario</p>
      <div className="row g-3">
        <div className="col-12">
          <Form.Label>Producto *</Form.Label>
          <Controller
            name="producto_id"
            rules={{ required: true }}
            control={control}
            render={({ field: { name, onChange, ref } }) => (
              <AsyncSelect
                isClearable
                cacheOptions
                defaultOptions
                inputId="producto_id"
                loadOptions={searchProductoOptions}
                placeholder="Buscar producto..."
                onChange={(e) => onChange(e?.value)}
                name={name}
                ref={ref}
                styles={stylesSelect}
                theme={themeSelect}
              />
            )}
          />
          {errors.producto_id && (
            <small className="text-danger">Seleccione un producto</small>
          )}
        </div>
        <div className="col-md-6">
          <Form.Label>Tipo *</Form.Label>
          <Controller
            name="tipo"
            rules={{ required: true }}
            control={control}
            render={({ field: { name, onChange, ref } }) => (
              <Select
                inputId="tipo"
                options={[
                  { label: 'Entrada', value: 'entrada' },
                  { label: 'Salida', value: 'salida' },
                ]}
                placeholder="Tipo de movimiento"
                onChange={(e) => onChange(e?.value)}
                name={name}
                ref={ref}
                styles={stylesSelect}
                theme={themeSelect}
              />
            )}
          />
          {errors.tipo && <small className="text-danger">Seleccione un tipo</small>}
        </div>
        <div className="col-md-6">
          <Form.Group controlId="cantidad">
            <Form.Label>Cantidad *</Form.Label>
            <Form.Control
              {...register('cantidad', { required: true, min: 1 })}
              type="number"
              min="1"
              placeholder="0"
            />
            {errors.cantidad && <small className="text-danger">Ingrese una cantidad valida</small>}
          </Form.Group>
        </div>
        <div className="col-12">
          <Form.Group controlId="descripcion">
            <Form.Label>Descripcion *</Form.Label>
            <Form.Control
              {...register('descripcion', { required: true })}
              type="text"
              placeholder="Ej: Reposicion de stock, Ajuste de inventario..."
            />
            {errors.descripcion && <small className="text-danger">Ingrese una descripcion</small>}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group controlId="referencia">
            <Form.Label>Referencia</Form.Label>
            <Form.Control
              {...register('referencia')}
              type="text"
              placeholder="Ej: Orden #123"
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group controlId="nota">
            <Form.Label>Nota</Form.Label>
            <Form.Control {...register('nota')} type="text" placeholder="Nota adicional..." />
          </Form.Group>
        </div>
      </div>

      <div className="mt-4 d-flex gap-3 justify-content-center">
        <button type="button" onClick={onHide} className="btn btn-danger text-white">
          Cancelar
        </button>
        <Button type="submit" className="text-white" variant="success" disabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner style={{ width: '15px', height: '15px' }} />
          ) : (
            'Registrar Movimiento'
          )}
        </Button>
      </div>
    </form>
  )
}

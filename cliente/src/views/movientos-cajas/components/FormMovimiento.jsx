/* eslint-disable prettier/prettier */
import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { useCaja } from '../../../hooks/useCaja'

export default function FormMovimiento({ onHide, onSuccess }) {
  FormMovimiento.propTypes = {
    onHide: PropTypes.func,
    onSuccess: PropTypes.func,
  }

  const { crearMovimiento } = useCaja()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-CO', { hour12: false }),
    },
  })

  const onSubmit = async (data) => {
    try {
      data.monto = parseFloat(data.monto)
      data.estado = 'activo'
      const result = await crearMovimiento(data)
      toast.success(result.data.message)
      onHide()
      onSuccess()
    } catch (error) {
      console.log(error)
      toast.error('Error al registrar el movimiento')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-center border-bottom pb-2 fw-bold">Registrar Movimiento de Caja</p>
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="tipo">
            <Form.Label>Tipo de Movimiento *</Form.Label>
            <Form.Select
              {...register('tipo', { required: true })}
              isInvalid={!!errors.tipo}
            >
              <option value="">Seleccionar...</option>
              <option value="ingreso">Ingreso (Entrada)</option>
              <option value="egreso">Egreso (Salida)</option>
            </Form.Select>
            {errors.tipo && (
              <Form.Control.Feedback type="invalid">Seleccione el tipo</Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="monto">
            <Form.Label>Monto *</Form.Label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <Form.Control
                {...register('monto', { required: true, min: 0.01 })}
                type="number"
                step="0.01"
                placeholder="0.00"
                isInvalid={!!errors.monto}
              />
            </div>
            {errors.monto && (
              <span className="text-danger small">Ingrese un monto valido</span>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="metodo_pago">
            <Form.Label>Metodo de Pago *</Form.Label>
            <Form.Select
              {...register('metodo_pago', { required: true })}
              isInvalid={!!errors.metodo_pago}
            >
              <option value="">Seleccionar...</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="consignacion">Consignacion</option>
            </Form.Select>
            {errors.metodo_pago && (
              <Form.Control.Feedback type="invalid">
                Seleccione el metodo de pago
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        <div className="col-md-3">
          <Form.Group className="mb-3" controlId="fecha">
            <Form.Label>Fecha</Form.Label>
            <Form.Control {...register('fecha')} type="date" />
          </Form.Group>
        </div>
        <div className="col-md-3">
          <Form.Group className="mb-3" controlId="hora">
            <Form.Label>Hora</Form.Label>
            <Form.Control {...register('hora')} type="time" step="1" />
          </Form.Group>
        </div>
        <div className="col-md-12">
          <Form.Group className="mb-3" controlId="descripcion">
            <Form.Label>Descripcion *</Form.Label>
            <Form.Control
              {...register('descripcion', { required: true })}
              type="text"
              placeholder="Ej: Pago proveedor, Compra insumos, Venta mostrador..."
              isInvalid={!!errors.descripcion}
            />
            {errors.descripcion && (
              <Form.Control.Feedback type="invalid">
                La descripcion es obligatoria
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        <div className="col-md-12">
          <Form.Group className="mb-3" controlId="nota">
            <Form.Label>Nota</Form.Label>
            <Form.Control
              {...register('nota')}
              as="textarea"
              rows={2}
              placeholder="Informacion adicional..."
            />
          </Form.Group>
        </div>
      </div>

      <div className="mt-3 d-flex gap-4 justify-content-center">
        <button type="button" onClick={onHide} className="btn btn-danger text-white">
          Cancelar
        </button>
        <Button type="submit" className="text-white" variant="success">
          Registrar Movimiento
        </Button>
      </div>
    </form>
  )
}

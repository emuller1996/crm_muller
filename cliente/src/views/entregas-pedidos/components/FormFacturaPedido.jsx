/* eslint-disable prettier/prettier */
import React from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import { useFacturas } from '../../../hooks/useFacturas'
import { usePedidos } from '../../../hooks/usePedidos'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { ViewDollar } from '../../../utils'

export default function FormFacturaPedido({ pedido, onHide, onSuccess }) {
  FormFacturaPedido.propTypes = {
    pedido: PropTypes.object,
    onHide: PropTypes.func,
    onSuccess: PropTypes.func,
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const { crearFactura } = useFacturas()
  const { actualizarPedidos } = usePedidos()

  const onSubmit = async (data) => {
    data.productos = pedido.productos
    data.client_id = pedido.client_id
    data.pedido_id = pedido._id
    data.total_monto = pedido.total_monto
    data.dia_venta = new Date().toISOString().split('T')[0]
    try {
      await crearFactura(data)
      // Actualizar estado del pedido a Facturado
      await actualizarPedidos({ status: 'Facturado', factura_generada: true }, pedido._id)
      toast.success('Factura generada desde pedido')
      if (onHide) onHide()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.log(error)
      toast.error('Error al generar factura')
    }
  }

  return (
    <div>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="d-flex justify-content-between">
            <span className="text-muted">Cliente</span>
            <span className="fw-bold">{pedido?.client?.name}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Pedido</span>
            <span>PD-{pedido?.numero_pedido}</span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex justify-content-between">
            <span className="text-muted">Total</span>
            <span className="fw-bold fs-5">{ViewDollar(pedido?.total_monto)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">Productos</span>
            <span>{pedido?.productos?.length || 0}</span>
          </div>
        </div>
      </div>
      <hr />
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Label htmlFor="status">Estado de Factura</Form.Label>
            <Controller
              name="status"
              rules={{ required: true }}
              control={control}
              render={({ field: { name, onChange, ref } }) => (
                <Select
                  inputId="status"
                  options={[
                    { label: 'Pendiente', value: 'Pendiente' },
                    { label: 'Pagada', value: 'Pagada' },
                  ]}
                  placeholder="Seleccione estado"
                  onChange={(e) => onChange(e.value)}
                  ref={ref}
                  styles={stylesSelect}
                  theme={themeSelect}
                />
              )}
            />
          </div>
          <div className="col-md-6">
            <Form.Label htmlFor="metodo_pago">Metodo de Pago</Form.Label>
            <Controller
              name="metodo_pago"
              rules={{ required: true }}
              control={control}
              render={({ field: { name, onChange, ref } }) => (
                <Select
                  inputId="metodo_pago"
                  options={[
                    { label: 'Efectivo', value: 'efectivo' },
                    { label: 'Tarjeta', value: 'tarjeta' },
                    { label: 'Transferencia', value: 'transferencia' },
                  ]}
                  placeholder="Seleccione metodo"
                  onChange={(e) => onChange(e.value)}
                  ref={ref}
                  styles={stylesSelect}
                  theme={themeSelect}
                />
              )}
            />
          </div>
          {watch('status') === 'Pendiente' && (
            <div className="col-md-6">
              <Form.Group controlId="fecha_vencimiento">
                <Form.Label>Fecha de Vencimiento</Form.Label>
                <Form.Control {...register('fecha_vencimiento', { required: true })} type="date" />
              </Form.Group>
            </div>
          )}
          <div className="col-12">
            <Form.Group controlId="nota">
              <Form.Label>Nota</Form.Label>
              <Form.Control {...register('nota')} as="textarea" rows={2} placeholder="Nota opcional..." />
            </Form.Group>
          </div>
          <div className="mt-4 d-flex gap-3 justify-content-center">
            <button type="button" onClick={onHide} className="btn btn-secondary">
              Cancelar
            </button>
            <Button type="submit" className="text-white" variant="success" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <i className="fa-solid fa-file-invoice-dollar me-1"></i>
              )}
              Generar Factura
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

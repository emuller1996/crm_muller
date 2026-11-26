/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import CurrencyInput from 'react-currency-input-field'
import PropTypes from 'prop-types'
import { ViewDollar } from '../../../../utils'

/**
 * Modal para modificar la cantidad y el precio de un producto ya agregado a la factura.
 * onSave({ cantidad, price }) recibe los nuevos valores.
 */
export default function ModalEditarProductoFactura({ producto, onHide, onSave }) {
  ModalEditarProductoFactura.propTypes = {
    producto: PropTypes.object,
    onHide: PropTypes.func,
    onSave: PropTypes.func,
  }

  const [cantidad, setCantidad] = useState('')
  const [precio, setPrecio] = useState('')

  useEffect(() => {
    if (producto) {
      setCantidad(String(producto.cantidad ?? 1))
      setPrecio(String(producto.price ?? 0))
    }
  }, [producto])

  const cantidadNum = parseFloat(cantidad)
  const precioNum = parseFloat(precio)
  const cantidadValida = !Number.isNaN(cantidadNum) && cantidadNum > 0
  const precioValido = !Number.isNaN(precioNum) && precioNum >= 0
  const costo = Number(producto?.cost)
  const bajoCosto = precioValido && costo > 0 && precioNum < costo

  const guardar = (e) => {
    e.preventDefault()
    if (!cantidadValida || !precioValido) return
    onSave({ cantidad: cantidadNum, price: precioNum })
  }

  return (
    <Modal centered show={!!producto} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa-solid fa-pen-to-square me-2 text-primary"></i>
          Modificar Producto
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={guardar}>
        <Modal.Body>
          <p className="fw-bold mb-3">{producto?.product_name}</p>
          <div className="row g-3">
            <div className="col-5">
              <Form.Label htmlFor="editar_cantidad">Cantidad</Form.Label>
              <Form.Control
                id="editar_cantidad"
                type="number"
                min="0"
                step="any"
                autoFocus
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                isInvalid={!cantidadValida}
              />
              <Form.Control.Feedback type="invalid">Debe ser mayor a 0</Form.Control.Feedback>
            </div>
            <div className="col-7">
              <Form.Label htmlFor="editar_precio">Precio unitario</Form.Label>
              <CurrencyInput
                id="editar_precio"
                className={`form-control ${!precioValido ? 'is-invalid' : ''}`}
                value={precio}
                decimalsLimit={2}
                prefix="$"
                intlConfig={{ locale: 'en-US', currency: 'GBP' }}
                onValueChange={(value) => setPrecio(value ?? '')}
              />
              {!precioValido && <div className="invalid-feedback d-block">Ingrese un precio valido</div>}
            </div>
          </div>

          {bajoCosto && (
            <div className="alert alert-warning py-2 small mt-3 mb-0">
              <i className="fa-solid fa-triangle-exclamation me-1"></i>
              El precio es menor al costo del producto ({ViewDollar(costo)}).
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3 px-3 py-2 bg-light rounded">
            <span className="fw-semibold">Subtotal</span>
            <span className="fs-5 fw-bold">
              {ViewDollar(cantidadValida && precioValido ? cantidadNum * precioNum : 0)}
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!cantidadValida || !precioValido}>
            <i className="fa-solid fa-check me-1"></i>
            Guardar cambios
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

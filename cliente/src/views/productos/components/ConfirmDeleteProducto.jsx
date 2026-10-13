/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Alert, Button, Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import { useProductos } from '../../../hooks/useProductos'

const plural = (n, singular, pluralText) => `${n} ${n === 1 ? singular : pluralText}`

export default function ConfirmDeleteProducto({ producto, onHide, onDeleted }) {
  ConfirmDeleteProducto.propTypes = {
    producto: PropTypes.object.isRequired,
    onHide: PropTypes.func,
    onDeleted: PropTypes.func,
  }

  const { getProductoUso, deleteProducto } = useProductos()
  const [uso, setUso] = useState(null)
  const [loadingUso, setLoadingUso] = useState(true)
  const [errorUso, setErrorUso] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getProductoUso(producto._id)
        setUso(res.data)
      } catch (error) {
        console.log(error)
        setErrorUso(true)
      } finally {
        setLoadingUso(false)
      }
    }
    cargar()
  }, [producto._id])

  const usos = uso
    ? [
        uso.movimientos_inventario > 0 &&
          plural(uso.movimientos_inventario, 'movimiento de inventario', 'movimientos de inventario'),
        uso.facturas_venta > 0 &&
          plural(uso.facturas_venta, 'factura de venta', 'facturas de venta'),
        uso.facturas_compra > 0 &&
          plural(uso.facturas_compra, 'factura de compra', 'facturas de compra'),
      ].filter(Boolean)
    : []

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await deleteProducto(producto._id)
      toast.success(res.data.message)
      if (onDeleted) onDeleted()
      if (onHide) onHide()
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Error al eliminar el producto')
      setDeleting(false)
    }
  }

  return (
    <div className="text-center p-2">
      <div
        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
        style={{
          width: '64px',
          height: '64px',
          background: 'rgba(229, 83, 83, .12)',
          color: 'var(--cui-danger, #e55353)',
          fontSize: '1.6rem',
        }}
      >
        <i className="fa-solid fa-trash"></i>
      </div>
      <h5 className="fw-bold mb-2">Eliminar Producto</h5>
      <p className="mb-3">
        ¿Seguro que deseas eliminar <strong>{producto?.name}</strong>?
      </p>

      {loadingUso && (
        <div className="d-flex justify-content-center align-items-center gap-2 text-body-secondary mb-3">
          <Spinner size="sm" />
          <span className="small">Verificando uso del producto...</span>
        </div>
      )}

      {errorUso && (
        <Alert variant="secondary" className="text-start small">
          No se pudo verificar si el producto tiene movimientos o facturas asociadas.
        </Alert>
      )}

      {usos.length > 0 && (
        <Alert variant="warning" className="text-start small">
          <div className="fw-bold mb-1">
            <i className="fa-solid fa-triangle-exclamation me-1"></i>
            Este producto ya tiene registros asociados:
          </div>
          <ul className="mb-2 ps-3">
            {usos.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          El historial se conservará, pero el producto dejará de aparecer en los listados, en
          inventario y no podrá agregarse a nuevas facturas.
        </Alert>
      )}

      <div className="mt-4 d-flex gap-3 justify-content-center">
        <Button variant="outline-secondary" onClick={onHide} disabled={deleting}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          className="text-white"
          onClick={handleDelete}
          disabled={deleting || loadingUso}
        >
          {deleting ? (
            <Spinner size="sm" className="me-1" />
          ) : (
            <i className="fa-solid fa-trash me-1"></i>
          )}
          Eliminar
        </Button>
      </div>
    </div>
  )
}

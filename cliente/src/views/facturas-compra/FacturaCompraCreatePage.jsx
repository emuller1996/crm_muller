/* eslint-disable prettier/prettier */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import FormFacturaCompra from './facturas/components/FormFacturaCompra'

export default function FacturaCompraCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="container-fluid">
      {/* Header con breadcrumb y boton volver */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1 small">
              <li className="breadcrumb-item">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => navigate('/facturas-compra')}
                >
                  Facturas de Compra
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Nueva Factura de Compra
              </li>
            </ol>
          </nav>
          <h4 className="mb-0 fw-bold">
            <i className="fa-solid fa-file-invoice me-2 text-primary"></i>
            Nueva Factura de Compra
          </h4>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate('/facturas-compra')}
        >
          <i className="fa-solid fa-arrow-left me-1"></i>
          Volver
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <FormFacturaCompra
            onCancel={() => navigate('/facturas-compra')}
            getAllFacturaCompra={() => navigate('/facturas-compra')}
          />
        </div>
      </div>
    </div>
  )
}

/* eslint-disable prettier/prettier */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import FormFactura from './facturas/components/FormFactura'

export default function FacturaCreatePage() {
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
                  onClick={() => navigate('/facturas')}
                >
                  Facturas
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Nueva Factura
              </li>
            </ol>
          </nav>
          <h4 className="mb-0 fw-bold">
            <i className="fa-solid fa-file-invoice-dollar me-2 text-primary"></i>
            Nueva Factura
          </h4>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate('/facturas')}
        >
          <i className="fa-solid fa-arrow-left me-1"></i>
          Volver
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <FormFactura
            onCancel={() => navigate('/facturas')}
            getAllFactura={() => navigate('/facturas')}
          />
        </div>
      </div>
    </div>
  )
}

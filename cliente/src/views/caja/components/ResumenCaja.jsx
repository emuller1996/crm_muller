/* eslint-disable prettier/prettier */
import React from 'react'
import PropTypes from 'prop-types'

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value || 0)
}

const metodoIcons = {
  efectivo: 'fa-solid fa-money-bill-wave',
  tarjeta: 'fa-solid fa-credit-card',
  transferencia: 'fa-solid fa-building-columns',
  consignacion: 'fa-solid fa-receipt',
}

export default function ResumenCaja({ resumen }) {
  ResumenCaja.propTypes = {
    resumen: PropTypes.object,
  }

  if (!resumen) return null

  return (
    <div className="row mb-3">
      <div className="col-md-4">
        <div className="card border-success">
          <div className="card-body text-center">
            <h6 className="text-muted mb-1">
              <i className="fa-solid fa-arrow-up text-success me-1"></i>
              Total Ingresos
            </h6>
            <h4 className="text-success fw-bold">{formatMoney(resumen.total_ingresos)}</h4>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card border-danger">
          <div className="card-body text-center">
            <h6 className="text-muted mb-1">
              <i className="fa-solid fa-arrow-down text-danger me-1"></i>
              Total Egresos
            </h6>
            <h4 className="text-danger fw-bold">{formatMoney(resumen.total_egresos)}</h4>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card border-primary">
          <div className="card-body text-center">
            <h6 className="text-muted mb-1">
              <i className="fa-solid fa-scale-balanced text-primary me-1"></i>
              Balance
            </h6>
            <h4
              className={`fw-bold ${
                (resumen.total_ingresos || 0) - (resumen.total_egresos || 0) >= 0
                  ? 'text-success'
                  : 'text-danger'
              }`}
            >
              {formatMoney((resumen.total_ingresos || 0) - (resumen.total_egresos || 0))}
            </h4>
          </div>
        </div>
      </div>

      {resumen.por_metodo && Object.keys(resumen.por_metodo).length > 0 && (
        <div className="col-12 mt-2">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">Desglose por Metodo de Pago</h6>
              <div className="row">
                {Object.entries(resumen.por_metodo).map(([metodo, datos]) => (
                  <div key={metodo} className="col-md-3 mb-2">
                    <div className="border rounded p-2 text-center">
                      <i className={`${metodoIcons[metodo] || 'fa-solid fa-circle'} me-1`}></i>
                      <span className="text-capitalize fw-bold">{metodo}</span>
                      <div className="small text-success">
                        Ingresos: {formatMoney(datos.ingresos)}
                      </div>
                      <div className="small text-danger">
                        Egresos: {formatMoney(datos.egresos)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

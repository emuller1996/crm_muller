/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import CurrencyInput from 'react-currency-input-field'
import PropTypes from 'prop-types'
import { ViewDollar } from '../../../../utils'

const styles = `
  .cobro-total {
    border-radius: .75rem;
    background: rgba(46, 184, 92, .1);
    border: 1px solid rgba(46, 184, 92, .35);
  }
  .cobro-option {
    border: 2px solid var(--cui-border-color, #dbdfe6);
    border-radius: .9rem;
    background: var(--cui-body-bg, #fff);
    width: 100%;
    padding: 1.1rem .75rem;
    transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
  }
  .cobro-option:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, .08);
  }
  .cobro-option:disabled { opacity: .6; cursor: not-allowed; }
  .cobro-option.sin-imprimir:hover:not(:disabled) { border-color: #2eb85c; }
  .cobro-option.con-imprimir:hover:not(:disabled) { border-color: #3399ff; }
  .cobro-option .cobro-icon {
    width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto .6rem; font-size: 1.5rem; color: #fff;
  }
`

/**
 * Modal de cobro: muestra el total, ayuda a calcular el cambio y
 * permite elegir entre cobrar sin imprimir o cobrar e imprimir.
 * onConfirm(imprimir: boolean) se llama al elegir una opcion.
 */
export default function ModalCobroFactura({ show, total, metodoPago, saving, onHide, onConfirm }) {
  ModalCobroFactura.propTypes = {
    show: PropTypes.bool,
    total: PropTypes.number,
    metodoPago: PropTypes.string,
    saving: PropTypes.bool,
    onHide: PropTypes.func,
    onConfirm: PropTypes.func,
  }

  const [recibido, setRecibido] = useState(undefined)
  const inputRef = useRef(null)

  useEffect(() => {
    if (show) {
      setRecibido(undefined)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [show])

  const recibidoNum = Number(recibido) || 0
  const cambio = recibidoNum - (total || 0)
  const faltante = recibido !== undefined && recibido !== '' && cambio < 0

  return (
    <Modal centered show={show} onHide={saving ? undefined : onHide} backdrop="static">
      <style>{styles}</style>
      <Modal.Header closeButton={!saving}>
        <Modal.Title>
          <i className="fa-solid fa-cash-register me-2 text-success"></i>
          Cobrar Factura
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Total */}
        <div className="cobro-total text-center p-3 mb-3">
          <div className="small text-body-secondary text-uppercase fw-semibold">Total a cobrar</div>
          <div className="fw-bold text-success" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
            {ViewDollar(total || 0)}
          </div>
          {metodoPago && (
            <div className="small text-body-secondary text-capitalize">
              Metodo de pago: <strong>{metodoPago}</strong>
            </div>
          )}
        </div>

        {/* Calculadora de cambio */}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <label htmlFor="efectivo_recibido" className="form-label small fw-semibold">
              <i className="fa-solid fa-money-bill-wave me-1 text-success"></i>
              Efectivo recibido
            </label>
            <CurrencyInput
              ref={inputRef}
              id="efectivo_recibido"
              className="form-control form-control-lg"
              value={recibido}
              placeholder="$0"
              decimalsLimit={2}
              prefix="$"
              intlConfig={{ locale: 'en-US', currency: 'GBP' }}
              onValueChange={(value) => setRecibido(value)}
              disabled={saving}
            />
          </div>
          <div className="col-6">
            <label htmlFor="cambio" className="form-label small fw-semibold">
              <i className="fa-solid fa-coins me-1 text-warning"></i>
              Cambio a devolver
            </label>
            <input
              id="cambio"
              className={`form-control form-control-lg fw-bold ${
                faltante ? 'text-danger border-danger' : 'text-success'
              }`}
              value={recibido ? ViewDollar(Math.max(cambio, 0)) : ''}
              placeholder="$0"
              readOnly
            />
            {faltante && (
              <div className="small text-danger mt-1">
                Faltan {ViewDollar(Math.abs(cambio))}
              </div>
            )}
          </div>
        </div>

        {/* Opciones de cobro */}
        <div className="row g-3">
          <div className="col-6">
            <button
              type="button"
              className="cobro-option sin-imprimir text-center"
              disabled={saving}
              onClick={() => onConfirm(false)}
            >
              <div className="cobro-icon" style={{ background: '#2eb85c' }}>
                {saving ? <Spinner size="sm" /> : <i className="fa-solid fa-hand-holding-dollar"></i>}
              </div>
              <div className="fw-bold">Cobrar</div>
              <div className="small text-body-secondary">sin imprimir</div>
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className="cobro-option con-imprimir text-center"
              disabled={saving}
              onClick={() => onConfirm(true)}
            >
              <div className="cobro-icon" style={{ background: '#3399ff' }}>
                {saving ? <Spinner size="sm" /> : <i className="fa-solid fa-print"></i>}
              </div>
              <div className="fw-bold">Cobrar e imprimir</div>
              <div className="small text-body-secondary">abre el ticket</div>
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

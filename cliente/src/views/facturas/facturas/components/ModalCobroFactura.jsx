/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react'
import { Form, Modal, Spinner } from 'react-bootstrap'
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
  .cobro-mixto {
    border: 1px solid var(--cui-border-color, #dbdfe6);
    border-radius: .75rem;
  }
`

const METODOS = [
  { value: 'efectivo', label: 'Efectivo', icon: 'fa-money-bill-wave text-success' },
  { value: 'tarjeta', label: 'Tarjeta', icon: 'fa-credit-card text-primary' },
  { value: 'transferencia', label: 'Transferencia', icon: 'fa-money-bill-transfer text-warning' },
]

let nextId = 1
const nuevaLinea = (metodo_pago) => ({ id: nextId++, metodo_pago, valor: '' })

/**
 * Modal de cobro: muestra el total, ayuda a calcular el cambio y
 * permite elegir entre cobrar sin imprimir o cobrar e imprimir.
 * Con metodo "mixto" permite repartir el total entre varios metodos de pago.
 * onConfirm(imprimir: boolean, detallePago: [{ metodo_pago, valor }] | null)
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

  const esMixto = metodoPago === 'mixto'
  const [recibido, setRecibido] = useState(undefined)
  const [lineas, setLineas] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (show) {
      setRecibido(undefined)
      setLineas([nuevaLinea('efectivo'), nuevaLinea('transferencia')])
      if (!esMixto) setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [show])

  // --- Pago mixto ---
  const valorLinea = (l) => Number(l.valor) || 0
  const asignado = lineas.reduce((acc, l) => acc + valorLinea(l), 0)
  const diferencia = (total || 0) - asignado
  const metodosUsados = lineas.map((l) => l.metodo_pago)
  const hayRepetidos = new Set(metodosUsados).size !== metodosUsados.length
  const todasConValor = lineas.every((l) => valorLinea(l) > 0)
  const mixtoValido =
    lineas.length >= 2 && todasConValor && !hayRepetidos && Math.abs(diferencia) <= 1

  const actualizarLinea = (id, cambios) =>
    setLineas((ls) => ls.map((l) => (l.id === id ? { ...l, ...cambios } : l)))

  const completarLinea = (id) => {
    const linea = lineas.find((l) => l.id === id)
    const resto = (total || 0) - (asignado - valorLinea(linea))
    actualizarLinea(id, { valor: String(Math.max(resto, 0)) })
  }

  const agregarLinea = () => {
    const libre = METODOS.find((m) => !metodosUsados.includes(m.value))
    setLineas((ls) => [...ls, nuevaLinea(libre?.value ?? 'efectivo')])
  }

  // --- Calculadora de cambio: en mixto se compara con la porcion en efectivo ---
  const efectivoACobrar = esMixto
    ? lineas.filter((l) => l.metodo_pago === 'efectivo').reduce((acc, l) => acc + valorLinea(l), 0)
    : total || 0
  const mostrarCambio = !esMixto || metodosUsados.includes('efectivo')
  const recibidoNum = Number(recibido) || 0
  const cambio = recibidoNum - efectivoACobrar
  const faltante = recibido !== undefined && recibido !== '' && cambio < 0

  const puedeCobrar = !saving && (!esMixto || mixtoValido)

  const confirmar = (imprimir) => {
    const detalle = esMixto
      ? lineas.map((l) => ({ metodo_pago: l.metodo_pago, valor: valorLinea(l) }))
      : null
    onConfirm(imprimir, detalle)
  }

  return (
    <Modal centered show={show} onHide={saving ? undefined : onHide} backdrop="static" size={esMixto ? 'lg' : undefined}>
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

        {/* Detalle del pago mixto */}
        {esMixto && (
          <div className="cobro-mixto p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold">
                <i className="fa-solid fa-layer-group me-1 text-primary"></i>
                Detalle del pago
              </span>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={agregarLinea}
                disabled={saving || lineas.length >= METODOS.length}
              >
                <i className="fa-solid fa-plus me-1"></i>
                Agregar metodo
              </button>
            </div>

            {lineas.map((l) => {
              const metodo = METODOS.find((m) => m.value === l.metodo_pago)
              return (
                <div key={l.id} className="row g-2 align-items-center mb-2">
                  <div className="col-5">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className={`fa-solid ${metodo?.icon ?? ''}`}></i>
                      </span>
                      <Form.Select
                        value={l.metodo_pago}
                        onChange={(e) => actualizarLinea(l.id, { metodo_pago: e.target.value })}
                        disabled={saving}
                        aria-label="Metodo de pago"
                      >
                        {METODOS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </div>
                  <div className="col-4">
                    <CurrencyInput
                      className="form-control"
                      value={l.valor}
                      placeholder="$0"
                      decimalsLimit={2}
                      prefix="$"
                      intlConfig={{ locale: 'en-US', currency: 'GBP' }}
                      onValueChange={(value) => actualizarLinea(l.id, { valor: value ?? '' })}
                      disabled={saving}
                      aria-label={`Valor ${metodo?.label ?? ''}`}
                    />
                  </div>
                  <div className="col-3 d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm flex-grow-1"
                      title="Completar con lo que falta"
                      onClick={() => completarLinea(l.id)}
                      disabled={saving}
                    >
                      Completar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      title="Quitar metodo"
                      onClick={() => setLineas((ls) => ls.filter((x) => x.id !== l.id))}
                      disabled={saving || lineas.length <= 2}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              )
            })}

            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top small">
              <span>
                Asignado <strong>{ViewDollar(asignado)}</strong> de {ViewDollar(total || 0)}
              </span>
              {Math.abs(diferencia) <= 1 ? (
                <span className="text-success fw-semibold">
                  <i className="fa-solid fa-circle-check me-1"></i>
                  Completo
                </span>
              ) : diferencia > 0 ? (
                <span className="text-danger fw-semibold">Faltan {ViewDollar(diferencia)}</span>
              ) : (
                <span className="text-danger fw-semibold">Sobran {ViewDollar(Math.abs(diferencia))}</span>
              )}
            </div>
            {hayRepetidos && (
              <div className="small text-danger mt-1">No repitas el mismo metodo de pago.</div>
            )}
            {!todasConValor && (
              <div className="small text-body-secondary mt-1">
                Cada metodo debe tener un valor mayor a 0.
              </div>
            )}
          </div>
        )}

        {/* Calculadora de cambio */}
        {mostrarCambio && (
          <div className="row g-3 mb-4">
            <div className="col-6">
              <label htmlFor="efectivo_recibido" className="form-label small fw-semibold">
                <i className="fa-solid fa-money-bill-wave me-1 text-success"></i>
                Efectivo recibido
                {esMixto && (
                  <span className="text-body-secondary fw-normal">
                    {' '}
                    (de {ViewDollar(efectivoACobrar)})
                  </span>
                )}
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
        )}

        {/* Opciones de cobro */}
        <div className="row g-3">
          <div className="col-6">
            <button
              type="button"
              className="cobro-option sin-imprimir text-center"
              disabled={!puedeCobrar}
              onClick={() => confirmar(false)}
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
              disabled={!puedeCobrar}
              onClick={() => confirmar(true)}
            >
              <div className="cobro-icon" style={{ background: '#3399ff' }}>
                {saving ? <Spinner size="sm" /> : <i className="fa-solid fa-print"></i>}
              </div>
              <div className="fw-bold">Cobrar e imprimir</div>
              <div className="small text-body-secondary">abre el ticket</div>
            </button>
          </div>
        </div>
        {esMixto && !mixtoValido && (
          <div className="small text-body-secondary text-center mt-2">
            Completa el detalle del pago para poder cobrar.
          </div>
        )}
      </Modal.Body>
    </Modal>
  )
}

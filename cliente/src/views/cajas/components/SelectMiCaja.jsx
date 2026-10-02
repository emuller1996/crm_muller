/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { useCajas } from '../../../hooks/useCajas'
import { useCajaActiva } from '../../../hooks/useCajaActiva'
import { ViewDollar } from '../../../utils'

const styles = `
  .caja-card {
    border: 1px solid var(--cui-border-color, #dbdfe6);
    border-radius: 0.75rem;
    background: var(--cui-body-bg, #fff);
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
  }
  .caja-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, .08);
    border-color: var(--cui-primary, #5856d6);
  }
  .caja-card.selected {
    border: 2px solid var(--cui-primary, #5856d6);
    background: rgba(88, 86, 214, .06);
  }
  .caja-card.empty {
    border-style: dashed;
  }
  .caja-card.invalid {
    border-color: var(--cui-danger, #e55353);
    border-style: solid;
  }
  .caja-card.disabled {
    cursor: not-allowed;
    opacity: .7;
  }
  .caja-icon {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(88, 86, 214, .12);
    color: var(--cui-primary, #5856d6);
    font-size: 1.15rem;
  }
  .caja-card.selected .caja-icon {
    background: var(--cui-primary, #5856d6);
    color: #fff;
  }
  .caja-check {
    position: absolute;
    top: .6rem;
    right: .7rem;
    color: var(--cui-primary, #5856d6);
    font-size: 1.2rem;
  }
  .caja-nota {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

/**
 * Selector reutilizable de la caja activa del usuario.
 * La seleccion se guarda en localStorage y se sincroniza entre todas las instancias.
 * onChange(cajaId, caja) se llama cada vez que la caja activa se resuelve o cambia.
 */
export default function SelectMiCaja({ onChange, error, disabled }) {
  SelectMiCaja.propTypes = {
    onChange: PropTypes.func,
    error: PropTypes.bool,
    disabled: PropTypes.bool,
  }

  const { getMisCajas } = useCajas()
  const [cajaId, setCajaId] = useCajaActiva()
  const [misCajas, setMisCajas] = useState(null)
  const [show, setShow] = useState(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getMisCajas()
        setMisCajas(res.data ?? [])
      } catch (err) {
        console.log(err)
        setMisCajas([])
      }
    }
    cargar()
  }, [])

  // Valida la caja guardada contra las asignadas y notifica al padre
  useEffect(() => {
    if (misCajas === null) return
    let seleccion = misCajas.some((c) => c._id === cajaId) ? cajaId : null
    if (!seleccion && misCajas.length === 1) seleccion = misCajas[0]._id
    if (seleccion !== cajaId) {
      setCajaId(seleccion)
      return
    }
    onChangeRef.current?.(seleccion ?? undefined, misCajas.find((c) => c._id === seleccion))
  }, [misCajas, cajaId])

  const cajaActiva = misCajas?.find((c) => c._id === cajaId)

  const abrir = () => {
    if (!disabled && misCajas?.length) setShow(true)
  }

  const elegir = (id) => {
    setCajaId(id)
    setShow(false)
  }

  if (misCajas === null) {
    return (
      <>
        <style>{styles}</style>
        <div className="caja-card empty p-3 d-flex align-items-center gap-3">
          <Spinner size="sm" />
          <span className="text-body-secondary">Cargando cajas...</span>
        </div>
      </>
    )
  }

  if (misCajas.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="caja-card invalid disabled p-3 d-flex align-items-center gap-3">
          <div className="caja-icon" style={{ color: 'var(--cui-danger)' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="small">
            <div className="fw-bold">No tienes cajas asignadas</div>
            <div className="text-body-secondary">
              Pide a un administrador que te asigne una en Configuraciones → Cajas.
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div
        role="button"
        tabIndex={0}
        onClick={abrir}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && abrir()}
        className={`caja-card p-3 d-flex align-items-center gap-3 ${
          cajaActiva ? '' : 'empty'
        } ${error && !cajaActiva ? 'invalid' : ''} ${disabled ? 'disabled' : ''}`}
      >
        <div className="caja-icon">
          <i className="fa-solid fa-cash-register"></i>
        </div>
        <div className="flex-grow-1 overflow-hidden">
          {cajaActiva ? (
            <>
              <div className="small text-body-secondary">Caja activa</div>
              <div className="fw-bold text-truncate">{cajaActiva.nombre}</div>
              <div className="small text-body-secondary">
                Monto máx. {ViewDollar(cajaActiva.monto_maximo ?? 0)}
              </div>
            </>
          ) : (
            <>
              <div className="fw-bold">Seleccionar caja</div>
              <div className={`small ${error ? 'text-danger' : 'text-body-secondary'}`}>
                {error ? 'Elige una caja.' : 'Haz clic para elegir la caja de trabajo'}
              </div>
            </>
          )}
        </div>
        {!disabled && (
          <Button
            type="button"
            size="sm"
            variant={cajaActiva ? 'outline-primary' : 'primary'}
            onClick={(e) => {
              e.stopPropagation()
              abrir()
            }}
          >
            <i className="fa-solid fa-arrows-rotate me-1"></i>
            {cajaActiva ? 'Cambiar' : 'Elegir'}
          </Button>
        )}
      </div>

      <Modal centered size="lg" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fa-solid fa-cash-register me-2"></i>
            Seleccionar Caja
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            {misCajas.map((c) => {
              const selected = c._id === cajaId
              return (
                <div key={c._id} className="col-sm-6 col-lg-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => elegir(c._id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && elegir(c._id)}
                    className={`caja-card position-relative h-100 p-3 ${selected ? 'selected' : ''}`}
                  >
                    {selected && <i className="fa-solid fa-circle-check caja-check"></i>}
                    <div className="caja-icon mb-3">
                      <i className="fa-solid fa-cash-register"></i>
                    </div>
                    <div className="fw-bold text-truncate pe-4">{c.nombre}</div>
                    <div className="small text-body-secondary mb-1">
                      Monto máx. {ViewDollar(c.monto_maximo ?? 0)}
                    </div>
                    {c.nota && (
                      <div className="small text-body-secondary caja-nota">{c.nota}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

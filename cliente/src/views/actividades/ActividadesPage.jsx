/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import toast from 'react-hot-toast'
import { Modal } from 'react-bootstrap'
import { useActividades } from '../../hooks/useActividades'
import FormActividad from './components/FormActividad'

const ESTADO_COLOR = {
  Pendiente: '#ffc107',
  'En Progreso': '#0d6efd',
  Completada: '#198754',
  Cancelada: '#dc3545',
}

const ESTADO_TEXT_COLOR = {
  Pendiente: '#000',
  'En Progreso': '#fff',
  Completada: '#fff',
  Cancelada: '#fff',
}

export default function ActividadesPage() {
  const { data, loading, getAll, create, update, remove } = useActividades()
  const [showForm, setShowForm] = useState(false)
  const [actividadEdit, setActividadEdit] = useState(null)
  const [actividadDetalle, setActividadDetalle] = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [actividadToDelete, setActividadToDelete] = useState(null)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [fechaClickeada, setFechaClickeada] = useState(null)
  const calendarRef = useRef(null)

  const formatDateLocal = (date) => {
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  useEffect(() => {
    getAll()
  }, [])

  const eventos = data.map((a) => ({
    id: a._id,
    title: a.titulo,
    start: a.fecha_inicio,
    end: a.fecha_fin,
    backgroundColor: ESTADO_COLOR[a.estado] ?? '#6c757d',
    borderColor: ESTADO_COLOR[a.estado] ?? '#6c757d',
    textColor: ESTADO_TEXT_COLOR[a.estado] ?? '#fff',
    extendedProps: { actividad: a },
  }))

  const handleCreate = async (payload) => {
    try {
      await create(payload)
      toast.success('Actividad creada')
      setShowForm(false)
      getAll()
    } catch {
      toast.error('Error al crear la actividad')
    }
  }

  const handleUpdate = async (payload) => {
    try {
      await update(actividadEdit._id, payload)
      toast.success('Actividad actualizada')
      setShowForm(false)
      setActividadEdit(null)
      getAll()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleDelete = async () => {
    try {
      setLoadingDelete(true)
      await remove(actividadToDelete._id)
      toast.success('Actividad eliminada')
      setShowDelete(false)
      setActividadDetalle(null)
      setActividadToDelete(null)
      getAll()
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setLoadingDelete(false)
    }
  }

  const handleEventClick = ({ event }) => {
    setActividadDetalle(event.extendedProps.actividad)
  }

  const handleDateClick = ({ date }) => {
    const fin = new Date(date.getTime() + 60 * 60 * 1000)
    setFechaClickeada({ inicio: formatDateLocal(date), fin: formatDateLocal(fin) })
    setActividadEdit(null)
    setShowForm(true)
  }

  const abrirEditar = (actividad) => {
    setActividadDetalle(null)
    setActividadEdit(actividad)
    setShowForm(true)
  }

  return (
    <div className="p-2 p-md-3">
      <style>{`
        /* ── Header & toolbar ── */
        .fc .fc-toolbar {
          flex-wrap: wrap;
          gap: 8px;
          row-gap: 8px;
        }
        .fc .fc-toolbar-title {
          font-size: 1.1rem !important;
          font-weight: 600;
        }
        .fc .fc-button {
          font-size: 0.8rem !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
        }
        .fc .fc-button-group .fc-button {
          border-radius: 0 !important;
        }
        .fc .fc-button-group .fc-button:first-child {
          border-radius: 6px 0 0 6px !important;
        }
        .fc .fc-button-group .fc-button:last-child {
          border-radius: 0 6px 6px 0 !important;
        }

        /* ── Custom prev/next ── */
        .fc-customPrev-button,
        .fc-customNext-button {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 34px !important;
          height: 34px !important;
          padding: 0 !important;
          border-radius: 50% !important;
        }
        .fc-customPrev-button::before {
          font-family: "Font Awesome 6 Free";
          font-weight: 900;
          content: "\\f053";
          font-size: 0.8rem;
        }
        .fc-customNext-button::before {
          font-family: "Font Awesome 6 Free";
          font-weight: 900;
          content: "\\f054";
          font-size: 0.8rem;
        }

        /* ── Events ── */
        .fc .fc-event {
          border: none !important;
          border-radius: 6px !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .fc .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
        .fc .fc-daygrid-event {
          padding: 2px 6px !important;
        }

        /* ── Today highlight ── */
        .fc .fc-day-today {
          background-color: rgba(13, 110, 253, 0.04) !important;
        }

        /* ── Table cells ── */
        .fc td, .fc th {
          border-color: #e9ecef !important;
        }
        .fc .fc-col-header-cell {
          background: #f8f9fa;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          padding: 8px 0 !important;
        }
        .fc .fc-timegrid-slot {
          height: 40px !important;
        }

        /* ── Mobile ── */
        @media (max-width: 767.98px) {
          .fc .fc-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }
          .fc .fc-toolbar-title {
            font-size: 1rem !important;
            text-align: center;
          }
          .fc .fc-button {
            font-size: 0.72rem !important;
            padding: 3px 7px !important;
          }
          .fc .fc-col-header-cell {
            font-size: 0.7rem;
          }
          .fc .fc-daygrid-day-number {
            font-size: 0.75rem;
          }
          .actividades-header {
            flex-direction: column;
            align-items: stretch !important;
            gap: 8px;
          }
          .actividades-header h5 {
            font-size: 1rem;
          }
        }

        /* ── Tablet ── */
        @media (min-width: 768px) and (max-width: 1024px) {
          .fc .fc-toolbar-title {
            font-size: 1rem !important;
          }
          .fc .fc-button {
            font-size: 0.75rem !important;
          }
        }

        /* ── Detail card ── */
        .detalle-field {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 10px 14px;
        }
        .detalle-field-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6c757d;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .detalle-field-value {
          font-size: 0.9rem;
          color: #212529;
          font-weight: 500;
        }
      `}</style>

      {/* Header */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="d-flex justify-content-between align-items-center actividades-header">
            <h5 className="mb-0 fw-bold">
              <i className="fa-solid fa-calendar-days me-2 text-primary"></i>
              Actividades
            </h5>
            <button
              className="btn btn-primary btn-sm px-3"
              onClick={() => {
                setActividadEdit(null)
                setFechaClickeada(null)
                setShowForm(true)
              }}
            >
              <i className="fa-solid fa-plus me-1"></i>
              Nueva Actividad
            </button>
          </div>

          {/* Leyenda */}
          <div className="d-flex flex-wrap gap-2 mt-3">
            {Object.entries(ESTADO_COLOR).map(([estado, color]) => (
              <span
                key={estado}
                className="badge rounded-pill px-3 py-2"
                style={{
                  backgroundColor: color,
                  color: ESTADO_TEXT_COLOR[estado],
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {estado}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-2 p-md-3">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <div
                  className="spinner-border text-primary"
                  style={{ width: '3em', height: '3em' }}
                  role="status"
                />
                <p className="text-muted mt-2 mb-0">Cargando actividades...</p>
              </div>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
              themeSystem="bootstrap5"
              initialView="timeGridWeek"
              customButtons={{
                customPrev: {
                  text: '',
                  click: () => calendarRef.current?.getApi().prev(),
                },
                customNext: {
                  text: '',
                  click: () => calendarRef.current?.getApi().next(),
                },
              }}
              headerToolbar={{
                left: 'customPrev,customNext today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              locale="es"
              buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Dia' }}
              events={eventos}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              height="auto"
              stickyHeaderDates={true}
              dayMaxEvents={3}
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              eventContent={({ event, timeText }) => {
                const { actividad } = event.extendedProps
                const participantes = actividad?.participantes?.length ?? 0
                return (
                  <div
                    style={{
                      padding: '3px 8px',
                      width: '100%',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {event.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '1px',
                        opacity: 0.85,
                      }}
                    >
                      {timeText && (
                        <span style={{ fontSize: '0.68rem' }}>
                          <i className="fa-regular fa-clock" style={{ marginRight: 3 }}></i>
                          {timeText}
                        </span>
                      )}
                      {participantes > 0 && (
                        <span style={{ fontSize: '0.68rem' }}>
                          <i className="fa-solid fa-user-group" style={{ marginRight: 3 }}></i>
                          {participantes}
                        </span>
                      )}
                    </div>
                  </div>
                )
              }}
            />
          )}
        </div>
      </div>

      {/* Form crear/editar */}
      <FormActividad
        show={showForm}
        onHide={() => {
          setShowForm(false)
          setActividadEdit(null)
          setFechaClickeada(null)
        }}
        onSubmit={actividadEdit ? handleUpdate : handleCreate}
        actividad={actividadEdit}
        fechaInicial={fechaClickeada}
      />

      {/* Modal detalle */}
      <Modal show={!!actividadDetalle} onHide={() => setActividadDetalle(null)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2 flex-wrap">
            <span
              className="badge px-3 py-2"
              style={{
                backgroundColor: ESTADO_COLOR[actividadDetalle?.estado] ?? '#6c757d',
                color: ESTADO_TEXT_COLOR[actividadDetalle?.estado] ?? '#fff',
                fontSize: '0.75rem',
              }}
            >
              {actividadDetalle?.estado}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{actividadDetalle?.titulo}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <div className="row g-2">
            <div className="col-6">
              <div className="detalle-field">
                <div className="detalle-field-label">
                  <i className="fa-regular fa-calendar me-1"></i>Inicio
                </div>
                <div className="detalle-field-value">
                  {actividadDetalle?.fecha_inicio
                    ? new Date(actividadDetalle.fecha_inicio).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {actividadDetalle?.fecha_inicio
                    ? new Date(actividadDetalle.fecha_inicio).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="detalle-field">
                <div className="detalle-field-label">
                  <i className="fa-regular fa-calendar-check me-1"></i>Fin
                </div>
                <div className="detalle-field-value">
                  {actividadDetalle?.fecha_fin
                    ? new Date(actividadDetalle.fecha_fin).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {actividadDetalle?.fecha_fin
                    ? new Date(actividadDetalle.fecha_fin).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </div>
              </div>
            </div>
            {actividadDetalle?.descripcion && (
              <div className="col-12 mt-2">
                <div className="detalle-field">
                  <div className="detalle-field-label">
                    <i className="fa-solid fa-align-left me-1"></i>Descripcion
                  </div>
                  <div className="detalle-field-value" style={{ fontWeight: 400 }}>
                    {actividadDetalle.descripcion}
                  </div>
                </div>
              </div>
            )}
            {actividadDetalle?.participantes?.length > 0 && (
              <div className="col-12 mt-2">
                <div className="detalle-field">
                  <div className="detalle-field-label">
                    <i className="fa-solid fa-user-group me-1"></i>Participantes
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {actividadDetalle.participantes.map((p, i) => (
                      <span
                        key={i}
                        className={`badge ${p.tipo === 'usuario' ? 'bg-primary' : 'bg-success'}`}
                        style={{ fontSize: '0.75rem', fontWeight: 500 }}
                      >
                        <i
                          className={`fa-solid ${p.tipo === 'usuario' ? 'fa-user' : 'fa-user-tie'} me-1`}
                        ></i>
                        {p.name ?? p.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <button
            className="btn btn-outline-danger btn-sm px-3"
            onClick={() => {
              setActividadToDelete(actividadDetalle)
              setShowDelete(true)
            }}
          >
            <i className="fa-solid fa-trash me-1"></i>Eliminar
          </button>
          <button
            className="btn btn-warning btn-sm px-3 text-white"
            onClick={() => abrirEditar(actividadDetalle)}
          >
            <i className="fa-solid fa-pen me-1"></i>Editar
          </button>
          <button
            className="btn btn-secondary btn-sm px-3"
            onClick={() => setActividadDetalle(null)}
          >
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmar eliminar */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered size="sm">
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <i
              className="fa-solid fa-triangle-exclamation text-warning"
              style={{ fontSize: '2.5rem' }}
            ></i>
          </div>
          <h6 className="fw-bold">Eliminar Actividad</h6>
          <p className="text-muted mb-0">
            ¿Eliminar <strong>{actividadToDelete?.titulo}</strong>?
            <br />
            <small>Esta accion no se puede deshacer.</small>
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pt-0">
          <button className="btn btn-secondary btn-sm px-3" onClick={() => setShowDelete(false)}>
            Cancelar
          </button>
          <button
            className="btn btn-danger btn-sm px-3"
            onClick={handleDelete}
            disabled={loadingDelete}
          >
            {loadingDelete ? (
              <span className="spinner-border spinner-border-sm me-1" />
            ) : (
              <i className="fa-solid fa-trash me-1"></i>
            )}
            Eliminar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

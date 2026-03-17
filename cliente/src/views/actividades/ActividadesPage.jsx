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
  Pendiente: '#f0c84c',
  'En Progreso': '#4c8ff0',
  Completada: '#4cf05a',
  Cancelada: '#f04c4c',
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
    textColor: '#000',
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
    <div className="p-3">
      <style>{`
        .fc-customPrev-button,
        .fc-customNext-button {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 32px !important;
          height: 32px !important;
          padding: 0 !important;
        }
        .fc-customPrev-button::before {
          font-family: "Font Awesome 6 Free";
          font-weight: 900;
          content: "\\f053";
          font-size: 0.85rem;
        }
        .fc-customNext-button::before {
          font-family: "Font Awesome 6 Free";
          font-weight: 900;
          content: "\\f054";
          font-size: 0.85rem;
        }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">
          <i className="fa-solid fa-calendar-days me-2"></i>Actividades
        </h4>
        <button className="btn btn-primary btn-sm" onClick={() => { setActividadEdit(null); setShowForm(true) }}>
          <i className="fa-solid fa-plus me-1"></i>Nueva Actividad
        </button>
      </div>

      {/* Leyenda */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {Object.entries(ESTADO_COLOR).map(([estado, color]) => (
          <span key={estado} className="badge rounded-pill" style={{ backgroundColor: color, color: '#000' }}>
            {estado}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" style={{ width: '3em', height: '3em' }} />
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
          buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
          events={eventos}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          eventContent={({ event, timeText }) => {
            const { actividad } = event.extendedProps
            const participantes = actividad?.participantes?.length ?? 0
            const color = event.backgroundColor
            return (
              <div style={{
                backgroundColor: color,
                borderLeft: `4px solid ${event.borderColor}`,
                borderRadius: '6px',
                padding: '3px 6px',
                width: '100%',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {event.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  {timeText && (
                    <span style={{ fontSize: '0.68rem', color: '#333' }}>
                      <i className="fa-solid fa-clock" style={{ marginRight: 2 }}></i>{timeText}
                    </span>
                  )}
                  {participantes > 0 && (
                    <span style={{ fontSize: '0.68rem', color: '#333' }}>
                      <i className="fa-solid fa-user-group" style={{ marginRight: 2 }}></i>{participantes}
                    </span>
                  )}
                </div>
              </div>
            )
          }}
        />
      )}

      {/* Form crear/editar */}
      <FormActividad
        show={showForm}
        onHide={() => { setShowForm(false); setActividadEdit(null); setFechaClickeada(null) }}
        onSubmit={actividadEdit ? handleUpdate : handleCreate}
        actividad={actividadEdit}
        fechaInicial={fechaClickeada}
      />

      {/* Modal detalle */}
      <Modal show={!!actividadDetalle} onHide={() => setActividadDetalle(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <span
              className="badge me-2"
              style={{ backgroundColor: ESTADO_COLOR[actividadDetalle?.estado] ?? '#6c757d', color: '#000' }}
            >
              {actividadDetalle?.estado}
            </span>
            {actividadDetalle?.titulo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-2">
            <div className="col-md-6">
              <small className="text-muted d-block">Inicio</small>
              <span>{actividadDetalle?.fecha_inicio ? new Date(actividadDetalle.fecha_inicio).toLocaleString() : '-'}</span>
            </div>
            <div className="col-md-6">
              <small className="text-muted d-block">Fin</small>
              <span>{actividadDetalle?.fecha_fin ? new Date(actividadDetalle.fecha_fin).toLocaleString() : '-'}</span>
            </div>
            {actividadDetalle?.descripcion && (
              <div className="col-12 mt-2">
                <small className="text-muted d-block">Descripción</small>
                <p className="mb-0">{actividadDetalle.descripcion}</p>
              </div>
            )}
            {actividadDetalle?.participantes?.length > 0 && (
              <div className="col-12 mt-2">
                <small className="text-muted d-block">Participantes</small>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {actividadDetalle.participantes.map((p, i) => (
                    <span key={i} className={`badge ${p.tipo === 'usuario' ? 'bg-primary' : 'bg-success'}`}>
                      <i className={`fa-solid ${p.tipo === 'usuario' ? 'fa-user' : 'fa-user-tie'} me-1`}></i>
                      {p.name ?? p.id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => { setActividadToDelete(actividadDetalle); setShowDelete(true) }}
          >
            <i className="fa-solid fa-trash me-1"></i>Eliminar
          </button>
          <button className="btn btn-warning btn-sm" onClick={() => abrirEditar(actividadDetalle)}>
            <i className="fa-solid fa-pen me-1"></i>Editar
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActividadDetalle(null)}>
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmar eliminar */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Eliminar <strong>{actividadToDelete?.titulo}</strong>? Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowDelete(false)}>Cancelar</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loadingDelete}>
            {loadingDelete ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="fa-solid fa-trash me-1"></i>}
            Eliminar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

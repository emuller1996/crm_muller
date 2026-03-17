/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import PropTypes from 'prop-types'
import Select from 'react-select'
import AuthContext from '../../../context/AuthContext'
import { getAllUsuariosService } from '../../../services/usuarios.services'
import { getAllClientesService } from '../../../services/clientes.services'

const ESTADOS = ['Pendiente', 'En Progreso', 'Completada', 'Cancelada']

FormActividad.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  actividad: PropTypes.object,
  fechaInicial: PropTypes.shape({ inicio: PropTypes.string, fin: PropTypes.string }),
}

export default function FormActividad({ show, onHide, onSubmit, actividad, fechaInicial }) {
  const { Token } = useContext(AuthContext)
  const [opcionesParticipantes, setOpcionesParticipantes] = useState([])
  const [loadingOpts, setLoadingOpts] = useState(false)
  const isEdit = !!actividad

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (show) {
      cargarParticipantes()
      if (isEdit) {
        const participantesSeleccionados = (actividad.participantes ?? []).map((p) => ({
          value: p.id,
          label: `${p.name ?? p.id} (${p.tipo})`,
          tipo: p.tipo,
        }))
        reset({
          titulo: actividad.titulo,
          descripcion: actividad.descripcion,
          estado: actividad.estado,
          fecha_inicio: actividad.fecha_inicio?.slice(0, 16),
          fecha_fin: actividad.fecha_fin?.slice(0, 16),
          participantes: participantesSeleccionados,
        })
      } else {
        reset({
          titulo: '',
          descripcion: '',
          estado: 'Pendiente',
          fecha_inicio: fechaInicial?.inicio ?? '',
          fecha_fin: fechaInicial?.fin ?? '',
          participantes: [],
        })
      }
    }
  }, [show, actividad])

  const cargarParticipantes = async () => {
    setLoadingOpts(true)
    try {
      const [resU, resC] = await Promise.all([
        getAllUsuariosService(Token),
        getAllClientesService(Token),
      ])
      const usuarios = (resU.data ?? []).map((u) => ({
        value: u._id,
        label: `${u.name} (usuario)`,
        tipo: 'usuario',
      }))
      const clientes = (resC.data ?? []).map((c) => ({
        value: c._id,
        label: `${c.name} (cliente)`,
        tipo: 'cliente',
      }))
      setOpcionesParticipantes([
        { label: 'Usuarios', options: usuarios },
        { label: 'Clientes', options: clientes },
      ])
    } catch {
      setOpcionesParticipantes([])
    } finally {
      setLoadingOpts(false)
    }
  }

  const handleFormSubmit = async (values) => {
    const payload = {
      titulo: values.titulo,
      descripcion: values.descripcion,
      estado: values.estado,
      fecha_inicio: new Date(values.fecha_inicio).toISOString(),
      fecha_fin: new Date(values.fecha_fin).toISOString(),
      participantes: (values.participantes ?? []).map((p) => ({
        id: p.value,
        tipo: p.tipo,
        name: p.label.split(' (')[0],
      })),
    }
    await onSubmit(payload)
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Editar Actividad' : 'Nueva Actividad'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Título *</label>
              <input
                className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                {...register('titulo', { required: 'Campo requerido' })}
              />
              {errors.titulo && <div className="invalid-feedback">{errors.titulo.message}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Fecha Inicio *</label>
              <input
                type="datetime-local"
                className={`form-control ${errors.fecha_inicio ? 'is-invalid' : ''}`}
                {...register('fecha_inicio', { required: 'Campo requerido' })}
              />
              {errors.fecha_inicio && <div className="invalid-feedback">{errors.fecha_inicio.message}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Fecha Fin *</label>
              <input
                type="datetime-local"
                className={`form-control ${errors.fecha_fin ? 'is-invalid' : ''}`}
                {...register('fecha_fin', { required: 'Campo requerido' })}
              />
              {errors.fecha_fin && <div className="invalid-feedback">{errors.fecha_fin.message}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Estado</label>
              <select className="form-select" {...register('estado')}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Participantes</label>
              <Controller
                name="participantes"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    isLoading={loadingOpts}
                    options={opcionesParticipantes}
                    placeholder="Seleccionar usuarios o clientes..."
                    noOptionsMessage={() => 'Sin opciones'}
                  />
                )}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows={3}
                {...register('descripcion')}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={onHide}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            {isEdit ? 'Guardar Cambios' : 'Crear Actividad'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

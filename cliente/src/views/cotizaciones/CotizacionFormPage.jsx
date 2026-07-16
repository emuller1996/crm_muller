/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import FormCotizacion from './components/FormCotizacion'
import { useCotizacion } from '../../hooks/useCotizacion'

export default function CotizacionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()

  const isEdit = Boolean(id)

  const { getAllCotizacion, data: ListCotizaciones } = useCotizacion()

  // En edicion: usar la cotizacion que viene por state (desde la lista) o,
  // como fallback (refresh / URL directa), cargarla desde el listado por _id.
  const [cotizacion, setCotizacion] = useState(location.state?.cotizacion ?? null)
  const [loading, setLoading] = useState(isEdit && !location.state?.cotizacion)

  useEffect(() => {
    if (isEdit && !cotizacion) {
      getAllCotizacion()
    }
  }, [])

  useEffect(() => {
    if (isEdit && !cotizacion && ListCotizaciones) {
      const encontrada = ListCotizaciones.find((c) => c._id === id)
      if (encontrada) {
        setCotizacion(encontrada)
      } else {
        navigate('/cotizaciones')
      }
      setLoading(false)
    }
  }, [ListCotizaciones])

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
                  onClick={() => navigate('/cotizaciones')}
                >
                  Cotizaciones
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {isEdit ? 'Editar Cotización' : 'Nueva Cotización'}
              </li>
            </ol>
          </nav>
          <h4 className="mb-0 fw-bold">
            <i className="fa-solid fa-file-lines me-2 text-primary"></i>
            {isEdit ? 'Editar Cotización' : 'Nueva Cotización'}
          </h4>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate('/cotizaciones')}
        >
          <i className="fa-solid fa-arrow-left me-1"></i>
          Volver
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <div
                className="spinner-border text-primary"
                style={{ width: '3em', height: '3em' }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <FormCotizacion
              CotiSelecionada={cotizacion}
              onCancel={() => navigate('/cotizaciones')}
              getAllCotizacion={() => navigate('/cotizaciones')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

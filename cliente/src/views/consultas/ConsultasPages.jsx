import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { stylesSelect, themeSelect } from '../../utils/optionsConfig'
import Select from 'react-select'
import { useConsultas } from '../../hooks/useConsultas'
import Pagination from '@mui/material/Pagination'
import ReactTimeAgo from 'react-time-ago'
import { ViewDollar } from '../../utils'
import toast from 'react-hot-toast'
import { Chip } from '@mui/material'
import FormConsultaRespuesta from './components/FormConsultaRespuesta'
import './ConsultasPages.css'
const ConsultasPages = () => {
  const [show, setShow] = useState(false)
  const [showHide, setShowHide] = useState(false)

  const [consultaSelecionada, setConsultaSelecionada] = useState(null)
  const [Draw, setDraw] = useState(1)

  const [filterData, setfilterData] = useState({ page: 1, status: '' })

  const { getAllConsultasPagination, dataP, loading, changeStatusConsultas } = useConsultas()

  useEffect(() => {
    getAllConsultasPagination(filterData)
  }, [filterData, Draw])

  const translateStatus = {
    pending: 'Pendientes',
    completed: 'Completados',
    hide: 'Ocultos',
  }

  const translateStatusClass = {
    pending: 'chip-pending',
    completed: 'chip-completed',
    hide: 'Ocultos',
  }

  return (
    <div>
      <div className="card">
        <div className="card-body">
          <p className="text-center text-muted">Filtros Avanzados</p>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <div>
                <label htmlFor="gender">Estado</label>
                <Select
                  name={'gender'}
                  inputId="gender"
                  placeholder=""
                  onChange={(e) => {
                    console.log(e)
                    setfilterData((status) => {
                      return { ...status, status: e?.value ?? '' }
                    })
                  }}
                  styles={stylesSelect}
                  theme={themeSelect}
                  options={[
                    { value: 'pending', label: 'Pendientes' },
                    { value: 'completed', label: 'Completados' },
                    { value: 'hide', label: 'Ocultos' },
                  ]}
                  isClearable
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-3">
        {loading && (
          <div className="d-flex justify-content-center my-5">
            <div
              className="spinner-border text-primary"
              style={{ width: '3em', height: '3em' }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {dataP &&
          dataP?.data?.map((consul) => (
            <div key={consul._id} className="col-md-6">
              <div
                className="card"
                style={{
                  backgroundColor: consul.status === 'hide' ? '#ffd9d9' : '',
                  filter: consul.status === 'hide' ? 'blur(4px)' : '',
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>Fecha</span>
                    <span>{new Date(consul.createdTime).toLocaleDateString()}</span>
                    <ReactTimeAgo date={consul.createdTime} locale="en-US" />
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>Estado</span>
                    <Chip
                      label={translateStatus[consul.status]}
                      className={`${translateStatusClass[consul.status]}`}
                      variant="outlined"
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <span>Producto</span>
                    <div className="d-flex align-items-center flex-column">
                      <img
                        src="http://localhost:3000/src/assets/Logo.png"
                        className="rounded-circle"
                        alt="TEST"
                        style={{ width: '50px' }}
                      />
                      <span>{consul?.producto?.name}</span>
                    </div>
                  </div>
                  <p className="border-bottom pb-2 mb-2">{consul?.consulta}</p>
                  <div className="d-flex gap-4 justify-content-center">
                    <button
                      onClick={() => {
                        setShow(true)
                        setConsultaSelecionada(consul)
                        console.log(consul)
                      }}
                      className="btn btn-info text-white"
                    >
                      <i className="fa-solid fa-reply me-2"></i>Responder
                    </button>
                    <button
                      className="btn btn-danger text-white"
                      onClick={() => {
                        setConsultaSelecionada(consul)
                        setShowHide(true)
                      }}
                    >
                      <i className="fa-solid fa-eye-slash me-2"></i>Ocultar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="card  mt-3">
        <div className="p-2 d-flex justify-content-center">
          <Pagination
            onChange={(eve, page) => {
              setfilterData((status) => {
                return { ...status, page: page }
              })
            }}
            count={dataP?.total_pages}
            variants="outlined"
          />
        </div>
      </div>
      <Modal
        size="lg"
        centered
        show={show}
        onHide={() => {
          setShow(false)
        }}
      >
        <Modal.Body>
          <FormConsultaRespuesta
            consultaSelecionada={consultaSelecionada}
            onHide={() => {
              setShow(false)
              setDraw((status) => ++status)
            }}
          />
        </Modal.Body>
      </Modal>

      <Modal
        size="lg"
        centered
        show={showHide}
        onHide={() => {
          setShowHide(false)
        }}
      >
        <Modal.Body>
          <p className="text-center">Seguro desea Ocultar esta Consulta?</p>
          <hr />
          <p className="text-center">{`" ${consultaSelecionada?.consulta} "`}</p>
          <hr />
          <div className="d-flex gap-4 justify-content-center">
            <button
              onClick={async () => {
                try {
                  console.log(consultaSelecionada)
                  await changeStatusConsultas(consultaSelecionada._id, { status: 'hide' })
                  toast.success(`Consulta Ocultada Correctamente.`)
                  setDraw((status) => ++status)
                  setConsultaSelecionada(null)
                  setShowHide(false)
                } catch (error) {
                  console.log(error)
                }
              }}
              className="btn btn-info text-white"
            >
              <i className="fa-solid fa-eye-slash me-2"></i>Ocultar
            </button>
            <button
              className="btn btn-danger text-white"
              onClick={() => {
                setConsultaSelecionada(null)
                setShowHide(false)
              }}
            >
              Cancelar
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default ConsultasPages

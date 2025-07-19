/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { ViewDollar } from '../../../utils'
import PropTypes from 'prop-types'
import { useConsultas } from '../../../hooks/useConsultas'
import toast from 'react-hot-toast'
import ReactTimeAgo from 'react-time-ago'

export default function FormConsultaRespuesta({ consultaSelecionada, onHide }) {
  FormConsultaRespuesta.propTypes = {
    consultaSelecionada: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
  }
  const [Respuesta, setRespuesta] = useState('')
  const { postCreateRespuesta, getRespuestaByConsulta } = useConsultas()
  const [Draw, setDraw] = useState(1)
  const [Data, setData] = useState(null)

  useEffect(() => {
    getAllRespuestasConsulta(consultaSelecionada._id)
  }, [consultaSelecionada, Draw])

  const getAllRespuestasConsulta = async (id) => {
    try {
      const result = await getRespuestaByConsulta(id)
      console.log(result.data)
      setData(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <p className="text-center"> Responder una Consulta</p>
      <span>Detalles de Consulta</span>
      <div className="card p-2 mb-3">
        <span className="text-center mb-2 text-muted">Datos del Cliente</span>
        <div className="d-flex justify-content-between ">
          <span>Nombre</span>
          <span className="">{consultaSelecionada?.cliente?.name_client}</span>
        </div>
        <div className="d-flex justify-content-between ">
          <span>Correo</span>
          <span className="">{consultaSelecionada?.cliente?.email_client}</span>
        </div>
      </div>
      <div className="card p-2 mb-3">
        <span className="text-center mb-2 text-muted">Datos de Producto</span>
        <div className="d-flex justify-content-between ">
          <span>Nombre</span>
          <span className="">{consultaSelecionada?.producto?.name}</span>
        </div>
        <div className="d-flex justify-content-between ">
          <span>Precio</span>
          <span className="">{ViewDollar(consultaSelecionada?.producto?.price)}</span>
        </div>
      </div>
      <div className="card p-2 mb-3">
        <span className="text-muted">Consulta</span>
        <p>{consultaSelecionada?.consulta}</p>
      </div>
      <div className="card p-2 mb-3">
        <span className="text-center mb-2 text-muted">Respuestas Registradas</span>
        {Data && Data.length === 0 && (
          <>
            <div className="alert alert-secondary text-center" role="alert">
              No hay Respuestas Registradas.
            </div>
          </>
        )}
        {Data &&
          Data.map((consulta) => (
            <div key={consulta._id}>
              <div className="card p-2 mb-2 position-relative">
                <div className="position-absolute top-0 end-0 me-2">
                  <span className="badge text-bg-light">
                    <ReactTimeAgo date={consulta.createdTime} locale="en-US" />
                  </span>
                </div>

                <div className="d-flex">
                  <div className="flex-shrink-1">
                    <div
                      className=""
                      style={{
                        borderRight: '1px solid #d4d4d4',
                        marginRight: '0.5em',
                        paddingRight: '0.5em',
                      }}
                    >
                      <span style={{ fontSize: '0.8em' }} className="d-block text-nowrap">
                        {consulta?.user?.name}
                      </span>
                      <span style={{ fontSize: '0.8em' }} className="">
                        {consulta?.user?.role}
                      </span>
                    </div>
                  </div>
                  <div className="p-1 mt-2 w-100">
                    <span className="">{consulta.respuesta}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div>
        <div className="d-flex gap-3 align-items-center">
          <div className="w-100">
            <div className="">
              <textarea
                onChange={(e) => {
                  setRespuesta(e.target.value)
                }}
                className="form-control"
                name=""
                value={Respuesta}
                id=""
                rows="3"
              ></textarea>
            </div>
          </div>
          <div className=" flex-shrink-1 ">
            <button
              style={{ height: '88px' }}
              type="button"
              className=" btn btn-primary"
              onClick={async () => {
                console.log({ respuesta: Respuesta, consulta_id: consultaSelecionada._id })
                try {
                  const res = await postCreateRespuesta({
                    respuesta: Respuesta,
                    consulta_id: consultaSelecionada._id,
                  })
                  toast.success(`Respuesta ha sido creada exitosamente.`)
                  setRespuesta('')
                  setDraw((status) => ++status)
                  onHide()
                  console.log(res.data)
                } catch (error) {
                  console.log(error)
                }
              }}
            >
              Responder
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

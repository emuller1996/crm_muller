/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import AuthContext from '../../../../context/AuthContext'
import { useProductos } from '../../../../hooks/useProductos'
import toast from 'react-hot-toast'
import ReactTimeAgo from 'react-time-ago'
import PropTypes from 'prop-types'

export default function ConsultasProductoComponent({ productId }) {
  ConsultasProductoComponent.propTypes = {
    productId: PropTypes.string.isRequired,
  }
  const { client } = useContext(AuthContext)
  const { ConsultasProduct, getConsultakByProductId, createConsultaProducto } = useProductos()
  const [consultaSend, setConsultaSend] = useState('')

  useEffect(() => {
    getConsultakByProductId(productId)
  }, [productId])

  const handleSendConsulta = async () => {
    try {
      console.log({
        product_id: productId,
        consulta: consultaSend,
      })
      await createConsultaProducto({
        product_id: productId,
        consulta: consultaSend,
      })
      toast.success(`Consulta Creada Satisfactoriamente.`, { duration: 2000 })
      setConsultaSend('')
      await getConsultakByProductId(productId)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <>
      <div className="card">
        <div className="card-body">
          <p className="m-0 mb-3 text-center text-capitalize">Consultas acerca del producto.</p>
          <div className="row g-3 mb-3">
            {ConsultasProduct &&
              ConsultasProduct.map((consul) => (
                <>
                  <div key={consul._id} className="col-12">
                    <div className="card">
                      <div className="card-body position-relative">
                        <span
                          style={{ fontSize: '0.8em' }}
                          className="text-muted position-absolute top-0 end-0 d-block text-start pt-1 pe-2"
                        >
                          <ReactTimeAgo date={consul.createdTime} locale="en-US" />
                        </span>
                        <div className="row">
                          <div className="flex-shrink-1 col-12 col-md-2">
                            <div className="text-center">
                              <i
                                style={{ color: '#818181' }}
                                className="fa-regular fa-circle-user fa-2x"
                              ></i>
                              <span className="card-title d-block text-muted">
                                {consul?.cliente?.name_client}
                              </span>
                            </div>
                          </div>
                          <div className="p-2 col-12 col-md-10">
                            <p className="card-text">{consul?.consulta}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {consul.respuestas.map((res) => (
                    <div key={res._id} className="col-12 ">
                      <div className="d-flex">
                        <div className="col-2 col-md-1 align-self-center">
                          <div className='text-center text-muted' style={{rotate:"180deg"}}>
                            <i className="fa-solid fa-reply fa-xl"></i>
                          </div>
                        </div>
                        <div className="col-10 col-md-11">
                          <div className="card">
                            <div className="card-body position-relative">
                              <span
                                style={{ fontSize: '0.8em' }}
                                className="text-muted position-absolute top-0 end-0 d-block text-start pt-1 pe-2"
                              >
                                <ReactTimeAgo date={res.createdTime} locale="en-US" />
                              </span>
                              <div className="row">
                                <div className="flex-shrink-1 col-12 col-md-2">
                                  <div className="text-center">
                                    <i
                                      style={{ color: '#818181' }}
                                      className="fa-regular fa-circle-user fa-2x"
                                    ></i>
                                    <span className="card-title d-block text-muted">
                                      {res?.user?.name}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-2 col-12 col-md-10">
                                  <p className="card-text">{res?.respuesta}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ))}
            {ConsultasProduct && ConsultasProduct.length === 0 && (
              <>
                <p>No hay consulta para este producto.</p>
              </>
            )}
            {/*  <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <span className="card-title">Usuario</span>
                  <p className="card-text">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam optio
                    incidunt possimus, id nostrum earum! Labore deleniti asperiores itaque modi in
                    fugit, natus illum nostrum, sunt sint impedit rerum nemo.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <span className="card-title">Usuario</span>
                  <p className="card-text">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam optio
                    incidunt possimus, id nostrum earum! Labore deleniti asperiores itaque modi in
                    fugit, natus illum nostrum, sunt sint impedit rerum nemo.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <span className="card-title">Usuario</span>
                  <p className="card-text">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam optio
                    incidunt possimus, id nostrum earum! Labore deleniti asperiores itaque modi in
                    fugit, natus illum nostrum, sunt sint impedit rerum nemo.
                  </p>
                </div>
              </div>
            </div> */}
          </div>
          <div className="d-flex gap-3 align-items-center">
            <div className="w-100" style={{ filter: `blur(${client ? '0px' : '2px'})` }}>
              <div className="">
                <textarea
                  value={consultaSend}
                  onChange={(e) => {
                    setConsultaSend(e.target.value)
                  }}
                  className="form-control"
                  name=""
                  id=""
                  placeholder="Ingresa tu Consulta aca."
                  minLength={20}
                  maxLength={300}
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className=" flex-shrink-1 ">
              <button
                disabled={client ? false : true}
                style={{ height: '88px' }}
                type="button"
                className=" btn btn-primary"
                onClick={handleSendConsulta}
              >
                Consultar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

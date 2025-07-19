/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import FormComentariosCliente from './FormComentariosCliente'
import { useClientes } from '../../../../hooks/useClientes'
import { Alert, Badge } from 'react-bootstrap'
export default function ComentariosCliente({ Cliente }) {
  console.log(Cliente)
  const { getAllComentarioByClientesPaginationPromise } = useClientes()

  const [Comentarios, setComentarios] = useState(null)
  const [Draw, setDraw] = useState(1)

  useEffect(() => {
    getAllComentarios(Cliente._id)
  }, [Cliente._id, Draw])

  const getAllComentarios = async (id) => {
    try {
      const result = await getAllComentarioByClientesPaginationPromise(id)
      setComentarios(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <div className="row g-3 mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {Comentarios && Array.isArray(Comentarios) && Comentarios.length === 0 && (
          <div>
            <Alert variant="light">Este cliente no tiene comentarios</Alert>
          </div>
        )}
        {Comentarios &&
          Comentarios.map((c) => (
            <div key={c?._id} className="col-12">
              <div className="card position-relative">
                <div className="position-absolute top-0 start-50 translate-middle">
                  <Badge bg="secondary">{new Date(c.createdTime).toLocaleString()}</Badge>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="card-text">{c?.comment}</p>
                    </div>
                    <div className="p-2">
                      <div>
                        {c?.is_call && <i className="fa-solid fa-phone-volume me-2"></i>}
                        {c?.is_visit && <i className="fa-solid fa-street-view me-2"></i>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <hr />
      <div>
        <FormComentariosCliente
          idCliente={Cliente?._id}
          onAllComentarios={() => {
            setDraw((status) => ++status)
          }}
        />
      </div>
    </div>
  )
}

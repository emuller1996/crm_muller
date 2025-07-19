/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import FormDireccion from './FormDireccion'
import { useClientes } from '../../../../../hooks/useClientes'

export default function MisDirecciones({}) {
  const [showImport, setShowImport] = useState(false)
  const [Draw, setDraw] = useState(1)
  const [AddresUpdate, setAddresUpdate] = useState(null)

  const { getAllAddressByClientes, dataAddress } = useClientes()

  useEffect(() => {
    getAllAddressByClientes()
    return () => {}
  }, [Draw])

  return (
    <div className="mt-5">
      <p className="text-center">Mis Direciones de Envio</p>
      <div className="mb-3">
        <button
          type="button"
          onClick={() => {
            setShowImport(true)
            setAddresUpdate(null)
          }}
          className="button-ecomerce"
        >
          Nueva Dirección de Envió
        </button>
      </div>
      <div>
        {dataAddress &&
          dataAddress.map((addres) => (
            <div key={addres._id} className="col-12">
              <div className="card mb-3">
                <div className="card-body">
                  <div className="row g-3  align-items-end">
                    <div className="col-md-4">
                      <p className="fw-bold fs-5 mb-1">{addres?.name}</p>

                      <div className="d-flex justify-content-between">
                        <span>Departamento</span>
                        <span>{addres?.departament}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Cuidad</span>
                        <span>{addres?.city}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex justify-content-between">
                        <span>Direccion</span>
                        <span>{addres?.address}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Barrio</span>
                        <span>{addres?.neighborhood} </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Referencia</span>
                        <span>{addres?.reference} </span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex justify-content-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowImport(true)
                            setAddresUpdate(addres)
                          }}
                          className="button-ecomerce"
                        >
                          <i className="fa-solid fa-pen-to-square" style={{ color: '#f1f7ff' }}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        {/* <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p className="fw-bold fs-5 mb-1">Nombre Direccion</p>
              <div className="row">
                <div className="col-md-4">
                  <div className="d-flex justify-content-between">
                    <span>Cuidad</span>
                    <span>Buenaventura</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Departamento</span>
                    <span>Valle del Cauca</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Direccion</span>
                    <span>Cra 62c # 11 - 61 </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Barrio</span>
                    <span>Bellavista </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Referencia</span>
                    <span>Piso 2 </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      <Modal
        centered
        show={showImport}
        onHide={() => {
          setShowImport(false)
        }}
      >
        <Modal.Body>
          <FormDireccion
            onHide={() => {
              setShowImport(false)
            }}
            AllAddress={() => {
              setDraw((status) => ++status)
            }}
            Address={AddresUpdate}
          />
        </Modal.Body>
      </Modal>
    </div>
  )
}

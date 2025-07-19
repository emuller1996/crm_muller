/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'

import { useClientes } from '../../../../../hooks/useClientes'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import FormDireccion from '../../MiPerfilPage/components/FormDireccion'

export default function SelectAddressShop({
  setDireccionSelecionada,
  direccionSelecionada,
  setPasoActive,
}) {
  SelectAddressShop.propTypes = {
    setDireccionSelecionada: PropTypes.func,
    direccionSelecionada: PropTypes.string,
    setPasoActive: PropTypes.string,
  }
  const [show, setShow] = useState(false)
  const [Draw, setDraw] = useState(1)
  const [AddresUpdate, setAddresUpdate] = useState(null)

  const [errorSelected, seterrorSelected] = useState({
    isError: false,
    message: '',
  })

  const { getAllAddressByClientes, dataAddress } = useClientes()
  useEffect(() => {
    getAllAddressByClientes()
  }, [Draw])

  return (
    <div className="">
      <div>
        <div className="text-center mb-3 mt-2">
          <button
            className="btn btn-primary text-white"
            onClick={() => {
              setAddresUpdate(null)
              setShow(true)
            }}
          >
            <i className="fa-solid fa-circle-plus me-2"></i>
            Agrega Direccion de Envio.
          </button>
        </div>
        <span className="text-muted">Selecciona una Dirección de Envió</span>

        {dataAddress && dataAddress.length == 0 && (
          <>
            <div className="alert alert-light" role="alert">
              <strong>NO</strong> TIENE DIRECIONES DE ENVIO REGISTRADAS
            </div>
          </>
        )}
        {dataAddress &&
          dataAddress.map((address) => (
            <div
              key={address._id}
              onClick={() => {
                if(direccionSelecionada &&  direccionSelecionada === address._id){
                  setDireccionSelecionada(null)
                }else{
                  setDireccionSelecionada(address._id)
                  seterrorSelected({ isError: false, message: '' })
                }
              }}
              className="card mb-2"
              style={{
                borderColor: direccionSelecionada === address._id ? 'rgb(112, 166, 241)' : '#dfdfdf',
                backgroundColor:
                  direccionSelecionada === address._id ? 'rgba(232, 242, 255, 0.61)' : '#ffffff',
                boxShadow:
                  direccionSelecionada === address._id
                    ? 'rgba(3, 102, 214, 0.3) 0px 0px 0px 3px'
                    : '',
                cursor: 'pointer',
              }}
            >
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-9">
                    <p className='m-0 fw-bold fs-5'>{address?.name}</p>
                    <div>
                      {address?.departament}, {address?.city}
                    </div>
                    <div>
                      {address?.address}, {address?.neighborhood} ({address?.reference})
                    </div>
                  </div>
                  <div className="col-md-3 align-self-center">
                    <div className='d-flex justify-content-center'>
                    <button
                      type="button"
                      className="btn btn-outline-light"
                      onClick={(e)=>{
                        e.stopPropagation()
                        console.log("test");
                        console.log(address);
                        setAddresUpdate(address)
                        setShow(true)
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square" style={{color:"#3e85d6"}}></i>
                    </button>
                    </div>
                    
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          ))}

        {errorSelected.isError && (
          <>
            <div className="alert alert-warning" role="alert">
              <strong>
                <i className="fa-solid fa-triangle-exclamation me-3"></i>
              </strong>
              Selecciona una Dirección de Envió
            </div>
          </>
        )}
      </div>
      <div className="text-center mt-4">
        <button
          className="btn btn-success text-white"
          onClick={() => {
            if (!direccionSelecionada) {
              toast.error(`Selecciona una Dirección de Envió!`)
              seterrorSelected({ isError: true, message: 'Selecciona una Dirección de Envió' })
              return
            }
            setPasoActive('1')
          }}
        >
          Siguiente
        </button>
      </div>

      <Modal
        centered
        show={show}
        onHide={() => {
          setShow(false)
        }}
      >
        <Modal.Body>
          <FormDireccion
            onHide={() => {
              setShow(false)
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

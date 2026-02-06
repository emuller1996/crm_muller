import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Modal } from 'react-bootstrap'
import FormUsuarios from './components/FormUsuarios'
import { useUsuarios } from '../../hooks/useUsuarios'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../utils/optionsConfig'
import FormChangePassword from './components/FormChangePassword'

const UsuariosPage = () => {
  const [show, setShow] = useState(false)
  const [Draw, setDraw] = useState(1)
  const [showPass, setShowPass] = useState({ show: false, data: null })

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const { getAlUsuarios, data: ListUsuaios, loading, abortController } = useUsuarios()

  useEffect(() => {
    getAlUsuarios()
    return () => {
      abortController.abort()
    }
  }, [Draw])
  return (
    <div>
      <div>
        <Button variant="primary" onClick={handleShow}>
          Crear Usuarios
        </Button>
      </div>
      <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
        <DataTable
          className="MyDataTableEvent"
          striped
          columns={[
            {
              name: 'Id',
              cell: (row) => {
                return (
                  <ButtonGroup size="sm">
                    <Button
                      onClick={() => {
                        setShowPass({ show: true, data: row })
                      }}
                      title="Cambiar Contraseña"
                      variant="info"
                    >
                      <i className="fa-solid fa-key text-white"></i>
                    </Button>
                  </ButtonGroup>
                )
              },
              width: '100px',
            },
            { name: 'Id', selector: (row) => row._id, width: '100px' },
            { name: 'Nombre', selector: (row) => row?.name ?? '', width: '200px' },
            { name: 'Correo', selector: (row) => row?.email ?? '', width: '200px' },
            { name: 'Rol', selector: (row) => row?.role ?? '', width: '150px' },
            { name: '', selector: (row) => row?.city ?? '' },
          ]}
          data={ListUsuaios ?? []}
          pagination
          progressPending={loading}
          progressComponent={
            <div className="d-flex justify-content-center my-5">
              <div
                className="spinner-border text-primary"
                style={{ width: '3em', height: '3em' }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          }
          paginationComponentOptions={paginationComponentOptions}
          noDataComponent="No hay datos para mostrar"
        />
      </div>

      <Modal backdrop={'static'} size="lg" centered show={show} onHide={handleClose}>
        <Modal.Body>
          <FormUsuarios
            onHide={handleClose}
            allUser={() => {
              setDraw((status) => ++status)
            }}
          />
        </Modal.Body>
      </Modal>

      <Modal
        size="sm"
        centered
        show={showPass.show}
        onHide={() => {
          setShowPass({ show: false, data: null })
        }}
      >
        <Modal.Header closeButton style={{ backgroundColor: '#11640079' }}>
          Cambiar Contraseña
        </Modal.Header>
        <Modal.Body>
          <FormChangePassword
            dataUser={showPass.data}
            allUser={() => {
              setDraw((status) => ++status)
              setShowPass({ show: false, data: null })
            }}
          />
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default UsuariosPage

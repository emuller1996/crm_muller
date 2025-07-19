import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import FormUsuarios from './components/FormUsuarios'
import { useUsuarios } from '../../hooks/useUsuarios'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../utils/optionsConfig'

const UsuariosPage = () => {
  const [show, setShow] = useState(false)
  const [Draw, setDraw] = useState(1)

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
            { name: 'Id', selector: (row) => row._id, width: '100px' },
            { name: 'Nombre', selector: (row) => row?.name ?? '', width: '200px' },
            { name: 'Correo', selector: (row) => row?.email ?? '', width: '200px' },
            { name: 'Rol', selector: (row) => row?.role ?? '', width: '150px' },
            { name: '', selector: (row) => row?.city ?? '' },
          ]}
          data={ListUsuaios ?? []}
          pagination
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
    </div>
  )
}

export default UsuariosPage

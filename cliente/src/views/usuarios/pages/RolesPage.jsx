/* eslint-disable prettier/prettier */
import { Button, ButtonGroup, Modal } from 'react-bootstrap'
import RolePermissionsForm from './components/RolePermissionsForm'
import React, { useState } from 'react'
import { useUsuarios } from '../../../hooks/useUsuarios'
import { useEffect } from 'react'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../../utils/optionsConfig'

export default function RolesPage() {
  const [show, setShow] = useState(false)
  const [Draw, setDraw] = useState(1)
  const [RoleSelect, setRoleSelect] = useState(null)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const { getAllRole, DataRole } = useUsuarios()

  useEffect(() => {
    getAllRole()
  }, [Draw])

  return (
    <>
      <div>
        <Button variant="primary" onClick={()=>{
            setRoleSelect(null)
            handleShow()
        }}>
          Crear Role
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
                        handleShow()
                        setRoleSelect(row)
                      }}
                      title="Actulizar"
                      variant="info"
                    >
                      <i className="fa-solid fa-key text-white"></i>
                    </Button>
                  </ButtonGroup>
                )
              },
              width: '100px',
            },
            
            { name: 'Nombre', selector: (row) => row?.name ?? '', },
            { name: 'Fecha Creacion', selector: (row) => `${new Date(row?.createdTime).toLocaleDateString()} : ${new Date(row?.createdTime).toLocaleTimeString()}`  },
          ]}
          data={DataRole.data ?? []}
          pagination
          progressPending={DataRole.loading}
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
          noDataComponent="No hay Roles Registados"
        />
      </div>
      <Modal size="lg" centered show={show} onHide={handleClose}>
        <Modal.Body>
          <RolePermissionsForm
            onHide={handleClose}
            role={RoleSelect}
            allRole={() => {
              setDraw((status) => ++status)
            }}
          />
        </Modal.Body>
      </Modal>
    </>
  )
}

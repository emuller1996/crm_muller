import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { Accordion, Button, Form, InputGroup, Modal } from 'react-bootstrap'
import { useClientes } from '../../hooks/useClientes'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../utils/optionsConfig'
import FormClientes from './components/FormClientes'
import ComentariosCliente from './components/ComentariosCliente/ComentariosCliente'
import { ViewDollar } from '../../utils'

const ClientePage = () => {
  const [show, setShow] = useState(false)
  const [show2, setShow2] = useState(false)

  const [Draw, setDraw] = useState(1)
  const [ClienteS, setClienteS] = useState(null)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const [dataFilter, setdataFilter] = useState({
    perPage: 10,
    search: '',
    page: 1,
    draw: 1,
  })

  const { getAllClientesPagination, dataP, loading } = useClientes()

  useEffect(() => {
    getAllClientesPagination(dataFilter)
  }, [dataFilter, Draw])

  return (
    <div className="">
      <CContainer fluid>
        <Accordion className="mb-2">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Filtros Avanzados</Accordion.Header>
            <Accordion.Body>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <div>
          <Button
            variant="success"
            className="text-white"
            onClick={() => {
              setClienteS(null)
              handleShow()
            }}
          >
            Crear Cliente
          </Button>
          <Button className="ms-2" variant="info">
            EXPORTAR CLIENTS
          </Button>
        </div>
        <div className="w-100 mt-2">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              placeholder="Buscar por Nombre, Alias y Telefono"
              type="text"
              aria-label="First name"
              className="form-control"
              onChange={(e) => {
                setdataFilter((status) => {
                  return { ...status, search: e.target.value }
                })
              }}
            />
          </div>
        </div>
        <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
          <DataTable
            className="MyDataTableEvent"
            striped
            columns={[
              {
                cell: (row) => {
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setClienteS(row)
                          handleShow()
                        }}
                        className="btn btn-info btn-sm text-white"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        onClick={() => {
                          setClienteS(row)
                          setShow2(true)
                        }}
                        type="button"
                        className="btn btn-dark btn-sm ms-2"
                      >
                        <i className="fa-solid fa-comments"></i>
                      </button>
                    </>
                  )
                },
              },
              { name: 'Nombre', selector: (row) => row?.name ?? '', width: '200px' },
              { name: 'Alias/Apodo', selector: (row) => row?.alias ?? '', width: '200px' },
              { name: 'Correo', selector: (row) => row?.email ?? '', width: '200px' },
              { name: 'Telefono', selector: (row) => row?.telefono ?? '', width: '150px' },
              {
                name: 'Direccion',
                selector: (row) => `${row?.direccion ?? ''}`,
                width: '150px',
              },
              {
                name: 'Barrio',
                selector: (row) => `${row?.barrio ?? ''}`,
                width: '150px',
              },
              {
                name: 'Creado por',
                selector: (row) => row?.user_create ?? '',
                format: (row) => (
                  <>
                    <div>
                      <span className="text-muted">
                        <i className=" fa-solid fa-user me-1"></i>
                        {row?.user_create?.name ?? ' No registrado '}
                      </span>
                    </div>
                  </>
                ),
              },
              {
                name: 'Fecha Creacion.',
                selector: (row) =>
                  `${new Date(row?.createdTime).toISOString().split('T')[0] ?? ''} ${new Date(row?.createdTime).toLocaleTimeString() ?? ''}`,
                width: '250px',
              },
              {
                name: 'Fecha Actualizacion',
                selector: (row) =>
                  `${new Date(row?.updatedTime).toISOString().split('T')[0] ?? ''} ${new Date(row?.updatedTime).toLocaleTimeString() ?? ''}`,
                width: '250px',
              },
              { name: '', selector: (row) => row?.city ?? '' },
            ]}
            progressPending={loading}
            data={dataP?.data}
            pagination
            paginationServer
            paginationComponentOptions={paginationComponentOptions}
            paginationPerPage={dataFilter.perPage}
            noDataComponent="No hay datos para mostrar"
            paginationTotalRows={dataP?.total}
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
            onChangeRowsPerPage={(perPage, page) => {
              console.log(perPage, page)
              setdataFilter((status) => {
                return { ...status, perPage }
              })
            }}
            onChangePage={(page) => {
              console.log(page)

              setdataFilter((status) => {
                return { ...status, page }
              })
            }}
          />
        </div>
        <Modal backdrop={'static'} size="lg" centered show={show} onHide={handleClose}>
          <Modal.Body>
            <FormClientes
              onHide={handleClose}
              cliente={ClienteS}
              allClientes={() => {
                setDraw((status) => ++status)
              }}
            />
          </Modal.Body>
        </Modal>
        <Modal size="lg" centered show={show2} onHide={() => setShow2(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Comentarios de Cliente : {`${ClienteS?.name}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ComentariosCliente Cliente={ClienteS} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow2(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setShow2(false)}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </CContainer>
    </div>
  )
}

export default ClientePage

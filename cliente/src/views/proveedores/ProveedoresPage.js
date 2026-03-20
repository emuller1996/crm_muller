import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { Button, Modal } from 'react-bootstrap'
import { useProveedores } from '../../hooks/useProveedores'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../utils/optionsConfig'
import FormProveedores from './components/FormProveedores'

const ProveedoresPage = () => {
  const [show, setShow] = useState(false)
  const [Draw, setDraw] = useState(1)
  const [ProveedorS, setProveedorS] = useState(null)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const [dataFilter, setdataFilter] = useState({
    perPage: 10,
    search: '',
    page: 1,
    draw: 1,
  })

  const { getAllProveedoresPagination, dataP, loading } = useProveedores()

  useEffect(() => {
    getAllProveedoresPagination(dataFilter)
  }, [dataFilter, Draw])

  return (
    <div className="">
      <CContainer fluid>
        <div>
          <Button
            variant="success"
            className="text-white"
            onClick={() => {
              setProveedorS(null)
              handleShow()
            }}
          >
            Crear Proveedor
          </Button>
        </div>
        <div className="w-100 mt-2">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              placeholder="Buscar por Nombre, Documento, Telefono o Contacto"
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
                    <button
                      type="button"
                      onClick={() => {
                        setProveedorS(row)
                        handleShow()
                      }}
                      className="btn btn-info btn-sm text-white"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                  )
                },
                width: '60px',
              },
              { name: 'Nombre', selector: (row) => row?.nombre ?? '', width: '200px' },
              {
                name: 'Tipo Doc.',
                selector: (row) => row?.tipo_documento ?? '',
                width: '120px',
              },
              {
                name: 'Nro. Documento',
                selector: (row) => row?.numero_documento ?? '',
                width: '160px',
              },
              { name: 'Telefono', selector: (row) => row?.telefono ?? '', width: '150px' },
              { name: 'Direccion', selector: (row) => row?.direccion ?? '', width: '180px' },
              { name: 'Ciudad', selector: (row) => row?.ciudad ?? '', width: '130px' },
              { name: 'Correo', selector: (row) => row?.correo ?? '', width: '200px' },
              {
                name: 'Contacto',
                selector: (row) => row?.nombre_contacto ?? '',
                width: '180px',
              },
              {
                name: 'Creado por',
                selector: (row) => row?.user_create ?? '',
                format: (row) => (
                  <div>
                    <span className="text-muted">
                      <i className="fa-solid fa-user me-1"></i>
                      {row?.user_create?.name ?? ' No registrado '}
                    </span>
                  </div>
                ),
              },
              {
                name: 'Fecha Creacion.',
                selector: (row) =>
                  `${new Date(row?.createdTime).toISOString().split('T')[0] ?? ''} ${new Date(row?.createdTime).toLocaleTimeString() ?? ''}`,
                width: '250px',
              },
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
              setdataFilter((status) => {
                return { ...status, perPage }
              })
            }}
            onChangePage={(page) => {
              setdataFilter((status) => {
                return { ...status, page }
              })
            }}
          />
        </div>
        <Modal backdrop={'static'} size="lg" centered show={show} onHide={handleClose}>
          <Modal.Body>
            <FormProveedores
              onHide={handleClose}
              proveedor={ProveedorS}
              allProveedores={() => {
                setDraw((status) => ++status)
              }}
            />
          </Modal.Body>
        </Modal>
      </CContainer>
    </div>
  )
}

export default ProveedoresPage

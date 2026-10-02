import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { Button, Modal } from 'react-bootstrap'
import { useCajas } from '../../hooks/useCajas'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../utils/optionsConfig'
import FormCajas from './components/FormCajas'

const CajasPage = () => {
  const [show, setShow] = useState(false)
  const [Draw, setDraw] = useState(1)
  const [CajaS, setCajaS] = useState(null)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const [dataFilter, setdataFilter] = useState({
    perPage: 10,
    search: '',
    page: 1,
    draw: 1,
  })

  const { getAllCajasPagination, dataP, loading } = useCajas()

  useEffect(() => {
    getAllCajasPagination(dataFilter)
  }, [dataFilter, Draw])

  return (
    <div className="">
      <CContainer fluid>
        <div>
          <Button
            variant="success"
            className="text-white"
            onClick={() => {
              setCajaS(null)
              handleShow()
            }}
          >
            Crear Caja
          </Button>
        </div>
        <div className="w-100 mt-2">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              placeholder="Buscar por Nombre o Nota"
              type="text"
              aria-label="Buscar"
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
                        setCajaS(row)
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
                name: 'Estado',
                selector: (row) => row?.estado ?? '',
                format: (row) => (
                  <span
                    className={`badge ${row?.estado === 'habilitada' ? 'text-bg-success' : 'text-bg-secondary'}`}
                  >
                    {row?.estado === 'habilitada' ? 'Habilitada' : 'Deshabilitada'}
                  </span>
                ),
                width: '140px',
              },
              {
                name: 'Monto Maximo',
                selector: (row) => row?.monto_maximo ?? 0,
                format: (row) =>
                  (row?.monto_maximo ?? 0).toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0,
                  }),
                width: '160px',
              },
              {
                name: 'Usuarios',
                selector: (row) => row?.usuarios_detalle?.length ?? 0,
                format: (row) => (
                  <div className="d-flex flex-wrap gap-1 py-1">
                    {(row?.usuarios_detalle ?? []).map((u) => (
                      <span key={u._id} className="badge text-bg-light border">
                        <i className="fa-solid fa-user me-1"></i>
                        {u.name ?? 'No registrado'}
                      </span>
                    ))}
                  </div>
                ),
                width: '280px',
              },
              { name: 'Nota', selector: (row) => row?.nota ?? '', width: '220px' },
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
            <FormCajas
              onHide={handleClose}
              caja={CajaS}
              allCajas={() => {
                setDraw((status) => ++status)
              }}
            />
          </Modal.Body>
        </Modal>
      </CContainer>
    </div>
  )
}

export default CajasPage

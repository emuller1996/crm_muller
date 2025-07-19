import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { Button, Form, Modal, Tooltip } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import {
  paginationComponentOptions,
  StatusOrderOptions,
  stylesSelect,
  themeSelect,
} from '../../utils/optionsConfig'
import { ViewDollar } from '../../utils'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { useOrden } from '../../hooks/useOrden'
import { Chip } from '@mui/material'

const PedidosPage = () => {
  const [show, setShow] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [Draw, setDraw] = useState(1)
  const [dataFilter, setdataFilter] = useState({
    perPage: 10,
    search: '',
    page: 1,
    draw: 1,
  })

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const { data: ListProductos, dataP, loading, getAllOrdenesPagination } = useOrden()
  const [ProductoSelecionado, setProductoSelecionado] = useState(null)

  useEffect(() => {
    getAllOrdenesPagination(dataFilter)
  }, [dataFilter])
  return (
    <div className="container-fluid">
      <div>
        <div className="card card-body mt-3">
          <span className="d-block text-muted">Filtros Avanzados</span>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <div>
                <Form.Label htmlFor="gender">Estado</Form.Label>
                <Select
                  name={'status'}
                  placeholder=""
                  onChange={(e) => {
                    console.log(e)
                    setdataFilter((status) => {
                      return { ...status, status: e?.value ?? '' }
                    })
                  }}
                  styles={stylesSelect}
                  theme={themeSelect}
                  options={StatusOrderOptions}
                  isClearable
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="w-100">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </span>
                  <input
                    placeholder="Busque por Nombre Cliente o Correo"
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
            </div>
          </div>
        </div>

        <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
          <DataTable
            className="MyDataTableEvent"
            striped
            columns={[
              {
                name: 'Acciones',
                width: '80px',
                cell: (row) => {
                  return (
                    <>
                      <Link
                        to={`${row._id}/detalle`}
                        onClick={() => {
                          setProductoSelecionado(row)
                          handleShow()
                        }}
                        title="Detalle Orden."
                        className="btn text-white btn-info btn-sm me-2"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </Link>
                    </>
                  )
                },
              },
              //{ name: 'Id', selector: (row) => row._id, width: '100px' },
              {
                name: 'Cliente',
                selector: (row) => row?.cliente?.name_client ?? '',
                width: '250px',
              },

              {
                name: 'Fecha de Pedido',
                selector: (row) =>
                  `${new Date(row?.createdTime).toLocaleDateString() ?? ''} ${new Date(row?.createdTime).toLocaleTimeString() ?? ''}`,
                width: '160px',
              },
              {
                name: 'Valor',
                selector: (row) => ViewDollar(row?.total_order ?? 0) ?? '',
                width: '150px',
              },
              {
                name: 'Estado',
                selector: (row) => row?.status,
                width: '150px',
                cell: (row) => {
                  let color = ``
                  if (row?.status === 'Pendiente') {
                    color = '#f6f68e'
                  }
                  if (row?.status === 'En Proceso') {
                    color = '#95a4f9'
                  }
                  if (row?.status === 'Cancelada') {
                    color = '#f99a95'
                  }
                  if (row?.status === 'En Camino') {
                    color = '#8ef6eb'
                  }
                  if (row?.status === 'Entregada') {
                    color = '#a3f995'
                  }
                  return (
                    <>
                      <Chip
                        sx={{ fontSize: '1em', backgroundColor: color }}
                        label={row?.status}
                        variant="outlined"
                      />
                    </>
                  )
                },
              },

              {
                name: 'Num Products',
                selector: (row) => row?.products?.length ?? '',
                width: '90px',
              },
              {
                name: 'Fecha de Creacion.',
                selector: (row) =>
                  `${new Date(row?.createdTime).toLocaleDateString() ?? ''} ${new Date(row?.createdTime).toLocaleTimeString() ?? ''}`,
                width: '160px',
              },
            ]}
            data={dataP?.data}
            pagination
            paginationServer
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
            paginationTotalRows={dataP?.total}
            paginationComponentOptions={paginationComponentOptions}
            noDataComponent="No hay datos para mostrar"
            onChangeRowsPerPage={(perPage, page) => {
              console.log(perPage, page)
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
            <p>modal PAge</p>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  )
}

export default PedidosPage

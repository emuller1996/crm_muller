/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { Badge, Form, Modal } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../utils/optionsConfig'
import { useLogs } from '../../hooks/useLogs'

const METHOD_COLORS = {
  POST: 'success',
  PUT: 'primary',
  PATCH: 'warning',
  DELETE: 'danger',
}

const LogsPage = () => {
  const { getLogs, getStats, data, stats, loading } = useLogs()
  const [selected, setSelected] = useState(null)

  const [dataFilter, setDataFilter] = useState({
    perPage: 20,
    page: 1,
    search: '',
    modulo: '',
    accion: '',
    success: '',
    fecha_desde: '',
    fecha_hasta: '',
  })

  useEffect(() => {
    getLogs(dataFilter)
  }, [dataFilter])

  useEffect(() => {
    getStats()
  }, [])

  return (
    <div>
      <CContainer fluid>
        <h5 className="fw-bold mb-3">
          <i className="fa-solid fa-clipboard-list me-2"></i>
          Registro de Actividad
        </h5>

        {/* Stats */}
        {stats && (
          <div className="row g-2 mb-3">
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-2 text-center">
                  <div className="text-muted small">Total Registros</div>
                  <div className="fs-5 fw-bold">{stats.total}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-2 text-center">
                  <div className="text-muted small">Hoy</div>
                  <div className="fs-5 fw-bold text-primary">{stats.hoy}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-2 text-center">
                  <div className="text-muted small">Errores</div>
                  <div className="fs-5 fw-bold text-danger">{stats.errores}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-2 text-center">
                  <div className="text-muted small">Modulos</div>
                  <div className="fs-5 fw-bold">{stats.por_modulo?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                placeholder="Buscar..."
                type="text"
                className="form-control"
                onChange={(e) =>
                  setDataFilter((s) => ({ ...s, search: e.target.value, page: 1 }))
                }
              />
            </div>
          </div>
          <div className="col-md-2">
            <Form.Select
              size="sm"
              value={dataFilter.modulo}
              onChange={(e) => setDataFilter((s) => ({ ...s, modulo: e.target.value, page: 1 }))}
            >
              <option value="">Todos los modulos</option>
              {(stats?.por_modulo || []).map((m) => (
                <option key={m.modulo} value={m.modulo}>
                  {m.modulo} ({m.count})
                </option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-2">
            <Form.Select
              size="sm"
              value={dataFilter.accion}
              onChange={(e) => setDataFilter((s) => ({ ...s, accion: e.target.value, page: 1 }))}
            >
              <option value="">Todas las acciones</option>
              <option value="crear">Crear</option>
              <option value="actualizar">Actualizar</option>
              <option value="modificar">Modificar</option>
              <option value="eliminar">Eliminar</option>
            </Form.Select>
          </div>
          <div className="col-md-1">
            <Form.Select
              size="sm"
              value={dataFilter.success}
              onChange={(e) => setDataFilter((s) => ({ ...s, success: e.target.value, page: 1 }))}
            >
              <option value="">Estado</option>
              <option value="true">OK</option>
              <option value="false">Error</option>
            </Form.Select>
          </div>
          <div className="col-md-2">
            <Form.Control
              size="sm"
              type="date"
              value={dataFilter.fecha_desde}
              onChange={(e) =>
                setDataFilter((s) => ({ ...s, fecha_desde: e.target.value, page: 1 }))
              }
            />
          </div>
          <div className="col-md-2">
            <Form.Control
              size="sm"
              type="date"
              value={dataFilter.fecha_hasta}
              onChange={(e) =>
                setDataFilter((s) => ({ ...s, fecha_hasta: e.target.value, page: 1 }))
              }
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded overflow-hidden border shadow-sm">
          <DataTable
            className="MyDataTableEvent"
            striped
            columns={[
              {
                name: '',
                width: '50px',
                cell: (row) => (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    title="Ver detalle"
                    onClick={() => setSelected(row)}
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                ),
              },
              {
                name: 'Metodo',
                width: '90px',
                cell: (row) => (
                  <Badge bg={METHOD_COLORS[row.method] || 'secondary'} className="font-monospace">
                    {row.method}
                  </Badge>
                ),
              },
              {
                name: 'Modulo',
                width: '130px',
                selector: (row) => row?.modulo ?? '',
              },
              {
                name: 'Descripcion',
                selector: (row) => row?.descripcion ?? '',
                width: '280px',
              },
              {
                name: 'Usuario',
                width: '150px',
                cell: (row) =>
                  row.user_name ? (
                    <span>
                      <i className="fa-solid fa-user me-1 text-muted"></i>
                      {row.user_name}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  ),
              },
              {
                name: 'Estado',
                width: '80px',
                cell: (row) => (
                  <Badge bg={row.success ? 'success' : 'danger'} className="px-2">
                    {row.status_code}
                  </Badge>
                ),
              },
              {
                name: 'Duracion',
                width: '90px',
                cell: (row) => (
                  <span className="text-muted small font-monospace">
                    {row.duration_ms}ms
                  </span>
                ),
              },
              {
                name: 'Fecha',
                width: '170px',
                selector: (row) =>
                  row?.createdTime
                    ? `${new Date(row.createdTime).toLocaleDateString()} ${new Date(row.createdTime).toLocaleTimeString()}`
                    : '',
              },
            ]}
            progressPending={loading}
            data={data?.data}
            pagination
            paginationServer
            paginationComponentOptions={paginationComponentOptions}
            paginationPerPage={dataFilter.perPage}
            paginationTotalRows={data?.total}
            noDataComponent="No hay registros"
            progressComponent={
              <div className="d-flex justify-content-center my-5">
                <div
                  className="spinner-border text-primary"
                  style={{ width: '3em', height: '3em' }}
                  role="status"
                />
              </div>
            }
            onChangeRowsPerPage={(perPage) => {
              setDataFilter((s) => ({ ...s, perPage }))
            }}
            onChangePage={(page) => {
              setDataFilter((s) => ({ ...s, page }))
            }}
            conditionalRowStyles={[
              {
                when: (row) => !row.success,
                style: { backgroundColor: '#fff5f5' },
              },
            ]}
          />
        </div>

        {/* Modal Detalle */}
        <Modal size="lg" centered show={!!selected} onHide={() => setSelected(null)}>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center gap-2">
              <Badge bg={METHOD_COLORS[selected?.method] || 'secondary'} className="font-monospace">
                {selected?.method}
              </Badge>
              <span style={{ fontSize: '1rem' }}>{selected?.descripcion}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selected && (
              <div>
                {/* Info general */}
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <DetailField label="Modulo" value={selected.modulo} />
                  </div>
                  <div className="col-md-6">
                    <DetailField label="Accion" value={selected.accion} />
                  </div>
                  <div className="col-md-6">
                    <DetailField label="URL" value={selected.url} mono />
                  </div>
                  <div className="col-md-3">
                    <DetailField
                      label="Status"
                      value={
                        <Badge bg={selected.success ? 'success' : 'danger'}>
                          {selected.status_code} - {selected.success ? 'OK' : 'Error'}
                        </Badge>
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <DetailField label="Duracion" value={`${selected.duration_ms}ms`} />
                  </div>
                </div>

                <hr />

                {/* Usuario */}
                <h6 className="text-muted small text-uppercase mb-2">Usuario</h6>
                <div className="row g-2 mb-3">
                  <div className="col-md-4">
                    <DetailField label="Nombre" value={selected.user_name || '-'} />
                  </div>
                  <div className="col-md-4">
                    <DetailField label="Email" value={selected.user_email || '-'} />
                  </div>
                  <div className="col-md-4">
                    <DetailField label="IP" value={selected.ip || '-'} mono />
                  </div>
                </div>

                <hr />

                {/* Respuesta */}
                {selected.response_message && (
                  <div className="mb-3">
                    <h6 className="text-muted small text-uppercase mb-2">Respuesta</h6>
                    <div className="bg-light rounded p-2">
                      <code>{selected.response_message}</code>
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {selected.request_body && (
                  <div className="mb-3">
                    <h6 className="text-muted small text-uppercase mb-2">Request Body</h6>
                    <pre
                      className="bg-dark text-light rounded p-3 small"
                      style={{ maxHeight: '300px', overflow: 'auto' }}
                    >
                      {JSON.stringify(selected.request_body, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Params */}
                {selected.params && (
                  <div className="mb-3">
                    <h6 className="text-muted small text-uppercase mb-2">Params</h6>
                    <pre className="bg-light rounded p-2 small">
                      {JSON.stringify(selected.params, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Meta */}
                <hr />
                <div className="row g-2">
                  <div className="col-md-6">
                    <DetailField
                      label="Fecha y Hora"
                      value={
                        selected.timestamp
                          ? new Date(selected.timestamp).toLocaleString()
                          : '-'
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <DetailField label="User Agent" value={selected.user_agent || '-'} mono small />
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </CContainer>
    </div>
  )
}

function DetailField({ label, value, mono, small }) {
  return (
    <div>
      <div className="text-muted small text-uppercase" style={{ fontSize: '0.68rem' }}>
        {label}
      </div>
      <div
        className={`${mono ? 'font-monospace' : ''}`}
        style={{ fontSize: small ? '0.75rem' : '0.85rem', wordBreak: 'break-all' }}
      >
        {value}
      </div>
    </div>
  )
}

export default LogsPage

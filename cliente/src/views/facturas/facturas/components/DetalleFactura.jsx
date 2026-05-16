/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import DataTable from 'react-data-table-component'
import { ViewDollar } from '../../../../utils'
import { useFacturas } from '../../../../hooks/useFacturas'

export default function DetalleFactura({ Factura }) {
  DetalleFactura.propTypes = {
    getAllFactura: PropTypes.func,
    Factura: PropTypes.object,
  }

  const { getPagosByFactura } = useFacturas()
  const [Pagos, setPagos] = useState(null)
  const [loadingPagos, setLoadingPagos] = useState(false)

  useEffect(() => {
    if (Factura?._id && Factura?.status === 'Pendiente') {
      loadPagos(Factura._id)
    } else {
      setPagos(null)
    }
  }, [Factura?._id, Factura?.status])

  const loadPagos = async (id) => {
    setLoadingPagos(true)
    try {
      const result = await getPagosByFactura(id)
      setPagos(result.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingPagos(false)
    }
  }

  const totalPagado = Pagos?.suma?.value || 0
  const saldoPendiente = (Factura?.total_monto || 0) - totalPagado

  return (
    <>
      <div>
        <div className="px-3">
          <div className="row g-3">
            <div className="col-md-6">
              <p className="m-0">Datos Cliente.</p>
              <p className="m-0 fs-5">{Factura?.client?.name}</p>
            </div>
            <div className="col-md-6">
              <p className="m-0">Fecha Generada.</p>
              <p className="m-0 fs-5">
                {new Date(Factura?.createdTime).toLocaleDateString()}{' '}
                {new Date(Factura?.createdTime).toLocaleTimeString()}
              </p>
            </div>
            <div className="col-md-6">
              <p className="m-0">Metodo de pago.</p>
              <p className="m-0 fs-5 text-uppercase">{Factura?.metodo_pago}</p>
            </div>
            {Factura?.fecha_vencimiento && (
              <div className="col-md-6">
                <p className="m-0">Fecha de Vencimiento.</p>
                <p className="m-0 fs-5 text-uppercase">{Factura?.fecha_vencimiento}</p>
              </div>
            )}
            <div className="col-md-12 text-center">
              <p className="m-0">Estado</p>
              <p className="badge bg-primary text-uppercase m-0 fs-5">{Factura?.status}</p>
            </div>
          </div>
        </div>
        <div className="px-3">
          <div className="rounded overflow-hidden border border-ligth shadow-sm mt-3">
            <DataTable
              className="MyDataTableEvent"
              striped
              columns={[
                {
                  name: 'Nombre Producto',
                  selector: (row) => row?.product_name ?? '',
                },
                {
                  name: 'Cant.',
                  selector: (row) => row?.cantidad ?? '',
                },
                {
                  name: 'Precio',
                  selector: (row) => row?.price ?? '',
                  format: (row) => ViewDollar(row?.price) ?? '',
                },
                {
                  name: 'Total',
                  selector: (row) => row?.price ?? '',
                  format: (row) => ViewDollar(row?.price * row?.cantidad) ?? '',
                },
              ]}
              noDataComponent={<p className="my-4">No hay Productos en la Cotización.</p>}
              data={Factura?.productos}
            />
          </div>
          <div className="text-center mt-2">
            <span className="me-2">Total </span>
            <span className="fw-bold fs-4">{ViewDollar(Factura?.total_monto)}</span>
          </div>

          {/* Seccion de pagos parciales - solo si la factura esta Pendiente */}
          {Factura?.status === 'Pendiente' && (
            <>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">
                  <i className="fa-solid fa-comment-dollar me-2 text-success"></i>
                  Pagos Realizados
                </h6>
                {Pagos && (
                  <span className="badge bg-info text-dark">
                    {Pagos.pagos?.length || 0} pago(s)
                  </span>
                )}
              </div>

              {loadingPagos && (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary me-2" />
                  <span className="text-muted">Cargando pagos...</span>
                </div>
              )}

              {!loadingPagos && Pagos && Pagos.pagos?.length === 0 && (
                <div className="alert alert-secondary py-2 small mb-2">
                  <i className="fa-solid fa-circle-info me-1"></i>
                  No se han registrado pagos parciales en esta factura.
                </div>
              )}

              {!loadingPagos && Pagos && Pagos.pagos?.length > 0 && (
                <>
                  <div className="rounded overflow-hidden border border-ligth shadow-sm mb-2">
                    <DataTable
                      className="MyDataTableEvent"
                      striped
                      dense
                      columns={[
                        {
                          name: 'Fecha y Hora',
                          selector: (row) =>
                            row?.createdTime
                              ? `${new Date(row.createdTime).toLocaleDateString()} ${new Date(row.createdTime).toLocaleTimeString()}`
                              : '',
                          width: '200px',
                        },
                        {
                          name: 'Monto',
                          cell: (row) => (
                            <span className="fw-bold text-success">
                              {ViewDollar(row?.monto || 0)}
                            </span>
                          ),
                          width: '140px',
                        },
                        {
                          name: 'Metodo',
                          cell: (row) => (
                            <span className="text-capitalize">
                              {row.metodo_pago === 'efectivo' && (
                                <i className="fa-solid fa-money-bill me-1 text-success"></i>
                              )}
                              {row.metodo_pago === 'tarjeta' && (
                                <i className="fa-solid fa-credit-card me-1 text-primary"></i>
                              )}
                              {row.metodo_pago === 'Transferencia' && (
                                <i className="fa-solid fa-money-bill-transfer me-1 text-warning"></i>
                              )}
                              {row?.metodo_pago ?? '-'}
                            </span>
                          ),
                          width: '160px',
                        },
                        {
                          name: 'Registrado por',
                          cell: (row) => (
                            <span className="text-muted">
                              <i className="fa-solid fa-user me-1"></i>
                              {row?.user_create?.name ?? 'No registrado'}
                            </span>
                          ),
                        },
                      ]}
                      data={Pagos.pagos}
                      noDataComponent={<p className="my-3">Sin pagos</p>}
                    />
                  </div>

                  {/* Resumen de pagos */}
                  <div className="row g-2 mt-2">
                    <div className="col-md-4">
                      <div className="card border-success">
                        <div className="card-body py-2 text-center">
                          <div className="text-muted small">Total Pagado</div>
                          <div className="fs-5 fw-bold text-success">
                            {ViewDollar(totalPagado)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-warning">
                        <div className="card-body py-2 text-center">
                          <div className="text-muted small">Saldo Pendiente</div>
                          <div className="fs-5 fw-bold text-warning">
                            {ViewDollar(saldoPendiente)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-primary">
                        <div className="card-body py-2 text-center">
                          <div className="text-muted small">Total Factura</div>
                          <div className="fs-5 fw-bold text-primary">
                            {ViewDollar(Factura?.total_monto || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {Factura?.signature && (
            <>
              <hr />
              <p className="text-center mb-0">Firma Cliente </p>
              <div className="d-flex justify-content-center overflow-auto">
                <div style={{ border: '1px solid #c2c2c2', width: '450px', borderRadius: 8 }}>
                  <img src={Factura?.signature} alt="FIMRA_COTIZACION" />
                </div>
              </div>
              <span>
                Fecha Firma {new Date(Factura.signature_date).toLocaleDateString()} -{' '}
                {new Date(Factura.signature_date).toLocaleTimeString()}
              </span>
            </>
          )}
          {Factura?.nota && (
            <>
              <div className="">
                <div className="">
                  <label htmlFor="" className="form-label">
                    Notas
                  </label>
                  <textarea
                    defaultValue={Factura?.nota}
                    disabled
                    className="form-control"
                    name=""
                    id=""
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

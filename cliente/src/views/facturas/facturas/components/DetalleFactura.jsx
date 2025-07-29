/* eslint-disable prettier/prettier */
import React from 'react'
import PropTypes from 'prop-types'
import DataTable from 'react-data-table-component'
import { ViewDollar } from '../../../../utils'

export default function DetalleFactura({ Factura }) {
  DetalleFactura.propTypes = {
    getAllFactura: PropTypes.func,
    Factura: PropTypes.object,
  }
  console.log(Factura)

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

/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { StatusOrderOptions, stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import Select from 'react-select'
import { Form } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { useOrden } from '../../../hooks/useOrden'
import { ViewDollar } from '../../../utils'
import toast from 'react-hot-toast'

export default function PedidoDetallesPage() {
  const { idOrder } = useParams()

  const { getOrdenById, dataDetalle, loading, changeStatusOrder } = useOrden()

  useEffect(() => {
    getOrdenById(idOrder)
  }, [idOrder])

  console.log(dataDetalle)

  return (
    <div>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere voluptate debitis laborum
        accusantium obcaecati saepe sit facilis! Nemo minima sint totam placeat maiores, laboriosam
        provident sed quas ipsum ipsam est.
      </p>
      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div
            className="spinner-border text-primary"
            style={{ width: '3em', height: '3em' }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {dataDetalle && (
        <>
          <div className="card p-3 mb-3">
            <div className="row">
              <div className="col-md-6">
                <p className='m-0 '>Total Orden</p>
                <p className='m-0 fs-4 fw-semibold'> {ViewDollar(dataDetalle.total_order)}</p>
              </div>
              <div className="col-md-6">
                <Form.Label htmlFor="status">Cambiar de Estado</Form.Label>
                {dataDetalle && (
                  <Select
                    name={'status'}
                    id="status"
                    placeholder=""
                    defaultValue={StatusOrderOptions.find(
                      (sta) => sta.value === dataDetalle?.status,
                    )}
                    onChange={async (e) => {
                      try {
                        await changeStatusOrder(idOrder, { status: e?.value })
                        toast.success(`Se ha cambiado de estado la Orden.`)
                      } catch (error) {
                        console.log(error)
                      }
                    }}
                    styles={stylesSelect}
                    theme={themeSelect}
                    options={StatusOrderOptions}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <span className="d-flex justify-content-center text-muted">Datos de Cliente</span>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <span className="">Nombre</span>
                    <span className="">{dataDetalle?.cliente?.name_client}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Correo</span>
                    <span className="">{dataDetalle?.cliente?.email_client}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Telefono</span>
                    <span className="">{dataDetalle?.cliente?.phone_client}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Num Documento</span>
                    <span className="">{dataDetalle?.cliente?.number_document_client}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">
                      {' '}
                      <br />
                    </span>
                    <span className=""></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <span className="d-flex justify-content-center text-muted">Datos de Envio</span>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <span className="">Cuidad</span>
                    <span className="">{dataDetalle?.address?.city}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Departamento</span>
                    <span className="">{dataDetalle?.address?.departament}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Direccion</span>
                    <span className="">{dataDetalle?.address?.address}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Barrio</span>
                    <span className="">{dataDetalle?.address?.neighborhood}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Referencia</span>
                    <span className="">{dataDetalle?.address?.reference}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <span className="d-flex justify-content-center text-muted">Datos de Pago</span>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <span className="">Metodo de Pago</span>
                    <span className="">TARJETA</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Estado</span>
                    <span className="text-uppercase ">{dataDetalle?.mercadopago_data?.status}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Fecha</span>
                    <span className="">{dataDetalle?.mercadopago_data?.date_created }</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Ultimos 4 Digitos de la Tarjeta</span>
                    <span className="">{dataDetalle?.mercadopago_data?.card?.first_six_digits } *********** {dataDetalle?.mercadopago_data?.card?.last_four_digits }</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Monto Transaction {`(MercadoPago)`}</span>
                    <span className="text-success fw-semibold">{ViewDollar(dataDetalle?.mercadopago_data?.transaction_amount)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="">Monto Tarifa. {`(MercadoPago)`}</span>
                    <span className="text-warning fw-semibold">{ViewDollar(dataDetalle?.mercadopago_data?.fee_details?.[0]?.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="table-responsive mt-3">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Precio U.</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Talla</th>
                  <th scope="col">Precio Total.</th>
                </tr>
              </thead>
              <tbody>
                {dataDetalle?.products?.map((pro) => (
                  <tr key={pro._id} className="">
                    <td width={'450px'} scope="row">
                      <div>
                        <img
                          src={pro.image}
                          alt="IMG_PRODUCT"
                          style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                        />
                        <span className="ms-3">{pro.producto_data.name}</span>
                      </div>
                    </td>
                    <td>{ViewDollar(pro.price)}</td>
                    <td>{pro.cantidad}</td>
                    <td>{pro.stock_data.size}</td>
                    <td>{ViewDollar(pro.price * pro.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

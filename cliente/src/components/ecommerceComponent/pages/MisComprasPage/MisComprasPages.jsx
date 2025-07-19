/* eslint-disable prettier/prettier */

import React, { useEffect, useState } from 'react'
import { useClientes } from '../../../../hooks/useClientes'
import ReactTimeAgo from 'react-time-ago'
import { ViewDollar } from '../../../../utils'
import { IconButton, Step, StepLabel, Stepper } from '@mui/material'
import { Button, Modal } from 'react-bootstrap'
import './MisComprasPages.css'
import StepperStatus from './components/StepperStatus'
export default function MisComprasPages() {
  const { getAllShoppingByClientes, loading, dataShopping, getShopDetailById, dataShopDetail } =
    useClientes()
  const [show, setShow] = useState(false)
  const [ShopDetail, setShopDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    console.log('raro')

    getAllShoppingByClientes()
  }, [])

  return (
    <div className="container mt-5 mb-5">
      <p className="text-center fs-4">Mis Compras</p>
      <p className=" text-center text-muted">
        Bienvenido, en esta sección encontraras la información de tus compras.
      </p>
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      <div style={{ minHeight: '65vh' }}>
        <div className="row g-3 ">
          {dataShopping &&
            dataShopping.map((shop) => (
              <div key={shop._id} className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-1">
                      <span>
                        <ReactTimeAgo date={shop.createdTime} locale="en-CO" />
                      </span>
                      <span className="badge text-bg-primary">{shop?.status}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="card-text">Total</span>
                      <span className="card-title">{`${ViewDollar(shop.total_order ?? 0)}`}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="card-text">Num. Productos</span>
                      <span className="card-title">{shop.products.length}</span>
                    </div>
                    <div className="text-center">
                      <IconButton
                        title="Ver Detalle Compra"
                        onClick={async (e) => {
                          try {
                            setShow(true)
                            console.log(shop)
                            setShopDetail(null)
                            setLoadingDetail(true)
                            const result = await getShopDetailById(shop._id)
                            console.log(result.data)
                            setShopDetail(result.data)
                          } catch (error) {
                            console.log(error)
                          } finally {
                            setLoadingDetail(false)
                          }
                        }}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </IconButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <Modal
        centered
        show={show}
        onHide={() => {
          setShow(false)
        }}
        size="lg"
      >
        <Modal.Body>
          {loadingDetail && (
            <div className="text-center my-5">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
          {ShopDetail && (
            <>
              <StepperStatus status={ShopDetail?.status} />
              <div className="row g-3">
                <div className="col-md-6">
                  <span className="d-flex justify-content-center text-muted">Datos de Envio</span>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <span className="">Cuidad</span>
                        <span className="">{ShopDetail?.address?.city ?? ''}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="">Departamento</span>
                        <span className="">{ShopDetail?.address?.departament ?? ''}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="">Direccion</span>
                        <span className="">{ShopDetail?.address?.address ?? ''}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="">Barrio</span>
                        <span className="">{ShopDetail?.address?.neighborhood ?? ''}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="">Referencia</span>
                        <span className="">{ShopDetail?.address?.reference ?? ''}</span>
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
                        <span className="">PAGADO</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="">Fecha</span>
                        <span className="">TEst</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="">Ultimos 4 Digitos de la Tarjeta</span>
                        <span className="">Inde</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="">Valor Pagado</span>
                        <span className="">11213</span>
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
                    {ShopDetail?.products?.map((pro) => (
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
              <div className="text-center">
                Valor Total
                <p className='fw-bold fs-5'>{ShopDetail?.total_order ? ViewDollar(ShopDetail?.total_order) : ''}</p>
              </div>
            </>
          )}

          <div className="text-center">
            <Button
              onClick={() => {
                setShow(false)
              }}
              variant="danger"
              className="text-white"
            >
              <i className="fa-solid fa-xmark me-2"></i>Cerrar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

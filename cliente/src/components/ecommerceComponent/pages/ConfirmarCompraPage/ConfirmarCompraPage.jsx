/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { useProductos } from '../../../../hooks/useProductos'
import AuthContext from '../../../../context/AuthContext'
import { ViewDollar } from '../../../../utils'
import { Accordion } from 'react-bootstrap'
import { Payment, initMercadoPago } from '@mercadopago/sdk-react'
import './ConfirmarCompraPage.css'
import SelectAddressShop from './components/SelectAddressShop'
import axios from 'axios'
import toast from 'react-hot-toast'

initMercadoPago(import.meta.env.VITE_MERCA_PUBLIC_KEY)

export default function ConfirmarCompraPage({}) {
  const { validateProductoCart } = useProductos()

  const [direccionSelecionada, setDireccionSelecionada] = useState(null)

  const [pasoActive, setPasoActive] = useState('0')

  useEffect(() => {
    getAllProductCart()
  }, [])

  const [Data, setData] = useState(null)
  const [isLoading, setisLoading] = useState(false)
  const [total, settotal] = useState(null)

  const { cartEcommerceAmericanState, setCartEcommerceAmericanState, client } =
    useContext(AuthContext)

  console.log(client)

  const customization = {
    paymentMethods: {
      //ticket: 'all',
      //bankTransfer: 'all',
      creditCard: 'all',
      debitCard: 'all',
      //mercadoPago: 'all',
    },
  }
  const getAllProductCart = async () => {
    try {
      setisLoading(true)
      const rest = cartEcommerceAmericanState.map(async (pro) => {
        try {
          const resss = await validateProductoCart(pro._id, pro)
          return { ...resss.data.resutl, cantidad: pro.cantidad }
        } catch (error) {
          setCartEcommerceAmericanState(
            cartEcommerceAmericanState.filter((c) => c._id !== pro?._id),
          )
          setCartEcommerceAmerican(cartEcommerceAmericanState.filter((c) => c._id !== pro?._id))
          toast.error(`Se Borro un producto de tu carrito por que  no esta disponible.`)
          return null
        }
      })
      console.log(rest)
      const res2 = await Promise.all(rest)
      console.log(res2)
      res2.forEach((c) => {
        if (c === null) {
        }
      })
      console.log(res2.filter((c) => c !== null).map((c) => c))
      console.log(
        res2.reduce((acumulador, actual) => acumulador + actual.product.price * actual.cantidad, 0),
      )
      settotal(
        res2.reduce((acumulador, actual) => acumulador + actual.product.price * actual.cantidad, 0),
      )
      setData(res2.filter((c) => c !== null).map((c) => c))
    } catch (error) {
      console.log(error)
    } finally {
      setisLoading(false)
    }
  }

  const onSubmit = async ({ selectedPaymentMethod, formData }) => {
    // callback llamado al hacer clic en el botón enviar datos
    return new Promise((resolve, reject) => {
      /* formData.ordenData.total_order = parseFloat(total)
      formData.ordenData.productos = Data
      formData.ordenData.address_id = direccionSelecionada */
      axios
        .post(
          '/ordenes/process_payment',
          JSON.stringify({
            paymentMercado: formData,
            orderData: {
              products: Data.map((stk) => {
                return {
                  stock_id: stk._id,
                  cantidad: stk.cantidad,
                  product_id: stk.product_id,
                  price: stk.product.price,
                }
              }),
              address_id: direccionSelecionada,
              cliente: {
                client_id: client._id,
                name_client: client.name_client,
                email_client: client.email_client,
                phone_client: client.phone_client,
                number_document_client: client.number_document_client,
              },
              total_order: total,
            },
          }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .then((response) => {
          // recibir el resultado del pago
          console.log(response)
          if (response.data.mercaResponse.status === 'approved') {
            toast.success('Se ha Generado su Pedido Correctamente.')
            setPasoActive('2')
            resolve()
          } else {
            //toast.error('HUBO UN ERROR EN EL PROCESO DE PAGO')
            let txtError = ''
            if (response.data.mercaResponse.status_detail === 'cc_rejected_insufficient_amount') {
              txtError = 'La tarjeta no cuenta con los fondos para el cobro de la orden.'
            }
            if (response.data.mercaResponse.status_detail === 'cc_rejected_other_reason') {
              txtError = 'La tarjeta ha sido rechazada por otras razones.'
            }

            toast((t) => (
              <div className="" role="alert">
                <span className="fw-bold text-center">ERROR AL PROCESAR EL PAGO</span>
                <span className="d-block">
                  {txtError}
                  <button className="btn btn-sm btn-danger" onClick={() => toast.dismiss(t.id)}>
                    Dismiss
                  </button>
                </span>
              </div>
            ))
            reject()
          }
        })
        .catch((error) => {
          // manejar la respuesta de error al intentar crear el pago
          reject()
        })
    })
  }
  const onError = async (error) => {
    // callback llamado para todos los casos de error de Brick
    console.log(error)
  }
  const onReady = async () => {
    /*
      Callback llamado cuando el Brick está listo.
      Aquí puede ocultar cargamentos de su sitio, por ejemplo.
    */
  }

  return (
    <div className="mt-4 mb-5" style={{minHeight:"50vh"}}>
      <p className="text-center">CONFIRMAR MI COMPRA</p>
      <div className="row g-4">
        <div className="col-md-6 col-payment">
          <Accordion defaultActiveKey="0" activeKey={pasoActive}>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Direccion de Envio</Accordion.Header>
              <Accordion.Body>
                <SelectAddressShop
                  setDireccionSelecionada={setDireccionSelecionada}
                  direccionSelecionada={direccionSelecionada}
                  setPasoActive={setPasoActive}
                />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Método de Pago</Accordion.Header>
              <Accordion.Body>
                <div>
                  <div className="text-center">
                    <button
                      className="btn btn-danger text-white"
                      onClick={() => {
                        setPasoActive('0')
                      }}
                    >
                      Atras
                    </button>
                  </div>
                  {total && pasoActive === '1' && (
                    <Payment
                      initialization={{ amount: total }}
                      customization={customization}
                      onSubmit={onSubmit}
                      onReady={onReady}
                      onError={onError}
                    />
                  )}
                </div>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Confirmación de Orden/Pedido</Accordion.Header>
              <Accordion.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
        <div className="col-md-6 col-detail">
          <div style={{ overflow: 'hidden', borderRadius: '1em' }}>
            <div className="table-responsive">
              <table className="table ">
                <thead>
                  <tr>
                    <td scope="col">Producto</td>
                    <td align="center" scope="col">
                      Unidades
                    </td>
                    <td align="center" scope="col">
                      Tallta
                    </td>
                    <td scope="col">Precio</td>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={5}>
                        <div className="d-flex justify-content-center my-4">
                          <div
                            className="spinner-border"
                            role="status"
                            style={{ color: '#5b64db' }}
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {Data &&
                    Data.map((st) => (
                      <tr key={st?._id} className="">
                        <td style={{ color: '#696969' }}>{st?.product?.name}</td>
                        <td style={{ color: '#696969' }} align="center">
                          {st?.cantidad}
                        </td>
                        <td style={{ color: '#696969' }}>{st?.size}</td>
                        <td style={{ color: '#696969' }}>{ViewDollar(st?.product?.price)}</td>
                      </tr>
                    ))}
                  <tr>
                    <td
                      style={{ borderRadius: '0 0 0 0.7em', border: 'none' }}
                      colSpan={2}
                      align="right"
                    >
                      <span className="fw-bold fs-5">Total</span>
                    </td>
                    <td style={{ border: 'none' }} colSpan={1}>
                      <span className=" fs-5">
                        {Data &&
                          ViewDollar(
                            Data.reduce(
                              (acumulador, actual) =>
                                acumulador + actual.product.price * actual.cantidad,
                              0,
                            ),
                          )}
                      </span>
                    </td>
                    <td style={{ borderRadius: '0 0 0.7em 0 ', border: 'none' }}></td>
                  </tr>
                </tbody>
              </table>
              {/* <p className="text-end me-5">
          Total{' '}
          {ViewDollar(
            cartEcommerceAmericanState.reduce(
              (acumulador, actual) => acumulador + actual.price_producto,
              0,
            ),
          )}
        </p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

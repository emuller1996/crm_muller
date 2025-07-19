/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import AuthContext from '../../context/AuthContext'
import { ViewDollar } from '../../utils'
import { useProductos } from '../../hooks/useProductos'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function CartComponent({ onHide }) {
  const [cartEcommerceAmerican, setCartEcommerceAmerican] = useLocalStorage(
    'cartEcommerceAmerican',
    [],
  )
  const { client, cartEcommerceAmericanState, setCartEcommerceAmericanState } =
    useContext(AuthContext)

  const { validateProductoCart } = useProductos()

  const [Data, setData] = useState(null)
  const [isLoading, setisLoading] = useState(false)

  useEffect(() => {
    getAllProductCart()
  }, [])

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

      console.log(res2.filter((c) => c !== null).map((c) => c))
      setData(res2.filter((c) => c !== null).map((c) => c))
    } catch (error) {
      console.log(error)
    } finally {
      setisLoading(false)
    }
  }

  return (
    <>
      <p className="text-center">Mi Carrito</p>
      <div className="table-responsive">
        <table className="table ">
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Unidades</th>
              <th scope="col">Tallta</th>
              <th scope="col">Precio U.</th>
              <th scope="col">Total U.</th>

              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5}>
                  <div className="d-flex justify-content-center my-4">
                    <div className="spinner-border" role="status" style={{ color: '#5b64db' }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {Data &&
              Data.map((st) => (
                <tr key={st?._id} className="">
                  <td width={'450px'} scope="row">
                    <img
                      className="img-fluid me-3"
                      style={{ width: '60px', height: '60px', borderRadius: 50 }}
                      src={st?.image?.image}
                      alt=""
                    />
                    <span className="text-nowrap">{st?.product?.name}</span>
                  </td>
                  <td>{st?.cantidad}</td>
                  <td>{st?.size}</td>
                  <td>{ViewDollar(st?.product?.price)}</td>
                  <td>{ViewDollar(st?.product?.price * st?.cantidad)}</td>
                  <td>
                    <button
                      onClick={() => {
                        console.log(cartEcommerceAmericanState.filter((c) => c._id !== st?._id))

                        setCartEcommerceAmericanState(
                          cartEcommerceAmericanState.filter((c) => c._id !== st?._id),
                        )
                        setCartEcommerceAmerican(
                          cartEcommerceAmericanState.filter((c) => c._id !== st?._id),
                        )
                        setData(Data.filter((c) => c._id !== st?._id))
                        toast.success(`Se Borro el producto de tu carrito.`)
                      }}
                      type="button"
                      className="btn btn-sm btn-danger text-white"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))}

            {Data && Array.isArray(Data) && Data.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <p className="text-center text-muted mt-4">NO HAY PRODUCTO EN EL CARRITO</p>
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={3} align="right">
                <span className="fw-bold fs-5">Total</span>
              </td>
              <td colSpan={1}>
                <span className=" fs-5">
                  {Data &&
                    ViewDollar(
                      Data.reduce(
                        (acumulador, actual) => acumulador + actual.product.price * actual.cantidad,
                        0,
                      ),
                    )}
                </span>
              </td>
              <td></td>
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
      <div className="mt-3 mb-2 text-center">
        {Data && Array.isArray(Data) && Data.length !== 0 && (
          <Link to={`/eco/confirmar-compra`} onClick={onHide}>
            <button disabled={client ? false : true} className="button-ecomerce">
              <i className="fa-solid fa-money-bill me-3"></i> Ir a Pagar
            </button>
          </Link>
        )}
        {/*    <button disabled={client ? false : true} className="button-ecomerce"></button> */}

        <p className='mt-5 text-muted'>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, necessitatibus. Pariatur dolorum dolore minima totam. Aliquam deserunt facere vel. Laboriosam molestias voluptates ipsum sequi, quidem rem praesentium eveniet eum at?
        </p>
      </div>
    </>
  )
}

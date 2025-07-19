/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { useProductos } from '../../../hooks/useProductos'
import { useParams } from 'react-router-dom'
import { ViewDollar } from '../../../utils'
import { Carousel } from 'react-bootstrap'
import './ProductDetailPage.css'
import StockComponent from './ProductDetailPage/StockComponent'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import toast from 'react-hot-toast'
import AuthContext from '../../../context/AuthContext'
import ConsultasProductoComponent from './ProductDetailPage/ConsultasProductoComponent'
export default function ProductDetailPage() {
  const { id } = useParams()
  const { getProductById, dataDetalle } = useProductos()

  const [sizeSelected, setSizeSelected] = useState(null)
  const { setCartEcommerceAmericanState, cartEcommerceAmericanState } = useContext(AuthContext)

  const [cartEcommerceAmerican, setCartEcommerceAmerican] = useLocalStorage(
    'cartEcommerceAmerican',
    [],
  )

  useEffect(() => {
    getProductById(id)
  }, [id])

  return (
    <>
      <div className="mt-4" style={{ minHeight: '10vh' }}>
        <p className="text-center text-muted ">Detalle del Producto</p>
        <hr />
      </div>
      {dataDetalle && (
        <section className="section" id="product">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-7">
                <Carousel interval={1500}>
                  {/* <Carousel.Item key={2123}>
                    <img className="d-block w-100" src={dataDetalle?.imageBase64} alt={`Slidess`} />
                  </Carousel.Item> */}
                  {dataDetalle?.Imagenes &&
                    Array.isArray(dataDetalle?.Imagenes) &&
                    dataDetalle?.Imagenes.length === 0 && (
                      <div className='d-flex justify-content-center align-items-center' style={{minHeight:"350px"}}>
                        <p className="text-center text-muted mt-4">NO HAY IMAGENES PARA ESTE PRODUCTO</p>
                      </div>
                    )}
                  {dataDetalle?.Imagenes &&
                    dataDetalle?.Imagenes.map((im) => (
                      <Carousel.Item key={im._id}>
                        <img className="d-block w-100" src={im.image} alt={`Slidess`} />
                      </Carousel.Item>
                    ))}
                </Carousel>
              </div>
              <div className="col-lg-5">
                <div className="right-content">
                  <h4>{dataDetalle?.name}</h4>
                  <span className="d-block fs-4 mb-2 fw-bold price">
                    {ViewDollar(dataDetalle?.price)}
                  </span>

                  <span className="brad_product">{dataDetalle?.brand}</span>
                  <hr />
                  <div className="quote">
                    <p style={{ whiteSpace: 'pre-line' }}>{dataDetalle?.description}</p>
                  </div>
                  <div className="row g-3">
                    {dataDetalle &&
                      dataDetalle?.Stock.map((stock) => (
                        <StockComponent
                          key={stock?._id}
                          stock={stock}
                          setSizeSelected={setSizeSelected}
                          sizeSelected={sizeSelected}
                        />
                      ))}
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      disabled={sizeSelected ? false : true}
                      onClick={() => {
                        console.log(sizeSelected)
                        if (!sizeSelected) {
                          toast.error('Elige una Talla')
                          return
                        }
                         if (!sizeSelected.cantidad) {
                            sizeSelected.cantidad=1;
                        }
                        sizeSelected.name_producto = dataDetalle.name
                        sizeSelected.price_producto = dataDetalle.price
                        console.log(
                          cartEcommerceAmerican.find((stk) => stk._id === sizeSelected._id),
                        )
                        if (cartEcommerceAmerican.find((stk) => stk._id === sizeSelected._id)) {
                          toast.error('Producto ya esta en el carrito')
                          return
                        } else {
                          setCartEcommerceAmerican([...cartEcommerceAmerican, sizeSelected])
                          setCartEcommerceAmericanState([...cartEcommerceAmerican, sizeSelected])
                          toast.success(`Producto se agrego al carrito correctamente.`, {
                            duration: 2000,
                          })
                          setSizeSelected(null)
                        }
                      }}
                      className="button-ecomerce"
                    >
                      Agregar al Carrito
                      <i className="ms-2 fa-solid fa-cart-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="container mt-4 mb-5">
          <ConsultasProductoComponent productId={id} />
        </div>
      </section>
    </>
  )
}

import React, { useContext, useEffect, useRef, useState } from 'react'
import { Container, Dropdown, Modal, Nav, Navbar } from 'react-bootstrap'
import logo from '../assets/Logo.png'
import { Link, useNavigate } from 'react-router-dom'
import FormLogin from './ecommerceComponent/FormLogin'
import AuthContext from '../context/AuthContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ViewDollar } from '../utils'
import { AuthClientComponent } from './ecommerceComponent/AuthClientComponent'
import CartComponent from './ecommerceComponent/CartComponent'

const AppNavBarEcomerce = () => {
  const headerRef = useRef()
  const {
    client,
    setTokenClient,
    setTokenAccessCliente,
    setClient,
    cartEcommerceAmericanState,
    setCartEcommerceAmericanState,
  } = useContext(AuthContext)

  console.log(client)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  const [show, setShow] = useState(false)
  const [showCart, setShowCart] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const [cartEcommerceAmerican, setCartEcommerceAmerican] = useLocalStorage(
    'cartEcommerceAmerican',
    [],
  )
  const navigate = useNavigate()

  return (
    <>
      <Modal size="lg" centered show={show} onHide={handleClose}>
        <Modal.Body>
          <FormLogin
            onHide={() => {
              setShow(false)
            }}
          />
        </Modal.Body>
      </Modal>

      <Modal
        size="lg"
        centered
        show={showCart}
        onHide={() => {
          setShowCart(false)
        }}
      >
        <Modal.Body>
          {/*  <p>Mi Carrito</p>
          <div className="table-responsive">
            <table className="table ">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Unidades</th>
                  <th scope="col">Tallta</th>
                  <th scope="col">Precio</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {cartEcommerceAmericanState.map((st) => (
                  <tr key={st._id} className="">
                    <td scope="row">{st.name_producto}</td>
                    <td>{st.cantidad}</td>
                    <td>{st.size}</td>
                    <td>{ViewDollar(st.price_producto)}</td>
                    <td>
                      <button
                        onClick={() => {
                          console.log(cartEcommerceAmericanState.filter((c) => c._id !== st._id))
                          setCartEcommerceAmericanState(
                            cartEcommerceAmericanState.filter((c) => c._id !== st._id),
                          )
                          setCartEcommerceAmerican(
                            cartEcommerceAmericanState.filter((c) => c._id !== st._id),
                          )
                        }}
                        type="button"
                        className="btn btn-sm btn-danger text-white"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              Total{' '}
              {ViewDollar(
                cartEcommerceAmericanState.reduce(
                  (acumulador, actual) => acumulador + actual.price_producto,
                  0,
                ),
              )}
            </p>
            <div className="mt-3 mb-2 text-center">
              <button disabled={client ? false : true} className="button-ecomerce">
                <i className="fa-solid fa-money-bill me-3"></i> Ir a Pagar
              </button>
            </div>
          </div> */}
          <CartComponent
            onHide={() => {
              setShowCart(false)
            }}
          />
        </Modal.Body>
      </Modal>

      <div className="header-top border-bottom py-2" style={{ backgroundColor: '#b3cef5' }}>
        <div className="container-lg">
          <div className="row justify-content-evenly">
            <div className="col">
              <ul className="social-links list-unstyled d-flex m-0 text-white">
                <li className="pe-2">
                  <i className="fa-brands fa-facebook"></i>
                </li>
                <li className="pe-2">
                  <i className="fa-brands fa-instagram"></i>
                </li>
                <li>
                  <i className="fa-brands fa-whatsapp"></i>
                </li>
              </ul>
            </div>
            <div className="col d-none d-md-block">
              <p className="text-center text-light m-0">
                <strong>Envios </strong> a Todo Colombia
              </p>
            </div>
          </div>
        </div>
      </div>
      <nav className="navbar navbar-expand-lg bg-white text-uppercase fs-6 p-3 border-bottom align-items-center ">
        <div className="container">
          <div className="row justify-content-between align-items-center w-100">
            <div className="col-auto">
              <Link to={``} className="navbar-brand text-dark">
                <img src={logo} className="me-2" style={{ width: '60px' }} />
                <span className=""> American Shop</span>
              </Link>
            </div>

            <div className="col-3 col-lg-auto">
              <ul className="list-unstyled d-flex m-0 justify-content-end">
                <li className="d-none d-lg-block">
                  <button
                    className="btn text-uppercase cursor-pointer"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasCart"
                    aria-controls="offcanvasCart"
                    onClick={() => {
                      setShowCart(true)
                    }}
                  >
                    <i className="fa-solid fa-cart-shopping"></i>
                    <span className="cart-count text-nowrap ">
                      ({`${cartEcommerceAmericanState?.length}`})
                    </span>
                  </button>
                </li>
                <AuthClientComponent
                  onShow={() => {
                    setShow(true)
                  }}
                />

                <li className="d-lg-none">
                  <button
                    className="btn text-uppercase text-nowrap cursor-pointer"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasCart"
                    aria-controls="offcanvasCart"
                    onClick={() => {
                      setShowCart(true)
                    }}
                  >
                    <i className="fa-solid fa-cart-shopping"></i>
                    <span className="cart-count ">({`${cartEcommerceAmericanState?.length}`})</span>
                  </button>
                </li>
                <li className="d-lg-none">
                  {client ? (
                    <>
                      <Dropdown className="">
                        <Dropdown.Toggle variant="light" id="dropdown-basic">
                          {`${client?.name_client[0]}${client?.name_client[1]}`}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Link
                            className="dropdown-item text-decoration-none"
                            to={`/eco/mis-compras`}
                          >
                            Mis Compras
                          </Link>
                          <Link
                            className="dropdown-item text-decoration-none"
                            to={`/eco/mi-perfil`}
                          >
                            Mi Perfil
                          </Link>
                          <Dropdown.Item
                            onClick={() => {
                              setTokenClient(null)
                              setTokenAccessCliente(null)
                              setClient(null)
                              navigate('/')
                            }}
                          >
                            Cerrar Session
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </>
                  ) : (
                    <button
                      className="btn text-uppercase  cursor-pointer"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvasCart"
                      aria-controls="offcanvasCart"
                      onClick={() => {
                        setShow(true)
                      }}
                    >
                      <i className="fa-solid fa-right-to-bracket me-2"></i>
                      <span className="cart-count"></span>
                    </button>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default AppNavBarEcomerce

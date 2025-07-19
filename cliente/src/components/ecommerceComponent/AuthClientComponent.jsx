/* eslint-disable prettier/prettier */

import React, { useContext } from 'react'
import { Dropdown } from 'react-bootstrap'
import AuthContext from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import LoginProtectedClient from '../../utils/LoginProtectedClient'

export const AuthClientComponent = ({ onShow }) => {
  AuthClientComponent.propTypes = {
    onShow: PropTypes.func,
  }
  const { client, setTokenClient, setTokenAccessCliente, setClient } = useContext(AuthContext)
  
  const navigate = useNavigate()
  
  return (
    <>
      {client ? (
        <>
          <LoginProtectedClient>
            <Dropdown className="d-none d-lg-block">
              <Dropdown.Toggle variant="light" id="dropdown-basic">
                {client?.name_client}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Link className="dropdown-item text-decoration-none" to={`/eco/mis-compras`}>
                  Mis Compras
                </Link>
                <Link className="dropdown-item text-decoration-none" to={`/eco/mi-perfil`}>
                  Mi Perfil
                </Link>
                <Dropdown.Item
                  onClick={() => {
                    setTokenClient(null)
                    setTokenAccessCliente(null)
                    setClient(null)
                    navigate("/")
                  }}
                >
                  Cerrar Session
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </LoginProtectedClient>
        </>
      ) : (
        <>
          <li className="d-none d-lg-block">
            <button
              className="btn text-uppercase cursor-pointer"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasCart"
              aria-controls="offcanvasCart"
              onClick={onShow}
            >
              <i className="fa-solid fa-right-to-bracket me-2"></i>
              <span className="cart-count">Ingresar</span>
            </button>
          </li>
        </>
      )}
    </>
  )
}

/* eslint-disable prettier/prettier */

import React from 'react'
import { createContext, useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import PropTypes from 'prop-types'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export default AuthContext

export const AuthProvider = ({ children }) => {
  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  }

  const [tokenAccess, setTokenAccess] = useLocalStorage('tokenAccessAmericanShop', null)
  const [tokenAccessCliente, setTokenAccessCliente] = useLocalStorage(
    'tokenAccessClienteAmericanShop',
    null,
  )
  const [Token, setToken] = useState(tokenAccess ? tokenAccess : null)
  const [TokenClient, setTokenClient] = useState(tokenAccessCliente ? tokenAccessCliente : null)

  const [user, setUser] = useState(tokenAccess ? jwtDecode(tokenAccess) : null)
  const [client, setClient] = useState(tokenAccessCliente ? jwtDecode(tokenAccessCliente) : null)

  const [cartEcommerceAmerican, setCartEcommerceAmerican] = useLocalStorage(
    'cartEcommerceAmerican',
    [],
  )

  const [cartEcommerceAmericanState, setCartEcommerceAmericanState] = useState(
    cartEcommerceAmerican ? cartEcommerceAmerican : null,
  )

  const navigate = useNavigate()

  const cerrarSessionAdmin = () => {
    setTokenAccess(null)
    setToken(null)
    setClient(null)
    localStorage.removeItem("tokenAccessAmericanShop")
    navigate("/login")
  }

  let contextData = {
    user,
    setUser,
    setToken,
    Token,
    setTokenAccessCliente,
    tokenAccessCliente,
    setTokenClient,
    TokenClient,
    setClient,
    client,
    cartEcommerceAmericanState,
    setCartEcommerceAmericanState,
    cerrarSessionAdmin
  }

  return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
}

/* eslint-disable prettier/prettier */
import React from 'react'
import { useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router'
import AuthContext from '../context/AuthContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  getClienteValidateTokensService,
  getValidateTokensService,
} from '../services/auth.services'

export default function LoginProtectedClient({ children }) {
  const { setTokenClient, setClient } = useContext(AuthContext)
  const [isLoading, setisLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    validateTest()
  }, [])

  const [tokenAccessCliente, setTokenAccessCliente] = useLocalStorage(
    'tokenAccessClienteAmericanShop',
    null,
  )

  const validateTest = async () => {
    try {
      const res = await getClienteValidateTokensService(tokenAccessCliente)
      console.log(res)
      setClient(res.data.user)
    } catch (error) {
      console.log(error)
      setTokenClient(null)
      setClient(null)
      setTokenAccessCliente(null)
    } finally {
      setisLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center "
        style={{ height: '100vh', width: '100&' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!tokenAccessCliente) {
    return <Navigate to="/" replace />
  }
  return children
}
LoginProtectedClient.propTypes = {
  children: PropTypes.node.isRequired,
}

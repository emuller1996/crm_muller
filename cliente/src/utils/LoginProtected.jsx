/* eslint-disable prettier/prettier */
import React from 'react'
import { useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router'
import AuthContext from '../context/AuthContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getValidateTokensService } from '../services/auth.services'

export default function LoginProtected({ children }) {
  const { user } = useContext(AuthContext)
  const [isLoading, setisLoading] = useState(true)
  const navigate = useNavigate()
  const [tokenAccess, setTokenAccess] = useLocalStorage('tokenAccessAmericanShop', null)

  useEffect(() => {
    validateTest()
  }, [])

  const validateTest = async () => {
    try {
      const res = await getValidateTokensService(tokenAccess)
      console.log(res)
    } catch (error) {
      console.log(error)
      setTokenAccess(null)
    } finally{
      setisLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center "
        style={{ height: "100vh", width: "100&" }}
      >
       cargando...
      </div>
    );
  }

  if (!tokenAccess) {
    return <Navigate to="/login" replace />
  }
  return children
}
LoginProtected.propTypes = {
  children: PropTypes.node.isRequired,
}

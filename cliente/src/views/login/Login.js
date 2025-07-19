import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useForm } from 'react-hook-form'
import { postLoginService } from '../../services/auth.services'
import AuthContext from '../../context/AuthContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { jwtDecode } from 'jwt-decode'

const Login = () => {
  const [, setTokenAccess] = useLocalStorage('tokenAccessAmericanShop', null)
  const { setToken, setUser } = useContext(AuthContext)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const [errorMessage, seterrorMessage] = useState(null)

  const onSubmit = async (data) => {
    console.log(data)
    try {
      seterrorMessage(null)
      const r = await postLoginService(data)
      console.log(r.data)
      setTokenAccess(r.data.token)
      setToken(r.data.token)
      setUser(jwtDecode(r.data.token))
      navigate('/d/dashboard')
    } catch (error) {
      console.log(error)
      if (error.response.status === 400) {
        seterrorMessage(error.response.data.message)
      }
    }
  }
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit(onSubmit)}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        {...register('email', { required: true })}
                        placeholder="Correo Electronico"
                        autoComplete="email"
                        type="email"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        {...register('password', { required: true })}
                        placeholder="Password"
                        autoComplete="current-password"
                      />
                    </CInputGroup>

                    <div>
                      {errorMessage && (
                        <div className="alert alert-warning" role="alert">
                          {errorMessage}
                        </div>
                      )}
                    </div>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" type="submit" className="px-4">
                          {/* <Link to={'/d/dashboard'}> */}
                          Login
                          {/* </Link> */}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                      <Link to={'/'}>Home</Link>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login

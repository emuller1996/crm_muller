import React, { useContext, useState } from 'react'
import { CContainer, CSpinner } from '@coreui/react'
import FormRegister from './FormRegister'
import { useForm } from 'react-hook-form'
import { postLoginClientesService } from '../../services/clientes.services'
import { Alert } from 'react-bootstrap'
import AuthContext from '../../context/AuthContext'
import { jwtDecode } from 'jwt-decode'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
// routes config

const FormLogin = ({ onHide }) => {
  FormLogin.propTypes = {
    onHide: PropTypes.func,
  }
  const [ErrorText, setErrorText] = useState({ status: false, message: '', detail: '' })
  const [isLoadingForm, setisLoadingForm] = useState(false)
  const [estadoFormulario, setEstadoFormulario] = useState('login')
  const { setTokenClient, setTokenAccessCliente, setClient } = useContext(AuthContext)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm()

  const navigate = useNavigate()

  const onSubmit = async (data) => {
    console.log(data)
    try {
      setisLoadingForm(true)
      setErrorText({
        status: false,
        message: '',
        detail: '',
      })
      const result = await postLoginClientesService(data)
      console.log(result)
      setTokenClient(result.data.token)
      setTokenAccessCliente(result.data.token)
      setClient(jwtDecode(result.data.token))
      onHide()
      navigate('/eco/mi-perfil')
    } catch (error) {
      console.log(error)
      if (error.response.status == 404) {
        setErrorText({
          status: true,
          message: error.response.data.message,
          detail: error.response.data.detail,
        })
      }
    } finally {
      setisLoadingForm(false)
    }
  }
  return (
    <CContainer className="px-4" lg>
      {estadoFormulario === 'login' && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="text-center">Login</p>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control "
              {...register('email_client', { required: true })}
              id="email_client"
              placeholder=""
            />
            <label htmlFor="email_client">Correo Electronico</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              {...register('password_client', { required: true })}
              className="form-control "
              id="password_client"
              placeholder=""
            />
            <label htmlFor="password_client">Contraseña</label>
          </div>
          <div className="text-center">
            <button type="submit" className="button-ecomerce">
              Ingresar
            </button>
          </div>
          <div className="mt-4">
            <p>
              No tienes Cuenta? Registrate
              <a
                className="text-primary"
                onClick={() => {
                  setEstadoFormulario('register')
                }}
              >
                Aqui
              </a>
            </p>
          </div>
          <div>
            <div>
              {ErrorText.status && (
                <>
                  <Alert className="mt-4" key={'warning'} variant={'warning'}>
                    <Alert.Heading>{ErrorText?.message}</Alert.Heading>
                    <p>{ErrorText?.detail}</p>
                  </Alert>
                </>
              )}
            </div>
          </div>
        </form>
      )}

      {estadoFormulario === 'register' && <FormRegister />}
    </CContainer>
  )
}

export default FormLogin

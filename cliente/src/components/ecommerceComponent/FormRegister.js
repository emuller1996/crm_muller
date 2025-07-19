import React, { useContext, useEffect, useState } from 'react'
import { CContainer, CSpinner } from '@coreui/react'
import { Controller, useForm } from 'react-hook-form'
import { postCreateClienteService } from '../../services/cliente.services'
import toast from 'react-hot-toast'
import { Alert, Form, Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { useClientes } from '../../hooks/useClientes'
import Select from 'react-select'
import axios from 'axios'
import { stylesSelect, themeSelect } from '../../utils/optionsConfig'
import AuthContext from '../../context/AuthContext'
import { jwtDecode } from 'jwt-decode'

// routes config

const FormRegister = ({ client }) => {
  FormRegister.propTypes = {
    client: PropTypes.object,
  }
  const [estadoFormulario, setEstadoFormulario] = useState('login')
  const [ErrorText, setErrorText] = useState({ status: false, message: '', detail: '' })
  const [SuccessText, setSuccessText] = useState({ status: false, message: '', detail: '' })
  const [isLoadingForm, setisLoadingForm] = useState(false)
  const [optionCities, setOptionCities] = useState(null)
  const { putClienteById } = useClientes()
  const { setClient } = useContext(AuthContext)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm()
  const onSubmit = async (data) => {
    console.log(data)
    if (client) {
      console.log(data)
      setErrorText({
        status: false,
        message: '',
        detail: '',
      })
      try {
        const result = await putClienteById(client._id, data)
        toast.success(result.data.message)
        setSuccessText({
          status: true,
          message: result.data.message,
          detail: result.data.detail,
        })
        setClient(result.data.clienteData)
        setTimeout(() => {
          setSuccessText({
            status: false,
            message: '',
            detail: '',
          })
        }, 5000)
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        setisLoadingForm(true)
        setErrorText({
          status: false,
          message: '',
          detail: '',
        })
        const result = await postCreateClienteService(data)
        //onHide()
        toast.success(result.data.message)
        setSuccessText({
          status: true,
          message: result.data.message,
          detail: result.data.detail,
        })
        reset()
      } catch (error) {
        console.log(error)
        if (error.response.status == 400) {
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
  }
  const getAllCity = async () => {
    try {
      const result = await axios.get(`https://api-colombia.com/api/v1/City`)
      console.log(result.data)
      setOptionCities(
        result.data.map((c) => {
          return {
            label: c.name,
            value: c.id,
            key: c.name,
          }
        }),
      )
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getAllCity()
  }, [])
  return (
    <CContainer className="px-4" lg>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <p className="text-center">{client ? 'Actualizando mis Datos' : 'Registrame'}</p>
        <div className="mb-3">
          <label className="form-label" htmlFor="name_client">
            Nombre Completo <span className="fw-bold text-primary">*</span>
          </label>
          <input
            {...register('name_client', { required: true })}
            defaultValue={client?.name_client}
            type="text"
            className="form-control "
            id="name_client"
            placeholder=""
          />
        </div>
        <div className=" mb-3">
          <label className="form-label" htmlFor="email_client">
            Correo Electronico <span className="fw-bold text-primary">*</span>
          </label>
          <input
            {...register('email_client', { required: true })}
            type="email"
            className="form-control "
            defaultValue={client?.email_client}
            readOnly={client ? true : false}
            id="email_client"
            placeholder=""
          />
        </div>
        <div className="  mb-3">
          <label className="form-label" htmlFor="phone_client">
            Numero Telefonico <span className="fw-bold text-primary">*</span>
          </label>

          <input
            {...register('phone_client', { required: true })}
            defaultValue={client?.phone_client}
            type="text"
            className="form-control "
            id="phone_client"
            placeholder=""
          />
        </div>
        <div className="  mb-3">
          <label className="form-label" htmlFor="type_document_client">
            Tipo de Documento <span className="fw-bold text-primary">*</span>
          </label>
          <select
            className="form-select"
            id="type_document_client"
            defaultValue={client?.type_document_client}
            aria-label="Floating label select example"
            {...register('type_document_client', {
              required: true,
              validate: (s) => s !== 'Selecione una Opcion',
            })}
          >
            <option disabled>Selecione una Opcion</option>
            <option value="CC">CC</option>
            <option value="TI">TI</option>
            <option value="PASAPORTE">PASAPORTE</option>
          </select>
        </div>
        <div className="  mb-3">
          <label className="form-label" htmlFor="number_document_client">
            Numero Documento <span className="fw-bold text-primary">*</span>
          </label>
          <input
            {...register('number_document_client', { required: true })}
            type="text"
            className="form-control "
            id="number_document_client"
            placeholder=""
            defaultValue={client?.number_document_client}
          />
        </div>
        <div className="col-md-12 mb-3">
          {optionCities && (
            <div>
              <Form.Label htmlFor="city">
                Cuidad <span className="fw-bold text-primary">*</span>
              </Form.Label>
              <Controller
                name="city"
                rules={{ required: true }}
                control={control}
                defaultValue={optionCities.find((de) => de.key === client?.city)?.label}
                render={({ field: { name, onChange, ref } }) => {
                  return (
                    <Select
                      ref={ref}
                      id={name}
                      name={name}
                      placeholder=""
                      onChange={(e) => {
                        console.log(e)
                        onChange(e?.label)
                      }}
                      defaultValue={optionCities.find((de) => de.key === client?.city)}
                      styles={stylesSelect}
                      theme={themeSelect}
                      options={optionCities}
                    />
                  )
                }}
              />
            </div>
          )}
        </div>
        <label className="form-label" htmlFor="inline-radio-1">
          Genero
        </label>
        <div key={`inline-radio`} className="col-md-12 mb-3">
          <Form.Check
            inline
            label="Masculino"
            name="gender"
            type="radio"
            id={`inline-radio-1`}
            value={'Masculino'}
            {...register('gender', { required: false })}
            defaultChecked={client?.gender === 'Masculino' ? true : false}
          />
          <Form.Check
            inline
            label="Femenino"
            name="gender"
            type="radio"
            id={`inline-radio-2`}
            value={'Femenino'}
            {...register('gender', { required: false })}
            defaultChecked={client?.gender === 'Femenino' ? true : false}
          />
          <Form.Check
            inline
            label="Sin Definir"
            name="gender"
            type="radio"
            id={`inline-radio-3`}
            value={'None'}
            {...register('gender', { required: false })}
            defaultChecked={client?.gender === 'None' ? true : false}
          />
        </div>
        {!client && (
          <>
            <div className="  mb-3">
              <label className="form-label" htmlFor="password_client">
                Contraseña <span className="fw-bold text-primary">*</span>
              </label>
              <input
                {...register('password_client', { required: true })}
                type="password"
                className="form-control "
                id="password_client"
                placeholder=""
              />
            </div>
            <div className="form-check">
              <input
                {...register('is_tc', { required: true })}
                className="form-check-input"
                type="checkbox"
                value=""
                id="is_tc"
              />
              <label className="form-check-label" htmlFor="is_tc">
                Acepto los terminos y condiciones <span className="fw-bold text-primary">*</span>
              </label>
            </div>
          </>
        )}
        <div className="text-center">
          <button type="submit" disabled={isLoadingForm} className="button-ecomerce">
            {isLoadingForm ? (
              <>
                <div className="px-3 mx-3">
                  <Spinner animation="border" size="sm" />
                </div>
              </>
            ) : client ? (
              'Actualizar'
            ) : (
              'Registrame'
            )}
          </button>
        </div>
        <div>
          {ErrorText.status && (
            <>
              <Alert className="mt-4" key={'warning'} variant={'warning'}>
                <Alert.Heading>{ErrorText?.message}</Alert.Heading>
                <p>{ErrorText?.detail}</p>
              </Alert>
            </>
          )}
          {SuccessText.status && (
            <>
              <Alert className="mt-4" key={'success'} variant={'success'}>
                <Alert.Heading>{SuccessText?.message}</Alert.Heading>
                <p>{SuccessText?.detail}</p>
              </Alert>
            </>
          )}
        </div>
      </form>
    </CContainer>
  )
}

export default FormRegister

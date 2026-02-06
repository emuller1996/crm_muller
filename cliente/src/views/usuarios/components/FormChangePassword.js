/* eslint-disable prettier/prettier */

import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import { useUsuarios } from '../../../hooks/useUsuarios'
import toast from 'react-hot-toast'

const FormChangePassword = ({ dataUser, allUser }) => {
  FormChangePassword.propTypes = {
    dataUser: PropTypes.object,
    allUser: PropTypes.func,
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const { patchChangePasswordUsuarios } = useUsuarios()

  const onSubmit = async (data) => {
    try {
      await patchChangePasswordUsuarios(data, dataUser._id)
      await allUser()
      toast.success('Se cambió la contraseña correctamente')
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
    // { password: '...', confirmPassword: '...' }
  }

  return (
    <div className="col-md-12">
      <p className="m-0">Nombre : {dataUser?.name}</p>
      <p className="m-0">Correo : {dataUser?.email}</p>
      <hr />

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Password */}
        <Form.Group className="mb-3">
          <Form.Label>Contraseña nueva</Form.Label>
          <Form.Control
            type="password"
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 8,
                message: 'Debe tener al menos 8 caracteres',
              },
            })}
            isInvalid={!!errors.password}
          />
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </Form.Group>

        {/* Confirm Password */}
        <Form.Group className="mb-3">
          <Form.Label>Confirmar contraseña</Form.Label>
          <Form.Control
            type="password"
            {...register('confirmPassword', {
              required: 'Debes confirmar la contraseña',
              validate: (value) => value === password || 'Las contraseñas no coinciden',
            })}
            isInvalid={!!errors.confirmPassword}
          />
          <Form.Control.Feedback type="invalid">
            {errors.confirmPassword?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Button type="submit" variant="success" className="text-white">
          Cambiar Contraseña
        </Button>
      </form>
    </div>
  )
}

export default FormChangePassword

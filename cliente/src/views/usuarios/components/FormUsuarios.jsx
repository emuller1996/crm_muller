/* eslint-disable prettier/prettier */
import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { postCreatePuntoVentaService } from '../../../services/punto_venta.services'
import { postCreateUsuariosService } from '../../../services/usuarios.services'
import PropTypes from 'prop-types'
import { useUsuarios } from '../../../hooks/useUsuarios'
import Select from 'react-select'
import { useEffect } from 'react'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'

export default function FormUsuarios({ onHide, allUser, user }) {
  FormUsuarios.propTypes = {
    onHide: PropTypes.func,
    allUser: PropTypes.func,
    user: PropTypes.object,
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm()

  const { postCreateUsuarios, getAllRole, DataRole, patchUpdatedUsuarios } = useUsuarios()

  const onSubmit = async (data) => {
    console.log(data)
    if (user) {
      try {
        const result = await patchUpdatedUsuarios(data, user._id)
        console.log(result.data)
        toast.success(result.data.message)
        onHide()
        allUser()
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        const result = await postCreateUsuarios(data)
        console.log(result.data)
        toast.success(result.data.message)
        onHide()
        allUser()
      } catch (error) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    getAllRole()
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-center border-bottom pb-2">{user ? "Actualizando " : "Creando "}Usuario</p>
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              {...register('name', { required: true })}
              type="text"
              defaultValue={user?.name}
              placeholder="Movistar Arena"
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              {...register('email', { required: true })}
              type="text"
              placeholder="jjose@corre.com"
              defaultValue={user?.email}
            />
          </Form.Group>
        </div>
        {!user && (
          <div className="col-md-6">
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                {...register('password', { required: true })}
                type="password"
                placeholder=""
              />
            </Form.Group>
          </div>
        )}
        <div className="col-md-6">
          {Array.isArray(DataRole.data) && (
            <div>
              <Form.Label htmlFor="role_id">Role</Form.Label>
              <Controller
                name="role_id"
                //rules={{ required: true }}
                control={control}
                defaultValue={user?.role_id}
                render={({ field: { name, onChange, ref } }) => {
                  return (
                    <Select
                      ref={ref}
                      id={name}
                      name={name}
                      placeholder=""
                      onChange={(e) => {
                        onChange(e?.value)
                      }}
                      defaultValue={DataRole?.data
                        ?.map((cata) => {
                          console.log(cata._id)
                          console.log(user?.role_id)

                          return {
                            label: `${cata.name}`,
                            value: `${cata._id}`,
                          }
                        })
                        .find((c) => c?.value === user?.role_id)}
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          borderColor: state.isFocused ? '#7977e6a2' : '#dbdfe6',
                          boxShadow: state.isFocused
                            ? '  rgba(0, 0, 0, 0.16) 0px 1px 4px, #4b49b642 0px 0px 0px 3px;'
                            : '',
                          borderRadius: '0.4em',
                        }),
                        menu: (baseStyles, state) => ({
                          ...baseStyles,
                          borderColor: state.isFocused ? 'grey' : 'red',
                          backgroundColor: 'white',
                        }),
                      }}
                      theme={{
                        colors: {
                          primary: '#4b49b688',
                          primary25: '#7473ca',
                          primary50: '#aeade6',
                          primary75: '#dad9f7',
                        },
                      }}
                      options={
                        DataRole.data &&
                        DataRole.data.map((cata) => {
                          return {
                            label: `${cata.name}`,
                            value: `${cata._id}`,
                          }
                        })
                      }
                    />
                  )
                }}
                styles={stylesSelect}
                theme={themeSelect}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 d-flex gap-4 justify-content-center">
        <button type="button" onClick={onHide} className="btn btn-danger text-white">
          Cancelar
        </button>
        <Button type="submit" className="text-white" variant="success">
          Guardar Usuario.
        </Button>
      </div>
    </form>
  )
}

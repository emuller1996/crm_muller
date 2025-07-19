/* eslint-disable prettier/prettier */
import React from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { postCreatePuntoVentaService } from '../../../services/punto_venta.services'
import { postCreateUsuariosService } from '../../../services/usuarios.services'
import PropTypes from 'prop-types'
import { useClientes } from '../../../hooks/useClientes'

export default function FormClientes({ onHide, allClientes, cliente }) {
  FormClientes.propTypes = {
    onHide: PropTypes.func,
    allClientes: PropTypes.func,
    cliente: PropTypes.object,
  }

  const { CreateCliente, updateCliente } = useClientes()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    if (!cliente) {
      try {
        const result = await CreateCliente(data)
        console.log(result.data)
        toast.success(result.data.message)
        onHide()
        allClientes()
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        const result = await updateCliente(data, cliente._id)
        console.log(result.data)
        toast.success(result.data.message)
        onHide()
        allClientes()
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-center border-bottom pb-2">{`${cliente ? 'Actualizando Cliente' : 'Creando Cliente'}`}</p>
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              {...register('name', { required: true })}
              type="text"
              placeholder=""
              defaultValue={cliente?.name}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="alias">
            <Form.Label>Apodo {`(Alias)`}</Form.Label>
            <Form.Control
              {...register('alias')}
              type="text"
              placeholder=""
              defaultValue={cliente?.alias}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="telefono">
            <Form.Label>Telefono</Form.Label>
            <Form.Control
              {...register('telefono')}
              type="text"
              placeholder=""
              defaultValue={cliente?.telefono}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="barrio">
            <Form.Label>Barrio</Form.Label>
            <Form.Control
              {...register('barrio')}
              type="text"
              placeholder=""
              defaultValue={cliente?.barrio}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="direccion">
            <Form.Label>Direccion</Form.Label>
            <Form.Control
              {...register('direccion')}
              type="text"
              placeholder=""
              defaultValue={cliente?.direccion}
            />
          </Form.Group>
        </div>

        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Correo</Form.Label>
            <Form.Control {...register('email')} type="email" placeholder="" />
          </Form.Group>
        </div>
      </div>

      <div className="mt-5 d-flex gap-4 justify-content-center">
        <button type="button" onClick={onHide} className="btn btn-danger text-white">
          Cancelar
        </button>
        <Button type="submit" className="text-white" variant="success">
          Guardar Cliente
        </Button>
      </div>
    </form>
  )
}

/* eslint-disable prettier/prettier */
import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { useProveedores } from '../../../hooks/useProveedores'

export default function FormProveedores({ onHide, allProveedores, proveedor }) {
  FormProveedores.propTypes = {
    onHide: PropTypes.func,
    allProveedores: PropTypes.func,
    proveedor: PropTypes.object,
  }

  const { createProveedor, updateProveedor } = useProveedores()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    if (!proveedor) {
      try {
        const result = await createProveedor(data)
        toast.success(result.data.message)
        onHide()
        allProveedores()
      } catch (error) {
        console.log(error)
        toast.error('Error al crear el proveedor')
      }
    } else {
      try {
        const result = await updateProveedor(data, proveedor._id)
        toast.success(result.data.message)
        onHide()
        allProveedores()
      } catch (error) {
        console.log(error)
        toast.error('Error al actualizar el proveedor')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-center border-bottom pb-2">
        {`${proveedor ? 'Actualizando Proveedor' : 'Creando Proveedor'}`}
      </p>
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="nombre">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              {...register('nombre', { required: true })}
              type="text"
              placeholder=""
              defaultValue={proveedor?.nombre}
              isInvalid={!!errors.nombre}
            />
            {errors.nombre && (
              <Form.Control.Feedback type="invalid">
                El nombre es obligatorio
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="tipo_documento">
            <Form.Label>Tipo de Documento *</Form.Label>
            <Form.Select
              {...register('tipo_documento', { required: true })}
              defaultValue={proveedor?.tipo_documento || ''}
              isInvalid={!!errors.tipo_documento}
            >
              <option value="">Seleccionar...</option>
              <option value="CC">Cedula de Ciudadania</option>
              <option value="NIT">NIT</option>
              <option value="CE">Cedula de Extranjeria</option>
              <option value="PP">Pasaporte</option>
            </Form.Select>
            {errors.tipo_documento && (
              <Form.Control.Feedback type="invalid">
                El tipo de documento es obligatorio
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="numero_documento">
            <Form.Label>Numero de Documento *</Form.Label>
            <Form.Control
              {...register('numero_documento', { required: true })}
              type="text"
              placeholder=""
              defaultValue={proveedor?.numero_documento}
              isInvalid={!!errors.numero_documento}
            />
            {errors.numero_documento && (
              <Form.Control.Feedback type="invalid">
                El numero de documento es obligatorio
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="telefono">
            <Form.Label>Telefono</Form.Label>
            <Form.Control
              {...register('telefono')}
              type="text"
              placeholder=""
              defaultValue={proveedor?.telefono}
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
              defaultValue={proveedor?.direccion}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="ciudad">
            <Form.Label>Ciudad</Form.Label>
            <Form.Control
              {...register('ciudad')}
              type="text"
              placeholder=""
              defaultValue={proveedor?.ciudad}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="correo">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              {...register('correo')}
              type="email"
              placeholder=""
              defaultValue={proveedor?.correo}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="nombre_contacto">
            <Form.Label>Nombre de Contacto</Form.Label>
            <Form.Control
              {...register('nombre_contacto')}
              type="text"
              placeholder=""
              defaultValue={proveedor?.nombre_contacto}
            />
          </Form.Group>
        </div>
      </div>

      <div className="mt-5 d-flex gap-4 justify-content-center">
        <button type="button" onClick={onHide} className="btn btn-danger text-white">
          Cancelar
        </button>
        <Button type="submit" className="text-white" variant="success">
          Guardar Proveedor
        </Button>
      </div>
    </form>
  )
}

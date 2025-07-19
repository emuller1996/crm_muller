/* eslint-disable prettier/prettier */
import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import {
  postCreateCategoriaService,
  putUpdateCategoriaService,
} from '../../../services/categorias.services'
import { useCategorias } from '../../../hooks/useCategorias'

export default function FormCategoria({ onHide, categoria, getAllCategorias }) {
  FormCategoria.propTypes = {
    onHide: PropTypes.func,
    categoria: PropTypes.object,
    getAllCategorias: PropTypes.func,
  }
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const  { crearCategoria, actualizarCategoria } = useCategorias()

  const onSubmit = async (data) => {
    console.log(data)
    if (!categoria) {
      try {
        const result = await crearCategoria(data)
        console.log(result.data)
        toast.success(result.data.message)
        onHide()
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        const result = await actualizarCategoria(data, categoria._id)
        console.log(result.data)
        toast.success(result.data.message)
        onHide()
      } catch (error) {
        console.log(error)
      }
    }
    await getAllCategorias()
  }

  return (
    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-center border-bottom pb-2">
        {`${categoria ? 'Editando ' : 'Creando'}`} Categoria
      </p>
      <div className="row">
        <div className="col-12">
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Nombre Categoria</Form.Label>
            <Form.Control
              defaultValue={categoria?.name}
              {...register('name', { required: true })}
              type="text"
              placeholder=""
            />
          </Form.Group>
        </div>
        <div className="col-12">
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Descripcion</Form.Label>
            <Form.Control
              defaultValue={categoria?.description}
              {...register('description', { required: true })}
              as="textarea"
              rows={3}
            />
          </Form.Group>
        </div>
      </div>

      <div className="mt-5 d-flex gap-4 justify-content-center">
        <button type="button" onClick={onHide} className="btn btn-danger text-white">
          Cancelar
        </button>
        <Button type="submit" className="text-white" variant="success">
          Guardar Categoria
        </Button>
      </div>
    </form>
  )
}

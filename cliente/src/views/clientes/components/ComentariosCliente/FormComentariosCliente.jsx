/* eslint-disable prettier/prettier */
import React from 'react'
import { Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useClientes } from '../../../../hooks/useClientes'
import toast from 'react-hot-toast'
export default function FormComentariosCliente({ idCliente, onAllComentarios }) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const { createComentarioByCliente } = useClientes()
  const onSubmitFormComentarios = async (data) => {
    data.clien_id = idCliente
    console.log(data)
    try {
      const result = await createComentarioByCliente(data, idCliente)
      console.log(result)
      reset()
      onAllComentarios()
      toast.success(result.data.message)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmitFormComentarios)} action="p-1">
      <div key={`inline-checkbox`} className="mb-1">
        <i className="fa-solid fa-phone-volume me-2"></i>
        <Form.Check
          inline
          {...register('is_call')}
          label="Se Llamo el cliente?"
          name="is_call"
          type={'checkbox'}
          id={`is_call`}
        />

        <i className="fa-solid fa-street-view me-2"></i>
        <Form.Check
          inline
          {...register('is_visit')}
          label="Se Visito el cliente?"
          name="is_visit"
          type={'checkbox'}
          id={`is_visit`}
        />
      </div>
      <div className="d-flex align-items-center">
        <div className="flex-grow-1">
          <Form.Control
            {...register('comment', { required: true, minLength: 10, maxLength: 300 })}
            as="textarea"
            placeholder="Ingresa el Comentario Aca."
            rows={2}
            className="mb-2"
          />
        </div>
        <div className="p-2">
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
      </div>
    </form>
  )
}

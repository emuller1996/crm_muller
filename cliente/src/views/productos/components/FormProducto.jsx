/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import CurrencyInput from 'react-currency-input-field'
import Select from 'react-select'
import { useCategorias } from '../../../hooks/useCategorias'
import { genderOptions, stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import { putUpdateProductoService } from '../../../services/productos.services'
import toast from 'react-hot-toast'
import { useProductos } from '../../../hooks/useProductos'

export default function FormProducto({ onHide, getAllProduct, producto }) {
  FormProducto.propTypes = {
    onHide: PropTypes.func,
    getAllProduct: PropTypes.func,
    producto: PropTypes.object,
  }
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  const { createProducto } = useProductos()
  const { getAllCategorias, data: ListCategorias } = useCategorias()

  useEffect(() => {
    getAllCategorias()
  }, [])

  console.log(producto)

  const onSubmit = async (data) => {
    console.log(data)
    data.price = parseFloat(data.price)
    data.cost = parseFloat(data.cost)

    if (!producto) {
      try {
        const result = await createProducto(data)
        console.log(result.data)
        onHide()
        toast.success(result.data.message)
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        const result = await putUpdateProductoService(producto._id, data)
        console.log(result.data)
        onHide()
        toast.success(result.data.message)
      } catch (error) {
        console.log(error)
      }
    }

    await getAllProduct()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-center border-bottom pb-2">Creando Usuario</p>
      <div className="row g-3">
        <div className="col-md-6">
          <Form.Group className="" controlId="name">
            <Form.Label>Nombre Producto</Form.Label>
            <Form.Control
              defaultValue={producto?.name}
              {...register('name', { required: true })}
              type="text"
              placeholder=""
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <div>
            <Form.Label>Precio</Form.Label>
            <Controller
              control={control}
              name="price"
              defaultValue={producto?.price}
              rules={{ required: 'el Precio es requerido' }}
              render={({ field: { name, onChange, ref, value } }) => {
                return (
                  <CurrencyInput
                    ref={ref}
                    className="form-control"
                    id={name}
                    name={name}
                    value={value}
                    placeholder=""
                    decimalsLimit={2}
                    prefix="$"
                    intlConfig={{ locale: 'en-US', currency: 'GBP' }}
                    onValueChange={(value, name, values) => {
                      console.log(value, name, values)
                      onChange(value)
                    }}
                  />
                )
              }}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div>
            <Form.Label>Costo</Form.Label>
            <Controller
              control={control}
              name="cost"
              defaultValue={producto?.cost}
              rules={{ required: 'el Costo es requerido' }}
              render={({ field: { name, onChange, ref, value } }) => {
                return (
                  <CurrencyInput
                    ref={ref}
                    className="form-control"
                    id={name}
                    name={name}
                    value={value}
                    placeholder=""
                    decimalsLimit={2}
                    prefix="$"
                    intlConfig={{ locale: 'en-US', currency: 'GBP' }}
                    onValueChange={(value, name, values) => {
                      console.log(value, name, values)
                      onChange(value)
                    }}
                  />
                )
              }}
            />
          </div>
        </div>
        <div className="col-md-6">
          {ListCategorias && (
            <div>
              <Form.Label htmlFor="category_id">Categoria</Form.Label>
              <Controller
                name="category_id"
                //rules={{ required: true }}
                control={control}
                defaultValue={producto?.category_id}
                render={({ field: { name, onChange, ref } }) => {
                  return (
                    <Select
                      ref={ref}
                      id={name}
                      name={name}
                      placeholder=""
                      defaultValue={ListCategorias.map((cata) => {
                        return {
                          label: `${cata.name}`,
                          value: `${cata._id}`,
                        }
                      }).find((c) => c?.value === producto?.category_id)}
                      onChange={(e) => {
                        console.log(e)
                        onChange(e?.value)
                      }}
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
                        ListCategorias &&
                        ListCategorias.map((cata) => {
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
        <div className="col-md-4">
          <Form.Group className="" controlId="brand">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              defaultValue={producto?.brand}
              {...register('brand')}
              type="text"
              placeholder=""
            />
          </Form.Group>
        </div>
        {/* <div className="col-md-12">
          <Form.Group className="" controlId="published">
            <Form.Check // prettier-ignore
              type={'checkbox'}
              id={`published`}
              label={`Publicado?`}
              defaultChecked={producto?.published}
              {...register('published')}
            />
          </Form.Group>
        </div> */}
        <div className="col-12">
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Descripcion</Form.Label>
            <Form.Control
              defaultValue={producto?.description}
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
          Guardar Producto
        </Button>
      </div>
    </form>
  )
}

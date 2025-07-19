/* eslint-disable prettier/prettier */

import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import { useProductos } from '../../../../hooks/useProductos'
import toast from 'react-hot-toast'
const FormStock = ({ StockProduct, allStock, cancel, idProduct }) => {
  FormStock.propTypes = {
    StockProduct: PropTypes.object,
    allStock: PropTypes.func,
    cancel: PropTypes.func,
    idProduct: PropTypes.string,
  }
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm()

  const { createStockProducto, updateStockProducto } = useProductos()

  useEffect(() => {
    if (StockProduct) {
      setValue('size', StockProduct?.size)
      setValue('stock', StockProduct?.stock)
    }
  }, [StockProduct])

  const onSubmit = async (data) => {
    data.product_id = idProduct
    data.stock = parseInt(data.stock)
    console.log(data)
    if (StockProduct) {
      try {
        const result = await updateStockProducto(data, StockProduct._id)
        StockProduct.stock = parseInt(data.stock)
        toast.success(result.data.message)
        reset()
        allStock()
      } catch (error) {
        console.log(error)
        if (error.response.status === 400) {
          toast.error(`${error.response.data.detail}`)
        }
      }
    } else {
      try {
        const result = await createStockProducto(data)
        toast.success(result.data.message)
        reset()
        allStock()
      } catch (error) {
        console.log(error)
        if (error.response.status === 400) {
          toast.error(`${error.response.data.detail}`)
        }
      }
    }
  }

  return (
    <div className="card border">
      <form onSubmit={handleSubmit(onSubmit)} className="card-body">
        <span className="text-center">{StockProduct ? 'EDITAR' : ' CREAR'} Talla</span>
        <hr />
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Talla</Form.Label>
          <Form.Control
            {...register('size', { required: true })}
            defaultValue={StockProduct?.size}
            type="text"
            disabled={StockProduct?.size ? true : false}
            placeholder=""
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Stock o Inventario</Form.Label>
          <Form.Control
            {...register('stock', { required: true })}
            defaultValue={StockProduct?.stock}
            type="number"
            placeholder=""
          />
        </Form.Group>
        <div className="text-center">
          {StockProduct && (
            <button
              type="button"
              onClick={() => {
                cancel()
                setValue('size', "")
                setValue('stock', "")
              }}
              className="btn btn-danger text-white text-center me-3"
            >
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary text-center">
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormStock

/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import CurrencyInput from 'react-currency-input-field'
import Select from 'react-select'
import toast from 'react-hot-toast'
import { genderOptions, stylesSelect, themeSelect } from '../../../../../utils/optionsConfig'
import axios from 'axios'
import { useClientes } from '../../../../../hooks/useClientes'

export default function FormDireccion({ onHide, AllAddress, Address }) {
  FormDireccion.propTypes = {
    onHide: PropTypes.func,
    AllAddress: PropTypes.func,
    Address: PropTypes.object,
  }
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  const { postClienteNewAddress, putClienteNewAddress } = useClientes()

  const [optionDepartament, setOptionDepartament] = useState(null)
  const [optionCities, setOptionCities] = useState(null)
  const [DepartamentSelect, setDepartamentSelect] = useState(
    Address ? Address.departament_id_api : null,
  )

  useEffect(() => {
    getAllDepartementos()
  }, [])

  useEffect(() => {
    if (DepartamentSelect) {
      getAllCityByDepartementos(DepartamentSelect)
    }
  }, [DepartamentSelect])

  const onSubmit = async (data) => {
    console.log(data)
    data.departament_id_api = DepartamentSelect
    if (Address) {
      try {
        console.log(data)
        await putClienteNewAddress(data, Address._id)
        onHide()
        toast.success(`Dirección de Envió Actualizada Correctamente.`)
        AllAddress()
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await postClienteNewAddress(data)
        onHide()
        toast.success(`Dirección de Envió Creada Correctamente.`)
        AllAddress()
      } catch (error) {
        console.log(error)
      }
    }
  }

  const getAllCityByDepartementos = async (id) => {
    try {
      const result = await axios.get(`https://api-colombia.com/api/v1/Department/${id}/cities`)
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

  const getAllDepartementos = async () => {
    try {
      const result = await axios.get('https://api-colombia.com/api/v1/Department')
      console.log(result.data)
      setOptionDepartament(
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
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-center border-bottom pb-2">
        {' '}
        {Address ? `Actualizando Direccio de Envio` : `Crear Nueva Direcciones de Envio`}
      </p>
      <div className="row g-3">
        <div className="col-md-12">
          <Form.Group className="" controlId="name">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              {...register('name', { required: true })}
              defaultValue={Address?.name}
              type="text"
              placeholder="Mi Casa, Trabajo , Oficia"
            />
          </Form.Group>
        </div>

        <div className="col-md-12">
          {optionDepartament && (
            <div>
              <Form.Label htmlFor="departament">Departamento</Form.Label>
              <Controller
                name="departament"
                rules={{ required: true }}
                control={control}
                defaultValue={
                  optionDepartament.find((de) => de.key === Address?.departament)?.label
                }
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
                        setDepartamentSelect(e.value)
                      }}
                      defaultValue={optionDepartament.find((de) => de.key === Address?.departament)}
                      styles={stylesSelect}
                      theme={themeSelect}
                      options={optionDepartament}
                    />
                  )
                }}
              />
            </div>
          )}
        </div>
        <div className="col-md-12">
          {optionCities && DepartamentSelect && (
            <div>
              <Form.Label htmlFor="city">Cuidad</Form.Label>
              <Controller
                name="city"
                rules={{ required: true }}
                control={control}
                defaultValue={optionCities.find((de) => de.key === Address?.city)?.label}
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
                      defaultValue={optionCities.find((de) => de.key === Address?.city)}
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
        <div className="col-md-12">
          <Form.Group className="" controlId="address">
            <Form.Label>Direccion</Form.Label>
            <Form.Control
              {...register('address', { required: true })}
              type="text"
              placeholder=""
              defaultValue={Address?.address}
            />
          </Form.Group>
        </div>
        <div className="col-md-12">
          <Form.Group className="" controlId="neighborhood">
            <Form.Label>Barrio</Form.Label>
            <Form.Control
              {...register('neighborhood')}
              type="text"
              placeholder=""
              defaultValue={Address?.neighborhood}
            />
          </Form.Group>
        </div>
        <div className="col-md-12">
          <Form.Group className="" controlId="reference">
            <Form.Label>Referencia</Form.Label>
            <Form.Control
              {...register('reference')}
              type="text"
              placeholder=""
              defaultValue={Address?.reference}
            />
          </Form.Group>
        </div>
      </div>

      <div className="mt-5 d-flex gap-4 justify-content-center">
        <button type="button" onClick={onHide} className="button-ecomerce-cancel">
        <i className="fa-solid fa-xmark me-2"></i>Cancelar
        </button>

        <button type="submit" className="button-ecomerce">
          <i className="fa-solid fa-floppy-disk me-2" style={{ color: '#f1f7ff' }}></i> Guardar
        </button>
      </div>
    </form>
  )
}

/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import Select from 'react-select'
import CurrencyInput from 'react-currency-input-field'
import { useCajas } from '../../../hooks/useCajas'
import { useUsuarios } from '../../../hooks/useUsuarios'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'

const parseUsuarios = (usuarios) => {
  try {
    const ids = JSON.parse(usuarios ?? '[]')
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

export default function FormCajas({ onHide, allCajas, caja }) {
  FormCajas.propTypes = {
    onHide: PropTypes.func,
    allCajas: PropTypes.func,
    caja: PropTypes.object,
  }

  const { createCaja, updateCaja } = useCajas()
  const { data: usuarios, getAlUsuarios } = useUsuarios()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: caja?.nombre ?? '',
      estado: caja?.estado ?? 'habilitada',
      monto_maximo: caja?.monto_maximo,
      usuarios: parseUsuarios(caja?.usuarios),
      nota: caja?.nota ?? '',
    },
  })

  useEffect(() => {
    getAlUsuarios()
  }, [])

  const optionsUsuarios = (usuarios ?? []).map((u) => ({ label: u.name, value: u._id }))

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      monto_maximo: data.monto_maximo ?? 0,
      usuarios: JSON.stringify(data.usuarios ?? []),
    }
    if (!caja) {
      try {
        const result = await createCaja(payload)
        toast.success(result.data.message)
        onHide()
        allCajas()
      } catch (error) {
        console.log(error)
        toast.error('Error al crear la caja')
      }
    } else {
      try {
        const result = await updateCaja(payload, caja._id)
        toast.success(result.data.message)
        onHide()
        allCajas()
      } catch (error) {
        console.log(error)
        toast.error('Error al actualizar la caja')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-center border-bottom pb-2">
        {`${caja ? 'Actualizando Caja' : 'Creando Caja'}`}
      </p>
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3" controlId="nombre">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              {...register('nombre', { required: true })}
              type="text"
              placeholder="Caja Principal"
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
          <Form.Group className="mb-3" controlId="estado">
            <Form.Label>Estado *</Form.Label>
            <Form.Select {...register('estado', { required: true })}>
              <option value="habilitada">Habilitada</option>
              <option value="deshabilitada">Deshabilitada</option>
            </Form.Select>
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label htmlFor="monto_maximo">Monto Maximo *</Form.Label>
            <Controller
              control={control}
              name="monto_maximo"
              rules={{ required: true }}
              render={({ field: { name, onChange, ref, value } }) => (
                <CurrencyInput
                  ref={ref}
                  className={`form-control ${errors.monto_maximo ? 'is-invalid' : ''}`}
                  id={name}
                  name={name}
                  value={value}
                  placeholder=""
                  decimalsLimit={2}
                  prefix="$"
                  intlConfig={{ locale: 'en-US', currency: 'GBP' }}
                  onValueChange={(value, name, values) => {
                    onChange(values?.float ?? null)
                  }}
                />
              )}
            />
            {errors.monto_maximo && (
              <div className="invalid-feedback d-block">El monto maximo es obligatorio</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label htmlFor="usuarios">Usuarios Asignados</Form.Label>
            <Controller
              control={control}
              name="usuarios"
              render={({ field: { name, onChange, ref, value } }) => (
                <Select
                  ref={ref}
                  inputId={name}
                  name={name}
                  isMulti
                  placeholder="Seleccionar usuarios..."
                  options={optionsUsuarios}
                  value={optionsUsuarios.filter((o) => (value ?? []).includes(o.value))}
                  onChange={(selected) => onChange((selected ?? []).map((s) => s.value))}
                  styles={stylesSelect}
                  theme={(theme) => ({
                    ...theme,
                    colors: { ...theme.colors, ...themeSelect.colors },
                  })}
                />
              )}
            />
          </Form.Group>
        </div>
        <div className="col-md-12">
          <Form.Group className="mb-3" controlId="nota">
            <Form.Label>Nota</Form.Label>
            <Form.Control {...register('nota')} as="textarea" rows={3} placeholder="" />
          </Form.Group>
        </div>
      </div>

      <div className="mt-5 d-flex gap-4 justify-content-center">
        <button type="button" onClick={onHide} className="btn btn-danger text-white">
          Cancelar
        </button>
        <Button type="submit" className="text-white" variant="success">
          Guardar Caja
        </Button>
      </div>
    </form>
  )
}

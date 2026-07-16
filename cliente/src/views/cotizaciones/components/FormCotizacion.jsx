/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import AsyncSelect from 'react-select/async'
import { useClientes } from '../../../hooks/useClientes'
import { stylesSelect, themeSelect } from '../../../utils/optionsConfig'
import DataTable from 'react-data-table-component'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import { useCotizacion } from '../../../hooks/useCotizacion'
import FormProductoCotizacion from './FormProductoCotizacion'
import { ViewDollar } from '../../../utils'

export default function FormCotizacion({ getAllCotizacion, onCancel, CotiSelecionada }) {
  FormCotizacion.propTypes = {
    getAllCotizacion: PropTypes.func,
    onCancel: PropTypes.func,
    CotiSelecionada: PropTypes.object,
  }
  const { getAllClientesPaginationPromise } = useClientes()

  const [ProductoCotizacion, setProductoCotizacion] = useState(
    CotiSelecionada ? CotiSelecionada.productos : [],
  )
  const [showProductosModal, setShowProductosModal] = useState(false)

  const { crearCotizacion, actualizarCotizacion } = useCotizacion()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    if (ProductoCotizacion.length === 0) {
      toast.error(`Selecione al menos un producto a la Cotización`)
      return
    }
    data.productos = ProductoCotizacion
    data.total_monto = ProductoCotizacion?.reduce((preVal, currentVal) => {
      return preVal + currentVal.price * currentVal.cantidad
    }, 0)
    if (CotiSelecionada) {
      try {
        await actualizarCotizacion(data, CotiSelecionada._id)
        toast.success(`Cotizacion Actualizada`)
        await getAllCotizacion()
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await crearCotizacion(data)
        toast.success(`Cotizacion Creada`)
        await getAllCotizacion()
      } catch (error) {
        console.log(error)
      }
    }
  }

  const searchLeadOptions = async (value) => {
    try {
      const result = await getAllClientesPaginationPromise({
        search: value,
        page: 1,
      })
      return result.data.data.map((c) => {
        return {
          label: `${c.name ?? ''} - ${c.alias ?? ''} - ${c.telefono ?? ''}`,
          value: c._id,
        }
      })
    } catch (error) {
      console.log(error)
      return []
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F3') {
        event.preventDefault()
        setShowProductosModal(true)
      }

      if (event.key === 'F2') {
        event.preventDefault()
        setShowProductosModal(false)
      }

      if (event.key === 'F4') {
        event.preventDefault()
        handleSubmit(onSubmit)()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSubmit, onSubmit, ProductoCotizacion])

  return (
    <>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        {/* Datos de la cotizacion */}
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Label htmlFor="client_id">Cliente</Form.Label>
            <Controller
              name="client_id"
              rules={{ required: true }}
              control={control}
              defaultValue={CotiSelecionada ? CotiSelecionada.client_id : undefined}
              render={({ field: { name, onChange, ref } }) => (
                <AsyncSelect
                  isClearable
                  cacheOptions
                  defaultOptions
                  inputId="client_id"
                  loadOptions={searchLeadOptions}
                  placeholder="Selecionar Cliente"
                  onChange={(e) => onChange(e?.value)}
                  name={name}
                  defaultValue={
                    CotiSelecionada && {
                      value: CotiSelecionada?.client?.id,
                      label: CotiSelecionada?.client?.name,
                    }
                  }
                  ref={ref}
                  styles={stylesSelect}
                  theme={themeSelect}
                />
              )}
            />
            {errors?.client_id && (
              <Alert variant={'warning'} className="mt-2 py-1 px-2 small">
                Elige un cliente.
              </Alert>
            )}
          </div>
        </div>

        <hr className="my-4" />

        {/* Seccion productos */}
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <h6 className="mb-0 fw-bold">
            <i className="fa-solid fa-box me-2 text-primary"></i>
            Productos de la Cotización
          </h6>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowProductosModal(true)}
          >
            <i className="fa-solid fa-plus me-1"></i>
            Agregar Productos (F3)
          </Button>
        </div>

        <div className="rounded overflow-hidden border border-ligth shadow-sm">
          <DataTable
            className="MyDataTableEvent"
            striped
            columns={[
              {
                name: '',
                width: '50px',
                cell: (row) => (
                  <button
                    onClick={() => {
                      setProductoCotizacion((status) =>
                        status.filter((ele) => ele.product_id !== row.product_id),
                      )
                    }}
                    type="button"
                    title="Remover Producto."
                    className="btn btn-danger btn-sm me-2 text-white"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                ),
              },
              {
                name: 'Nombre Producto',
                selector: (row) => row?.product_name ?? '',
              },
              {
                name: 'Cant.',
                selector: (row) => row?.cantidad ?? '',
                width: '80px',
              },
              {
                name: 'Precio',
                selector: (row) => row?.price ?? '',
                format: (row) => ViewDollar(row?.price) ?? '',
                width: '140px',
              },
              {
                name: 'Total',
                selector: (row) => row?.price ?? '',
                format: (row) => ViewDollar(row?.price * row?.cantidad) ?? '',
                width: '140px',
              },
            ]}
            noDataComponent={
              <div className="my-4 text-center text-muted">
                <i className="fa-solid fa-box-open fs-3 d-block mb-2"></i>
                <p className="mb-0">No hay productos agregados</p>
                <small>Haz click en &quot;Agregar Productos&quot; para añadirlos</small>
              </div>
            }
            data={ProductoCotizacion}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3 px-3 py-2 bg-light rounded">
          <span className="fw-semibold">Total</span>
          <span className="fs-5 fw-bold">
            {ViewDollar(
              ProductoCotizacion?.reduce(
                (preVal, currentVal) => preVal + currentVal.price * currentVal.cantidad,
                0,
              ) || 0,
            )}
          </span>
        </div>

        <div className="mt-4 d-flex gap-3 justify-content-end">
          {onCancel && (
            <Button type="button" variant="outline-secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            disabled={isSubmitting}
            variant="success"
            type="submit"
            className="px-4 text-white"
          >
            {isSubmitting ? (
              <Spinner size="sm" className="me-1" />
            ) : (
              <i className="fa-solid fa-floppy-disk me-1"></i>
            )}
            Guardar Cotización
          </Button>
        </div>
      </form>

      {/* Modal para agregar productos */}
      <Modal
        backdrop="static"
        size="xl"
        centered
        show={showProductosModal}
        onHide={() => setShowProductosModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fa-solid fa-box me-2"></i>
            Agregar Productos a la Cotización
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormProductoCotizacion setProductoCotizacion={setProductoCotizacion} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            className="text-white"
            onClick={() => setShowProductosModal(false)}
          >
            <i className="fa-solid fa-check me-1"></i>
            Listo [{ProductoCotizacion.length} productos] (F2)
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import AsyncSelect from 'react-select/async'
import { useProveedores } from '../../../../hooks/useProveedores'
import { stylesSelect, themeSelect } from '../../../../utils/optionsConfig'
import DataTable from 'react-data-table-component'
import { ViewDollar } from '../../../../utils'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import Select from 'react-select'
import { useFacturasCompra } from '../../../../hooks/useFacturasCompra'
import FormProductoCotizacion from '../../../cotizaciones/components/FormProductoCotizacion'
import moment from 'moment-timezone'

export default function FormFacturaCompra({ getAllFacturaCompra, onCancel, FacturaSelect }) {
  FormFacturaCompra.propTypes = {
    getAllFacturaCompra: PropTypes.func,
    onCancel: PropTypes.func,
    FacturaSelect: PropTypes.object,
  }
  const { getAllProveedoresPaginationPromise } = useProveedores()

  const currentDate = moment.utc()
  const localDate = currentDate.tz('America/Bogota')

  const [ProductoCotizacion, setProductoCotizacion] = useState(
    FacturaSelect ? FacturaSelect.productos : [],
  )
  const [showProductosModal, setShowProductosModal] = useState(false)

  const { crearFacturaCompra } = useFacturasCompra()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm()

  const [isPending, setPending] = useState(false)

  const onSubmit = async (data) => {
    if (ProductoCotizacion.length === 0) {
      toast.error(`Selecione al menos un producto a la Factura de Compra`)
      return
    }
    data.productos = ProductoCotizacion
    data.dia_compra = localDate.format().split('T')[0]
    data.total_monto = ProductoCotizacion?.reduce((preVal, currentVal) => {
      return preVal + currentVal.price * currentVal.cantidad
    }, 0)
    try {
      await crearFacturaCompra(data)
      toast.success(`Factura de Compra Creada`)
      getAllFacturaCompra()
    } catch (error) {
      console.log(error)
      toast.error('Error al crear la factura de compra')
    }
  }

  const searchProveedorOptions = async (value) => {
    try {
      const result = await getAllProveedoresPaginationPromise({
        search: value,
        page: 1,
      })
      return result.data.data.map((p) => ({
        label: `${p.nombre ?? ''} - ${p.numero_documento ?? ''} - ${p.telefono ?? ''}`,
        value: p._id,
      }))
    } catch (error) {
      console.log(error)
      return []
    }
  }

  return (
    <>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        {/* Datos de la factura */}
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Label htmlFor="proveedor_id">Proveedor</Form.Label>
            <Controller
              name="proveedor_id"
              rules={{ required: true }}
              control={control}
              defaultValue={FacturaSelect ? FacturaSelect.proveedor_id : undefined}
              render={({ field: { name, onChange, ref } }) => (
                <AsyncSelect
                  isClearable
                  cacheOptions
                  defaultOptions
                  inputId="proveedor_id"
                  loadOptions={searchProveedorOptions}
                  placeholder="Selecionar Proveedor"
                  onChange={(e) => onChange(e?.value)}
                  name={name}
                  defaultValue={
                    FacturaSelect && {
                      value: FacturaSelect?.proveedor?._id,
                      label: FacturaSelect?.proveedor?.nombre,
                    }
                  }
                  ref={ref}
                  styles={stylesSelect}
                  theme={themeSelect}
                />
              )}
            />
            {errors?.proveedor_id && (
              <Form.Text className="text-danger">Selecciona un proveedor</Form.Text>
            )}
          </div>

          <div className="col-md-3">
            <Form.Label htmlFor="status">Estado</Form.Label>
            <Controller
              name="status"
              rules={{ required: true }}
              control={control}
              render={({ field: { name, onChange, ref } }) => (
                <Select
                  options={[
                    { label: 'Pendiente', value: 'Pendiente' },
                    { label: 'Pagada', value: 'Pagada' },
                  ]}
                  placeholder="Selecione un Estado"
                  inputId="status"
                  onChange={(tar) => {
                    onChange(tar.value)
                    setPending(tar.value === 'Pendiente')
                  }}
                  ref={ref}
                  styles={stylesSelect}
                  theme={themeSelect}
                />
              )}
            />
          </div>

          <div className="col-md-3">
            <Form.Label htmlFor="metodo_pago">Metodo de Pago</Form.Label>
            <Controller
              name="metodo_pago"
              rules={{ required: true }}
              control={control}
              render={({ field: { name, onChange, ref } }) => (
                <Select
                  inputId="metodo_pago"
                  options={[
                    { label: 'Efectivo', value: 'efectivo' },
                    { label: 'Tarjeta', value: 'tarjeta' },
                    { label: 'Transferencia', value: 'transferencia' },
                  ]}
                  placeholder="Selecione Medio"
                  onChange={(tar) => onChange(tar.value)}
                  ref={ref}
                  styles={stylesSelect}
                  theme={themeSelect}
                />
              )}
            />
          </div>

          {isPending && (
            <div className="col-md-4">
              <Form.Group controlId="fecha_vencimiento">
                <Form.Label>Fecha de Vencimiento</Form.Label>
                <Form.Control
                  {...register('fecha_vencimiento', { required: true })}
                  type="date"
                />
              </Form.Group>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {/* Seccion productos */}
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <h6 className="mb-0 fw-bold">
            <i className="fa-solid fa-box me-2 text-primary"></i>
            Productos de la Factura de Compra
          </h6>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowProductosModal(true)}
          >
            <i className="fa-solid fa-plus me-1"></i>
            Agregar Productos
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

        <div className="mt-3">
          <Form.Group controlId="nota">
            <Form.Label>Nota</Form.Label>
            <Form.Control
              {...register('nota')}
              as="textarea"
              placeholder="Agrega una nota aca ..."
              rows={2}
            />
          </Form.Group>
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
            Guardar Factura de Compra
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
            Agregar Productos a la Factura de Compra
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormProductoCotizacion  isCompra={true} setProductoCotizacion={setProductoCotizacion} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            className="text-white"
            onClick={() => setShowProductosModal(false)}
          >
            <i className="fa-solid fa-check me-1"></i>
            Listo ({ProductoCotizacion.length} productos)
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

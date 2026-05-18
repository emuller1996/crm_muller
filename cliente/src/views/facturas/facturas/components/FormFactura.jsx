/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import AsyncSelect from 'react-select/async'
import { useClientes } from '../../../../hooks/useClientes'
import { stylesSelect, themeSelect } from '../../../../utils/optionsConfig'
import DataTable from 'react-data-table-component'
import { ViewDollar } from '../../../../utils'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import Select from 'react-select'
import { useFacturas } from '../../../../hooks/useFacturas'
import FormProductoCotizacion from '../../../cotizaciones/components/FormProductoCotizacion'
import moment from 'moment-timezone'

export default function FormFactura({ getAllFactura, onCancel, FacturaSelect }) {
  FormFactura.propTypes = {
    getAllFactura: PropTypes.func,
    onCancel: PropTypes.func,
    FacturaSelect: PropTypes.object,
  }
  const { getAllClientesPaginationPromise } = useClientes()

  const currentDate = moment.utc()
  const localDate = currentDate.tz('America/Bogota')

  const [ProductoCotizacion, setProductoCotizacion] = useState(
    FacturaSelect ? FacturaSelect.productos : [],
  )
  const [showProductosModal, setShowProductosModal] = useState(false)

  const { crearFactura } = useFacturas()
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const [isPending, setPending] = useState(false)

  const onSubmit = async (data) => {
    if (ProductoCotizacion.length === 0) {
      toast.error(`Selecione al menos un producto a la Factura`)
      return
    }
    data.productos = ProductoCotizacion
    data.dia_venta = localDate.format().split('T')[0]
    data.total_monto = ProductoCotizacion?.reduce((preVal, currentVal) => {
      return preVal + currentVal.price * currentVal.cantidad
    }, 0)
    try {
      await crearFactura(data)
      toast.success(`Factura Creada`)
      getAllFactura()
    } catch (error) {
      console.log(error)
      toast.error('Error al crear la factura')
    }
  }

  const searchLeadOptions = async (value) => {
    try {
      const mostradorOption = {
        label: 'CLIENTE DE MOSTRADORA',
        value: 'cliente_mostrador',
      }

      const result = await getAllClientesPaginationPromise({
        search: value,
        page: 1,
      })

      const clientesOptions = result.data.data.map((c) => {
        return {
          label: `${c.name ?? ''} - ${c.alias ?? ''} - ${c.telefono ?? ''}`,
          value: c._id,
        }
      })

      return [mostradorOption, ...clientesOptions]
    } catch (error) {
      console.log(error)
      return [
        {
          label: 'CLIENTE DE MOSTRADORA',
          value: 'cliente_mostrador',
        },
      ]
    }
  }

  return (
    <>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        {/* Datos de la factura */}
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Label htmlFor="client_id">Cliente</Form.Label>
            <Controller
              name="client_id"
              rules={{ required: true }}
              control={control}
              defaultValue={FacturaSelect ? FacturaSelect.client_id : undefined}
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
                    FacturaSelect && {
                      value: FacturaSelect?.client?.id,
                      label: FacturaSelect?.client?.name,
                    }
                  }
                  ref={ref}
                  styles={stylesSelect}
                  theme={themeSelect}
                />
              )}
            />
          </div>

          <div className="col-md-6">
            <Form.Label htmlFor="status">Estado</Form.Label>
            <Controller
              name="status"
              rules={{ required: { value: true, message: 'Selecione el Estado' } }}
              control={control}
              defaultValue={'Pagada'}
              render={({ field: { name, onChange, ref } }) => (
                <Select
                  options={[
                    { label: 'Pendiente', value: 'Pendiente' },
                    { label: 'Pagada', value: 'Pagada' },
                  ]}
                  defaultValue={{ label: 'Pagada', value: 'Pagada' }}
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

          <div className="col-12">
            <label className="form-label">Metodo de Pago</label>
            <div className="d-flex gap-3 flex-wrap">
              <Form.Check className="p-0">
                <Form.Check.Input
                  {...register('metodo_pago', { required: true })}
                  type={'radio'}
                  hidden
                  name="metodo_pago"
                  id={`efectivo`}
                  value={'efectivo'}
                />
                <Form.Check.Label
                  className="p-2"
                  style={{
                    border: '1px solid',
                    borderRadius: '0.4em',
                    cursor: 'pointer',
                    borderColor: watch().metodo_pago === 'efectivo' ? '#436efd' : '#acacac',
                    color: watch().metodo_pago === 'efectivo' ? '#436efd' : '#303030',
                  }}
                  htmlFor="efectivo"
                >
                  Efectivo
                  <i className="ms-2 fa-xl fa-solid fa-money-bill"></i>
                </Form.Check.Label>
              </Form.Check>
              <Form.Check className="p-0">
                <Form.Check.Input
                  {...register('metodo_pago', { required: true })}
                  type={'radio'}
                  id={`tarjeta`}
                  name="metodo_pago"
                  value={'tarjeta'}
                  hidden
                />
                <Form.Check.Label
                  className="p-2"
                  style={{
                    border: '1px solid',
                    borderRadius: '0.4em',
                    cursor: 'pointer',
                    borderColor: watch().metodo_pago === 'tarjeta' ? '#436efd' : '#acacac',
                    color: watch().metodo_pago === 'tarjeta' ? '#436efd' : '#303030',
                  }}
                  htmlFor="tarjeta"
                >
                  Tarjeta
                  <i className="fa-xl fa-solid fa-credit-card ms-2"></i>
                </Form.Check.Label>
              </Form.Check>
              <Form.Check className="p-0">
                <Form.Check.Input
                  {...register('metodo_pago', { required: true })}
                  type={'radio'}
                  id={`Transferencia`}
                  name="metodo_pago"
                  value={'transferencia'}
                  hidden
                />
                <Form.Check.Label
                  className="p-2"
                  style={{
                    border: '1px solid',
                    borderRadius: '0.4em',
                    cursor: 'pointer',
                    borderColor:
                      watch().metodo_pago === 'Transferencia' ? '#436efd' : '#acacac',
                    color: watch().metodo_pago === 'Transferencia' ? '#436efd' : '#303030',
                  }}
                  htmlFor="Transferencia"
                >
                  Transferencia
                  <i className="fa-xl fa-solid fa-money-bill-transfer ms-2"></i>
                </Form.Check.Label>
              </Form.Check>
            </div>
            {errors?.metodo_pago && (
              <Alert variant={'warning'} className="mt-2 py-1 px-2 small">
                Elige un Metodo de Pago.
              </Alert>
            )}
          </div>

          {isPending && (
            <div className="col-md-6">
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
            Productos de la Factura
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
            Guardar Factura
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
            Agregar Productos a la Factura
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormProductoCotizacion setProductoCotizacion={setProductoCotizacion} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" className="text-white" onClick={() => setShowProductosModal(false)}>
            <i className="fa-solid fa-check me-1"></i>
            Listo ({ProductoCotizacion.length} productos)
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

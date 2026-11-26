/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react'
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
import SelectMiCaja from '../../../cajas/components/SelectMiCaja'
import { useProductos } from '../../../../hooks/useProductos'
import FormClientes from '../../../clientes/components/FormClientes'
import ModalCobroFactura from './ModalCobroFactura'
import ModalEditarProductoFactura from './ModalEditarProductoFactura'
import { useFacturaTicket } from '../../../../hooks/useFacturaTicket'

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
  // Indice de la linea de producto que se esta editando (cantidad / precio)
  const [editIndex, setEditIndex] = useState(null)

  const { crearFactura } = useFacturas()
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm()

  const [isPending, setPending] = useState(false)

  // Cliente seleccionado (controlado para poder seleccionar uno recien creado)
  const [clienteOption, setClienteOption] = useState(
    FacturaSelect ? { value: FacturaSelect?.client?.id, label: FacturaSelect?.client?.name } : {
        label: 'CLIENTE DE MOSTRADORA',
        value: 'cliente_mostrador',
      },
  )
  const [showClienteModal, setShowClienteModal] = useState(false)

  const onClienteCreado = (cliente) => {
    if (!cliente?._id) return
    const option = {
      value: cliente._id,
      label: `${cliente.name ?? ''} - ${cliente.alias ?? ''} - ${cliente.telefono ?? ''}`,
    }
    setClienteOption(option)
    setValue('client_id', option.value, { shouldValidate: true })
  }

  // Escaneo por codigo de barras: el lector escribe el codigo y envia Enter
  const { getProductoByCode } = useProductos()
  const [codigoScan, setCodigoScan] = useState('')
  const [scanning, setScanning] = useState(false)
  const inputScan = useRef(null)

  const agregarPorCodigo = async () => {
    const code = codigoScan.trim()
    if (!code || scanning) return
    setScanning(true)
    try {
      const { data: producto } = await getProductoByCode(code)
      setProductoCotizacion((status) => {
        const existe = status.find((p) => p.product_id === producto._id)
        if (existe) {
          return status.map((p) =>
            p.product_id === producto._id ? { ...p, cantidad: Number(p.cantidad) + 1 } : p,
          )
        }
        return [
          ...status,
          {
            product_id: producto._id,
            product_name: producto.name,
            price: parseFloat(producto.price) || 0,
            cost: parseFloat(producto.cost) || 0,
            cantidad: 1,
          },
        ]
      })
      toast.success(`${producto.name} agregado`, { duration: 1200 })
    } catch (error) {
      toast.error(
        error.response?.status === 404
          ? `No existe un producto con el codigo "${code}"`
          : 'Error al buscar el producto',
      )
    } finally {
      setCodigoScan('')
      setScanning(false)
      inputScan.current?.focus()
    }
  }

  // Cobro: el formulario validado se guarda aqui y se confirma desde el modal de cobro
  const { imprimirTicket } = useFacturaTicket()
  const [facturaPendiente, setFacturaPendiente] = useState(null)
  const [cobrando, setCobrando] = useState(false)

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
    setFacturaPendiente(data)
  }

  useEffect(() => {
    inputScan.current?.focus()
  }, [])

  const confirmarCobro = async (imprimir) => {
    if (!facturaPendiente || cobrando) return
    // La ventana se abre en el mismo click para que el navegador no la bloquee
    const ventana = imprimir ? window.open('', '_blank') : null
    setCobrando(true)
    try {
      const res = await crearFactura(facturaPendiente)
      toast.success(`Factura Creada`)

      if (imprimir) {
        const clienteNombre =
          facturaPendiente.client_id === 'cliente_mostrador'
            ? 'CLIENTE DE MOSTRADOR'
            : (clienteOption?.label ?? '').split(' - ')[0]
        await imprimirTicket(
          {
            ...facturaPendiente,
            numero_factura: res?.data?.numero_factura,
            createdTime: Date.now(),
            client: { name: clienteNombre },
          },
          Number(localStorage.getItem('ticket_ancho_mm')) || 80,
          ventana,
        )
      }

      setFacturaPendiente(null)
      getAllFactura()
    } catch (error) {
      console.log(error)
      if (ventana && !ventana.closed) ventana.close()
      toast.error(error.response?.data?.message || 'Error al crear la factura')
    } finally {
      setCobrando(false)
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Con el modal de cobro abierto no se usan los atajos del formulario
      if (facturaPendiente || editIndex !== null) return

      // F3 keyCode = 114, F4 keyCode = 115
      if (event.key === 'F3') {
        event.preventDefault() // Evita comportamiento por defecto del navegador
        setShowProductosModal(true)
      }

      if (event.key === 'F2') {
        event.preventDefault() // Evita comportamiento por defecto del navegador
        setShowProductosModal(false)
      }

      if (event.key === 'F4') {
        event.preventDefault() // Evita comportamiento por defecto del navegador
        handleSubmit(onSubmit)()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSubmit, onSubmit, ProductoCotizacion, facturaPendiente, editIndex])

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
              defaultValue={FacturaSelect ? FacturaSelect.client_id : "cliente_mostrador"}
              render={({ field: { name, onChange, ref } }) => (
                <div className="d-flex gap-2">
                  <div className="flex-grow-1">
                    <AsyncSelect
                      isClearable
                      cacheOptions
                      defaultOptions
                      inputId="client_id"
                      loadOptions={searchLeadOptions}
                      placeholder="Selecionar Cliente"
                      value={clienteOption}
                      onChange={(e) => {
                        setClienteOption(e ?? null)
                        onChange(e?.value)
                      }}
                      name={name}
                      ref={ref}
                      styles={stylesSelect}
                      theme={themeSelect}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline-primary"
                    title="Crear nuevo cliente"
                    onClick={() => setShowClienteModal(true)}
                  >
                    <i className="fa-solid fa-user-plus"></i>
                  </Button>
                </div>
              )}
            />
            {errors?.client_id && (
              <Alert variant={'warning'} className="mt-2 py-1 px-2 small">
                Elige un cliente.
              </Alert>
            )}
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
                    { label: 'Pagada', value: 'Pagada' },
                    { label: 'Pendiente', value: 'Pendiente' },
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

          <div className="col-md-7">
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
                  id={`transferencia`}
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
                    borderColor: watch().metodo_pago === 'transferencia' ? '#436efd' : '#acacac',
                    color: watch().metodo_pago === 'transferencia' ? '#436efd' : '#303030',
                  }}
                  htmlFor="transferencia"
                >
                  Transferencia
                  <i className="fa-xl fa-solid fa-money-bill-transfer ms-2"></i>
                </Form.Check.Label>
              </Form.Check>
            </div>
            <div className="col-8">
              {errors?.metodo_pago && (
                <Alert variant={'warning'} className="mt-2 py-1 px-2 small">
                  Elige un Metodo de Pago.
                </Alert>
              )}
            </div>
          </div>

          <div className="col-md-5">
            <Form.Label>Caja</Form.Label>
            <Controller
              name="caja_id"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange } }) => (
                <SelectMiCaja onChange={(id) => onChange(id)} error={!!errors?.caja_id} />
              )}
            />
          </div>

          {isPending && (
            <div className="col-md-6">
              <Form.Group controlId="fecha_vencimiento">
                <Form.Label>Fecha de Vencimiento</Form.Label>
                <Form.Control {...register('fecha_vencimiento', { required: true })} type="date" />
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
            Agregar Productos (F3)
          </Button>
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text">
            {scanning ? <Spinner size="sm" /> : <i className="fa-solid fa-barcode"></i>}
          </span>
          <input
            ref={inputScan}
            type="text"
            className="form-control"
            placeholder="Escanee o escriba el codigo de barras y presione Enter"
            value={codigoScan}
            onChange={(e) => setCodigoScan(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Evita que el Enter del lector envie el formulario
                e.preventDefault()
                agregarPorCodigo()
              }
            }}
          />
        </div>

        <div className="rounded overflow-hidden border border-ligth shadow-sm">
          <DataTable
            className="MyDataTableEvent"
            striped
            columns={[
              {
                name: '',
                width: '100px',
                cell: (row, index) => (
                  <div className="d-flex gap-1">
                    <button
                      onClick={() => setEditIndex(index)}
                      type="button"
                      title="Modificar cantidad y precio."
                      className="btn btn-primary btn-sm"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      onClick={() => {
                        setProductoCotizacion((status) =>
                          status.filter((ele) => ele.product_id !== row.product_id),
                        )
                      }}
                      type="button"
                      title="Remover Producto."
                      className="btn btn-danger btn-sm text-white"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
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

      {/* Modal de cobro (total, cambio y opciones de impresion) */}
      <ModalCobroFactura
        show={!!facturaPendiente}
        total={facturaPendiente?.total_monto ?? 0}
        metodoPago={facturaPendiente?.metodo_pago}
        saving={cobrando}
        onHide={() => setFacturaPendiente(null)}
        onConfirm={confirmarCobro}
      />

      {/* Modal para modificar cantidad y precio de un producto agregado */}
      <ModalEditarProductoFactura
        producto={editIndex !== null ? ProductoCotizacion[editIndex] : null}
        onHide={() => setEditIndex(null)}
        onSave={({ cantidad, price }) => {
          setProductoCotizacion((status) =>
            status.map((p, i) => (i === editIndex ? { ...p, cantidad, price } : p)),
          )
          setEditIndex(null)
        }}
      />

      {/* Modal para crear cliente (fuera del form de la factura para no anidar formularios) */}
      <Modal
        backdrop="static"
        size="lg"
        centered
        show={showClienteModal}
        onHide={() => setShowClienteModal(false)}
      >
        <Modal.Body>
          <FormClientes onHide={() => setShowClienteModal(false)} onCreated={onClienteCreado} />
        </Modal.Body>
      </Modal>

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
          <FormProductoCotizacion setProductoCotizacion={setProductoCotizacion} isVenta={true} />
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

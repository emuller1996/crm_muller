/* eslint-disable prettier/prettier */
import React, { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { ViewDollar } from '../../../utils'
import { usePedidos } from '../../../hooks/usePedidos'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'

export default function FormSignedPedido({ pedido, onSuccess }) {
  FormSignedPedido.propTypes = {
    pedido: PropTypes.object,
    onSuccess: PropTypes.func,
  }

  const sigCanvas = useRef(null)
  const { actualizarPedidos } = usePedidos()

  const guardarFirma = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      toast.error('Dibuja una firma primero')
      return
    }
    const firmaBase64 = sigCanvas.current.toDataURL('image/png')
    try {
      await actualizarPedidos(
        {
          status: 'Entregada',
          signature: firmaBase64,
          signature_date: new Date().getTime(),
        },
        pedido._id,
      )
      toast.success('Firma guardada - Pedido entregado')
      if (onSuccess) onSuccess()
    } catch (error) {
      console.log(error)
      toast.error('Error al guardar la firma')
    }
  }

  const limpiarFirma = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear()
    }
  }

  return (
    <div className="px-3 text-center">
      <div className="d-flex justify-content-center">
        <div>
          <p className="m-0 fw-bold">{pedido?.client?.name}</p>
          <p className="m-0 text-muted">Pedido PD-{pedido?.numero_pedido}</p>
          <p className="m-0 fs-5">{ViewDollar(pedido?.total_monto)}</p>
          <p className="mt-2 mb-1">Firma de entrega:</p>
          <div style={{ border: '1px solid #c2c2c2', width: '450px', borderRadius: 8 }}>
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{ width: 450, height: 200, className: 'signature-canvas' }}
              penColor="blue"
            />
          </div>
          <div className="mt-3">
            <button className="btn btn-danger me-2" onClick={limpiarFirma}>
              <i className="fa-solid fa-eraser me-1"></i>
              Limpiar
            </button>
            <button className="btn btn-success text-white" onClick={guardarFirma}>
              <i className="fa-solid fa-check me-1"></i>
              Guardar Firma y Entregar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

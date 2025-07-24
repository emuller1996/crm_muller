/* eslint-disable prettier/prettier */
import React, { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { ViewDollar } from '../../../../utils'
import { useCotizacion } from '../../../../hooks/useCotizacion'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'

export default function FormSignedCotizacion({ CotiSelecionada, getAllCotizacion }) {
  // Guardar la firma como Base64
  FormSignedCotizacion.propTypes = {
    CotiSelecionada: PropTypes.object,
    getAllCotizacion: PropTypes.func,
  }
  const sigCanvas = useRef(null)

  const { actualizarCotizacion } = useCotizacion()

  const guardarFirma = async () => {
    if (sigCanvas.current) {
      const firmaBase64 = sigCanvas.current.toDataURL('image/png') // Esto devuelve un Data URL (Base64)
      console.log(firmaBase64) // Ej: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      try {
        await actualizarCotizacion(
          { status: 'Aprobada', signature: firmaBase64, signature_date: new Date().getTime() },
          CotiSelecionada._id,
        )
        toast.success(`Firma Guardada.`)
        getAllCotizacion()
      } catch (error) {
        console.log(error)
      }
      // Guardar en el estado o enviar al servidor
      //localStorage.setItem("firmaGuardada", firmaBase64);
    }
  }

  // Limpiar el canvas
  const limpiarFirma = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear()
    }
  }
  return (
    <div className="px-3 text-center">
      <div className="d-flex justify-content-center">
        <div>
          <p className="m-0">{CotiSelecionada?.client?.name}</p>
          <p className="m-0">{ViewDollar(CotiSelecionada?.total_monto)}</p>
          <p>Firma aquí:</p>
          <div style={{ border: '1px solid #c2c2c2', width: '450px', borderRadius: 8 }}>
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{ width: 450, height: 200, className: 'signature-canvas' }}
              penColor="blue"
            />
          </div>
          <div className="mt-3">
            <button className="btn btn-danger me-2" onClick={limpiarFirma}>
              Limpiar
            </button>
            <button className="btn btn-success" onClick={guardarFirma}>
              Guardar Firma
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

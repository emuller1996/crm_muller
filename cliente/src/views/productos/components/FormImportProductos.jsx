/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { useProductos } from '../../../hooks/useProductos'
import toast from 'react-hot-toast'
export default function FormImportProductos({ getAllProductos }) {
  const { importProductos } = useProductos()

  const [file, setFile] = useState(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return alert('Selecciona un archivo primero')
    const formData = new FormData()
    formData.append('file', file) // "file" debe coincidir con el nombre del campo en Express
    try {
      const response = await importProductos(formData)
      console.log('Respuesta del servidor:', response.data)
      toast.success("Se ha importado el excel correctamente.")
      await getAllProductos()
    } catch (error) {
      console.error('Error al subir el archivo:', error)
    }
  }
  return (
    <>
      <p className="text-center font-semibold mb-4 ">Importar Productos por excel</p>
      <div className="mb-3">
        <label htmlFor="formFile" className="form-label">
          Default file input example
        </label>
        <input onChange={handleFileChange} className="form-control" type="file" id="formFile" />
        <div className="text-center mt-4">
          <button onClick={handleUpload} type="submit" className="btn btn-primary">
            Subir Excel
          </button>
        </div>
      </div>
    </>
  )
}

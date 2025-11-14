/* eslint-disable prettier/prettier */

import { CContainer } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import imageCompression from 'browser-image-compression'
import { useForm } from 'react-hook-form'

const EmpresaPage = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [base64Image, setBase64Image] = useState(null)
  const [ErrorFile, setErrorFile] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const handleImageChange = async (e) => {
    try {
      setSelectedImage(null)
      setErrorFile(null)
      const file = e.target.files[0]
      if (!file) return

      const options = {
        maxSizeMB: 1, // Tamaño máximo en MB
        maxWidthOrHeight: 1920, // Dimensión máxima
        useWebWorker: true, // Usar web worker para mejor rendimiento
        fileType: 'image/webp', // Convertir a WebP
        initialQuality: 0.8, // Calidad (0.8 = 80%)
      }

      const compressedFile = await imageCompression(file, options)
      console.log('Tamaño original:', file.size, 'bytes')
      console.log('Tamaño comprimido:', compressedFile.size, 'bytes')
      /* // Validaciones
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
      const maxSize = 3 * 1024 * 1024 // 3MB

      if (!validTypes.includes(file.type.toLowerCase())) {
        throw new Error('Formato no válido. Solo se aceptan JPG/PNG')
      }

      if (file.size > maxSize) {
        throw new Error('El archivo excede el límite de 3MB')
      } */
      if (compressedFile) {
        setSelectedImage(compressedFile)
        convertToBase64(compressedFile)
      }
    } catch (error) {
      console.error('Error al procesar imagen:', error.message)
      e.target.value = '' // Limpiar input
      // Puedes usar un estado para mostrar el error en la UI
      // setError(error.message);
      //alert(error.message)
      setErrorFile(error.message)
    }
  }

  const convertToBase64 = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setBase64Image(reader.result)
    }
    reader.onerror = (error) => {
      console.error('Error al convertir la imagen a Base64:', error)
    }
  }

  const onSubmit =(data)=>{
    data.logo = base64Image;
    console.log(data);
    
  }
  return (
    <div>
      <CContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-6">
              <Form.Group controlId="logoCompany" className="mb-3">
                <Form.Label>Logo</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              </Form.Group>
            </div>
            <div className="col-6">
              {selectedImage && (
                <div className=" d-flex gap-4 justify-content-center my-4">
                  <div className="rounded-4 border overflow-hidden">
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" width="80px" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <Form.Group className="mb-3" controlId="nameCompany">
            <Form.Label>Nombre Empresa</Form.Label>
            <Form.Control {...register('name', { required: true })} type="text" placeholder="" />
          </Form.Group>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="addressCompany">
                <Form.Label>Direccion</Form.Label>
                <Form.Control {...register('address', { required: true })} type="text" placeholder="" />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="phoneCompany">
                <Form.Label>Telefono</Form.Label>
                <Form.Control {...register('phone', { required: true })} type="text" placeholder="" />
              </Form.Group>
            </div>
          </div>
          <div className="text-center">
            <button type='submit' className="btn btn-success text-white">
              <i className="fa-solid fa-floppy-disk me-2"></i>Guardar
            </button>
          </div>
        </form>
      </CContainer>
    </div>
  )
}

export default EmpresaPage

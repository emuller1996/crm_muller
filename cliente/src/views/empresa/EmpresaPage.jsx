/* eslint-disable prettier/prettier */

import { CContainer } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import imageCompression from 'browser-image-compression'
import { useForm } from 'react-hook-form'
import { useEmpresa } from '../../hooks/useEmpresa'
import toast from 'react-hot-toast'

const EmpresaPage = () => {
  const { establecerConfiguracionEmpresa, getConfiguracionEmpresa, empresaData } = useEmpresa()

  const [selectedImage, setSelectedImage] = useState(empresaData ? empresaData?.logo : null)
  const [base64Image, setBase64Image] = useState(empresaData ? empresaData?.logo : null)
  const [ErrorFile, setErrorFile] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    getConfiguracionEmpresa()
  }, [])

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

  console.log(empresaData)

  const onSubmit = async (data) => {
    if(base64Image){
      data.logo = base64Image
    }
    console.log(data)
    if (empresaData) {
      console.log('editar')
    } else {
      try {
        await establecerConfiguracionEmpresa(data)
        toast.success('Configuracion de la Empresa Establecida')
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
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
              {!base64Image && empresaData && (
                <div className=" d-flex gap-4 justify-content-center my-4">
                  <div className="rounded-4 border overflow-hidden">
                    <img src={empresaData.logo} alt="Preview" width="80px" />
                  </div>
                </div>
              )}
              {base64Image && (
                <div className=" d-flex gap-4 justify-content-center my-4">
                  <div className="rounded-4 border overflow-hidden">
                    <img src={base64Image} alt="Preview" width="80px" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <Form.Group className="mb-3" controlId="nameCompany">
            <Form.Label>Nombre Empresa</Form.Label>
            <Form.Control
              defaultValue={empresaData?.name || ''}
              {...register('name', { required: true })}
              type="text"
              placeholder=""
            />
          </Form.Group>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="addressCompany">
                <Form.Label>Direccion</Form.Label>
                <Form.Control
                  {...register('address', { required: true })}
                  type="text"
                  placeholder=""
                  defaultValue={empresaData?.address || ''}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="phoneCompany">
                <Form.Label>Telefono</Form.Label>
                <Form.Control
                  {...register('phone', { required: true })}
                  type="text"
                  placeholder=""
                  defaultValue={empresaData?.phone || ''}
                />
              </Form.Group>
            </div>
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-success text-white">
              <i className="fa-solid fa-floppy-disk me-2"></i>Guardar
            </button>
          </div>
        </form>
      </CContainer>
    </div>
  )
}

export default EmpresaPage

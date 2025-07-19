import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'

import { useProductos } from '../../../hooks/useProductos'
import { useParams } from 'react-router-dom'
import {
  postCreateProductoImageService,
  putUpdateProductoService,
} from '../../../services/productos.services'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import imageCompression from 'browser-image-compression'

const ImagesPage = ({ idProduct }) => {
  ImagesPage.propTypes = {
    idProduct: PropTypes.string,
  }
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setisLoading] = useState(true)
  const [base64Image, setBase64Image] = useState(null)
  const [ErrorFile, setErrorFile] = useState(null)

  const { getImagesByProductId, ImagesProduct, getProductById, dataDetalle } = useProductos()

  //const { idProduct } = useParams()

  useEffect(() => {
    if (idProduct) {
      getAllDataFetch()
    }
  }, [idProduct])

  const getAllDataFetch = async () => {
    try {
      setisLoading(true)
      await getImagesByProductId(idProduct)
      await getProductById(idProduct)
    } catch (error) {
      console.log(error)
    } finally {
      setisLoading(false)
    }
  }

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
  const convertToBase642 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
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

  return (
    <>
      {isLoading && (
        <div className="d-flex justify-content-center my-5">
          <div
            className="spinner-border text-primary"
            style={{ width: '3em', height: '3em' }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {!isLoading && (
        <div style={{ minHeight: '400px' }}>
          <div className="my-2">
            <div className={`card card-body `}>
              <div className="d-flex justify-content-between align-items-center">
                <span>{dataDetalle?.name}</span>
                <div>
                  <img
                    src={dataDetalle?.imageBase64}
                    className="rounded-circle"
                    alt="NO_IMAGEN"
                    style={{ width: '50px', height: '50px' }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-4">
            <div className="col-md-6 ">
              <div className="card card-body">
                <p className="text-center text-muted">Ingresa imagen para el producto.</p>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Imagen del Producto.</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                </Form.Group>

                {selectedImage && (
                  <div className=" d-flex gap-4 justify-content-center my-4">
                    <div className="rounded-4 border overflow-hidden">
                      <img src={URL.createObjectURL(selectedImage)} alt="Preview" width="300px" />
                    </div>
                  </div>
                )}
                {ErrorFile && <Alert variant="warning"> {ErrorFile}</Alert>}

                <div className="text-center mt-3">
                  <Button
                    onClick={async () => {
                      await postCreateProductoImageService({ image: base64Image }, idProduct)
                      await getImagesByProductId(idProduct)
                      setSelectedImage(null)
                      setBase64Image(null)
                      console.log(base64Image)
                    }}
                    disabled={base64Image === null ? true : false}
                  >
                    Agregar Imagen
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-md-6 ">
              <div className="row g-2">
                {ImagesProduct && ImagesProduct.length === 0 && (
                  <div className="col-6 mx-auto">
                    <div className="alert alert-light">
                      <p className="text-center">Producto no tiene imagen.</p>
                    </div>
                  </div>
                )}
                {ImagesProduct &&
                  ImagesProduct.map((ima) => (
                    <div key={ima._id} className="col-4 col-md-6">
                      <div className="rounded-4   ">
                        <div
                          className={`card position-relative overflow-hidden  rounded-4  ${ima._id === dataDetalle?.image_id ? ' border-2 border-primary ' : ''}`}
                        >
                          <div className="position-absolute top-0 end-0">
                            <Button variant={'danger'} className="mt-1 me-1 text-white" size="sm">
                              <i className="fa-regular fa-trash-can"></i>
                            </Button>
                          </div>
                          <div className="position-absolute top-50 start-50 translate-middle">
                            <Button
                              style={{ opacity: '0.4' }}
                              onClick={async () => {
                                try {
                                  const result = await putUpdateProductoService(idProduct, {
                                    image_id: ima._id,
                                  })
                                  console.log(result.data)
                                  toast.success(result.data.message)
                                  await getImagesByProductId(idProduct)
                                  await getProductById(idProduct)
                                } catch (error) {
                                  console.log(error)
                                }
                              }}
                            >
                              Definir Imagen Principal
                            </Button>
                          </div>
                          <div className="overflow-hidden">
                            <img className="img-fluid" alt="test" src={ima.image} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ImagesPage

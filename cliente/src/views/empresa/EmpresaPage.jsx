/* eslint-disable prettier/prettier */

import { CContainer } from '@coreui/react'
import React, { useContext, useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import imageCompression from 'browser-image-compression'
import { useForm } from 'react-hook-form'
import { useEmpresa } from '../../hooks/useEmpresa'
import AuthContext from '../../context/AuthContext'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const EmpresaPage = () => {
  const { user } = useContext(AuthContext)
  const {
    establecerConfiguracionEmpresa,
    getConfiguracionEmpresa,
    actualizarEmpresa,
    empresaData,
  } = useEmpresa()

  const isSuperUser = user?.role_id === 'super_user'
  const canEdit = isSuperUser

  const [base64Image, setBase64Image] = useState(null)
  const [ErrorFile, setErrorFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    getConfiguracionEmpresa()
  }, [])

  useEffect(() => {
    if (empresaData) {
      reset({
        razon_social: empresaData.razon_social || '',
        nombre_comercial: empresaData.nombre_comercial || '',
        tipo_documento: empresaData.tipo_documento || 'NIT',
        numero_documento: empresaData.numero_documento || '',
        digito_verificacion: empresaData.digito_verificacion || '',
        direccion: empresaData.direccion || '',
        ciudad: empresaData.ciudad || '',
        departamento: empresaData.departamento || '',
        telefono: empresaData.telefono || '',
        celular: empresaData.celular || '',
        correo: empresaData.correo || '',
        sitio_web: empresaData.sitio_web || '',
      })
    }
  }, [empresaData, reset])

  const handleImageChange = async (e) => {
    if (!canEdit) return
    try {
      setErrorFile(null)
      const file = e.target.files[0]
      if (!file) return

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.8,
      }

      const compressedFile = await imageCompression(file, options)
      if (compressedFile) {
        convertToBase64(compressedFile)
      }
    } catch (error) {
      console.error('Error al procesar imagen:', error.message)
      e.target.value = ''
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

  const onSubmit = async (data) => {
    if (!canEdit) {
      toast.error('No tienes permisos para modificar la empresa')
      return
    }
    if (base64Image) {
      data.logo_base64 = base64Image
    }
    setSubmitting(true)
    try {
      if (empresaData && empresaData._id) {
        await actualizarEmpresa(data)
        toast.success('Informacion de la empresa actualizada')
      } else {
        await establecerConfiguracionEmpresa(data)
        toast.success('Configuracion de la empresa establecida')
      }
      setBase64Image(null)
      getConfiguracionEmpresa()
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  const logoSrc = base64Image
    ? base64Image
    : empresaData?.logo
      ? empresaData.logo.startsWith('http')
        ? empresaData.logo
        : `${API_BASE}${empresaData.logo}`
      : null

  return (
    <div>
      <CContainer>
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <h5 className="fw-bold mb-0">
                  <i className="fa-solid fa-building me-2 text-primary"></i>
                  Informacion de la Empresa
                </h5>
                <small className="text-muted">
                  {canEdit
                    ? 'Puedes editar los datos basicos de tu empresa'
                    : 'Solo un Super Usuario puede modificar esta informacion'}
                </small>
              </div>
              {canEdit ? (
                <span className="badge bg-success">
                  <i className="fa-solid fa-pen-to-square me-1"></i>
                  Modo edicion
                </span>
              ) : (
                <span className="badge bg-secondary">
                  <i className="fa-solid fa-lock me-1"></i>
                  Solo lectura
                </span>
              )}
            </div>

            {!canEdit && (
              <Alert variant="warning" className="mb-3">
                <i className="fa-solid fa-triangle-exclamation me-2"></i>
                No tienes permisos para editar la informacion de la empresa. Esta funcion esta
                reservada para usuarios con rol <strong>Super Usuario</strong>.
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Logo */}
              <div className="row g-3 mb-3 align-items-center">
                <div className="col-md-3 text-center">
                  <div
                    className="rounded-4 border overflow-hidden mx-auto d-flex align-items-center justify-content-center bg-light"
                    style={{ width: 120, height: 120 }}
                  >
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt="Logo"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    ) : (
                      <i className="fa-solid fa-image text-muted fs-1"></i>
                    )}
                  </div>
                </div>
                <div className="col-md-9">
                  <Form.Group controlId="logoCompany">
                    <Form.Label>Logo de la Empresa</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={!canEdit}
                    />
                    <Form.Text className="text-muted">
                      Se comprimira automaticamente a WebP. Max 1MB.
                    </Form.Text>
                    {ErrorFile && <div className="text-danger small mt-1">{ErrorFile}</div>}
                  </Form.Group>
                </div>
              </div>

              <hr />
              <h6 className="text-muted small text-uppercase">Informacion Legal</h6>

              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group controlId="razon_social">
                    <Form.Label>Razon Social *</Form.Label>
                    <Form.Control
                      {...register('razon_social', { required: true })}
                      type="text"
                      disabled={!canEdit}
                      isInvalid={!!errors.razon_social}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="nombre_comercial">
                    <Form.Label>Nombre Comercial</Form.Label>
                    <Form.Control
                      {...register('nombre_comercial')}
                      type="text"
                      disabled={!canEdit}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group controlId="tipo_documento">
                    <Form.Label>Tipo Documento</Form.Label>
                    <Form.Select {...register('tipo_documento')} disabled={!canEdit}>
                      <option value="NIT">NIT</option>
                      <option value="CC">Cedula de Ciudadania</option>
                      <option value="CE">Cedula de Extranjeria</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="numero_documento">
                    <Form.Label>Numero Documento *</Form.Label>
                    <Form.Control
                      {...register('numero_documento', { required: true })}
                      type="text"
                      disabled={!canEdit}
                      isInvalid={!!errors.numero_documento}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group controlId="digito_verificacion">
                    <Form.Label>Digito Verif.</Form.Label>
                    <Form.Control
                      {...register('digito_verificacion')}
                      type="text"
                      maxLength={1}
                      disabled={!canEdit}
                    />
                  </Form.Group>
                </div>
              </div>

              <hr />
              <h6 className="text-muted small text-uppercase">Ubicacion</h6>

              <div className="row g-3">
                <div className="col-md-12">
                  <Form.Group controlId="direccion">
                    <Form.Label>Direccion *</Form.Label>
                    <Form.Control
                      {...register('direccion', { required: true })}
                      type="text"
                      disabled={!canEdit}
                      isInvalid={!!errors.direccion}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="ciudad">
                    <Form.Label>Ciudad *</Form.Label>
                    <Form.Control
                      {...register('ciudad', { required: true })}
                      type="text"
                      disabled={!canEdit}
                      isInvalid={!!errors.ciudad}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="departamento">
                    <Form.Label>Departamento</Form.Label>
                    <Form.Control
                      {...register('departamento')}
                      type="text"
                      disabled={!canEdit}
                    />
                  </Form.Group>
                </div>
              </div>

              <hr />
              <h6 className="text-muted small text-uppercase">Contacto</h6>

              <div className="row g-3">
                <div className="col-md-4">
                  <Form.Group controlId="telefono">
                    <Form.Label>Telefono</Form.Label>
                    <Form.Control {...register('telefono')} type="text" disabled={!canEdit} />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group controlId="celular">
                    <Form.Label>Celular</Form.Label>
                    <Form.Control {...register('celular')} type="text" disabled={!canEdit} />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group controlId="correo">
                    <Form.Label>Correo</Form.Label>
                    <Form.Control {...register('correo')} type="email" disabled={!canEdit} />
                  </Form.Group>
                </div>
                <div className="col-md-12">
                  <Form.Group controlId="sitio_web">
                    <Form.Label>Sitio Web</Form.Label>
                    <Form.Control {...register('sitio_web')} type="text" disabled={!canEdit} />
                  </Form.Group>
                </div>
              </div>

              <div className="text-center mt-4">
                <Button
                  type="submit"
                  variant="success"
                  className="text-white px-4"
                  disabled={!canEdit || submitting}
                >
                  <i className="fa-solid fa-floppy-disk me-2"></i>
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CContainer>
    </div>
  )
}

export default EmpresaPage

import { useEffect, useState, useContext, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Typography,
  Divider,
  Box,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import toast from 'react-hot-toast';
import AuthContext from '../../../context/AuthContext';
import {
  uploadLogoEmpresaService,
  deleteLogoEmpresaService,
} from '../../../services/empresas.services';

const TIPOS_DOCUMENTO = [
  { value: 'NIT', label: 'NIT' },
  { value: 'CC', label: 'Cedula de Ciudadania' },
  { value: 'CE', label: 'Cedula de Extranjeria' },
];

const TIPOS_PERSONA = [
  { value: 'juridica', label: 'Persona Juridica' },
  { value: 'natural', label: 'Persona Natural' },
];

const REGIMENES = [
  { value: 'comun', label: 'Regimen Comun' },
  { value: 'simplificado', label: 'Regimen Simplificado' },
  { value: 'gran_contribuyente', label: 'Gran Contribuyente' },
  { value: 'no_responsable_iva', label: 'No Responsable de IVA' },
];

const DEPARTAMENTOS_CO = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlantico', 'Bogota D.C.', 'Bolivar',
  'Boyaca', 'Caldas', 'Caqueta', 'Casanare', 'Cauca', 'Cesar', 'Choco',
  'Cordoba', 'Cundinamarca', 'Guainia', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Narino', 'Norte de Santander', 'Putumayo', 'Quindio',
  'Risaralda', 'San Andres y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupes', 'Vichada',
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';

export default function FormEmpresa({ open, onClose, onSubmit, empresa }) {
  const isEdit = !!empresa;
  const { token } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (open) {
      setLogoFile(null);
      if (isEdit) {
        setLogoPreview(empresa.logo ? `${API_BASE}${empresa.logo}` : null);
        reset({
          razon_social: empresa.razon_social || '',
          nombre_comercial: empresa.nombre_comercial || '',
          tipo_documento: empresa.tipo_documento || 'NIT',
          numero_documento: empresa.numero_documento || '',
          digito_verificacion: empresa.digito_verificacion || '',
          tipo_persona: empresa.tipo_persona || 'juridica',
          regimen_tributario: empresa.regimen_tributario || 'comun',
          actividad_economica: empresa.actividad_economica || '',
          direccion: empresa.direccion || '',
          ciudad: empresa.ciudad || '',
          departamento: empresa.departamento || '',
          codigo_postal: empresa.codigo_postal || '',
          telefono: empresa.telefono || '',
          celular: empresa.celular || '',
          correo: empresa.correo || '',
          sitio_web: empresa.sitio_web || '',
          representante_legal: empresa.representante_legal || '',
          documento_representante: empresa.documento_representante || '',
        });
      } else {
        setLogoPreview(null);
        reset({
          razon_social: '',
          nombre_comercial: '',
          tipo_documento: 'NIT',
          numero_documento: '',
          digito_verificacion: '',
          tipo_persona: 'juridica',
          regimen_tributario: 'comun',
          actividad_economica: '',
          direccion: '',
          ciudad: '',
          departamento: '',
          codigo_postal: '',
          telefono: '',
          celular: '',
          correo: '',
          sitio_web: '',
          representante_legal: '',
          documento_representante: '',
        });
      }
    }
  }, [open, empresa]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = async () => {
    if (isEdit && empresa.logo) {
      try {
        setUploadingLogo(true);
        await deleteLogoEmpresaService(token, empresa._id);
        toast.success('Logo eliminado');
      } catch {
        toast.error('Error al eliminar logo');
      } finally {
        setUploadingLogo(false);
      }
    }
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormSubmit = async (data) => {
    if (isEdit) {
      // Editar: subir logo directamente si hay uno nuevo
      if (logoFile) {
        try {
          setUploadingLogo(true);
          await uploadLogoEmpresaService(token, empresa._id, logoFile);
        } catch {
          toast.error('Error al subir logo');
        } finally {
          setUploadingLogo(false);
        }
      }
      await onSubmit(data);
    } else {
      // Crear: pasar logoFile al parent para que lo suba con el _id nuevo
      await onSubmit(data, logoFile);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <BusinessIcon color="primary" />
        <Typography variant="h6" sx={{ flex: 1 }}>
          {isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent dividers>
          {/* Logo */}
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>
            Logo de la Empresa
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar
              src={logoPreview || undefined}
              variant="rounded"
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'grey.100',
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <ImageIcon sx={{ fontSize: 32, color: 'grey.400' }} />
            </Avatar>
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileSelect}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={uploadingLogo ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                sx={{ mb: 0.5 }}
              >
                {logoPreview ? 'Cambiar Logo' : 'Subir Logo'}
              </Button>
              {logoPreview && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemoveLogo}
                  disabled={uploadingLogo}
                  sx={{ ml: 1, mb: 0.5 }}
                >
                  Eliminar
                </Button>
              )}
              <Typography variant="caption" display="block" color="text.secondary">
                JPG, PNG, WebP, GIF o SVG. Se convertira a WebP automaticamente.
              </Typography>
            </Box>
          </Box>
          {!isEdit && logoFile && (
            <Alert severity="info" sx={{ mb: 1 }} variant="outlined">
              El logo se subira automaticamente despues de crear la empresa.
            </Alert>
          )}

          <Divider sx={{ my: 2.5 }} />

          {/* Informacion Legal */}
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>
            Informacion Legal
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Razon Social *"
                {...register('razon_social', { required: 'Requerido' })}
                error={!!errors.razon_social}
                helperText={errors.razon_social?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Nombre Comercial"
                {...register('nombre_comercial')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Tipo Documento *"
                select
                defaultValue={empresa?.tipo_documento || 'NIT'}
                {...register('tipo_documento', { required: 'Requerido' })}
                error={!!errors.tipo_documento}
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Numero Documento *"
                {...register('numero_documento', { required: 'Requerido' })}
                error={!!errors.numero_documento}
                helperText={errors.numero_documento?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Digito Verificacion"
                {...register('digito_verificacion')}
                inputProps={{ maxLength: 1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Tipo Persona"
                select
                defaultValue={empresa?.tipo_persona || 'juridica'}
                {...register('tipo_persona')}
              >
                {TIPOS_PERSONA.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Regimen Tributario"
                select
                defaultValue={empresa?.regimen_tributario || 'comun'}
                {...register('regimen_tributario')}
              >
                {REGIMENES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Actividad Economica (CIIU)"
                {...register('actividad_economica')}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          {/* Ubicacion */}
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>
            Ubicacion
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Direccion *"
                {...register('direccion', { required: 'Requerido' })}
                error={!!errors.direccion}
                helperText={errors.direccion?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Ciudad *"
                {...register('ciudad', { required: 'Requerido' })}
                error={!!errors.ciudad}
                helperText={errors.ciudad?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Departamento"
                select
                defaultValue={empresa?.departamento || ''}
                {...register('departamento')}
              >
                <MenuItem value="">Seleccionar...</MenuItem>
                {DEPARTAMENTOS_CO.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Codigo Postal"
                {...register('codigo_postal')}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          {/* Contacto */}
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>
            Contacto
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Telefono"
                {...register('telefono')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Celular"
                {...register('celular')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Correo Electronico"
                type="email"
                {...register('correo')}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Sitio Web"
                {...register('sitio_web')}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          {/* Representante Legal */}
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>
            Representante Legal
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Nombre Representante Legal"
                {...register('representante_legal')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Documento Representante"
                {...register('documento_representante')}
              />
            </Grid>
          </Grid>

          {/* Super Usuario - solo al crear */}
          {!isEdit && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AdminPanelSettingsIcon fontSize="small" />
                Super Usuario de la Empresa
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Este usuario tendra acceso total a la empresa. Se creara con rol super_user.
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nombre *"
                    {...register('super_usuario.name', { required: 'Requerido' })}
                    error={!!errors.super_usuario?.name}
                    helperText={errors.super_usuario?.name?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Correo *"
                    type="email"
                    {...register('super_usuario.email', { required: 'Requerido' })}
                    error={!!errors.super_usuario?.email}
                    helperText={errors.super_usuario?.email?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contrasena *"
                    type={showPassword ? 'text' : 'password'}
                    {...register('super_usuario.password', {
                      required: 'Requerido',
                      minLength: { value: 6, message: 'Minimo 6 caracteres' },
                    })}
                    error={!!errors.super_usuario?.password}
                    helperText={errors.super_usuario?.password?.message}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || uploadingLogo}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Empresa'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

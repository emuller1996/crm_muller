import { useEffect, useState } from 'react';
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
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const ROLES = [
  { value: 'super_user', label: 'Super Usuario' },
  { value: 'admin', label: 'Administrador' },
  { value: 'usuario', label: 'Usuario' },
];

export default function FormUsuario({ open, onClose, onSubmit, usuario }) {
  const isEdit = !!usuario;
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (open) {
      if (isEdit) {
        reset({
          name: usuario.name || '',
          email: usuario.email || '',
          role_id: usuario.role_id || 'usuario',
          empresa_id: usuario.empresa_id || '',
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          role_id: 'usuario',
          empresa_id: '',
        });
      }
    }
  }, [open, usuario]);

  

  const handleFormSubmit = async (data) => {
    if (isEdit) {
      delete data.password;
    }
    await onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <PersonIcon color="primary" />
        <Typography variant="h6" sx={{ flex: 1 }}>
          {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Nombre *"
                {...register('name', { required: 'Requerido' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Correo Electronico *"
                type="email"
                {...register('email', { required: 'Requerido' })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            {!isEdit && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contrasena *"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Requerido',
                    minLength: { value: 6, message: 'Minimo 6 caracteres' },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Rol *"
                select
                defaultValue={usuario?.role_id || 'usuario'}
                {...register('role_id', { required: 'Requerido' })}
                error={!!errors.role_id}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

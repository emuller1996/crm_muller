import { useContext, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import LockResetIcon from '@mui/icons-material/LockReset';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import toast from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';
import {
  getAllUsuariosService,
  createUsuarioService,
  updateUsuarioService,
  changePasswordUsuarioService,
  disableUsuarioService,
  enableUsuarioService,
} from '../../services/usuarios.services';
import FormUsuario from './FormUsuario';
import ChangePasswordDialog from './ChangePasswordDialog';

const roleLabels = {
  super_user: { label: 'Super Usuario', color: 'error' },
  admin: { label: 'Admin', color: 'primary' },
  usuario: { label: 'Usuario', color: 'default' },
};

export default function UsuariosPage() {
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingToggle, setLoadingToggle] = useState(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await getAllUsuariosService(token);
      setUsuarios(res.data || []);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCreate = async (data) => {
    try {
      await createUsuarioService(token, data);
      toast.success('Usuario creado');
      setShowForm(false);
      setSelected(null);
      fetchUsuarios();
    } catch {
      toast.error('Error al crear usuario');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateUsuarioService(token, selected._id, data);
      toast.success('Usuario actualizado');
      setShowForm(false);
      setSelected(null);
      fetchUsuarios();
    } catch {
      toast.error('Error al actualizar usuario');
    }
  };

  const handleChangePassword = async (password) => {
    try {
      await changePasswordUsuarioService(token, selected._id, password);
      toast.success('Contrasena actualizada');
      setShowPassword(false);
      setSelected(null);
    } catch {
      toast.error('Error al cambiar contrasena');
    }
  };

  const handleToggleEstado = async () => {
    if (!selected) return;
    setLoadingToggle(true);
    try {
      if (selected.estado === 'activo') {
        await disableUsuarioService(token, selected._id);
        toast.success('Usuario deshabilitado');
      } else {
        await enableUsuarioService(token, selected._id);
        toast.success('Usuario habilitado');
      }
      setShowToggle(false);
      setSelected(null);
      fetchUsuarios();
    } catch {
      toast.error('Error al cambiar estado');
    } finally {
      setLoadingToggle(false);
    }
  };

  const filtered = usuarios.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role_id || '').toLowerCase().includes(q) ||
      (u.empresa?.razon_social || '').toLowerCase().includes(q)
    );
  });

  const getRoleChip = (roleId) => {
    const r = roleLabels[roleId] || { label: roleId, color: 'default' };
    return <Chip label={r.label} color={r.color} size="small" variant="outlined" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h5">Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setSelected(null); setShowForm(true); }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TextField
        size="small"
        placeholder="Buscar por nombre, correo, rol, empresa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: { xs: '100%', sm: 320 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {filtered.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No hay usuarios para mostrar
            </Typography>
          )}
          {filtered.map((usr) => (
            <Card key={usr._id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                    {usr.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600}>{usr.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{usr.email}</Typography>
                  </Box>
                  <Chip
                    label={usr.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    color={usr.estado === 'activo' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  {getRoleChip(usr.role_id)}
                  {usr.empresa && (
                    <Chip label={usr.empresa.razon_social} size="small" variant="outlined" />
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ px: 2, pt: 0 }}>
                <Button size="small" startIcon={<EditIcon />}
                  onClick={() => { setSelected(usr); setShowForm(true); }}
                >
                  Editar
                </Button>
                <Button size="small" startIcon={<LockResetIcon />}
                  onClick={() => { setSelected(usr); setShowPassword(true); }}
                >
                  Clave
                </Button>
                <Button
                  size="small"
                  color={usr.estado === 'activo' ? 'error' : 'success'}
                  startIcon={usr.estado === 'activo' ? <BlockIcon /> : <CheckCircleIcon />}
                  onClick={() => { setSelected(usr); setShowToggle(true); }}
                >
                  {usr.estado === 'activo' ? 'Deshabilitar' : 'Habilitar'}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, width: 50 }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Correo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Empresa</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No hay usuarios para mostrar</Typography>
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((usr) => (
                <TableRow
                  key={usr._id}
                  hover
                  sx={usr.estado !== 'activo' ? { opacity: 0.55 } : {}}
                >
                  <TableCell>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                      {usr.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{usr.name}</Typography>
                  </TableCell>
                  <TableCell>{usr.email}</TableCell>
                  <TableCell>{getRoleChip(usr.role_id)}</TableCell>
                  <TableCell>{usr.empresa?.razon_social || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={usr.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      color={usr.estado === 'activo' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => { setSelected(usr); setShowForm(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cambiar contrasena">
                      <IconButton size="small" onClick={() => { setSelected(usr); setShowPassword(true); }}>
                        <LockResetIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={usr.estado === 'activo' ? 'Deshabilitar' : 'Habilitar'}>
                      <IconButton
                        size="small"
                        color={usr.estado === 'activo' ? 'error' : 'success'}
                        onClick={() => { setSelected(usr); setShowToggle(true); }}
                      >
                        {usr.estado === 'activo' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form Crear / Editar */}
      <FormUsuario
        open={showForm}
        onClose={() => { setShowForm(false); setSelected(null); }}
        onSubmit={selected ? handleUpdate : handleCreate}
        usuario={selected}
      />

      {/* Cambiar Contrasena */}
      <ChangePasswordDialog
        open={showPassword}
        onClose={() => { setShowPassword(false); setSelected(null); }}
        onSubmit={handleChangePassword}
        usuario={selected}
      />

      {/* Confirmar Habilitar / Deshabilitar */}
      <Dialog open={showToggle} onClose={() => setShowToggle(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          {selected?.estado === 'activo' ? 'Deshabilitar Usuario' : 'Habilitar Usuario'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selected?.estado === 'activo'
              ? `¿Deshabilitar a "${selected?.name}"? No podra iniciar sesion.`
              : `¿Habilitar a "${selected?.name}"? Podra iniciar sesion nuevamente.`
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowToggle(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleToggleEstado}
            variant="contained"
            color={selected?.estado === 'activo' ? 'error' : 'success'}
            disabled={loadingToggle}
          >
            {loadingToggle ? 'Procesando...' : selected?.estado === 'activo' ? 'Deshabilitar' : 'Habilitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

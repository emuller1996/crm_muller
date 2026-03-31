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
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ImageIcon from '@mui/icons-material/Image';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';
import toast from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';
import {
  getAllEmpresasService,
  createEmpresaService,
  updateEmpresaService,
  disableEmpresaService,
  enableEmpresaService,
  uploadLogoEmpresaService,
} from '../../services/empresas.services';
import FormEmpresa from './components/FormEmpresa';
import DetalleEmpresa from './components/DetalleEmpresa';

export default function EmpresasPage() {
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingToggle, setLoadingToggle] = useState(false);

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const res = await getAllEmpresasService(token);
      setEmpresas(res.data || []);
    } catch {
      toast.error('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleCreate = async (data, logoFile) => {
    try {
      const res = await createEmpresaService(token, data);
      const newId = res.data?.empresa?._id;
      if (logoFile && newId) {
        await uploadLogoEmpresaService(token, newId, logoFile);
      }
      toast.success('Empresa creada');
      setShowForm(false);
      setSelected(null);
      fetchEmpresas();
    } catch {
      toast.error('Error al crear empresa');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateEmpresaService(token, selected._id, data);
      toast.success('Empresa actualizada');
      setShowForm(false);
      setSelected(null);
      fetchEmpresas();
    } catch {
      toast.error('Error al actualizar empresa');
    }
  };

  const handleToggleEstado = async () => {
    if (!selected) return;
    setLoadingToggle(true);
    try {
      if (selected.estado === 'activa') {
        await disableEmpresaService(token, selected._id);
        toast.success('Empresa deshabilitada');
      } else {
        await enableEmpresaService(token, selected._id);
        toast.success('Empresa habilitada');
      }
      setShowToggle(false);
      setSelected(null);
      fetchEmpresas();
    } catch {
      toast.error('Error al cambiar estado');
    } finally {
      setLoadingToggle(false);
    }
  };

  const filtered = empresas.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.razon_social || '').toLowerCase().includes(q) ||
      (e.nombre_comercial || '').toLowerCase().includes(q) ||
      (e.numero_documento || '').toLowerCase().includes(q) ||
      (e.ciudad || '').toLowerCase().includes(q)
    );
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h5">Empresas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setSelected(null); setShowForm(true); }}
        >
          Nueva Empresa
        </Button>
      </Box>

      {/* Busqueda */}
      <TextField
        size="small"
        placeholder="Buscar por razon social, NIT, ciudad..."
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
        /* Vista mobile: cards */
        <Stack spacing={1.5}>
          {filtered.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No hay empresas para mostrar
            </Typography>
          )}
          {filtered.map((emp) => (
            <Card key={emp._id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 0.5 }}>
                  <Avatar
                    src={emp.logo ? `${API_BASE}${emp.logo}` : undefined}
                    variant="rounded"
                    sx={{ width: 40, height: 40, bgcolor: 'grey.100', flexShrink: 0 }}
                  >
                    <ImageIcon sx={{ fontSize: 20, color: 'grey.400' }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {emp.razon_social}
                    </Typography>
                    {emp.nombre_comercial && (
                      <Typography variant="caption" color="text.secondary">
                        {emp.nombre_comercial}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={emp.estado === 'activa' ? 'Activa' : 'Inactiva'}
                    color={emp.estado === 'activa' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {emp.tipo_documento}: {emp.numero_documento}
                  {emp.digito_verificacion ? `-${emp.digito_verificacion}` : ''}
                </Typography>
                {emp.ciudad && (
                  <Typography variant="body2" color="text.secondary">
                    {[emp.ciudad, emp.departamento].filter(Boolean).join(', ')}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ px: 2, pt: 0 }}>
                <Button size="small" startIcon={<VisibilityIcon />}
                  onClick={() => { setSelected(emp); setShowDetalle(true); }}
                >
                  Ver
                </Button>
                <Button size="small" startIcon={<EditIcon />}
                  onClick={() => { setSelected(emp); setShowForm(true); }}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  color={emp.estado === 'activa' ? 'error' : 'success'}
                  startIcon={emp.estado === 'activa' ? <BlockIcon /> : <CheckCircleIcon />}
                  onClick={() => { setSelected(emp); setShowToggle(true); }}
                >
                  {emp.estado === 'activa' ? 'Deshabilitar' : 'Habilitar'}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      ) : (
        /* Vista desktop: tabla */
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, width: 60 }}>Logo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Razon Social</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>NIT / Documento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ciudad</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Telefono</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No hay empresas para mostrar</Typography>
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((emp) => (
                <TableRow
                  key={emp._id}
                  hover
                  sx={emp.estado !== 'activa' ? { opacity: 0.55 } : {}}
                >
                  <TableCell>
                    <Avatar
                      src={emp.logo ? `${API_BASE}${emp.logo}` : undefined}
                      variant="rounded"
                      sx={{ width: 36, height: 36, bgcolor: 'grey.100' }}
                    >
                      <ImageIcon sx={{ fontSize: 18, color: 'grey.400' }} />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {emp.razon_social}
                    </Typography>
                    {emp.nombre_comercial && (
                      <Typography variant="caption" color="text.secondary">
                        {emp.nombre_comercial}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {emp.tipo_documento}: {emp.numero_documento}
                    {emp.digito_verificacion ? `-${emp.digito_verificacion}` : ''}
                  </TableCell>
                  <TableCell>
                    {[emp.ciudad, emp.departamento].filter(Boolean).join(', ') || '-'}
                  </TableCell>
                  <TableCell>{emp.telefono || emp.celular || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.estado === 'activa' ? 'Activa' : 'Inactiva'}
                      color={emp.estado === 'activa' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => { setSelected(emp); setShowDetalle(true); }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => { setSelected(emp); setShowForm(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={emp.estado === 'activa' ? 'Deshabilitar' : 'Habilitar'}>
                      <IconButton
                        size="small"
                        color={emp.estado === 'activa' ? 'error' : 'success'}
                        onClick={() => { setSelected(emp); setShowToggle(true); }}
                      >
                        {emp.estado === 'activa' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
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
      <FormEmpresa
        open={showForm}
        onClose={() => { setShowForm(false); setSelected(null); }}
        onSubmit={selected ? handleUpdate : handleCreate}
        empresa={selected}
      />

      {/* Detalle */}
      <DetalleEmpresa
        open={showDetalle}
        onClose={() => { setShowDetalle(false); setSelected(null); }}
        empresa={selected}
      />

      {/* Confirmar Habilitar / Deshabilitar */}
      <Dialog open={showToggle} onClose={() => setShowToggle(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          {selected?.estado === 'activa' ? 'Deshabilitar Empresa' : 'Habilitar Empresa'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selected?.estado === 'activa'
              ? `¿Deshabilitar "${selected?.razon_social}"? La empresa quedara en estado inactivo.`
              : `¿Habilitar "${selected?.razon_social}"? La empresa volvera a estado activo.`
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
            color={selected?.estado === 'activa' ? 'error' : 'success'}
            disabled={loadingToggle}
          >
            {loadingToggle ? 'Procesando...' : selected?.estado === 'activa' ? 'Deshabilitar' : 'Habilitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

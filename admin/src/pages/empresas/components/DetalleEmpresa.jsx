import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  IconButton,
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useState } from 'react';
import BillingManager from './BillingManager';
import { formatBillingDate } from '../utils/subscriptionUtils';

function Field({ label, value }) {
  if (!value) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}

const regimenLabels = {
  comun: 'Regimen Comun',
  simplificado: 'Regimen Simplificado',
  gran_contribuyente: 'Gran Contribuyente',
  no_responsable_iva: 'No Responsable de IVA',
};

export default function DetalleEmpresa({ open, onClose, empresa }) {
  const [showBilling, setShowBilling] = useState(false);
  if (!empresa) return null;

  const dv = empresa.digito_verificacion ? `-${empresa.digito_verificacion}` : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <BusinessIcon color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" lineHeight={1.2}>
            {empresa.razon_social}
          </Typography>
          {empresa.nombre_comercial && (
            <Typography variant="caption" color="text.secondary">
              {empresa.nombre_comercial}
            </Typography>
          )}
        </Box>
        <Chip
          label={empresa.estado === 'activa' ? 'Activa' : 'Inactiva'}
          color={empresa.estado === 'activa' ? 'success' : 'default'}
          size="small"
        />
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Legal */}
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
          Informacion Legal
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <Field label="Tipo Documento" value={empresa.tipo_documento} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Field label="Numero" value={`${empresa.numero_documento}${dv}`} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Field
              label="Tipo Persona"
              value={empresa.tipo_persona === 'juridica' ? 'Persona Juridica' : 'Persona Natural'}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Field
              label="Regimen"
              value={regimenLabels[empresa.regimen_tributario] || empresa.regimen_tributario}
            />
          </Grid>
          {empresa.actividad_economica && (
            <Grid size={{ xs: 12 }}>
              <Field label="Actividad Economica (CIIU)" value={empresa.actividad_economica} />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Ubicacion */}
        {(empresa.direccion || empresa.ciudad) && (
          <>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PlaceIcon fontSize="small" /> Ubicacion
            </Typography>
            <Field label="Direccion" value={empresa.direccion} />
            <Field
              label="Ciudad / Departamento"
              value={[empresa.ciudad, empresa.departamento].filter(Boolean).join(', ')}
            />
            <Field label="Codigo Postal" value={empresa.codigo_postal} />
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Contacto */}
        {(empresa.telefono || empresa.celular || empresa.correo) && (
          <>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon fontSize="small" /> Contacto
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}>
                <Field label="Telefono" value={empresa.telefono} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Field label="Celular" value={empresa.celular} />
              </Grid>
              {empresa.correo && (
                <Grid size={{ xs: 12 }}>
                  <Field label="Correo" value={empresa.correo} />
                </Grid>
              )}
              {empresa.sitio_web && (
                <Grid size={{ xs: 12 }}>
                  <Field label="Sitio Web" value={empresa.sitio_web} />
                </Grid>
              )}
            </Grid>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Representante */}
        {empresa.representante_legal && (
          <>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon fontSize="small" /> Representante Legal
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}>
                <Field label="Nombre" value={empresa.representante_legal} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Field label="Documento" value={empresa.documento_representante} />
              </Grid>
            </Grid>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Facturación y Suscripción */}
        <Box>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CreditCardIcon fontSize="small" /> Facturación y Suscripción
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 8 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip 
                  label={empresa.subscription?.plan || 'Gratuito'} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={empresa.subscription?.status || 'activo'} 
                  size="small" 
                  color={empresa.subscription?.status === 'activo' ? 'success' : 'default'} 
                />
              </Box>
              <Field 
                label="Fecha de Vencimiento" 
                value={empresa.subscription?.endDate ? formatBillingDate(empresa.subscription.endDate) : 'N/A'} 
              />
            </Grid>
            <Grid size={{ xs: 4 }} sx={{ textAlign: 'right' }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setShowBilling(true)}
              >
                Gestionar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
      </DialogActions>

      <BillingManager
        open={showBilling}
        onClose={() => setShowBilling(false)}
        empresa={empresa}
      />
    </Dialog>
  );
}
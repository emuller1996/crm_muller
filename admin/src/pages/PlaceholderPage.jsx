import { useLocation } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

export default function PlaceholderPage() {
  const location = useLocation();
  const name = location.pathname.replace('/', '') || 'pagina';

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, textTransform: 'capitalize' }}>
        {name.replace('-', ' ')}
      </Typography>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          p: 6,
          textAlign: 'center',
        }}
      >
        <ConstructionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Pagina en construccion
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Esta seccion estara disponible proximamente.
        </Typography>
      </Paper>
    </Box>
  );
}

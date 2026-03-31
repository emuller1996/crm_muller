import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';

const stats = [
  { title: 'Productos', icon: InventoryIcon, color: '#1565c0' },
  { title: 'Facturas', icon: ReceiptIcon, color: '#2e7d32' },
  { title: 'Clientes', icon: PeopleIcon, color: '#ed6c02' },
  { title: 'Inventario', icon: DashboardIcon, color: '#9c27b0' },
];

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Grid size={{ xs: 6, md: 3 }} key={s.title}>
              <Card
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${s.color}14`,
                    }}
                  >
                    <Icon sx={{ color: s.color }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {s.title}
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      --
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

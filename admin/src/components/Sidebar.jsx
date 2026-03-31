import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  useTheme,
} from '@mui/material';
import navigation from '../utils/navigation';

const DRAWER_WIDTH = 260;

export default function Sidebar({ open, onClose, variant, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigate = (path) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%',borderRight:"solid #c2c2c2 1px" }}>
      {/* Logo / Brand */}
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            width: 38,
            height: 38,
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          CRM
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            CRM Admin
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Panel de Control
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {navigation.map((section) => (
          <Box key={section.title} sx={{ mb: 0.5 }}>
            <Typography
              variant="overline"
              sx={{
                px: 2.5,
                py: 1,
                display: 'block',
                color: 'text.secondary',
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              {section.title}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <ListItem key={item.path} disablePadding sx={{ px: 1.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        borderRadius: 1.5,
                        mb: 0.3,
                        py: 0.8,
                        px: 1.5,
                        bgcolor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? '#fff' : 'text.primary',
                        '&:hover': {
                          bgcolor: isActive ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive ? '#fff' : 'text.secondary',
                        }}
                      >
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* User info */}
      {user && (
        <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: '0.85rem' }}>
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.name || 'Usuario'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email || ''}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          boxShadow: variant === 'temporary' ? 8 : 'none',
          border: 'none',
          bgcolor: 'background.paper',
        },
      }}
    >
      {content}
    </Drawer>
  );
}

export { DRAWER_WIDTH };

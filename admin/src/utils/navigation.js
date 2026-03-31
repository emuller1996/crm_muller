import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

const navigation = [
  {
    title: 'Principal',
    items: [
      { text: 'Dashboard', icon: DashboardIcon, path: '/' },
    ],
  },
  {
    title: 'Configuracion',
    items: [
      { text: 'Empresas', icon: BusinessIcon, path: '/empresas' },
      { text: 'Usuarios', icon: PersonIcon, path: '/usuarios' },
    ],
  },
];

export default navigation;

import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import theme from './utils/theme';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import EmpresasPage from './pages/empresas/EmpresasPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-center" />
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/productos" element={<PlaceholderPage />} />
              <Route path="/categorias" element={<PlaceholderPage />} />
              <Route path="/inventario" element={<PlaceholderPage />} />
              <Route path="/facturas" element={<PlaceholderPage />} />
              <Route path="/facturas-compra" element={<PlaceholderPage />} />
              <Route path="/clientes" element={<PlaceholderPage />} />
              <Route path="/proveedores" element={<PlaceholderPage />} />
              <Route path="/caja" element={<PlaceholderPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/empresas" element={<EmpresasPage />} />
              <Route path="/perfil" element={<PlaceholderPage />} />
              <Route path="*" element={<PlaceholderPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

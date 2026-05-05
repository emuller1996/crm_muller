import { useState, useCallback, useContext } from 'react';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import {
  getAllEmpresasService,
  createEmpresaService,
  updateEmpresaService,
  disableEmpresaService,
  enableEmpresaService,
  uploadLogoEmpresaService,
  deleteLogoEmpresaService,
  getSubscriptionService,
  updateSubscriptionService,
} from '../services/empresas.services';

export function useEmpresas() {
  const { token } = useContext(AuthContext);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllEmpresasService(token);
      setEmpresas(res.data || []);
    } catch (error) {
      toast.error('Error al cargar empresas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createEmpresa = async (data, logoFile) => {
    setActionLoading(true);
    try {
      const res = await createEmpresaService(token, data);
      const newId = res.data?.empresa?._id;
      if (logoFile && newId) {
        await uploadLogoEmpresaService(token, newId, logoFile);
      }
      toast.success('Empresa creada');
      await fetchEmpresas();
      return res.data;
    } catch (error) {
      toast.error('Error al crear empresa');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const updateEmpresa = async (id, data, logoFile = null) => {
    setActionLoading(true);
    try {
      if (logoFile) {
        await uploadLogoEmpresaService(token, id, logoFile);
      }
      await updateEmpresaService(token, id, data);
      toast.success('Empresa actualizada');
      await fetchEmpresas();
    } catch (error) {
      toast.error('Error al actualizar empresa');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleEstado = async (empresa) => {
    setActionLoading(true);
    try {
      if (empresa.estado === 'activa') {
        await disableEmpresaService(token, empresa._id);
        toast.success('Empresa deshabilitada');
      } else {
        await enableEmpresaService(token, empresa._id);
        toast.success('Empresa habilitada');
      }
      await fetchEmpresas();
    } catch (error) {
      toast.error('Error al cambiar estado');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const uploadLogo = async (id, file) => {
    setActionLoading(true);
    try {
      await uploadLogoEmpresaService(token, id, file);
      toast.success('Logo actualizado');
      await fetchEmpresas();
    } catch (error) {
      toast.error('Error al subir logo');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const removeLogo = async (id) => {
    setActionLoading(true);
    try {
      await deleteLogoEmpresaService(token, id);
      toast.success('Logo eliminado');
      await fetchEmpresas();
    } catch (error) {
      toast.error('Error al eliminar logo');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const fetchSubscription = async (id) => {
    try {
      const res = await getSubscriptionService(token, id);
      return res.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  };

  const updateSubscription = async (id, subscriptionData) => {
    setActionLoading(true);
    try {
      await updateSubscriptionService(token, id, subscriptionData);
      toast.success('Suscripción actualizada');
      await fetchEmpresas();
    } catch (error) {
      toast.error('Error al actualizar suscripción');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    empresas,
    loading,
    actionLoading,
    fetchEmpresas,
    createEmpresa,
    updateEmpresa,
    toggleEstado,
    removeLogo,
    fetchSubscription,
    updateSubscription,
    uploadLogo
  };
}
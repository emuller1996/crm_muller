import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import { PLANS, STATUSES } from "../utils/subscriptionUtils";
import {
  updateSubscriptionService,
  getSubscriptionService,
} from "../../../services/empresas.services";
import AuthContext from "../../../context/AuthContext";

export default function BillingManager({
  open,
  onClose,
  company,
  onUpdateSuccess,
}) {
  const [formData, setFormData] = useState({
    plan: "",
    status: "",
    trialEndDate: "",
    nextBillingDate: "",
    paymentStatus: "paid",
  });
  const [loading, setLoading] = useState(false);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (company?._id) {
        setLoading(true);
        try {
          const subscription = await getSubscriptionService(
            token,
            company._id,
          ).then((res) => res.data);
          setFormData({
            plan: subscription.plan || PLANS.FREE,
            status: subscription.status || STATUSES.ACTIVE,
            trialEndDate: subscription.trialEndDate || "",
            nextBillingDate: subscription.nextBillingDate || "",
            paymentStatus: subscription.paymentStatus || "paid",
          });
        } catch (error) {
          console.error("Error fetching subscription:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSubscription();
  }, [company, token]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateSubscriptionService(token, company._id, formData);
      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Error updating subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gestión de Suscripción: {company?.nombre}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Plan de Suscripción</InputLabel>
                <Select
                  value={formData.plan}
                  label="Plan de Suscripción"
                  onChange={(e) => handleChange("plan", e.target.value)}
                >
                  {Object.values(PLANS).map((plan) => (
                    <MenuItem key={plan} value={plan}>
                      {plan}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado de Cuenta</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado de Cuenta"
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  {Object.values(STATUSES).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider>Fechas de Facturación</Divider>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fin Periodo Prueba"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.trialEndDate}
                onChange={(e) => handleChange("trialEndDate", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Próxima Facturación"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.nextBillingDate}
                onChange={(e) =>
                  handleChange("nextBillingDate", e.target.value)
                }
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado del Pago</InputLabel>
                <Select
                  value={formData.paymentStatus}
                  label="Estado del Pago"
                  onChange={(e) =>
                    handleChange("paymentStatus", e.target.value)
                  }
                >
                  <MenuItem value="paid">Pagado</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="overdue">En Mora</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { format, isAfter, parseISO } from 'date-fns';

export const PLANS = {
  FREE: 'Gratuito',
  BASIC: 'Básico',
  PROFESSIONAL: 'Profesional',
  ENTERPRISE: 'Enterprise',
};

export const STATUSES = {
  ACTIVE: 'activo',
  TRIAL: 'prueba',
  EXPIRED: 'expirado',
  CANCELLED: 'cancelado',
};

export const getStatusColor = (status) => {
  switch (status) {
    case STATUSES.ACTIVE: return 'success';
    case STATUSES.TRIAL: return 'info';
    case STATUSES.EXPIRED: return 'error';
    case STATUSES.CANCELLED: return 'warning';
    default: return 'default';
  }
};

export const isTrialExpired = (trialEndDate) => {
  if (!trialEndDate) return true;
  return !isAfter(new Date(), parseISO(trialEndDate));
};

export const formatBillingDate = (date) => {
  if (!date) return 'N/A';
  return format(parseISO(date), 'dd MMM yyyy');
};
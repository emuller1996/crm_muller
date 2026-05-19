/**
 * Notification Service
 *
 * Centraliza el envio de notificaciones por correo del sistema.
 * Cada flujo de negocio expone una funcion `send<Tipo>Email({...})`.
 *
 * Patron escalable:
 *   - El transporter SMTP se reusa desde mailService.js (no duplicar config)
 *   - Cada template HTML vive en MailUtils.js
 *   - Las funciones aqui solo arman el mailOptions y manejan errores
 *   - Para agregar una nueva notificacion: 1) template en MailUtils, 2) funcion sender aqui
 */

import { transporter } from "./mailService.js";
import { getHTMLActivityReminder } from "./MailUtils.js";

const DEFAULT_FROM = '"CRM Muller" <ecommerce-dev@esmuller.cloud>';

/**
 * Envia recordatorio al creador de una actividad pendiente.
 *
 * @param {Object} params
 * @param {Object} params.activity - documento de actividad con titulo, descripcion, fecha_inicio, fecha_fin, estado
 * @param {Object} params.user - documento de usuario con name y email
 * @returns {Promise<{sent: boolean, reason?: string, error?: string}>}
 */
export const sendActivityReminderEmail = async ({ activity, user }) => {
  if (!user?.email) {
    return { sent: false, reason: "user_without_email" };
  }
  if (!activity?.titulo) {
    return { sent: false, reason: "activity_without_title" };
  }

  try {
    await transporter.sendMail({
      from: DEFAULT_FROM,
      to: user.email,
      subject: `Recordatorio: Tienes una actividad pendiente - ${activity.titulo}`,
      html: getHTMLActivityReminder(activity, user),
    });
    return { sent: true };
  } catch (error) {
    console.log("[notif] activity reminder error:", error?.message);
    return { sent: false, error: error?.message };
  }
};

// ─────────────────────────────────────────────────────────────────
// Para futuras notificaciones, seguir el mismo patron:
//
// export const sendInvoiceDueEmail = async ({ invoice, user }) => {
//   if (!user?.email) return { sent: false, reason: "user_without_email" };
//   try {
//     await transporter.sendMail({
//       from: DEFAULT_FROM,
//       to: user.email,
//       subject: `Tu factura FV-${invoice.numero_factura} esta proxima a vencer`,
//       html: getHTMLInvoiceDue(invoice, user),
//     });
//     return { sent: true };
//   } catch (error) {
//     console.log("[notif] invoice due error:", error?.message);
//     return { sent: false, error: error?.message };
//   }
// };
//
// export const sendOrderStatusEmail = async ({ order, user }) => { ... }
// ─────────────────────────────────────────────────────────────────

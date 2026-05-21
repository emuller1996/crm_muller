// src/jobs/index.js
import { schedule } from 'node-cron';
import validatePendingActivities from './activities/activityReminders.js';

// La sintaxis '0 8,20 * * *' significa: "Todos los dias a las 8:00 AM y 8:00 PM"
// Formato: MINUTO HORA DIA_MES MES DIA_SEMANA
const initializeJobs = () => {
    console.log("🕒 Inicializando Cron Jobs...");

    // Recordatorios de actividades pendientes: 8 AM y 8 PM (hora del servidor)
    schedule('0 8,20 * * *', async () => {
        await validatePendingActivities();
    },{timezone:"America/Bogota"});

    console.log("✅ Cron Jobs registrados correctamente.");
};

export default initializeJobs;
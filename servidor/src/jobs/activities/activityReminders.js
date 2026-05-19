import { INDEX_ES_MAIN } from "../../config.js";
import { client } from "../../db.js";
import { getDocumentById } from "../../utils/index.js";
import { sendActivityReminderEmail } from "../../services/notificationService.js";

/**
 * Job: revisa actividades con estado "Pendiente" cuyo inicio cae en los proximos 3 dias
 * y envia un correo recordatorio al usuario que las creo (user_create_id).
 *
 * Se ejecuta segun el cron registrado en src/jobs/index.js.
 */
const validatePendingActivities = async () => {
  console.log(
    `[${new Date().toISOString()}] Verificando actividades pendientes...`,
  );

  try {
    const now = new Date();
    const from = new Date(now);
    const to = new Date(now);
    to.setDate(to.getDate() + 3);

    const result = await client.search({
      index: INDEX_ES_MAIN,
      size: 500,
      body: {
        query: {
          bool: {
            filter: [
              { term: { "type.keyword": "actividad" } },
              { term: { "estado.keyword": "Pendiente" } },
              {
                range: {
                  fecha_inicio: {
                    gte: from.toISOString(),
                    lte: to.toISOString(),
                  },
                },
              },
            ],
          },
        },
        sort: [{ fecha_inicio: { order: "asc" } }],
      },
    });

    const actividades = result.body.hits.hits.map((c) => ({
      ...c._source,
      _id: c._id,
    }));

    if (actividades.length === 0) {
      console.log("✅ No hay actividades pendientes para notificar.");
      return;
    }

    let enviados = 0;
    let fallidos = 0;
    let omitidos = 0;

    for (const actividad of actividades) {
      if (!actividad.user_create_id) {
        omitidos++;
        continue;
      }

      let user = null;
      try {
        user = await getDocumentById(actividad.user_create_id);
      } catch (err) {
        console.log(
          `⚠️  No se pudo cargar el usuario ${actividad.user_create_id}:`,
          err.message,
        );
        fallidos++;
        continue;
      }

      const sendResult = await sendActivityReminderEmail({
        activity: actividad,
        user,
      });

      if (sendResult.sent) {
        enviados++;
      } else if (sendResult.reason) {
        omitidos++;
      } else {
        fallidos++;
      }
    }

    console.log(
      `📧 Recordatorios: ${enviados} enviados, ${fallidos} fallidos, ${omitidos} omitidos (de ${actividades.length} actividades pendientes).`,
    );
  } catch (error) {
    console.error("❌ Error en el job de actividades pendientes:", error.message);
  }
};

export default validatePendingActivities;

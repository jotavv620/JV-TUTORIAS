import * as db from "../db";
import {
  sendEmail,
  type EmailPayload,
} from "./emailService";

export type ReminderEmailData = {
  disciplina: string;
  professor: string;
  tutor: string;
  data: string;
  horario: string;
  horarioTermino: string;
  instituicao: string;
};

type ReminderType = "24h" | "12h" | "1h";

/**
 * Creates HTML email template for professor reminder
 */
export function createProfessorReminderTemplate(
  data: ReminderEmailData,
  reminderType: ReminderType
): string {
  const dataFormatada = new Date(data.data).toLocaleDateString("pt-BR");
  
  const reminderMessages = {
    "24h": {
      title: "⏰ Lembrete: Tutoria Amanhã",
      message: "Esta é uma lembrança de que você tem uma tutoria agendada para <strong>amanhã</strong>.",
      urgency: "Por favor, confirme se você poderá participar.",
    },
    "12h": {
      title: "⏰ Lembrete: Tutoria em 12 Horas",
      message: "Você tem uma tutoria agendada para <strong>hoje à noite</strong>.",
      urgency: "Confirme sua presença se ainda não o fez.",
    },
    "1h": {
      title: "⏰ Lembrete Urgente: Tutoria em 1 Hora",
      message: "Sua tutoria começa em <strong>1 hora</strong>!",
      urgency: "Prepare-se para participar.",
    },
  };

  const reminder = reminderMessages[reminderType];
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff8c00; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .info-row { margin-bottom: 15px; }
          .label { font-weight: bold; color: #ff8c00; }
          .alert { background-color: #fff3cd; border-left: 4px solid #ff8c00; padding: 15px; margin: 20px 0; border-radius: 3px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          .urgency { font-weight: bold; color: #d9534f; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${reminder.title}</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${data.professor}</strong>,</p>
            
            <p>${reminder.message}</p>
            
            <div class="alert">
              <strong>⚠️ ${reminder.urgency}</strong>
            </div>
            
            <h3>Detalhes da Tutoria:</h3>
            
            <div class="info-row">
              <span class="label">Disciplina:</span> ${data.disciplina}
            </div>
            
            <div class="info-row">
              <span class="label">Data:</span> ${dataFormatada}
            </div>
            
            <div class="info-row">
              <span class="label">Horário:</span> ${data.horario} às ${data.horarioTermino}
            </div>
            
            <div class="info-row">
              <span class="label">Bolsista/Tutor:</span> ${data.tutor}
            </div>
            
            <div class="info-row">
              <span class="label">Local:</span> ${data.instituicao}
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Se não puder comparecer, avise o coordenador com antecedência.
            </p>
          </div>
          
          <div class="footer">
            <p>Sistema de Gerenciamento de Tutorias</p>
            <p>Não responda este email diretamente - use o sistema para confirmar</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Creates HTML email template for bolsista reminder
 */
export function createBolsistaReminderTemplate(
  data: ReminderEmailData,
  reminderType: ReminderType
): string {
  const dataFormatada = new Date(data.data).toLocaleDateString("pt-BR");
  
  const reminderMessages = {
    "24h": {
      title: "⏰ Lembrete: Tutoria Amanhã",
      message: "Você foi designado para uma tutoria amanhã. Prepare-se!",
      checklist: true,
    },
    "12h": {
      title: "⏰ Lembrete: Tutoria em 12 Horas",
      message: "Sua tutoria é hoje à noite. Verifique os últimos detalhes.",
      checklist: true,
    },
    "1h": {
      title: "⏰ Lembrete Urgente: Tutoria em 1 Hora",
      message: "Sua tutoria começa em 1 hora! Prepare-se agora.",
      checklist: false,
    },
  };

  const reminder = reminderMessages[reminderType];
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #22c55e; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .info-row { margin-bottom: 15px; }
          .label { font-weight: bold; color: #22c55e; }
          .alert { background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 3px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${reminder.title}</h1>
          </div>
          
          <div class="content">
            <p>Olá,</p>
            
            <p>${reminder.message}</p>
            
            ${reminder.checklist ? `
            <div class="alert">
              <strong>✓ Checklist:</strong>
              <ul>
                <li>Prepare o material da aula</li>
                <li>Chegue com 10 minutos de antecedência</li>
                <li>Faça o check-in no sistema no horário agendado</li>
              </ul>
            </div>
            ` : `
            <div class="alert">
              <strong>✓ Prepare-se agora:</strong>
              <ul>
                <li>Verifique o material da aula</li>
                <li>Teste sua conexão/local</li>
                <li>Faça o check-in quando começar</li>
              </ul>
            </div>
            `}
            
            <h3>Detalhes da Tutoria:</h3>
            
            <div class="info-row">
              <span class="label">Disciplina:</span> ${data.disciplina}
            </div>
            
            <div class="info-row">
              <span class="label">Professor:</span> ${data.professor}
            </div>
            
            <div class="info-row">
              <span class="label">Data:</span> ${dataFormatada}
            </div>
            
            <div class="info-row">
              <span class="label">Horário:</span> ${data.horario} às ${data.horarioTermino}
            </div>
            
            <div class="info-row">
              <span class="label">Local:</span> ${data.instituicao}
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Se não puder comparecer, avise o coordenador com antecedência.
            </p>
          </div>
          
          <div class="footer">
            <p>Sistema de Gerenciamento de Tutorias</p>
            <p>Não responda este email diretamente - use o sistema para confirmar</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends reminder email to professor
 */
export async function sendProfessorReminderEmail(
  professorEmail: string,
  data: ReminderEmailData,
  reminderType: ReminderType = "24h"
): Promise<boolean> {
  if (!professorEmail) {
    console.warn("[Reminder] Professor email not provided");
    return false;
  }

  const subjectMap = {
    "24h": `Lembrete: Tutoria de ${data.disciplina} amanhã`,
    "12h": `Lembrete: Tutoria de ${data.disciplina} em 12 horas`,
    "1h": `Lembrete Urgente: Tutoria de ${data.disciplina} em 1 hora`,
  };

  return sendEmail({
    to: professorEmail,
    subject: subjectMap[reminderType],
    html: createProfessorReminderTemplate(data, reminderType),
  });
}

/**
 * Sends reminder email to bolsista
 */
export async function sendBolsistaReminderEmail(
  bolsistaEmail: string,
  data: ReminderEmailData,
  reminderType: ReminderType = "24h"
): Promise<boolean> {
  if (!bolsistaEmail) {
    console.warn("[Reminder] Bolsista email not provided");
    return false;
  }

  const subjectMap = {
    "24h": `Lembrete: Tutoria de ${data.disciplina} amanhã`,
    "12h": `Lembrete: Tutoria de ${data.disciplina} em 12 horas`,
    "1h": `Lembrete Urgente: Tutoria de ${data.disciplina} em 1 hora`,
  };

  return sendEmail({
    to: bolsistaEmail,
    subject: subjectMap[reminderType],
    html: createBolsistaReminderTemplate(data, reminderType),
  });
}

/**
 * Processes reminders for tutorias at different intervals (24h, 12h, 1h)
 * Should be called by a scheduled job every hour
 */
export async function processPendingReminders(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  console.log("[Reminder] Starting reminder processing...");
  
  let processed = 0;
  let sent = 0;
  let errors = 0;

  try {
    const now = new Date();
    
    // Check for 24h reminders (tutorias happening tomorrow)
    await processRemindersForInterval("24h", now);
    
    // Check for 12h reminders (tutorias happening in 12 hours)
    await processRemindersForInterval("12h", now);
    
    // Check for 1h reminders (tutorias happening in 1 hour)
    await processRemindersForInterval("1h", now);

    console.log(`[Reminder] Processing complete`);
  } catch (error) {
    console.error("[Reminder] Error in reminder processing:", error);
  }

  return { processed, sent, errors };
}

/**
 * Process reminders for a specific time interval
 */
async function processRemindersForInterval(
  interval: ReminderType,
  now: Date
): Promise<void> {
  const tutoriasNeedingReminder = await db.getTutoriasNeedingReminderByInterval(interval, now);
  
  console.log(`[Reminder] Found ${tutoriasNeedingReminder.length} tutorias needing ${interval} reminders`);

  for (const tutoria of tutoriasNeedingReminder) {
    try {
      const reminderData: ReminderEmailData = {
        disciplina: tutoria.disciplina,
        professor: tutoria.professor,
        tutor: tutoria.bolsista,
        data: tutoria.data,
        horario: tutoria.horario,
        horarioTermino: tutoria.horarioTermino,
        instituicao: tutoria.instituicao,
      };

      let professorEmailSent = false;
      let bolsistaEmailSent = false;

      // Send professor reminder
      const professorData = await db.getProfessorByName(tutoria.professor);
      if (professorData?.email) {
        professorEmailSent = await sendProfessorReminderEmail(
          professorData.email,
          reminderData,
          interval
        );
        console.log(`[Reminder] Professor ${interval} email sent: ${professorEmailSent}`);
      }

      // Send bolsista reminder
      const bolsistaData = await db.getBolsistaByName(tutoria.bolsista);
      if (bolsistaData?.email) {
        bolsistaEmailSent = await sendBolsistaReminderEmail(
          bolsistaData.email,
          reminderData,
          interval
        );
        console.log(`[Reminder] Bolsista ${interval} email sent: ${bolsistaEmailSent}`);
      }

      // Mark as sent if at least one email was sent
      if (professorEmailSent || bolsistaEmailSent) {
        await db.markReminderSent(tutoria.id, interval);
        console.log(`[Reminder] ✅ ${interval} reminder sent for tutoria ${tutoria.id}`);
      }
    } catch (error) {
      console.error(`[Reminder] Error processing tutoria ${tutoria.id}:`, error);
    }
  }
}

/**
 * Starts the reminder scheduler
 * Runs every hour to check for reminders
 */
export function startReminderScheduler(): NodeJS.Timer {
  console.log("[Reminder] Starting reminder scheduler (runs every hour)");
  
  // Run immediately on startup
  processPendingReminders().catch(err => 
    console.error("[Reminder] Error in initial reminder check:", err)
  );

  // Then run every hour (3600000 ms)
  return setInterval(() => {
    processPendingReminders().catch(err =>
      console.error("[Reminder] Error in scheduled reminder check:", err)
    );
  }, 3600000); // 1 hour
}

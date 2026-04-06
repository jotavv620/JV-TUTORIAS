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

/**
 * Creates HTML email template for professor reminder (24h before)
 */
export function createProfessorReminderTemplate(data: ReminderEmailData): string {
  const dataFormatada = new Date(data.data).toLocaleDateString("pt-BR");
  
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header" style="display: flex; align-items: center; gap: 15px;">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663332323498/6856TeX4yea3eYHoBQTyWM/logo-responsivo_77778679.png" alt="UNEF Logo" style="height: 40px; width: auto;"><h1 style="margin: 0;">⏰ Lembrete: Tutoria Amanhã</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${data.professor}</strong>,</p>
            
            <p>Este é um lembrete de que você tem uma tutoria agendada para <strong>amanhã</strong>. Confirme sua presença!</p>
            
            <div class="alert">
              <strong>⚠️ Importante:</strong> Por favor, confirme se você poderá participar desta tutoria respondendo este email.
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
 * Creates HTML email template for bolsista reminder (24h before)
 */
export function createBolsistaReminderTemplate(data: ReminderEmailData): string {
  const dataFormatada = new Date(data.data).toLocaleDateString("pt-BR");
  
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
          <div class="header" style="display: flex; align-items: center; gap: 15px;">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663332323498/6856TeX4yea3eYHoBQTyWM/logo-responsivo_77778679.png" alt="UNEF Logo" style="height: 40px; width: auto;"><h1 style="margin: 0;">⏰ Lembrete: Tutoria Amanhã</h1>
          </div>
          
          <div class="content">
            <p>Olá,</p>
            
            <p>Este é um lembrete de que você tem uma tutoria agendada para <strong>amanhã</strong>. Prepare-se!</p>
            
            <div class="alert">
              <strong>✓ Checklist:</strong>
              <ul>
                <li>Prepare o material da aula</li>
                <li>Chegue com 10 minutos de antecedência</li>
                <li>Faça o check-in no sistema no horário agendado</li>
              </ul>
            </div>
            
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
 * Sends reminder email to professor 24h before tutoria
 */
export async function sendProfessorReminderEmail(
  professorEmail: string,
  data: ReminderEmailData
): Promise<boolean> {
  if (!professorEmail) {
    console.warn("[Reminder] Professor email not provided");
    return false;
  }

  return sendEmail({
    to: professorEmail,
    subject: `Lembrete: Tutoria de ${data.disciplina} amanhã`,
    html: createProfessorReminderTemplate(data),
  });
}

/**
 * Sends reminder email to bolsista 24h before tutoria
 */
export async function sendBolsistaReminderEmail(
  bolsistaEmail: string,
  data: ReminderEmailData
): Promise<boolean> {
  if (!bolsistaEmail) {
    console.warn("[Reminder] Bolsista email not provided");
    return false;
  }

  return sendEmail({
    to: bolsistaEmail,
    subject: `Lembrete: Tutoria de ${data.disciplina} amanhã`,
    html: createBolsistaReminderTemplate(data),
  });
}

/**
 * Processes reminders for tutorias happening in 24 hours
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
    // Get all tutorias that need reminders
    const tutoriasNeedingReminder = await db.getTutoriasNeedingReminder();
    
    console.log(`[Reminder] Found ${tutoriasNeedingReminder.length} tutorias needing reminders`);
    processed = tutoriasNeedingReminder.length;

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
            reminderData
          );
          console.log(`[Reminder] Professor email sent: ${professorEmailSent}`);
        }

        // Send bolsista reminder
        const bolsistaData = await db.getBolsistaByName(tutoria.bolsista);
        if (bolsistaData?.email) {
          bolsistaEmailSent = await sendBolsistaReminderEmail(
            bolsistaData.email,
            reminderData
          );
          console.log(`[Reminder] Bolsista email sent: ${bolsistaEmailSent}`);
        }

        // Mark as sent if at least one email was sent
        if (professorEmailSent || bolsistaEmailSent) {
          await db.markReminderSent(tutoria.id);
          sent++;
          console.log(`[Reminder] ✅ Reminder sent for tutoria ${tutoria.id}`);
        }
      } catch (error) {
        console.error(`[Reminder] Error processing tutoria ${tutoria.id}:`, error);
        errors++;
      }
    }

    console.log(
      `[Reminder] Processing complete - Processed: ${processed}, Sent: ${sent}, Errors: ${errors}`
    );
  } catch (error) {
    console.error("[Reminder] Error in reminder processing:", error);
  }

  return { processed, sent, errors };
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

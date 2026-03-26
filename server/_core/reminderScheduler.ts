import { eq, and, isNull } from "drizzle-orm";
import { tutorias, professores, bolsistas } from "../../drizzle/schema";
import { getDb } from "../db";
import {
  sendProfessorTutoriaEmail,
  sendBolsistaTutoriaEmail,
  TutoriaEmailData,
} from "./emailService";

/**
 * Checks for tutorias that need reminder emails (30 minutes before start)
 * Runs every minute to ensure timely reminders
 */
export async function checkAndSendReminders(): Promise<void> {
  try {
    const database = await getDb();
    if (!database) {
      console.warn("[Reminder] Database not available");
      return;
    }

    // Get current time
    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];

    // Get all scheduled tutorias for today
    const allTutorias = await database
      .select()
      .from(tutorias)
      .where(and(eq(tutorias.status, "scheduled"), eq(tutorias.data, todayDate)));

    console.log(`[Reminder] Found ${allTutorias.length} tutorias for today`);

    for (const tutoria of allTutorias) {
      try {
        // Parse tutoria date and time
        const tutoriaDateTime = new Date(
          `${tutoria.data}T${tutoria.horario}:00`
        );

        // Check if tutoria is within 30 minutes
        const timeDiff = tutoriaDateTime.getTime() - now.getTime();
        const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

        // Send reminder if within 30 minutes and hasn't been sent yet
        if (
          minutesUntilStart > 0 &&
          minutesUntilStart <= 30 &&
          !tutoria.reminder_sent
        ) {
          console.log(
            `[Reminder] Sending reminder for tutoria ${tutoria.id} (starts in ${minutesUntilStart} minutes)`
          );

          const emailData: TutoriaEmailData = {
            disciplina: tutoria.disciplina,
            professor: tutoria.professor,
            tutor: tutoria.tutor,
            data: tutoria.data,
            horario: tutoria.horario,
            horarioTermino: tutoria.horarioTermino,
            instituicao: tutoria.instituicao,
          };

          // Get professor email
          const professorData = await database
            .select()
            .from(professores)
            .where(eq(professores.nome, tutoria.professor))
            .limit(1);

          // Get bolsista email
          const bolsistaData = await database
            .select()
            .from(bolsistas)
            .where(eq(bolsistas.nome, tutoria.tutor))
            .limit(1);

          // Send reminders
          let reminderSent = false;

          if (professorData.length > 0 && professorData[0].email) {
            const professorSent = await sendProfessorReminderEmail(
              professorData[0].email,
              emailData,
              minutesUntilStart
            );
            reminderSent = reminderSent || professorSent;
          }

          if (bolsistaData.length > 0 && bolsistaData[0].email) {
            const bolsistaSent = await sendBolsistaReminderEmail(
              bolsistaData[0].email,
              emailData,
              minutesUntilStart
            );
            reminderSent = reminderSent || bolsistaSent;
          }

          // Mark reminder as sent
          if (reminderSent) {
            await database
              .update(tutorias)
              .set({ reminder_sent: true })
              .where(eq(tutorias.id, tutoria.id));
          }
        }
      } catch (error) {
        console.error(
          `[Reminder] Error processing tutoria ${tutoria.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("[Reminder] Error checking reminders:", error);
  }
}

/**
 * Sends reminder email to professor
 */
async function sendProfessorReminderEmail(
  email: string,
  data: TutoriaEmailData,
  minutesUntilStart: number
): Promise<boolean> {
  const html = createProfessorReminderTemplate(data, minutesUntilStart);
  return sendEmail({
    to: email,
    subject: `Lembrete: Tutoria em ${minutesUntilStart} minutos - ${data.disciplina}`,
    html,
  });
}

/**
 * Sends reminder email to bolsista
 */
async function sendBolsistaReminderEmail(
  email: string,
  data: TutoriaEmailData,
  minutesUntilStart: number
): Promise<boolean> {
  const html = createBolsistaReminderTemplate(data, minutesUntilStart);
  return sendEmail({
    to: email,
    subject: `Lembrete: Tutoria em ${minutesUntilStart} minutos - ${data.disciplina}`,
    html,
  });
}

/**
 * Creates HTML reminder email for professor
 */
function createProfessorReminderTemplate(
  data: TutoriaEmailData,
  minutesUntilStart: number
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff6b35; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .alert { background-color: #fff3cd; border-left: 4px solid #ff6b35; padding: 15px; margin-bottom: 20px; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .info-row { margin-bottom: 15px; }
          .label { font-weight: bold; color: #ff6b35; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Lembrete de Tutoria</h1>
          </div>
          
          <div class="alert">
            <strong>Atenção:</strong> Sua tutoria começa em <strong>${minutesUntilStart} minutos</strong>!
          </div>
          
          <div class="content">
            <p>Olá <strong>${data.professor}</strong>,</p>
            
            <p>Esta é uma lembrança de que você tem uma tutoria agendada para começar em breve:</p>
            
            <div class="info-row">
              <span class="label">Disciplina:</span> ${data.disciplina}
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
            
            <p style="margin-top: 30px; padding: 15px; background-color: #e8f5e9; border-radius: 5px;">
              Por favor, prepare-se e esteja pronto para começar a tutoria no horário agendado.
            </p>
          </div>
          
          <div class="footer">
            <p>Sistema de Gerenciamento de Tutorias</p>
            <p>Não responda este email</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Creates HTML reminder email for bolsista
 */
function createBolsistaReminderTemplate(
  data: TutoriaEmailData,
  minutesUntilStart: number
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #22c55e; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .alert { background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin-bottom: 20px; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .info-row { margin-bottom: 15px; }
          .label { font-weight: bold; color: #22c55e; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Lembrete de Tutoria</h1>
          </div>
          
          <div class="alert">
            <strong>Atenção:</strong> Sua tutoria começa em <strong>${minutesUntilStart} minutos</strong>!
          </div>
          
          <div class="content">
            <p>Olá,</p>
            
            <p>Esta é uma lembrança de que você tem uma tutoria agendada para começar em breve:</p>
            
            <div class="info-row">
              <span class="label">Disciplina:</span> ${data.disciplina}
            </div>
            
            <div class="info-row">
              <span class="label">Professor:</span> ${data.professor}
            </div>
            
            <div class="info-row">
              <span class="label">Horário:</span> ${data.horario} às ${data.horarioTermino}
            </div>
            
            <div class="info-row">
              <span class="label">Local:</span> ${data.instituicao}
            </div>
            
            <p style="margin-top: 30px; padding: 15px; background-color: #dcfce7; border-radius: 5px;">
              <strong>Importante:</strong> Não esqueça de fazer o <strong>check-in</strong> quando chegar no local da tutoria!
            </p>
          </div>
          
          <div class="footer">
            <p>Sistema de Gerenciamento de Tutorias</p>
            <p>Não responda este email</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generic email sending function
 */
async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const forgeUrl = process.env.BUILT_IN_FORGE_API_URL;
    const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

    if (!forgeUrl || !forgeKey) {
      console.warn("[Reminder] Email service not configured");
      return false;
    }

    const response = await fetch(
      new URL("webdevtoken.v1.WebDevService/SendEmail", forgeUrl).toString(),
      {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${forgeKey}`,
          "content-type": "application/json",
          "connect-protocol-version": "1",
        },
        body: JSON.stringify({
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.html,
        }),
      }
    );

    if (!response.ok) {
      console.warn(
        `[Reminder] Failed to send email to ${payload.to} (${response.status})`
      );
      return false;
    }

    console.log(`[Reminder] Reminder email sent to ${payload.to}`);
    return true;
  } catch (error) {
    console.warn(`[Reminder] Error sending email to ${payload.to}:`, error);
    return false;
  }
}

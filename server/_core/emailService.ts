import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type TutoriaEmailData = {
  disciplina: string;
  professor: string;
  tutor: string;
  data: string;
  horario: string;
  horarioTermino: string;
  instituicao: string;
};

/**
 * Sends an email using the Manus Email Service
 * Returns true if successful, false if failed
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Email] Email service not configured");
    return false;
  }

  try {
    const endpoint = new URL(
      "webdevtoken.v1.WebDevService/SendEmail",
      ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`
    ).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || payload.html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email to ${payload.to} (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log(`[Email] Email sent successfully to ${payload.to}`);
    return true;
  } catch (error) {
    console.warn(`[Email] Error sending email to ${payload.to}:`, error);
    return false;
  }
}

/**
 * Creates HTML email template for professor notification
 */
export function createProfessorEmailTemplate(data: TutoriaEmailData): string {
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
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nova Tutoria Agendada</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${data.professor}</strong>,</p>
            
            <p>Uma nova tutoria foi agendada para você. Aqui estão os detalhes:</p>
            
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
            
            <p style="margin-top: 30px;">Qualquer dúvida, entre em contato com o coordenador.</p>
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
 * Creates HTML email template for bolsista access code
 */
export function createBolsistaAccessCodeTemplate(nome: string, accessCode: string): string {
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
          .code-box { background-color: #fff; border: 2px solid #ff8c00; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
          .code { font-family: monospace; font-size: 18px; font-weight: bold; color: #ff8c00; word-break: break-all; }
          .label { font-weight: bold; color: #ff8c00; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo ao Tutoria Manager!</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${nome}</strong>,</p>
            
            <p>Você foi cadastrado como bolsista no sistema Tutoria Manager. Abaixo está seu código de acesso único:</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">Seu Código de Acesso:</p>
              <div class="code">${accessCode}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Este código é pessoal e intransferível. Não o compartilhe com ninguém.
            </div>
            
            <p><strong>Como fazer login:</strong></p>
            <ol>
              <li>Acesse o sistema Tutoria Manager</li>
              <li>Cole o código acima no campo "Código de Acesso"</li>
              <li>Clique em "Acessar"</li>
            </ol>
            
            <p style="margin-top: 30px;">Se tiver dúvidas, entre em contato com o administrador do sistema.</p>
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

export async function sendBolsistaAccessCodeEmail(email: string, nome: string, accessCode: string): Promise<boolean> {
  const html = createBolsistaAccessCodeTemplate(nome, accessCode);
  return sendEmail({
    to: email,
    subject: `Seu Código de Acesso - Tutoria Manager`,
    html,
    text: `Bem-vindo ao Tutoria Manager!\n\nSeu código de acesso: ${accessCode}\n\nNão compartilhe este código com ninguém.`,
  });
}

/**
 * Creates HTML email template for bolsista notification
 */
export function createBolsistaEmailTemplate(data: TutoriaEmailData): string {
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
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tutoria Agendada</h1>
          </div>
          
          <div class="content">
            <p>Olá,</p>
            
            <p>Você foi designado para uma nova tutoria. Confira os detalhes abaixo:</p>
            
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
            
            <p style="margin-top: 30px; background-color: #e8f5e9; padding: 15px; border-radius: 5px;">
              <strong>Importante:</strong> Lembre-se de fazer check-in no sistema no horário agendado!
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
 * Sends email to professor about new tutoria
 */
export async function sendProfessorTutoriaEmail(
  professorEmail: string,
  data: TutoriaEmailData
): Promise<boolean> {
  if (!professorEmail) {
    console.warn("[Email] Professor email not provided");
    return false;
  }

  return sendEmail({
    to: professorEmail,
    subject: `Nova Tutoria Agendada - ${data.disciplina}`,
    html: createProfessorEmailTemplate(data),
  });
}

/**
 * Sends email to bolsista about new tutoria
 */
export async function sendBolsistaTutoriaEmail(
  bolsistaEmail: string,
  data: TutoriaEmailData
): Promise<boolean> {
  if (!bolsistaEmail) {
    console.warn("[Email] Bolsista email not provided");
    return false;
  }

  return sendEmail({
    to: bolsistaEmail,
    subject: `Tutoria Agendada - ${data.disciplina}`,
    html: createBolsistaEmailTemplate(data),
  });
}

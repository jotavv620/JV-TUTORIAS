import crypto from "crypto";
import { getDb } from "../db";
import { passwordResetTokens, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./emailService";

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Request password reset - creates token and sends email
 */
export async function requestPasswordReset(email: string): Promise<boolean> {
  try {
    // Find user by email
    const db = await getDb();
    if (!db) {
      console.error("[Password Reset] Database not available");
      return false;
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || user.length === 0) {
      // Don't reveal if email exists - security best practice
      return true;
    }

    const userId = user[0].id;

    // Generate reset token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await db
      .insert(passwordResetTokens)
      .values({
        userId,
        token,
        expiresAt,
        used: false,
      });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: "Recuperar Senha - Tutoria Manager",
      html: `
        <h2>Recuperar Senha</h2>
        <p>Você solicitou a recuperação de sua senha. Clique no link abaixo para resetar sua senha:</p>
        <a href="${resetUrl}" style="background-color: #ff8c00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Resetar Senha
        </a>
        <p>Este link expira em 24 horas.</p>
        <p>Se você não solicitou isso, ignore este email.</p>
      `,
    });

    return true;
  } catch (error) {
    console.error("[Password Reset] Error requesting reset:", error);
    return false;
  }
}

/**
 * Verify reset token and reset password
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find valid reset token
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    const resetToken = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    if (!resetToken || resetToken.length === 0) {
      return { success: false, error: "Token inválido ou expirado" };
    }

    const tokenRecord = resetToken[0];

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      return { success: false, error: "Token expirado" };
    }

    // Check if token was already used
    if (tokenRecord.used) {
      return { success: false, error: "Token já foi utilizado" };
    }

    // Hash new password
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, tokenRecord.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    return { success: true };
  } catch (error) {
    console.error("[Password Reset] Error resetting password:", error);
    return { success: false, error: "Erro ao resetar senha" };
  }
}

/**
 * Verify if a reset token is valid
 */
export async function verifyResetToken(token: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      return false;
    }

    const resetToken = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    if (!resetToken || resetToken.length === 0) {
      return false;
    }

    const tokenRecord = resetToken[0];

    // Check if token is expired or already used
    if (new Date() > tokenRecord.expiresAt || tokenRecord.used) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Password Reset] Error verifying token:", error);
    return false;
  }
}

import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (to: string, resetCode: string) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'no-reply@lead-management.local';

  if (!host || !user || !pass) {
    console.info(`[password-reset] SMTP not configured. Reset code for ${to}: ${resetCode}`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject: 'Lead Management password reset code',
    text: `Your password reset code is: ${resetCode}\n\nUse it on the sign-in page to create a new password.`,
    html: `<p>Your password reset code is: <strong>${resetCode}</strong></p><p>Use it on the sign-in page to create a new password.</p>`,
  });

  return true;
};

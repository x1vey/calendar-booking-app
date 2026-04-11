import nodemailer from 'nodemailer';

export async function sendSmtpEmail({
  to,
  subject,
  html,
  smtpUser,
  smtpPass,
}: {
  to: string;
  subject: string;
  html: string;
  smtpUser: string;
  smtpPass: string;
}) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const info = await transporter.sendMail({
    from: smtpUser,
    to,
    subject,
    html,
  });

  return info;
}

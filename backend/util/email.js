import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"R-Studio" <${process.env.SENDER_EMAIL}>`,
    to: to,
    subject: subject,
    html: html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log(`Email sent successfully to ${to}`);
    return info;
  } catch (error) {
    // console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
};
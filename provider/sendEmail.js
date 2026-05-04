const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.SMTS_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async (to, from, subject, message) => {
  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: message,
  };
  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

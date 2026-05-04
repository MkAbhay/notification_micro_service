const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

async function sendSms(to, message, template_id) {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to: to,
    });

    const logMessage = `Twilio API Response for ${to} with template '${template_id}'`;

    console.log(logMessage, {
      sid: response.sid,
      status: response.status,
    });

    return response.sid;
  } catch (err) {
    console.error("Twilio Error:", err.message);
    throw new Error(`Failed to send SMS to ${to}`);
  }
}

module.exports = sendSms;

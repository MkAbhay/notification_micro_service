const Ajv = require("ajv");
const dayjs = require("dayjs");
const { sendEmail, sendSms } = require("./provider");
const { query, bulkInsert } = require("./db");

const ajv_validator = (body, schema) => {
  const ajv = new Ajv({ allErrors: true, strict: false });

  const send_body_validate = ajv.compile(schema);
  const valid = send_body_validate(body);
  if (!valid) {
    const messages = send_body_validate.errors.map((err) =>
      `${err.instancePath || ""} ${err.message}`.trim(),
    );
    return {
      status: false,
      message: messages,
    };
  }

  return { status: true, message: [] };
};

const send_body_validation = (body) => {
  // schema
  const send_body_schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: { type: "array" },
      to: { type: "array" },
      subject: { type: "string" },
      body: { type: "string" },
      schedule_at: { type: ["string", "null"] },
    },
    required: ["type", "to", "body"],
    additionalProperties: true,
  };

  return ajv_validator(body, send_body_schema);
};

const bulk_send_body_validation = (body) => {
  // schema
  const send_body_schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      bulk: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "array" },
            to: { type: "array" },
            subject: { type: "string" },
            body: { type: "string" },
            schedule_at: { type: ["string", "null"] },
          },
          required: ["type", "to", "body"],
        },
      },
    },
    required: ["bulk"],
    additionalProperties: true,
  };

  return ajv_validator(body, send_body_schema);
};

const notification_insert_array = (body) => {
  let notitfication_body = [];
  // loop on type [array] (type of notification, ex. sms, email, etc)
  for (const type of body.type) {
    // loop on to [array] (email_id to send, ex. foo.@bar.com)
    for (const to of body.to) {
      notitfication_body.push([
        to,
        type === "email" ? process.env.EMAIL_FROM : process.env.SENDER_ID,
        body.subject,
        body.body,
        formatForMySQLTimestamp(body.schedule_at),
        type,
      ]);
    }
  }

  return notitfication_body;
};

function formatForMySQLTimestamp(value) {
  if (!value) return null;

  const d = dayjs(value);
  if (!d.isValid()) return null;

  return d.format("YYYY-MM-DD HH:mm:ss");
}

const send_service = async (body) => {
  try {
    // notification body constructor
    const notitfication_body = notification_insert_array(body);

    // bulk insert query
    await bulkInsert(
      "notification",
      "`to`, `from`, subject, body, schedule_at, type",
      notitfication_body,
    );
    return {
      status: true,
      code: 200,
      message: "successfully",
      data: { body: body },
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      code: 500,
      message: error.message || "sendService error",
      data: { error: error },
    };
  }
};

const send = async (noti) => {
  try {
    switch (noti.type) {
      case "email":
        await sendEmail(noti.to, noti.from, noti.subject, noti.body);
        break;
      case "sms":
        await sendSms(noti.to, noti.body, noti.template_id);
        break;
      default:
        throw new Error(`Unsupported notification type: ${noti.type}`);
    }

    // mark send
    await query(
      `UPDATE notification SET is_sent = 1, sent_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [noti.id],
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  ajv_validator,
  send_body_validation,
  bulk_send_body_validation,
  send_service,
  notification_insert_array,
  send,
  formatForMySQLTimestamp,
};

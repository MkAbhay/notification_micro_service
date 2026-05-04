const express = require("express");
const app = express();
const { query, bulkInsert, checkConnection } = require("./db");
const {
  send_body_validation,
  bulk_send_body_validation,
  send_service,
} = require("./helper");
const { demon } = require("./process");

// check connection
checkConnection();

// attaching demon (infinate while loop)
demon();

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// apis for health check
app.get("/api/health", (req, res) => {
  return res
    .status(200)
    .json({ status: true, code: 200, message: "server running", data: {} });
});

// api send notification
app.post("/api/send", async (req, res) => {
  try {
    const body = req.body;

    // body validation
    const body_validation_result = send_body_validation(body);
    if (!body_validation_result.status) {
      return res.status(400).json({
        status: true,
        code: 400,
        message: "Body validation fails",
        data: {
          details: body_validation_result.message,
        },
      });
    }

    // send service
    const send_service_result = await send_service(body);

    // response
    return res.status(200).json({
      status: true,
      message: `successfully`,
      code: 200,
      data: { response: send_service_result },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: true,
      code: 500,
      message: error.message || "Internal server error",
      data: {},
    });
  }
});

//api bulk send notification
app.post("/api/bulk_send", async (req, res) => {
  try {
    const body = req.body;
    let errors = [];
    let success = [];

    // body validation
    const body_validation_result = bulk_send_body_validation(body);
    if (!body_validation_result.status) {
      return res.status(400).json({
        status: true,
        code: 400,
        message: "Body validation fails",
        data: {
          details: body_validation_result.message,
        },
      });
    }

    // loop send_service
    for (let object of body.bulk) {
      const send_service_result = await send_service(object);
      if (send_service_result.status) {
        success.push(send_service_result);
      } else {
        errors.push(send_service_result);
      }
    }

    // response
    return res.status(200).json({
      status: true,
      message: `successfully`,
      code: 200,
      data: {
        success,
        success_count: success.length,
        errors,
        errors_count: errors.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: true,
      code: 500,
      message: error.message || "Internal server error",
      data: {},
    });
  }
});

// not found
app.use((req, res) => {
  return res.status(404).json({
    status: true,
    code: 404,
    message: "Path not found",
    data: {},
  });
});

// http server
const PORT = process.env.PORT || 3501;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

module.exports = {
  app,
};

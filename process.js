const { query } = require("./db");
const { send } = require("./helper");
let running = true;

process.on("SIGINT", () => {
  console.log("Stopping demon...");
  running = false;
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function demon() {
  while (running) {
    try {
      // fetch all notification where is_sent 0 and schedule_time < now() or null
      const [notification_rows] = await query(
        `SELECT * FROM notification WHERE is_sent = false AND (schedule_at is null OR schedule_at < CURRENT_TIMESTAMP) and is_deleted = 0;`
      );

      // send
      for (let notification of notification_rows) {
        await send(notification);
      }
    } catch (error) {
      console.error("Error in loop", error);
    }
    await sleep(10000); // wait 10 seconds
  }
}

module.exports = {
  demon,
  running,
};

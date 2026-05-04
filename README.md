# Notification Microservice

A Node.js-based microservice for sending notifications (email and SMS) with scheduling capabilities.

## Features

- Send single or bulk notifications
- Support for email and SMS notifications
- Scheduled notifications
- Background processing with daemon
- MySQL database storage
- RESTful API endpoints

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:
   - Create a MySQL database
   - Run the SQL script in `script.sql` to create the notification table

4. Create a `.env` file with the following environment variables:

   ```
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name

   EMAIL_HOST=your_email_smtp_host
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   EMAIL_FROM=your_from_email

   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   SENDER_ID=your_sender_id

   PORT=3501
   ```

## Usage

### Starting the Service

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The service will start on port 3501 (or the port specified in PORT environment variable).

### API Endpoints

#### Health Check

- **GET** `/api/health`
- Returns server status

#### Send Single Notification

- **POST** `/api/send`
- Body:
  ```json
  {
    "type": ["email", "sms"],
    "to": ["recipient@example.com", "+1234567890"],
    "subject": "Notification Subject",
    "body": "Notification body",
    "schedule_at": "2024-01-01 12:00:00" // optional
  }
  ```

#### Send Bulk Notifications

- **POST** `/api/bulk_send`
- Body:
  ```json
  {
    "bulk": [
      {
        "type": ["email"],
        "to": ["user1@example.com"],
        "subject": "Subject 1",
        "body": "Body 1"
      },
      {
        "type": ["sms"],
        "to": ["+1234567890"],
        "body": "SMS Body"
      }
    ]
  }
  ```

### Notification Types

- **email**: Sends email using nodemailer
- **sms**: Sends SMS using Twilio

### Scheduling

Notifications can be scheduled for future delivery by including `schedule_at` in ISO format or MySQL timestamp format. If not provided, notifications are sent immediately.

## Database Schema

The service uses a `notification` table with the following structure:

- `id`: Primary key
- `to`: Recipient
- `from`: Sender
- `subject`: Email subject
- `body`: Message body
- `schedule_at`: Scheduled time
- `is_sent`: Sent status
- `sent_at`: Sent timestamp
- `type`: Notification type (email/sms)
- `created_at`, `updated_at`: Timestamps
- `is_deleted`: Soft delete flag

## Dependencies

- **express**: Web framework
- **mysql2**: MySQL client
- **nodemailer**: Email sending
- **twilio**: SMS sending
- **ajv**: JSON schema validation
- **dayjs**: Date handling
- **dotenv**: Environment variables

## Development

- **nodemon**: Development server with auto-reload

## License

ISC

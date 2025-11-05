from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi import BackgroundTasks
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME="your_email@gmail.com",
    MAIL_PASSWORD="your_app_password",  # use app password, not your login password
    MAIL_FROM="your_email@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="TownDrop Support",
    MAIL_STARTTLS=True,     # ✅ new field name
    MAIL_SSL_TLS=False,     # ✅ new field name
    USE_CREDENTIALS=True,
)

fastmail = FastMail(conf)

async def send_verification_email(email_to: EmailStr, name: str):
    subject = "Welcome to TownDrop 🎉"
    body = f"""
    <h2>Hello {name},</h2>
    <p>Thank you for registering with <b>TownDrop</b>!</p>
    <p>Your account has been successfully created.</p>
    <br/>
    <p>Best regards,<br>TownDrop Team</p>
    """

    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype="html",
    )

    await fastmail.send_message(message)

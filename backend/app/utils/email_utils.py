import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr

# Load variables from .env
load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")

if not MAIL_USERNAME or not MAIL_PASSWORD:
    print("❌ EMAIL CONFIG MISSING: Please add MAIL_USERNAME and MAIL_PASSWORD to .env")
else:
    print(f"✔ Email config loaded for {MAIL_USERNAME}")

# Email server configuration
conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,       # Gmail App Password
    MAIL_FROM=MAIL_USERNAME,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="TownDrop Support",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

fastmail = FastMail(conf)

# Function that sends OTP email
async def send_verification_email(email_to: EmailStr, name: str, otp: str):
    subject = "Your TownDrop Verification OTP"

    body = f"""
    <div style="font-family: Arial, sans-serif; padding: 10px;">
        <h2>Hello {name},</h2>
        <p>Your OTP for verifying your TownDrop account is:</p>
        <h1 style="color:#4CAF50; letter-spacing: 3px;">{otp}</h1>
        <p>This OTP will expire in <b>10 minutes</b>.</p>
        <br/>
        <p>Best regards,<br><b>TownDrop Team</b></p>
    </div>
    """

    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype="html",
    )

    await fastmail.send_message(message)

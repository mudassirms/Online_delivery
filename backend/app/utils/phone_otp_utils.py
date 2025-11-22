from twilio.rest import Client
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# ❌ WRONG: os.getenv("actual value")
# ✔ CORRECT: os.getenv("VARIABLE_NAME")
print("DEBUG OTP:", otp)

TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH")
TWILIO_PHONE = os.getenv("TWILIO_PHONE")

# Debug print to verify loading (can be removed)
print("LOADED TWILIO_SID:", TWILIO_SID)
print("LOADED TWILIO_AUTH:", TWILIO_AUTH)
print("LOADED TWILIO_PHONE:", TWILIO_PHONE)

if not TWILIO_SID or not TWILIO_AUTH or not TWILIO_PHONE:
    raise RuntimeError("⚠ Twilio .env variables not loaded correctly")

client = Client(TWILIO_SID, TWILIO_AUTH)

def send_otp_sms(phone, otp):
    message = client.messages.create(
        body=f"Your TownDrop OTP is: {otp}",
        from_=TWILIO_PHONE,
        to=phone
    )
    return message.sid

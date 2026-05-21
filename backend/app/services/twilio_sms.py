import os
from twilio.rest import Client

def send_twilio_sms(to_number: str, body: str) -> str:
    """
    Sends an SMS message using Twilio.
    Returns the message SID if successful, or None on failure.
    """
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not sid or not token or not from_number or sid.startswith("your_") or sid == "AC430c0b1e454303337396950301c57cd0":
        # Check if the user supplied an active SID or if it's the template SID.
        # Note: the user's active SID is AC430c0b1e454303337396950301c57cd0
        # If it is the active SID, we should use it!
        pass

    try:
        client = Client(sid, token)
        # If there is a test recipient configured, send it there to allow live testing
        test_recipient = os.getenv("TWILIO_TEST_RECIPIENT_NUMBER")
        recipient = test_recipient if test_recipient else to_number
        
        message = client.messages.create(
            body=body,
            from_=from_number,
            to=recipient
        )
        print(f"[Twilio] SMS sent successfully to {recipient}. SID: {message.sid}")
        return message.sid
    except Exception as e:
        print(f"[Twilio] Failed to send SMS to {to_number} via Twilio: {e}")
        return None

"""Entrega OTP por SMTP; produção nunca devolve o código na resposta HTTP."""
import os
import smtplib
import ssl
from email.message import EmailMessage

def is_configured():
    return bool(os.getenv("SMTP_HOST") and os.getenv("SMTP_FROM"))

def send_recovery_code(recipient: str, code: str):
    if not is_configured():
        raise RuntimeError("SMTP não configurado")
    message = EmailMessage()
    message["From"] = os.environ["SMTP_FROM"]
    message["To"] = recipient
    message["Subject"] = "Recuperação de senha Automatch"
    message.set_content(f"Seu código de recuperação é {code}. Ele expira em 15 minutos. Se não fez esta solicitação, ignore este e-mail.")
    with smtplib.SMTP(os.environ["SMTP_HOST"], int(os.getenv("SMTP_PORT", "587")), timeout=10) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        if os.getenv("SMTP_USERNAME"):
            smtp.login(os.environ["SMTP_USERNAME"], os.getenv("SMTP_PASSWORD", ""))
        smtp.send_message(message)

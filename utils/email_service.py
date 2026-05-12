import smtplib
import os

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_verification_email(email, code):

    try:

        sender_email = os.getenv("MAIL_USERNAME")
        sender_password = os.getenv("MAIL_PASSWORD")

        subject = "Seu código de verificação - Iludus Tech"

        html = f"""
        <div style="font-family: Arial; text-align:center;">
            <h2 style="color:#4f46e5;">Iludus Tech</h2>

            <p>Seu código de verificação:</p>

            <div style="
                font-size:32px;
                font-weight:bold;
                background:#f3f4f6;
                padding:15px;
                border-radius:8px;
                display:inline-block;
                letter-spacing:5px;
            ">
                {code}
            </div>

            <p style="margin-top:20px;">
                Este código expira em 5 minutos.
            </p>
        </div>
        """

        msg = MIMEMultipart()

        msg["From"] = sender_email
        msg["To"] = email
        msg["Subject"] = subject

        msg.attach(MIMEText(html, "html"))

        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)

        server.starttls()

        server.login(sender_email, sender_password)

        server.sendmail(
            sender_email,
            email,
            msg.as_string()
        )

        server.quit()

        print("EMAIL ENVIADO COM SUCESSO")

        return True

    except Exception as e:

        print("ERRO AO ENVIAR EMAIL:")
        print(str(e))

        return False
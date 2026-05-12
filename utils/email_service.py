from flask_mail import Message
from extensions import mail

def send_verification_email(email, code):
    try:
        msg = Message(
            subject="Seu código de verificação - Iludus Tech",
            sender=("Iludus Tech", "iludustech@gmail.com"),
            recipients=[email]
        )

        msg.html = f"""
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

        mail.send(msg)
        print("Email enviado com sucesso:")
        return True

    except Exception as e:
        print("ERRO AO ENVIAR EMAIL:", e)
        return False
# atualizado

import requests
import os
from dotenv import load_dotenv

load_dotenv();

BREVO_API_KEY = os.getenv("BREVO_API_KEY")

def send_verification_email(email, code):

    url = "https://api.brevo.com/v3/smtp/email"

    headers = {
        "accept": "application/json",
        "api-key": "BREVO_API_KEY",
        "content-type": "application/json"
    }

    body = {

        "sender": {
            "name": "Iludus Tech",
            "email": "iludustech@gmail.com"
        },

        "to": [
            {
                "email": email
            }
        ],

        "subject": "Código de Verificação",

        "htmlContent": f"""

        <div style="
            background:#f4f7fb;
            padding:40px;
            font-family:Arial;
        ">

            <div style="
                max-width:500px;
                margin:auto;
                background:white;
                border-radius:20px;
                padding:40px;
            ">

                <h1 style="
                    color:#4f46e5;
                    margin-bottom:20px;
                ">
                    Iludus Tech
                </h1>

                <p style="
                    color:#374151;
                    font-size:16px;
                ">
                    Utilize o código abaixo para verificar sua conta:
                </p>

                <div style="
                    font-size:40px;
                    font-weight:bold;
                    letter-spacing:10px;
                    margin:30px 0;
                    color:#111827;
                    text-align:center;
                ">
                    {code}
                </div>

                <p style="
                    color:#6b7280;
                    font-size:14px;
                ">
                    Este código expira em 10 minutos.
                </p>

            </div>

        </div>

        """
    }

    response = requests.post(
        url,
        json=body,
        headers=headers
    )

    print(response.status_code)
    print(response.text)
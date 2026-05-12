from extensions import mysql
from werkzeug.security import generate_password_hash, check_password_hash
import random
import datetime
from utils.email_service import send_verification_email 

#mysql = MySQL()

def login_user(email, password):
    try:
        cur = mysql.connection.cursor()

        cur.execute("SELECT * FROM usuario WHERE Email = %s", (email,))
        user = cur.fetchone()

        print("USER: ", user)
        print("PASSWORD: ", password)
        print("DADOS: ", user[0], ", ",user[1], ", ",user[2] )

        if not user:
            return {"status": "nao_existe"}

        # índice depende da ordem da tabela
        # PalavraPasse geralmente é índice 4 (confirma na tua BD)
        senha_hash = user[5]
        
        if not senha_hash:
            return {"status": "erro"}

        if not check_password_hash(senha_hash, password):
            return {"status": "senha_incorreta"}

        return {
            "status": "sucesso",
            "user": {
                "id": user[0],  # id_Usuario
                "nome": user[1],
                "email": user[2]
            }
        }

    except Exception as e:
        print("ERRO LOGIN:", e)
        return {"status": "erro"}

def create_user(name, email, password, tipo):
    try:
        cur = mysql.connection.cursor()

        cur.execute("SELECT * FROM `usuario` WHERE Email = %s", (email,))
        if cur.fetchone():
            return {"status": "existe"}

        hashed_password = generate_password_hash(password)

        # gerar código
        code = str(random.randint(100000, 999999))
        expire = datetime.datetime.now() + datetime.timedelta(minutes=5)

        cur.execute("""
            INSERT INTO `usuario` 
            (Nome, Email, PalavraPasse, CodigoVerificacao, CodigoExpira) 
            VALUES (%s, %s, %s, %s, %s)
        """, (name, email, hashed_password, code, expire))

        user_id = cur.lastrowid

        cur.execute("""
            INSERT INTO cliente 
            (fk_Usuario_id_Usuario, TipoCliente) 
            VALUES (%s, %s)
        """, (user_id, tipo))
        
        mysql.connection.commit()
        cur.close()
        
        # enviar email
        send_verification_email(email, code)


        return {"status": "sucesso", "code": code}

    except Exception as e:
        import traceback
        print("ERRO Completo:")
        traceback.print_exc()
        return {"status": "erro"}
    
def verify_user(email, code):
        try:
            cur = mysql.connection.cursor()

            cur.execute("""
                SELECT CodigoVerificacao, CodigoExpira 
                FROM usuario 
                WHERE Email = %s
            """, (email,))

            user = cur.fetchone()

            if not user:
                return "nao_encontrado"

            db_code, expire = user

            # verificar código
            if db_code != code:
                return "codigo_invalido"

            # verificar expiração
            import datetime
            if datetime.datetime.now() > expire:
                return "expirado"

            # ativar conta
            cur.execute("""
                UPDATE usuario 
                SET Verificado = TRUE 
                WHERE Email = %s
            """, (email,))

            mysql.connection.commit()
            cur.close()

            return "sucesso"

        except Exception as e:
            print("ERRO VERIFY:", e)
            return "erro"
        
def resend_code(email):
    try:
        cur = mysql.connection.cursor()

        import random, datetime

        code = str(random.randint(100000, 999999))
        expire = datetime.datetime.now() + datetime.timedelta(minutes=5)

        cur.execute("""
            UPDATE usuario 
            SET CodigoVerificacao = %s, CodigoExpira = %s
            WHERE Email = %s
        """, (code, expire, email))

        mysql.connection.commit()
        cur.close()

        # enviar novo email
        from utils.email_service import send_verification_email
        email_sent = send_verification_email(email, code)

        if not email_sent:
            print("falha no envio do emeil")
            
        return "sucesso"

    except Exception as e:
        print("ERRO RESEND:", e)
        return "erro"


def login_admin(email, password):

    try:
        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT 
                u.id_Usuario,
                u.Nome,
                u.Email,
                u.PalavraPasse
            FROM usuario u
            JOIN administrador a
                ON a.fk_Usuario_id_Usuario = u.id_Usuario
            WHERE u.Email = %s
        """, (email,))

        admin = cur.fetchone()

        print("ADMIN:", admin)

        if not admin:
            return {"status": "nao_existe"}

        senha_hash = admin[3]

        if not check_password_hash(senha_hash, password):
            return {"status": "senha_incorreta"}

        return {
            "status": "sucesso",
            "admin": {
                "id": admin[0],
                "nome": admin[1],
                "email": admin[2]
            }
        }

    except Exception as e:
        print("ERRO LOGIN ADMIN:", e)

        return {
            "status": "erro"
        }
        
        



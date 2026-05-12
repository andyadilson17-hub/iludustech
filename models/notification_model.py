from extensions import mysql


def create_notification(cliente_id, titulo, mensagem, tipo="info", order_id = None):

    try:
        cur = mysql.connection.cursor()

        cur.execute("""
            INSERT INTO notificacao
            (
                Titulo,
                Mensagem,
                Tipo,
                fk_Cliente_id_Cliente,
                order_id
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            titulo,
            mensagem,
            tipo,
            cliente_id,
            order_id
        ))

        mysql.connection.commit()
        cur.close()

        return True

    except Exception as e:
        print("ERRO CREATE NOTIFICATION:", e)
        return False

def get_notifications(user_id):

    try:
        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT 
                n.id_Notificacao,
                n.Titulo,
                n.Mensagem,
                n.Tipo,
                n.Lida,
                n.DataNotificacao
            FROM notificacao n
            JOIN cliente c
            ON n.fk_Cliente_id_Cliente = c.id_Cliente
            WHERE c.fk_Usuario_id_Usuario = %s
            ORDER BY n.DataNotificacao DESC
        """, (user_id,))

        data = cur.fetchall()

        notifications = []

        for row in data:

            notifications.append({
                "id": row[0],
                "title": row[1],
                "message": row[2],
                "type": row[3],
                "read": row[4],
                "date": row[5].strftime("%d/%m/%Y %H:%M")
            })

        cur.close()

        return {
            "status": "sucesso",
            "notifications": notifications
        }

    except Exception as e:
        print("ERRO GET NOTIFICATIONS:", e)

        return {
            "status": "erro",
            "notifications": []
        }
        

def mark_as_read(notification_id):

    try:
        cur = mysql.connection.cursor()

        cur.execute("""
            UPDATE notificacao
            SET Lida = TRUE
            WHERE id_Notificacao = %s
        """, (notification_id,))

        mysql.connection.commit()
        cur.close()

        return True

    except Exception as e:
        print("ERRO READ:", e)
        return False
from extensions import mysql
import datetime
from models.notification_model import create_notification


def create_order(user_id, service, description):
    try:
        cur = mysql.connection.cursor()
               
        # 🔥 1. Buscar ID do cliente
        cur.execute("""
            SELECT id_Cliente FROM cliente
            WHERE fk_Usuario_id_Usuario = %s
        """, (user_id,))

        cliente = cur.fetchone()

        if not cliente:
            return {"status": "erro", "msg": "Cliente não encontrado"}

        cliente_id = cliente[0]

        # 🔥 2. Inserir pedido corretamente
        cur.execute ("""
            INSERT INTO Pedido 
            (DataPedido, Descricao, Estado, Etapa, Progresso, TipoPedido, fk_Cliente_id_Cliente)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            datetime.datetime.now(),
            description,
            "Em Espera",
            "Aguardando início",
            0,
            service,
            cliente_id
        ))

        mysql.connection.commit()
        cur.close()
        
        create_notification(
            cliente_id,
            "Novo Pedido",
            f"Seu pedido de {service} foi criado com sucesso.",
            "sucesso"
        )

        return {"status": "sucesso"}

    except Exception as e:
        import traceback
        print("ERRO CREATE ORDER:")
        traceback.print_exc()
        return {"status": "erro"}

    
def get_orders(user_id):
    try:
        cur = mysql.connection.cursor()

        # 🔥 buscar cliente_id correto
        cur.execute("""
            SELECT id_Cliente FROM cliente
            WHERE fk_Usuario_id_Usuario = %s
        """, (user_id,))

        cliente = cur.fetchone()

        if not cliente:
            return {"status": "erro", "orders": []}

        cliente_id = cliente[0]

        # 🔥 buscar pedidos
        cur.execute("""
            SELECT 
                id_Pedido,
                Descricao,
                Estado,
                Etapa,
                Progresso,
                TipoPedido,
                DataPedido
            FROM Pedido
            WHERE fk_Cliente_id_Cliente = %s
            ORDER BY DataPedido DESC
        """, (cliente_id,))

        data = cur.fetchall()

        orders = []
        for row in data:
            orders.append({
                "id": row[0],
                "description": row[1],
                "status": row[2],
                "stage": row[3],
                "progress": row[4],
                "service": row[5],
                "date": row[6].strftime("%Y-%m-%d")
            })

        return {"status": "sucesso", "orders": orders}

    except Exception as e:
        print("ERRO GET ORDERS:", e)
        return {"status": "erro", "orders": []}

def get_all_orders():
    try:
        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT
                p.id_Pedido,
                u.Nome,
                p.TipoPedido,
                p.Estado,
                p.Etapa,
                p.Progresso
            FROM Pedido p

            JOIN cliente c
                ON p.fk_Cliente_id_Cliente = c.id_Cliente

            JOIN usuario u
                ON c.fk_Usuario_id_Usuario = u.id_Usuario

            ORDER BY p.id_Pedido DESC
        """)

        data = cur.fetchall()

        orders = []

        for row in data:

            orders.append({
                "id": row[0],
                "cliente": row[1],
                "servico": row[2],
                "estado": row[3],
                "etapa": row[4],
                "progress": row[5]
            })

        cur.close()

        return {
            "status": "sucesso",
            "orders": orders
        }

    except Exception as e:
        print("ERRO GET ALL ORDERS:", e)

        return {
            "status": "erro"
        }
        
def update_order(order_id, etapa):

    try:

        cur = mysql.connection.cursor()

        # =========================
        # DEFINIR ESTADO/PROGRESSO
        # =========================

        estado = "Em Espera"
        progresso = 0

        if etapa == "Análise":
            estado = "Em Desenvolvimento"
            progresso = 25

        elif etapa == "Desenvolvimento":
            estado = "Em Desenvolvimento"
            progresso = 50

        elif etapa == "Testes":
            estado = "Em Desenvolvimento"
            progresso = 75

        elif etapa == "Concluído":
            estado = "Concluído"
            progresso = 100

        # =========================
        # UPDATE
        # =========================


        cur.execute("""
            SELECT fk_Cliente_id_Cliente
            FROM Pedido
            WHERE id_Pedido = %s
        """, (order_id,))

        cliente = cur.fetchone()

        cliente_id = cliente[0]

        cur.execute("""
            
            UPDATE Pedido

            SET
                Etapa = %s,
                Estado = %s,
                Progresso = %s

            WHERE id_Pedido = %s

        """, (

            etapa,
            estado,
            progresso,
            order_id

        ))

        mysql.connection.commit()
        
        mensagem = f"""
        Seu pedido foi atualizado para:
        {estado} ({progresso}%)
        """

        tipo = "progresso"

        if progresso == 100:
            tipo = "concluido"

        create_notification(
            cliente_id,
            "Pedido Atualizado",
            mensagem,
            tipo
        )


        cur.close()

        return {
            "status": "sucesso"
        }

    except Exception as e:

        print("ERRO UPDATE ORDER:", e)

        return {
            "status": "erro"
        }
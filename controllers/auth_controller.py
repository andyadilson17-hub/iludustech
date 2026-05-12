from flask import request, jsonify
from models.user_model import create_user, verify_user, resend_code, login_user, login_admin

def login():
    data = request.get_json()

    result = login_user(
        data.get("email"),
        data.get("password")
    )

    return jsonify(result)


def admin_login():

    data = request.get_json()

    result = login_admin(
        data.get("email"),
        data.get("password")
    )

    return jsonify(result)

def resend():
    data = request.get_json()
    email = data.get("email")

    result = resend_code(email)

    return jsonify({"status": result})

def register():
    data = request.get_json()
    print("DADOS RECEBIDOS: ", data)

    result = create_user(
        data.get("name"),
        data.get("email"),
        data.get("password"),
        data.get("tipo")
    )
    
    print("RESULTADOS: ", result)
  
    return jsonify(result)

def verify():
    data = request.get_json()

    email = data.get("email")
    code = data.get("code")

    result = verify_user(email, code)

    return jsonify({"status": result})

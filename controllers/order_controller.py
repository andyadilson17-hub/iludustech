from flask import request, jsonify
from models.order_model import create_order, get_orders, get_all_orders, update_order

def create():
    data = request.get_json()

    result = create_order(
        data.get("user_id"),
        data.get("service"),
        data.get("description")
    )

    return jsonify(result) 

def list_orders():
    user_id = request.args.get("user_id")

    result = get_orders(user_id)

    return jsonify(result)

def admin_orders():

    result = get_all_orders()

    return jsonify(result)

def update():

    data = request.get_json()

    result = update_order(

        data.get("order_id"),
        data.get("etapa")

    )

    return jsonify(result)
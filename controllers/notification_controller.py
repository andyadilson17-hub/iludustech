from flask import jsonify, request
from models.notification_model import get_notifications, mark_as_read

def list_notifications():

    user_id = request.args.get("user_id")

    result = get_notifications(user_id)

    return jsonify(result)

def read_notification(notification_id):

    result = mark_as_read(notification_id)

    return jsonify({
        "status": "sucesso"
    })


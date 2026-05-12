from flask import Flask, render_template
from config import Config
from models.user_model import mysql
from controllers.auth_controller import register, verify, resend, login, admin_login
from extensions import mysql, mail
from controllers.order_controller import create, list_orders, admin_orders, update
from controllers.notification_controller import list_notifications,read_notification

app = Flask(__name__)
app.config.from_object(Config)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'iludustech@gmail.com'
app.config['MAIL_PASSWORD'] = 'duwa sgrl auwv bpzl'  # ⚠️ não é senha normal

mysql.init_app(app)
mail.init_app(app)

# Rotas de páginas

@app.route("/api/order", methods=["POST"])
def create_order_api():
    return create()

@app.route("/api/notifications")
def notifications_api():
    return list_notifications()

@app.route("/api/orders")
def get_orders_api():
    return list_orders()

@app.route("/")
def login_page():
    return render_template("login.html")

@app.route("/api/login", methods=["POST"])
def login_api():
    return login()

@app.route("/api/adminlogin", methods=["POST"])
def admin_login_api():
    return admin_login()

@app.route("/adminlogin")
def adminlogin_page():
    return render_template("adminlogin.html")

@app.route("/register")
def register_page():
    return render_template("register.html")

@app.route("/verify")
def verify_page():
    return render_template("verify.html")

@app.route("/api/verify", methods=["POST"])
def verify_api():
    return verify()

@app.route("/landing")
def landing_page():
    return render_template("landing.html")

@app.route("/cliente")
def cliente_page():
    return render_template("cliente.html")

@app.route("/admin")
def admin_page():
    return render_template("admin.html")

# API
@app.route("/api/register", methods=["POST"])
def register_api():
    return register()

@app.route("/api/resend", methods=["POST"])
def resend_api():
    return resend()

@app.route("/api/admin/orders")
def admin_orders_api():
    return admin_orders()

@app.route("/api/admin/update-order", methods=["POST"])
def update_order_api():
    return update()

app.route("/api/notification/read/<int:notification_id>", methods=["PUT"])(read_notification)

if __name__ == "__main__":
    app.run(debug=True)
    



#mail = Mail(app)
#mail.init_app(app)
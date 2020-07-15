import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_url_path = '/static', static_folder = "static")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = []
messages = {}

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("request channels")
def request_channels():
    emit("load channels", {"channels": channels}, broadcast=True)

@socketio.on("submit channel")
def submit_channel(data):
    channel = data["channel"]
    channels.append(channel)
    emit("announce channel", {"channel": channel}, broadcast=True)
    
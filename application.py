import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_url_path = '/static', static_folder = "static")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = ["General"]
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

@socketio.on("submit message")
def submit_message(data):
    message = data["message"]
    channel = data["channel"]
    try:
        messages[channel].append({"message": message})
    except KeyError:
        messages[channel] = [{"message": message}]
    emit("announce message", {"message": message}, broadcast=True)
    
@socketio.on("request messages")
def request_messages(data):
    try:
        emit("load messages", {"messages": messages[data["channel"]]}, broadcast=True)
    except KeyError:
        pass

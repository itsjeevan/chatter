import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

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
    emit("announce message", {"message": message}, room=channel)
    
@socketio.on("request messages")
def request_messages(data):
    for channel in channels:
        leave_room(channel)
    try:
        channel = data["channel"]
        join_room(channel)
        emit("load messages", {"messages": messages[channel]}, room=channel)
    except KeyError:
        pass

import os

from flask import Flask, render_template, request, redirect
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime

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
    emit("load channels", {"channels": channels}, broadcast=False)

@socketio.on("submit channel")
def submit_channel(data):
    channel = data["channel"]
    if channel.lower() in map(str.lower, channels):
        pass
    else:
        channels.append(channel)
        emit("announce channel", {"channel": channel}, broadcast=True)

@socketio.on("submit message")
def submit_message(data):
    username = data["username"]
    message = data["message"]
    channel = data["channel"]
    global datetime
    datetime = datetime.now()
    timestamp = datetime.strftime("%Y/%m/%d %I:%M %p")
    message_object = {"username": username, "message": message, "timestamp": timestamp}
    try:
        messages[channel].append(message_object)
    except KeyError:
        messages[channel] = [message_object]
    if len(messages[channel]) > 100:
        messages[channel].pop(0)
    emit("announce message", message_object, room=channel)
    
@socketio.on("request messages")
def request_messages(data):
    for channel in channels:
        leave_room(channel)
    try:
        channel = data["channel"]
        join_room(channel)
        emit("load messages", {"messages": messages[channel]}, broadcast=False)
    except KeyError:
        pass

@app.route("/reset", methods=["GET"])
def reset():
    global channels
    global messages
    channels = ["General"]
    messages = {}
    return redirect("/")

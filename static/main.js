document.addEventListener('DOMContentLoaded', () => {

    // localStorage.clear();

    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Disable channel, message, and username button if field is empty
    validate_field('.channel__button', '.channel__field');
    validate_field('.message__button', '.message__field');
    validate_field('.username__button', '.username__field');

    // If a username exists, use it & hide form
    if (localStorage.getItem('username')) {
        const username = localStorage.getItem('username');
        document.querySelector('.username-title').innerHTML = `Welcome ${username}`;
        document.querySelector('.username').remove();
    }
    // Set username in localStorage once username button clicked
    else {
        document.querySelector('.username__button').onclick = () => {
            const username = document.querySelector('.username__field').value;
            localStorage.setItem('username', username);
            document.querySelector('.username-title').innerHTML = `Welcome ${username}`;
            document.querySelector('.username').remove();
            validate_field('.channel__button', '.channel__field');
            validate_field('.message__button', '.message__field');
            return false;
        };
    } 
    
    // Once connected to web socket
    socket.on('connect', () => {

        // Request saved channels from server
        socket.emit('request channels');

        // Load messages from last visited channel
        if (localStorage.getItem('channel')) {
            const channel = localStorage.getItem('channel');
            socket.emit('request messages', {'channel': channel});
            document.querySelector('.channel-title').innerHTML = `Channel: ${channel}`;
        }
        else {
            socket.emit('request messages', {'channel': 'General'});
            document.querySelector('.channel-title').innerHTML = 'Channel: General';
        }

        // When channel submitted
        document.querySelector('.channel__button').onclick = () => {
            const channel = document.querySelector('.channel__field').value;
            socket.emit('submit channel', {'channel': channel});
            document.querySelector('.channel__field').value = '';
            return false;
        };

        // When message submitted
        document.querySelector('.message__button').onclick = () => {
            const message = document.querySelector('.message__field').value;
            const channel = localStorage.getItem('channel');
            const username = localStorage.getItem('username');
            socket.emit('submit message', {'username': username, 'message': message, 'channel': channel});
            document.querySelector('.message__field').value = '';
            return false;
        };   

    });

    // Load saved channels from server
    socket.on('load channels', data => {
        data.channels.forEach(add_channel);
    });

    // When channel announced, update channels
    socket.on('announce channel', data => {
        add_channel(data.channel);
    });

    // When message announced, update messages
    socket.on('announce message', data => {
        const li = document.createElement('li');
        li.className = 'messages__item';
        li.innerHTML = `${data.timestamp} ${data.username}: ${data.message}`;
        document.querySelector('.messages').append(li);
    });

    // Load messages for clicked channel
    socket.on('load messages', data => {
        for (let message of data.messages) {
            let li = document.createElement('li');
            li.className = 'messages__item';
            li.innerHTML = `${message.timestamp} ${message.username}: ${message.message}`;
            document.querySelector('.messages').append(li);
        }
    });
    
    // Add channel to the channels list
    function add_channel(channel) {
    
        // Create anchor
        const a = document.createElement('a');
        a.setAttribute('href', 'javascript:void(0);');
        a.className = 'channels__item';
        a.innerHTML = channel;
        
        // When anchor is clicked load messages for the channel
        a.onclick = () => {
            document.querySelector('.messages').innerHTML = '';
            localStorage.setItem('channel', channel)
            document.querySelector('.channel-title').innerHTML = `Channel: ${channel}`;
            socket.emit('request messages', {'channel': channel});
        };
        
        // Create list item and append anchor
        const li = document.createElement('li');
        li.append(a)
        
        // Append list item to channels list
        document.querySelector('.channels').append(li);
        
    }

});

// Disable button if field is empty
function validate_field(button, field) {
    document.querySelector(button).disabled = true;
    if (button === '.username__button') {
        field_length(button, field);
    }
    else if (localStorage.getItem('username')) {
        field_length(button, field);
    }
}

// Check field length
function field_length(button, field) {
    document.querySelector(field).onkeyup = () => {
        if (document.querySelector(field).value.length > 0) {
            document.querySelector(button).disabled = false;
        }
        else {
            document.querySelector(button).disabled = true;
        }
    };
}

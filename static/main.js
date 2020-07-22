document.addEventListener('DOMContentLoaded', () => {

    // localStorage.clear();

    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Disable channel, message, and username button if field is empty
    validate_field('.channel-form__button', '.channel-form__input');
    validate_field('.message-form__button', '.message-form__input');
    validate_field('.username-form__button', '.username-form__input');

    // If a username exists, use it & hide form
    if (localStorage.getItem('username')) {
        const username = localStorage.getItem('username');
        document.querySelector('.username-title').innerHTML = username;
        document.querySelector('.username-form').style.display = 'none';
    }
    // Set username in localStorage once username button clicked
    else {
        document.querySelector('.username-title').style.display = 'none';
        document.querySelector('.username-form__button').onclick = () => {
            const username = document.querySelector('.username-form__input').value;
            localStorage.setItem('username', username);
            document.querySelector('.username-title').innerHTML = username;
            document.querySelector('.username-form').style.display = 'none';
            validate_field('.channel-form__button', '.channel-form__input');
            validate_field('.message-form__button', '.message-form__input');
            document.querySelector('.username-title').style.display = 'initial';
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
            document.querySelector('.channel-title').innerHTML = `# ${channel}`;
        }
        else {
            socket.emit('request messages', {'channel': 'General'});
            document.querySelector('.channel-title').innerHTML = '# General';
        }

        // When channel submitted
        document.querySelector('.channel-form__button').onclick = () => {
            const channel = document.querySelector('.channel-form__input').value;
            socket.emit('submit channel', {'channel': channel});
            document.querySelector('.channel-form__input').value = '';
            return false;
        };

        // When message submitted
        document.querySelector('.message-form__button').onclick = () => {
            const message = document.querySelector('.message-form__input').value;
            const channel = localStorage.getItem('channel');
            const username = localStorage.getItem('username');
            socket.emit('submit message', {'username': username, 'message': message, 'channel': channel});
            document.querySelector('.message-form__input').value = '';
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
        li.className = 'messages-list__item';
        li.innerHTML = `${data.timestamp} ${data.username}: ${data.message}`;
        document.querySelector('.messages-list').append(li);
        li.scrollIntoView(false);    
    });

    // Load messages for clicked channel
    socket.on('load messages', data => {
        let li;
        for (let message of data.messages) {
            li = document.createElement('li');
            li.className = 'messages-list__item';
            li.innerHTML = `${message.timestamp} ${message.username}: ${message.message}`;
            document.querySelector('.messages-list').append(li);
        }
        li.scrollIntoView(false); 
    });
    
    // Add channel to the channels list
    function add_channel(channel) {
        
        // Create list item and append anchor
        const li = document.createElement('li');
        li.className = 'channels-list__item';
        li.innerHTML = channel;

        // When anchor is clicked load messages for the channel
        li.onclick = () => {
            document.querySelectorAll('.channels-list__item').forEach(li => {
                li.className = 'channels-list__item';
            });
            document.querySelector('.messages-list').innerHTML = '';
            document.querySelector('.channel-title').innerHTML = `# ${channel}`;
            localStorage.setItem('channel', channel)
            li.className += ' ' + 'channels-list__item--active';
            socket.emit('request messages', {'channel': channel});
        };
        
        // Append list item to channels list
        document.querySelector('.channels-list').append(li);
        
    }

});

// Disable button if field is empty
function validate_field(button, field) {
    document.querySelector(button).disabled = true;
    if (button === '.username-form__button') {
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

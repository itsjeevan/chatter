document.addEventListener('DOMContentLoaded', () => {

    // localStorage.clear();

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Disable channel, message, and username button if field is empty
    validate('.channel__button', '.channel__field');
    validate('.message__button', '.message__field');
    validate('.username__button', '.username__field');


    // If a username exists, use it
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
            return false;
        };
    }
    
    
 

    // Once connected to web socket
    socket.on('connect', () => {

        // Load saved channels from server
        socket.emit('request channels');
        socket.on('load channels', data => {
            data.channels.forEach(add_channel);
        });

        // When channel submitted, emit socket event
        document.querySelector('.channel__button').onclick = () => {
            const channel = document.querySelector('.channel__field').value;
            socket.emit('submit channel', {'channel': channel});
            document.querySelector('.channel__field').value = '';
            return false;
        };
        // When channel announced, update list
        socket.on('announce channel', data => {
            add_channel(data.channel);
        });

        // When message submitted
        document.querySelector('.message__button').onclick = () => {
            const message = document.querySelector('.message__field').value;
            const channel = localStorage.getItem('channel')
            socket.emit('submit message', {'message': message, 'channel': channel});
            document.querySelector('.message__field').value = '';
            return false;
        };
        // When message announced, update messages
        socket.on('announce message', data => {
            const li = document.createElement('li');
            li.innerHTML = data.message;
            document.querySelector('.messages').append(li);
        });

        socket.on('load messages', data => {
            for (let message of data.messages) {
                let li = document.createElement('li');
                li.innerHTML = message.message;
                document.querySelector('.messages').append(li);
            }
        });

        // Add channel to the channels list
        function add_channel(channel) {
            
            // Create anchor
            const a = document.createElement('a');
            // a.setAttribute('href', 'javascript:void(0);');
            // a.setAttribute('data-channel', channel);
            a.className = 'channels__item';
            a.innerHTML = channel;
            
            a.onclick = () => {

                document.querySelector('.messages').innerHTML = '';
                localStorage.setItem('channel', channel)
                document.querySelector('.channel-title').innerHTML = `Channel: ${channel}`;

                socket.emit('request messages', {'channel': channel});
            };
            
            // Create list item and append anchor
            const li = document.createElement('li');
            li.append(a)
            
            // When anchor is clicked load messages for the channel
            // Append list item to channels list
            document.querySelector('.channels').append(li);
            
        }
    });



    
    // Disable button if field is empty
    function validate(button, field) {
        
        document.querySelector(button).disabled = true;
        document.querySelector(field).onkeyup = () => {
            if (document.querySelector(field).value.length > 0) {
                document.querySelector(button).disabled = false;
            }
            else {
                document.querySelector(button).disabled = true;
            }
        };
        
    }

});




// // BACKUP


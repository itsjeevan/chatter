document.addEventListener('DOMContentLoaded', () => {

    // localStorage.clear();

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // If a username exists, use it
    if (localStorage.getItem('username')) {
        const username = localStorage.getItem('username');
        document.querySelector('.username-title').innerHTML = `Welcome ${username}`;
        document.querySelector('.username').remove();
    }
    else {
        // Disable username button if empty
        document.querySelector('.username-button').disabled = true;
        document.querySelector('.username-field').onkeyup = () => {
            if (document.querySelector('.username-field').value.length > 0) {
                document.querySelector('.username-button').disabled = false;
            }
            else {
                document.querySelector('.username-button').disabled = true;
            }
        };
        // Set username in localStorage once username button clicked
        document.querySelector('.username-button').onclick = () => {
            const username = document.querySelector('.username-field').value;
            localStorage.setItem('username', username);
            document.querySelector('.username-title').innerHTML = `Welcome ${username}`;
            document.querySelector('.username').remove();
            return false;
        };
    }

    // Disable channel button if empty
    document.querySelector('.channel-button').disabled = true;
        document.querySelector('.channel-field').onkeyup = () => {
            if (document.querySelector('.channel-field').value.length > 0) {
                document.querySelector('.channel-button').disabled = false;
            }
            else {
                document.querySelector('.channel-button').disabled = true;
            }
        };


    
    // Once connected to socket
    socket.on('connect', () => {

        // When channel submitted, emit socket event
        document.querySelector('.channel-button').onclick = () => {
            const channel = document.querySelector('.channel-field').value;
            socket.emit('submit channel', {'channel': channel});
            document.querySelector('.channel-field').value = '';
            return false;
        };
        
        // When channel announced, update list
        socket.on('announce channel', data => {

            const a = document.createElement('a');
            a.setAttribute('href', '');
            a.setAttribute('data-channel', data.channel);
            a.innerHTML = data.channel;

            const li = document.createElement('li');
            li.append(a)

            document.querySelector('.channels').append(li);

        });


        // When message submitted
        document.querySelector('.message-button').onclick = () => {
            const message = document.querySelector('.message-field').value;
            const li = document.createElement('li')
            li.innerHTML = message;
            document.querySelector('.messages').append(li);
            document.querySelector('.message-field').value = '';
            return false;
        };
        
    });


});


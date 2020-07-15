document.addEventListener('DOMContentLoaded', () => {

    // localStorage.clear();

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // If a username exists, use it
    if (localStorage.getItem('username')) {
        const username = localStorage.getItem('username');
        document.querySelector('.user-username').innerHTML = `Welcome ${username}`;
        document.querySelector('.username').remove();
    }
    // Disable username button if empty
    else {
        validate('.username-button', '.username-field');

        // Set username in localStorage once username button clicked
        document.querySelector('.username-button').onclick = () => {
            const username = document.querySelector('.username-field').value;
            localStorage.setItem('username', username);
            document.querySelector('.user-username').innerHTML = `Welcome ${username}`;
            document.querySelector('.username').remove();
            return false;
        };
    }

    // Disable channel & message button if field is empty
    validate('.channel-button', '.channel-field');
    validate('.message-button', '.message-field');


    
    // Once connected to web socket
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
            a.className = 'channels-item';
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
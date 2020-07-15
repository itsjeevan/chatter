document.addEventListener('DOMContentLoaded', () => {

    // localStorage.clear();

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Disable channel & message button if field is empty
    validate('.channel__button', '.channel__field');
    validate('.message__button', '.message__field');


    // If a username exists, use it
    if (localStorage.getItem('username')) {
        const username = localStorage.getItem('username');
        document.querySelector('.username-title').innerHTML = `Welcome ${username}`;
        document.querySelector('.username').remove();
    }
    // Disable username button if empty
    else {
        validate('.username__button', '.username__field');

        // Set username in localStorage once username button clicked
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
            // const channels = data.channels;
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
            const li = document.createElement('li')
            li.innerHTML = message;
            document.querySelector('.messages').append(li);
            document.querySelector('.message__field').value = '';
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


function add_channel(channel) {

    // Create anchor
    const a = document.createElement('a');
    a.setAttribute('href', 'javascript:void(0);');
    a.setAttribute('data-channel', channel);
    a.className = 'channels__item';
    a.innerHTML = channel;

    // When anchor is clicked
    a.onclick = () => {
        localStorage.setItem('channel', channel)
        document.querySelector('.channel-title').innerHTML = `Channel: ${channel}`;
    };

    // Create list item and append anchor
    const li = document.createElement('li');
    li.append(a)

    // Append list item to list
    document.querySelector('.channels').append(li);

}
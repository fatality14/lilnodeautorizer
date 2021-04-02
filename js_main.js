(function() {
    function connect(addr, open_foo, msg_foo, close_foo, error_foo) {
        let sock = new WebSocket(addr);
        sock.onopen = open_foo;
        sock.onmessage = msg_foo;
        sock.onclose = close_foo;
        sock.onerror = error_foo;

        return sock;
    }

    function is_undef(val) {
        return val === undefined ? true : false;
    }

    function open_foo(e) {
        send_JSON_data(socket, {
            "command": 1200,
            "secret": localStorage.getItem("secret")
        });
    }

    function close_foo(e) {
        if (e.wasClean) {
            console.log(`[close] Соединение закрыто чисто, код=${e.code} причина=${e.reason}`);
        } else {
            console.log('[close] Соединение прервано по причине ' + e.code, true);
        }
    }

    function error_foo(e) {
        console.log(`[error] ${e.message}`);
    }

    let user_id;

    function msg_foo(e) {
        let data = JSON.parse(e.data);
        if (data) {
            console.log(data);

            let command = data.command;
            if (!is_undef(command)) {
                //establish connection
                if (command === 0) {
                    user_id = data.id;
                }
                //get secret status
                if (command === 1200) {
                    let code = data.code;
                    if (code === 0) {
                        console.log("good secret");
                        document.write(data.page);
                    } else if (code === 1) {
                        console.log("bad secret");
                    }
                }
            }
        }
    }

    let socket = connect("ws://127.0.0.1:3000", open_foo, msg_foo, close_foo, error_foo);

    function send_data(sock, data) {
        sock.send(data);
    }

    function send_JSON_data(sock, data) {
        sock.send(JSON.stringify(data));
    }
})();
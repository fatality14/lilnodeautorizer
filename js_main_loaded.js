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

if (localStorage.getItem("banner_counter") === null) {
    localStorage.setItem("banner_counter", 0);
    localStorage.setItem("second_banner_counter", 0);
}

function open_foo(e) {
    send_JSON_data(socket, {
        "command": 1300,
        "banner_counter": localStorage.getItem("banner_counter")
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
            //get banner
            if (command === 1300) {
                let code = data.code;
                if (code === 0) {
                    console.log(data.banner);
                    let banner_elem = document.querySelector(".banner");
                    banner_elem.style.backgroundImage = "url(" + data.banner.addr + ")";
                    banner_elem.childNodes[1].setAttribute("href", data.banner.ref);

                    function clickEvent() {
                        send_JSON_data(socket, {
                            "command": 1301,
                            "banner_counter": localStorage.getItem("banner_counter")
                        });
                    }
                    banner_elem.childNodes[1].onauxclick = clickEvent;
                    banner_elem.childNodes[1].onclick = clickEvent;

                    let second_banner_counter = parseInt(localStorage.getItem("second_banner_counter"));
                    let banner_counter = parseInt(localStorage.getItem("banner_counter"));

                    if (second_banner_counter === data.banner.shows - 1) {
                        localStorage.setItem("banner_counter", banner_counter + 1);
                        localStorage.setItem("second_banner_counter", 0);

                        if (data.max === banner_counter + 1) {
                            localStorage.setItem("banner_counter", 0);
                        }
                    } else {
                        localStorage.setItem("second_banner_counter", second_banner_counter + 1);
                    }
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
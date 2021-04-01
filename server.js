const ws = require('ws');
const fs = require('fs');

function host_server(ip, port, connection_foo) {
    serv = new ws.Server({
        host: ip,
        port: port
    });

    serv.on("connection", connection_foo);

    console.log("listening on " + ip + ":" + port);

    return serv;
}

function send_data(sock, data) {
    sock.send(data);
}

function send_JSON_data(sock, data) {
    sock.send(JSON.stringify(data));
}

function setup_sock(sock, open_foo, msg_foo, close_foo, error_foo) {
    sock.on("open", open_foo);
    sock.on("message", msg_foo);
    sock.on("close", close_foo);
    sock.on("error", error_foo);
}

function empty_foo() {}

function is_undef(val) {
    return val === undefined ? true : false;
}

function is_empty_str(val) {
    return val === "" ? true : false;
}

function is_in_collection(val, collection) {
    for (let key in collection) {
        if (collection[key] == val) {
            return true;
        }
    }
    return false;
}


function hash_string(s) {
    for (var i = 0, h = 0; i < s.length; i++)
        h = (Math.imul(31, h) + s.charCodeAt(i) | 0) * Math.pow(Math.random() + 9, 6);
    return h;
}

let clients = {};
let logins = [];
let passwords = [];
let secrets = [];
let baner = { addr: '', ref: '', shows: '' };

function connection_foo(ws) {
    let id = Math.random();

    clients[id] = ws;
    console.log("connection: " + id);

    send_JSON_data(clients[id], { 'command': 0, 'id': id });

    function msg_foo(msg) {
        console.log('got message: ' + msg);
        let data = JSON.parse(msg);

        //check domain here//
        //check ip here//

        if (data) {
            let command = data.command;
            if (!is_undef(command)) {
                if (command === 1000) {
                    if (is_in_collection(data.login, logins) || is_empty_str(data.login)) {
                        send_JSON_data(clients[id], { 'command': 1000, 'code': 1 });
                    } else if (is_empty_str(data.password)) {
                        send_JSON_data(clients[id], { 'command': 1000, 'code': 2 });
                    } else {
                        logins.push(data.login);
                        passwords.push(data.password);
                        secrets.push(hash_string(data.login));
                        send_JSON_data(clients[id], { 'command': 1000, 'code': 0 });
                    }
                }
            }
        }

        if (data) {
            let command = data.command;
            if (!is_undef(command)) {
                if (command === 1100) {
                    if (!is_in_collection(data.login, logins) ||
                        is_empty_str(data.login) ||
                        is_empty_str(data.password)) {
                        send_JSON_data(clients[id], { 'command': 1100, 'code': 1 });
                    } else {
                        for (let key in logins) {
                            if (logins[key] === data.login) {
                                if (passwords[key] === data.password) {
                                    send_JSON_data(clients[id], { 'command': 1100, 'code': 0, 'secret': secrets[key] });
                                } else {
                                    send_JSON_data(clients[id], { 'command': 1100, 'code': 1 });
                                }
                            }
                        }
                    }
                }
            }
        }

        if (data) {
            let command = data.command;
            if (!is_undef(command)) {
                if (command === 1200) {
                    if (!is_in_collection(data.secret, secrets)) {
                        send_JSON_data(clients[id], { 'command': 1200, 'code': 1 });
                    } else {
                        fs.readFile('./servers/l4/index_main_loaded.html', 'ascii', function(err, data) {
                            if (err) {
                                return console.log(err);
                            }
                            send_JSON_data(clients[id], { 'command': 1200, 'code': 0, 'page': data });
                        });
                    }
                }
            }
        }

        if (data) {
            let command = data.command;
            if (!is_undef(command)) {
                if (command === 1300) {

                }
            }
        }
    }

    function close_foo(e) {
        delete clients[id];
    }

    setup_sock(ws, empty_foo, msg_foo, close_foo, empty_foo);
}

let server = host_server('127.0.0.1', 3000, connection_foo);
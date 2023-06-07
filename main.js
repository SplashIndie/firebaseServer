let Server = {
    // JSON de configuração para inicializar a aplicação FireBase //
    Firebase: {}
};

class Server_Connect {
    constructor(server_data = { url: 'localhost', port: 8080 }) {
        if (Object.keys(Server.Firebase).length !== 0) {
            if (firebase.apps.length === 0 || !firebase.apps[0]) firebase.initializeApp(Server.Firebase);

            this.room = `${server_data.url}:${server_data.port}`;
            this.client = getRandomKey(64);
            this.clients = [];


            let db = firebase.database();
            let server_host = db.ref(`${this.room.split(':')[0].replaceAll(/[.,/]/g, '')}/${this.room.split(':')[1]}`);
            let client_host = db.ref(`${this.room.split(':')[0].replaceAll(/[.,/]/g, '')}/${this.room.split(':')[1]}/${this.client}`);

            server_host.on('value', (snapshot) => {
                this.clients = snapshot.val();
                let client_id = Object.keys(this.clients).find(key => this.clients[key].id === this.client);

                if (client_id) {
                    // Remove o objeto correspondente ao ID encontrado
                    delete this.clients[client_id];
                }
            });

            client_host.onDisconnect().remove();

            this.changeRoom = (ip = `${server_data.url}:${server_data.port}`) => {
                client_host.remove();

                this.room = ip;
                server_host = db.ref(`${this.room.split(':')[0].replaceAll(/[.,/]/g, '')}/${this.room.split(':')[1]}`);
                client_host = db.ref(`${this.room.split(':')[0].replaceAll(/[.,/]/g, '')}/${this.room.split(':')[1]}/${this.client}`);
            }

            this.sendData = (json = {}) => {
                client_host.set({
                    "id": this.client,
                    "data": json
                });
            }

            this.onClientConnected = (callback) => {
                server_host.on('child_added', (snapshot) => {
                    if (snapshot.val().id !== this.client) {
                        callback(snapshot.val());
                        // console.log(snapshot.val());
                    }
                });
            }

            this.onClientUpdate = (callback) => {
                server_host.on('child_changed', (snapshot) => {
                    if (snapshot.val().id !== this.client) {
                        callback(snapshot.val());
                        // console.log(snapshot.val());
                    }
                });
            }

            this.onClientDisconnected = (callback) => {
                server_host.on('child_removed', (snapshot) => {
                    if (snapshot.val().id !== this.client) {
                        callback(snapshot.val());
                        // console.log(snapshot.val());
                    }
                });
            }
        }
    }
}

function getRandomKey(length) {
    let key = '';
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';

    for (let i = 0; i < length; ++i) {
        key += chars[getRandomInt(0, chars.length - 1)];
    }

    return key;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

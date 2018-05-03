const express = require("express");
const bodyParser = require('body-parser');
const WebSocket = require("ws");

const http_port = process.env.HTTP_PORT || 3001;
const p2p_port = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const sockets = [];
const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

class Server {
    constructor(blockchain) {
        this.blockchain = blockchain

        this.connectToPeers(initialPeers);
        this.initHttpServer();
        this.initP2PServer();
    }
    
    initHttpServer() {
        const app = express();
        const blockchain = this.blockchain
        const blocks = this.blockchain.blocks
        app.use(bodyParser.json());

        app.get('/blocks', (req, res) => {
            res.send(JSON.stringify(blocks))
        });
        app.post('/mineBlock', (req, res) => {
            const block = blockchain.mineBlock(req.body.data);
            blockchain.addBlock(block);
            this.broadcast(this.responseLatestMsg());
            console.log('block added: ' + JSON.stringify(block));
            res.send();
        });
        app.get('/peers', (req, res) => {
            res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
        });
        app.post('/addPeer', (req, res) => {
            connectToPeers([req.body.peer]);
            res.send();
        });
        app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
    };

    initP2PServer() {
        const server = new WebSocket.Server({port: p2p_port});
        server.on('connection', ws => this.initConnection(ws));
        console.log('listening websocket p2p port on: ' + p2p_port);

    };

    initConnection(ws) {
        sockets.push(ws);
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        this.write(ws, this.queryChainLengthMsg());
    };

    initMessageHandler(ws) {
        ws.on('message', (data) => {
            const message = JSON.parse(data);
            console.log('Received message' + JSON.stringify(message));
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    this.write(ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    this.write(ws, this.responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    this.handleBlockchainResponse(message);
                    break;
            }
        });
    };

    initErrorHandler(ws) {
        const closeConnection = (ws) => {
            console.log('connection failed to peer: ' + ws.url);
            sockets.splice(sockets.indexOf(ws), 1);
        };
        ws.on('close', () => closeConnection(ws));
        ws.on('error', () => closeConnection(ws));
    };

    connectToPeers(newPeers) {
        newPeers.forEach((peer) => {
            const ws = new WebSocket(peer);
            ws.on('open', () => this.initConnection(ws));
            ws.on('error', () => {
                console.log('connection failed')
            });
        });
    };

    handleBlockchainResponse(message) {
        const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockHeld = this.getLatestBlock();
        if (latestBlockReceived.index > latestBlockHeld.index) {
            console.log('this.blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                console.log("We can append the received block to our chain");
                this.blockchain.blocks.push(latestBlockReceived);
                this.broadcast(responseLatestMsg());
            } else if (receivedBlocks.length === 1) {
                console.log("We have to query the chain from our peer");
                this.broadcast(this.queryAllMsg());
            } else {
                console.log("Received blockchain is longer than current blockchain");
                this.replaceChain(receivedBlocks);
            }
        } else {
            console.log('received blockchain is not longer than current blockchain. Do nothing');
        }
    };

    replaceChain(newBlocks) {
        if (this.isValidChain(newBlocks) && newBlocks.length > this.blockchain.blocks.length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blockchain.blocks = newBlocks;
            this.broadcast(responseLatestMsg());
        } else {
            console.log('Received blockchain invalid');
        }
    };

    isValidChain(blockchainToValidate) {
        if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
            return false;
        }
        const tempBlocks = [blockchainToValidate[0]];
        for (let i = 1; i < blockchainToValidate.length; i++) {
            if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
                tempBlocks.push(blockchainToValidate[i]);
            } else {
                return false;
            }
        }
        return true;
    };

    getLatestBlock() {
        return this.blockchain.blocks[this.blockchain.blocks.length - 1]
    };
    queryChainLengthMsg() {
        return {
            'type': MessageType.QUERY_LATEST
        }
    };
    queryAllMsg() {
        return {
            'type': MessageType.QUERY_ALL
        }
    };
    responseChainMsg() {
        return {
            'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(this.blockchain.blocks)
        }
    };
    responseLatestMsg() {
        return {
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify([this.getLatestBlock()])
        }
    };

    write (ws, message) {
        ws.send(JSON.stringify(message));
    }
    broadcast(message) {
        sockets.forEach(socket => this.write(socket, message));
    }

}

module.exports = Server
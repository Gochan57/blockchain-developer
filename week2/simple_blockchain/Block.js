const crypto = require('crypto')

class Block {
    constructor(index, timestamp, data, previousHash, nonce) {
        this.index = index;
        this.timestamp = timestamp.toLocaleString();
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = nonce
        this.hash = Block.calculateHash(this);
    }

    static calculateHash(block) {
        const data = block.index + block.timestamp + block.data + block.previousHash + block.nonce
        return crypto.createHash('sha256').update(data).digest('hex')
    }

    print() {
        console.log(`  {i: ${this.index}, time: ${this.timestamp}, data: ${this.data}, hash: ${this.hash}}`)
    }
}

module.exports = Block
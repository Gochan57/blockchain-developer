const Block = require('./Block')

class Blockchain {

    constructor() {
        const genesisBlock = new Block(0, new Date(), '100 bitcoins to Alice')
        this.blocks = [genesisBlock]
    }

    mineBlock(data) {
        console.log('Mining block...')
        const previousBlock = this.blocks[this.blocks.length - 1]
        const index = previousBlock.index + 1
        const timestamp = new Date()
        let nonce = 0
        let block = new Block(index, timestamp, data, previousBlock.hash, nonce++)
        while (!Blockchain.isValidHash(block.hash)) {
            block = new Block(index, timestamp, data, previousBlock.hash, nonce++)
        }
        console.log('Block was successfully mined after ' + nonce + ' iterations')
        block.print()
        return block;
    }

    addBlock (block) {
        if (this.isValidBlock(block)) {
            this.blocks.push(block);
        }
    }

    printBlocks () {
        this.blocks.forEach(block => block.print())
    }

    isValidBlock (block) {
        console.log('Checking new block...')
        const previousBlock = this.blocks[this.blocks.length - 1]
        let hash
        if (previousBlock.index + 1 !== block.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.hash !== block.previousHash) {
            console.log('invalid previous hash');
            return false;
        } else if ((hash = Block.calculateHash(block)) !== block.hash) {
            console.log('invalid hash: expected ' + Block.calculateHash(block) + ', but has ' + block.hash);
            return false;
        } else if (!Blockchain.isValidHash(hash)) {
            console.log('invalid hash: expected 0 at the beginning')
            return false
        }
        return true;
    }

    static isValidHash (hash) {
        return hash.substring(0,1) === '0'
    }
}

module.exports = Blockchain
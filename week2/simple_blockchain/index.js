const crypto = require('crypto')
// const express = require("express")
// const bodyParser = require('body-parser')

const port = 3002;

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

let genesisBlock = new Block(0, new Date(), '100 bitcoins to Alice')

let blocks = [genesisBlock]

function mineBlock(data) {
    console.log('Mining block...')
    const previousBlock = blocks[blocks.length - 1]
    const index = previousBlock.index + 1
    const timestamp = new Date()
    let nonce = 0
    let block = new Block(index, timestamp, data, previousBlock.hash, nonce++)
    while (!isValidHash(block.hash)) {
        block = new Block(index, timestamp, data, previousBlock.hash, nonce++)
    }
    console.log('Block was successfully mined after ' + nonce + ' iterations')
    block.print()
    return block;
}

function isValidHash (hash) {
    return hash.substring(0,1) === '0'
}

function isValidBlock (block) {
    console.log('Checking new block...')
    const previousBlock = blocks[blocks.length - 1]
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
    } else if (!isValidHash(hash)) {
        console.log('invalid hash: expected 0 at the beginning')
        return false
    }
    return true;
}

function addBlock (block) {
    if (isValidBlock(block)) {
        blocks.push(block);
    }
}

function test() {
    const printBlocks = () => {
        blocks.forEach(block => block.print())
    }
    console.log('Initial blockchain: ')
    printBlocks()

    const block1 = mineBlock('50 bitcoins to Bob')
    addBlock(block1)
    console.log('Blockschain now: ')
    printBlocks()

    const block2 = mineBlock('25 bitcoins to Bob')
    console.log('Eve trying to spoil block...')
    block2.data = '25 bitcoins to Eve'
    addBlock(block2)
    console.log('Blockschain now: ')
    printBlocks()
}
test()
const Blockchain = require('./Blockchain')

// const express = require("express")
// const bodyParser = require('body-parser')

function test() {
    const blockchain = new Blockchain()
    console.log('Initial blockchain: ')
    blockchain.printBlocks()

    const block1 = blockchain.mineBlock('50 bitcoins to Bob')
    blockchain.addBlock(block1)
    console.log('Blockschain now: ')
    blockchain.printBlocks()

    const block2 = blockchain.mineBlock('25 bitcoins to Bob')
    console.log('Eve trying to spoil block...')
    block2.data = '25 bitcoins to Eve'
    blockchain.addBlock(block2)
    console.log('Blockschain now: ')
    blockchain.printBlocks()
}
test()
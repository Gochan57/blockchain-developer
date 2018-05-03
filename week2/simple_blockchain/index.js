const fetch = require('node-fetch')
const Blockchain = require('./Blockchain')
const Server = require('./Server')
// const express = require("express")
// const bodyParser = require('body-parser')


const blockchain = new Blockchain()
function test() {
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

const server = new Server(blockchain)
fetch('http://localhost:3001/blocks')
    .then(res => res.json())
    .then(body => {
        console.log('\nInitial blockchain:')
        console.log(body)
        console.log()
    })
    .then(() => {
        console.log('Sending request to mine new block')
        fetch('http://localhost:3001/mineBlock', { method: 'POST', body: '50 bitcoins to Bob' })
            .then(() => {
                fetch('http://localhost:3001/blocks')
                    .then(res => res.json())
                    .then(body => {
                        console.log('\nBlockchain with mined block:')
                        console.log(body)
                    })

            })
    })


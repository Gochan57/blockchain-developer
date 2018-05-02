const crypto = require('crypto')
const secp256k1 = require('secp256k1')

const msg = "blockchain is cool"
const hash = crypto.createHash('sha256').update(msg).digest("hex");
const digest = crypto.createHash('sha256').update(msg).digest();
console.log(`0) Alice's message:
    message: ${msg}
    hash: ${hash}`)

let privateKey;
do {
    privateKey = crypto.randomBytes(32);
} while (!secp256k1.privateKeyVerify(privateKey));

// get the public key in a compressed format
const publicKey = secp256k1.publicKeyCreate(privateKey);
console.log(`1) Alice aquired new keypair:
	publicKey: ${publicKey.toString("hex")}
	privateKey: ${privateKey.toString("hex")}`);

/*
 Sign the message
*/
console.log(`2) Alice signed her message digest with her privateKey to get its signature:`);
const sigObj = secp256k1.sign(digest, privateKey);
const sig = sigObj.signature;
console.log("	Signature:", sig.toString("hex"));

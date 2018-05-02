const crypto = require('crypto');
const secp256k1 = require('secp256k1');
// or require('secp256k1/elliptic')
//   if you want to use pure js implementation in node

const msg = process.argv[2]; // message to be signed you pass
const digested = digest(msg);
console.log(`0) Alice's message: 
	message: ${msg}
	message digest: ${digested.toString("hex")}`);

/*
 Generate keypairs
*/
// generate privateKey
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
const sig = secp256k1.sign(digested, privateKey).signature;
console.log("	Signature:", sig.toString("hex"));

/*
 Verify
*/
console.log(`3) Bob verified by 3 elements ("message digest", "signature", and Alice's "publicKey"):`);
let verified = secp256k1.verify(digested, sig, publicKey);
console.log("	verified:", verified);
// => true


function digest(str, algo = "sha256") {
    return crypto.createHash(algo).update(str).digest();
}


/*
```
$ node ./example-alice-bob-message-verify.js "Hi Bob!"
0) Alice's message:
	message: Hi Bob!
	message digest: b973db5647786eaf8743ca49d80e9c503b91dc5d36d57d716bbd64693d9469c3
1) Alice aquired new keypair:
	publicKey: 02a41b4cf6abf9bdf021e86073ec2b6629f6314b6709214c03b57efc52928f4e24
	privateKey: 98c16b0964369dfef03f3db9e43d2e44603b34c938d9f0c04f4a23970ed44213
2) Alice signed her message digest with her privateKey to get its signature:
	Signature: b416d7fd1211bde85ae640d25aaa5b75ff0b89782339192e8dd6a851d8ae379a13cc1c05adba27a90ac426cfe8493cf9a939069d171175433179a88db9e2a342
3) Bob verifyed by 3 elements ("message digest", "signature", and Alice's "publicKey"):
	verified: true
```
*/
import crypto from "crypto";
import fs from "fs";

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
});

console.log(`publicKey: ${publicKey} `);
console.log(`privateKey: ${privateKey}`);
fs.writeFileSync("certs/privateKey.pem", privateKey);
fs.writeFileSync("certs/publickKey.pem", publicKey);

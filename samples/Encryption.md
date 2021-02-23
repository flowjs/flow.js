
# Flow.js with end to end encryption (E2EE)

Warning: Crypto is complex, you have to clearly understand what you're doing. Risk is to create fake security sensation for users.
Quote from [mdn](https://developer.mozilla.org/fr/docs/Web/API/SubtleCrypto):
"If you're not sure you know what you are doing, you probably shouldn't be using this API."

Warning 2: This code will only works with  `flow.js` versions `3.x`.

End to end encryption means you encrypt (and decrypt) data on client side and server side has no idea what data are about.

## There are multiple ways to encrypt files before send them to server:

### Load and encrypt full file and, then, give this big blob to `flow.js` which will takes care of spliting and sending it as usual.
The big downside of this approach is that, at one time, you will have full plaintext file AND full cyphertext file in browser memory which is critical if you want to allow users to send big files on multiple devices (each device/os has his own memory managment policy).

### Add plaintext file to `flow.js` and, then, load & encrypt file chunks on the fly just before sending POST server request.

Here is an example:

```js
const flow = new Flow({
    testChunks: false,
    target: '/upload',
    chunkSize: 10 * 1024 * 1024,
    allowDuplicateUploads: true,
    forceChunkSize: false,
    simultaneousUploads: 4,
    uploadMethod: 'POST',
    fileParameterName: 'file',
    // Asynchronous function called before each chunk upload request
    asyncReadFileFn: async function(flowObj, startByte, endByte, fileType, chunk) {
        // Load file chunk in memory
        const plaintextbytes = await readFileChunk(flowObj.file, startByte, endByte);
        // Encrypt chunk
        const cypherbytes = await encryptFileChunk(plaintextbytes, window.ivbytes, window.key);

        // Update chunk size to match encrypted chunk [Add 16 bytes from initialization vector]
        chunk.chunkSize = chunk.chunkSize + 16; 

        // Return new blob ready to send
        const blob = new Blob([cypherbytes], {type: 'application/octet-stream'});
        return blob;
    }
});

flow.on('fileAdded', file => {
    // Update file size to match encrypted file [Add 16 bytes from initialization vector for each encrypted chunk]
    file.size += file.chunks.length * 16;
});


// Add an HTML5 File object to the list of files.
// The library will takes care about splitting in chunks
flow.addFile(file);

function readFileChunk(file, startByte, endByte) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            const bytes = new Uint8Array(reader.result);
            resolve(bytes);
        };
        const blob = file.slice(startByte, endByte);
        reader.readAsArrayBuffer(blob);
    });
}
  
async function encryptFileChunk(plaintextbytes, iv, key) {
    let cypherchunkbytes = await window.crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, plaintextbytes);
  
    if(cypherchunkbytes) {
        cypherchunkbytes = new Uint8Array(cypherchunkbytes);
        return cypherchunkbytes;
    }
}
```

### Encrypt the file as a stream using an asymmetric StreamEncryptor and [openpgpjs](https://openpgpjs.org/).

Here is an example:

```js
class StreamEncryptor {
    constructor(gpgKeys) {
        this.gpgKeys = gpgKeys;
        this._reader = [];
    }

    async init(flowObj) {
        const { message } = await openpgp.encrypt({
            message: openpgp.message.fromBinary(flowObj.file.stream(), flowObj.file.name),
            publicKeys: this.gpgKeys
        });

        this._reader[flowObj.uniqueIdentifier] = openpgp.stream.getReader(message.packets.write());
        flowObj.size = flowObj.file.size + compute_pgp_overhead(this.gpgKeys, flowObj.file.name);
    }

    async read(flowObj, startByte, endByte, fileType, chunk) {
        const buffer = await this._reader[flowObj.uniqueIdentifier].readBytes(flowObj.chunkSize);
        if (buffer && buffer.length) {
            return new Blob([buffer], {type: 'application/octet-stream'});
        }
    }
}

var encryptor = new StreamEncryptor(gpgKeys);
new Flow({
    // ...
    asyncReadFileFn: encryptor.read.bind(encryptor),
    initFileFn: encryptor.init.bind(encryptor),
    forceChunkSize: true,
});
```


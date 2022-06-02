const crypto = require('crypto')

const decodeContent = (encodedData) => {
    let buff = Buffer.from(encodedData, 'base64')
    const decodedContent = buff.toString('ascii')
    return decodedContent
}

const encodeContent = (data) => {
    let buff = Buffer.from(data).toString('base64')
    return buff
}

const value = crypto.createHash('sha1').update(`blob 23\x00I am dope from dopedope`).digest('hex')
console.log(value)
//95b966ae1c166bd92f8ae7d1c313e738c731dfc3
//bXkgdXBkYXRlZCBmaWxlIGNvbnRlbnRz
console.log(encodeContent('I am dope from dopedope'))
console.log(decodeContent('bXkgbmV3IGZpbGUgY29udGVudHM=').length)
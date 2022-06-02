const decodeContent = (encodedData) => {
    let buff = Buffer.from(encodedData, 'base64')
    const decodedContent = buff.toString('ascii')
    return decodedContent
}

const encodeContent = (data) => {
    let buff = Buffer.from(data).toString('base64')
    return buff
}

module.exports = { decodeContent, encodeContent }
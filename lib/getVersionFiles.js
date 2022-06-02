const octokit = require('./octokitConfig')

const decodeContent = (encodedData) => {
    let buff = Buffer.from(encodedData, 'base64')
    const decodedContent = buff.toString('ascii')
    return decodedContent
}

const getVersionFiles = async (owner, repo) => {
    let packagejson, lockjson
    try{
        const res = await octokit.request(`GET /repos/${owner}/${repo}/contents/package.json`)
        packagejson = decodeContent(res?.data?.content)
    }
    catch(err) {
        packagejson = undefined
    }
    try{
        const res = await octokit.request(`GET /repos/${owner}/${repo}/contents/package-lock.json`)
        lockjson = decodeContent(res?.data?.content)
    }
    catch(err) {
        lockjson = undefined
    }
    if(!lockjson && !packagejson) return new Error("project doesn't contain version files")
    console.log(lockjson, packagejson)
    return {packagejson, lockjson}
}

// getVersionFiles('shashank-crypto', 'blog-API')
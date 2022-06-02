const octokit = require('./octokitConfig')

const getVersionFiles = async (owner, repo) => {
    let packagejson, lockjson
    try{
        const res = await octokit.request(`GET /repos/${owner}/${repo}/contents/package.json`)
        packagejson = res?.data
    }
    catch(err) {
        packagejson = undefined
        console.log("No package.json file in the home dir of the REPO in default branch")
    }

    try{
        const res = await octokit.request(`GET /repos/${owner}/${repo}/contents/package-lock.json`)
        lockjson = res?.data
    }
    catch(err) {
        lockjson = undefined
        console.log("No package-lock.json in the home dir of the REPO in default branch")
        if(!packagejson) throw new Error('No version files found')
    }
        // if(!lockjson && !packagejson) {throw new Error("project doesn't contain version files")}
        console.log(lockjson, packagejson)
        return {packagejson, lockjson}
}

module.exports = getVersionFiles
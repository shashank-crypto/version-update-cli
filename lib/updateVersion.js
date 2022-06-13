const octokit = require('./octokitConfig')
const comparever = require('compare-versions')
const fs = require('fs')
const config = new (require('conf'))()

const compareVersion = (package, version, packagejson, lockjson) => {
    const pkgver = comparever(packagejson?.depedencies[package], version)
    const lockver = comparever(lockjson?.depedencies[package]?.version, version)
    return [pkgver, lockver]
}

const updateVersion = (pkgjson, lockjson, pkgver) => {
    fs.writeFile('/cli/package.json', pkgjson, err => {
        if(err) console.log(err)
    }) 
}

//main issue right now is updating the versionFiles

//check if owner of the repo
const isOwner = (owner) => {
    const user = config.get('user')
    return (user == owner)
}

//not:
    //check if forked
    //get the forked repo
const isForked = async (owner, repo) => {
    const user = config.get('user')
    let dataLength, pg = 1;
    do{
        const {data} = await octokit.request(`GET /repos/${owner}/${repo}/forks?page=${pg}`)
        for(const fork of data) {
            // console.log(fork.owner.login)
            if(user == fork.owner.login) return fork.name
        }
        dataLength = data.length
        // console.log(dataLength, pg)
        pg++
    }
    while(dataLength == 30 && pg < 5)
    return undefined
}
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
    const {data} = await octokit.request(`GET /repos/${owner}/${repo}/forks`)
    for(const fork of data) {
        // console.log(fork.owner.login)
        if(user == fork.owner.login) return fork.name
    }
    return undefined
}

// isForked("bmartyn", "gpl")
  
    //create a new branch
    const createNewBranch = async (owner, repo) => {
        //get default_branch
        const repoInfo = await octokit.request(`GET /repos/${owner}/${repo}`)
        const {default_branch} = repoInfo.data
        console.log(default_branch)
        //get sha of the default_branch
        const brnachInfo = await octokit.request(`GET /repos/${owner}/${repo}/git/refs/heads/${default_branch}`)
        const {sha} = brnachInfo.data.object
        console.log(sha)
        //create new branch
        const branchName = `clibranch-${Math.ceil(Math.random()*10000)}`
        const {data} = await octokit.request(`POST /repos/${owner}/${repo}/git/refs`, {
            ref : `refs/heads/${branchName}`,
            sha : sha
        })
        console.log("new branch", data)
        return data
    }

    const encodeContent = (data) => {
        let buff = Buffer.from(data).toString('base64')
        return buff
    }

    const updateContent = (owner, repo, branch, path, content) => {
        const encodedContent = encodeContent(content)
        const contentSHA = githubSHA(content)
        //TODO: create the function githubSHA
        const {data} = await octokit.request(`GET /repos/${owner}/${repo}/contents/${path}`,
        {
            branch : branch,
            message : `update pkg versions`,
            content : encodedContent,
            committer : {
                name : config.get('name') || "version update cli",
                email : config.get('email') || "version.cli@github.com"
            },
            sha : contentSHA
        })
        return data
    }

    //push changes to the new branch
const pushChangeToBranch = async (owner, repo, branch, packagejson, lockjson) => {
    let updatedPackageContent, updatedLockContent
    if(packagejson) {
        const encodedContent = encodeContent(packagejson)
        const contentSHA = githubSHA(packagejson)
        //TODO: create the function githubSHA
        const update = await octokit.request(`GET /repos/${owner}/${repo}/contents/package.json`,
        {
            branch : branch,
            message : `update pkg versions`,
            content : encodedContent,
            committer : {
                name : config.get('name') || "version update cli",
                email : config.get('email') || "version.cli@github.com"
            },
            sha : contentSHA
        })
        updatedPackageContent = update.data
    }
    if(lockjson) {
        const encodeContent = encodeContent(lockjson)
        const contentSHA = githubSHA(lockjson)
        //TODO: create the function githubSHA
        const update = await octokit.request(`GET /repos/${owner}/${repo}/contents/package-lock.json`,
        {
            branch : branch,
            message : `update pkg versions`,
            content : encodedContent,
            sha : contentSHA
        })
        updatedLockContent = update.data
    }
    return {updatedPackageContent, updatedLockContent}
}

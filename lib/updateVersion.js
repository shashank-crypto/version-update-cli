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

    //create a new branch
    const createNewBranch = async (owner, repo) => { //3 api calls {not good}
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

    const updateContent = async (owner, repo, branch, path, content) => {
        const {sha, content} = content
        const encodedContent = encodeContent(content)
        const {data} = await octokit.request(`PUT /repos/${owner}/${repo}/contents/${path}`,
        {
            branch : branch,
            message : `update pkg versions`,
            content : encodedContent,
            committer : {
                name : config.get('name') || "version update cli",
                email : config.get('email') || "version.cli@github.com"
            },
            sha : sha
        })
        return data
    }

    //push changes to the new branch
const pushChangeToBranch = async (owner, repo, branch, packagejson, lockjson) => {
    //just take a json object and destructure it
    let updatedPackageContent, updatedLockContent
    if(packagejson) {
        await updateContent(owner, repo, branch, 'package.json', packagejson)
    }
    if(lockjson) {
        await updateContent(owner, repo, branch, 'package-lock.json', lockjson)
    }
    return {updatedPackageContent, updatedLockContent}
}

const createPullRequest = async (owner, repo, defBranch, pullBranch) => {
    const {data} = await octokit.request(`POST /repos/${owner}/${repo}/pulls`, {
        "title" : `Version update`,
        "body" : `CLI making request to update the requested packages`,
        "head" : `${config.get("user")}:${pullBranch}`,
        "base" : defBranch
    })
    return data.html_url
}
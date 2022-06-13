const octokit = require('./octokitConfig')
const config = new (require('conf'))()

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

module.exports = pushChangeToBranch
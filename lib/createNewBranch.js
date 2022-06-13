const octokit = require('./octokitConfig')

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

module.exports = createNewBranch
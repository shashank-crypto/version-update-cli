const octokit = require('./octokitConfig')

const createPullRequest = async (owner, repo, defBranch, pullBranch) => {
    const {data} = await octokit.request(`POST /repos/${owner}/${repo}/pulls`, {
        "title" : `Version update`,
        "body" : `CLI making request to update the requested packages`,
        "head" : `${config.get("user")}:${pullBranch}`,
        "base" : defBranch
    })
    return data.html_url
}

module.exports = createPullRequest
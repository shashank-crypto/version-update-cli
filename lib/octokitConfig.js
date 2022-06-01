const config = new (require('conf'))()
const {Octokit} = require('octokit')

const octokit = new Octokit({
    auth: config.get('github.token')
  })

module.exports = octokit
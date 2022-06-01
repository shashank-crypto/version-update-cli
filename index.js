const config = new (require('conf'))()
const path = require('path')
const csvtojson = require('csvtojson')
const { program } = require('commander')
const octokit = require('./lib/octokitConfig')

program
    .command('config')
    .option('-t, --token <token>')
    .description('Enter github personal access token')
    .action(async token => {
        config.set('github',token)
        const response = await octokit.request(`GET /user`)
        config.set('user',response.data.login)
    })

program
    .option('-i , --insert <file...>')
    .description('Give the filename and package@version')
    .action(async () => {
        const filepath = path.join(process.cwd(),program.opts().insert[0])
        const jsondata = await csvtojson().fromFile(filepath)
        for(const {repo} of jsondata) {
            const data = repo.split(/[/.]+/)
            const owner = data.at(-3)
            const repoName = data.at(-2)
            // console.log(owner, repoName)
            updateVersion(owner, repoName)
        }
    })

program.parse()
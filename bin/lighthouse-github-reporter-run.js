const GithubManager = require('../src/github-manager')
const LighthouseReportManager = require('../src/lighthouse-report-manager')
const program = require('commander')

const path = require('path')

const basePath = process.cwd()
const projectPackage = require(path.join(basePath, 'package.json'))
const packageConfig = projectPackage.config || {}

program
.option('-u, --urls <urls>', 'The url/urls(array) where the test is going to be executed.')
.option('-a, --apiUrl <apiUrl>', 'The url that the reporter will use as its API')
.option('-i, --prId <prId>', 'The PR id where the tool is going to dump its report.')
.option('-t, --authToken <authToken>', 'The auth token of the user that is going to dump the report.')
.option('-o, --owner <owner>', 'The owner of the repository were we are going to put our report')
.option('-n, --repository <repository>', 'The name of the repository were we are going to put the comment.')
.option('-p, --pwa <pwa>, ', 'Set a minimum score limit for PWA, all scores under this number will be a non pass')
.option('-f, --performance <performance>, ', 'Set a minimum score limit for PERFORMANCE, all scores under this number will be a non pass')
.option('-p, --accessibility <accessibility>, ', 'Set a minimum score limit for PWA, all scores under this number will be a non pass')
.option('-b, --c <bestPractices>, ', 'Set a minimum score limit for BEST PRACTICES, all scores under this number will be a non pass')
.option('-s, --c <seo>, ', 'Set a minimum score limit for SEO, all scores under this number will be a non pass')

.parse(process.argv)

function buildParameters(packageConfig) {
  const packageCfg = packageConfig['lighthouse-github-reporter'] || {}
  packageCfg.scoreThresholds = {}
    return {
      apiUrl: packageCfg.apiUrl || program.apiUrl,
      prId: program.prId,
      authToken: packageCfg.authToken || program.authToken || process.env.GH_USER_AUTH_TOKEN,
      owner: packageCfg.owner || program.owner,
      repositoryName: packageCfg.repository || program.repository,
      urls: packageCfg.urls || program.urls,
      strictReview: packageCfg.strictReview || program.strictReview,
      scoreThresholds: {
        performance: program.performance || packageCfg.scoreThresholds.performance || 100,
        pwa: program.pwa || packageCfg.scoreThresholds.pwa || 100,
        accessibility: program.accessibility || packageCfg.scoreThresholds.accessibility || 100,
        "best-practices": program['bestPractices'] || packageCfg.scoreThresholds["bestPractices"] || 100,
        seo: program.seo || packageCfg.scoreThresholds.seo || 100
      }
    }
}



const parameters = buildParameters(packageConfig)
const githubManager = new GithubManager(parameters.apiUrl).authenticate(parameters.authToken)
const lighthouseReports = LighthouseReportManager.generate(parameters.urls, parameters.strictReview)


Promise.all(lighthouseReports).then(reports => {
  reports.forEach(r => {
    const parsedReport = LighthouseReportManager.parseReport(r, parameters.scoreThresholds)
    const mdReport = LighthouseReportManager.getMarkDownTable(parsedReport)
    githubManager.sendReport(r.code, mdReport, parameters.owner, parameters.repositoryName, parameters.prId)
  })
}).catch(e => console.log(e))

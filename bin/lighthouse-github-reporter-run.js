const GithubManager = require('../src/github-manager')
const LighthouseReportManager = require('../src/lighthouse-report-manager')
const program = require('commander')

const path = require('path')

const basePath = process.cwd()
const projectPackage = require(path.join(basePath, 'package.json'))
const packageConfig = projectPackage.config || {}
const LOW_NOISE_LEVEL = 'low'

function urls(val) {
  console.log('__-->',val.split(','))
  return val.split(',');
}

program
  .option(
    '-u, --urls <urls>',
    'The url/urls(array) where the test is going to be executed.',
    urls
  )
  .option(
    '-a, --apiUrl <apiUrl>',
    'The url that the reporter will use as its API'
  )
  .option(
    '-i, --prId <prId>',
    'The PR id where the tool is going to dump its report.'
  )
  .option(
    '-t, --authToken <authToken>',
    'The auth token of the user that is going to dump the report.'
  )
  .option(
    '-o, --owner <owner>',
    'The owner of the repository were we are going to put our report'
  )
  .option(
    '-n, --repository <repository>',
    'The name of the repository were we are going to put the comment.'
  )
  .option(
    '-p, --pwa <pwa>, ',
    'Set a minimum score limit for PWA, all scores under this number will be a non pass'
  )
  .option(
    '-f, --performance <performance>, ',
    'Set a minimum score limit for PERFORMANCE, all scores under this number will be a non pass'
  )
  .option(
    '-p, --accessibility <accessibility>, ',
    'Set a minimum score limit for PWA, all scores under this number will be a non pass'
  )
  .option(
    '-b, --bestPractices <bestPractices>, ',
    'Set a minimum score limit for BEST PRACTICES, all scores under this number will be a non pass'
  )
  .option(
    '-s, --seo <seo>, ',
    'Set a minimum score limit for SEO, all scores under this number will be a non pass'
  )
  .option(
    '-n, --noiseLevel <noiseLevel>, ',
    'Set the noise level to low and it will remove old reports each time that needs to put a new one'
  )
  .option('-r, --reporterUserName <reporterUserName>, ')

  .parse(process.argv)

function buildParameters(packageConfig) {
  const packageCfg = packageConfig['lighthouse-github-reporter'] || {}
  packageCfg.scoreThresholds = packageCfg.scoreThresholds || {}
  return {
    apiUrl: packageCfg.apiUrl || program.apiUrl,
    prId: program.prId,
    authToken:
      program.authToken ||
      packageCfg.authToken ||
      process.env.GH_USER_AUTH_TOKEN,
    owner: program.owner || packageCfg.owner,
    repositoryName: program.repository || packageCfg.repository,
    urls: program.urls || packageCfg.urls,
    reporterUserName: program.reporterUserName || packageCfg.reporterUserName,
    noiseLevel: program.noiseLevel || packageCfg.noiseLevel || 'low',
    scoreThresholds: {
      performance:
        program.performance || packageCfg.scoreThresholds.performance || 100,
      pwa: program.pwa || packageCfg.scoreThresholds.pwa || 100,
      accessibility:
        program.accessibility ||
        packageCfg.scoreThresholds.accessibility ||
        100,
      'best-practices':
        program['bestPractices'] ||
        packageCfg.scoreThresholds['bestPractices'] ||
        100,
      seo: program.seo || packageCfg.scoreThresholds.seo || 100
    }
  }
}

function initReport(parameters) {
  const lighthouseReports = LighthouseReportManager.generate(
    parameters.urls
  )
  
  Promise.all(lighthouseReports)
    .then(reports => {
      reports.forEach(r => {
        const parsedReport = LighthouseReportManager.parseReport(
          r,
          parameters.scoreThresholds
        )
        const mdReport = LighthouseReportManager.getMarkDownTable(parsedReport)
        githubManager.sendReport(
          mdReport,
          parameters.owner,
          parameters.repositoryName,
          parameters.prId
        )
      })
    })
    .catch(e => console.log(e))
}

const parameters = buildParameters(packageConfig)

const githubManager = new GithubManager(parameters.apiUrl).authenticate(
  parameters.authToken
)
if(parameters.noiseLevel === LOW_NOISE_LEVEL) {
  githubManager.removeReports(
    parameters.owner,
    parameters.repositoryName,
    parameters.prId,
    parameters.reporterUserName
  ).then(() => {
    // wait for delete
    initReport(parameters)
  })
} else {
  initReport(parameters)  
}

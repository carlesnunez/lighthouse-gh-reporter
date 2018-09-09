const GithubManager = require('../src/github-manager')
const BIN_PATH = require.resolve('lighthouse-ci/lib/cli.js')
const {spawn} = require('child_process')

const lighthouseReport = new Promise((resolve, reject) => {
  const child = spawn('node', [BIN_PATH, 'http://www.milanuncios.com'])
  let report
  // use child.stdout.setEncoding('utf8'); if you want text chunks
  child.stdout.on('data', chunk => {
    // data from standard output is here as buffers
    report = chunk.toString()
  })

  child.on('close', code => {
    !code
      ? resolve({code: 'COMMENT', report})
      : resolve({code: 'COMMENT', report})
  })
})

const githubManager = new GithubManager('https://github.schibsted.io/api/v3')
githubManager.authenticate('9c0d8bcbc373fbe4ce1f2eb482d675233f8dda73')

lighthouseReport.then(r => githubManager.sendReport(r))

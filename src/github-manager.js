module.exports = class GithubManager {
  constructor(baseUrl) {
    this._octokit = require('@octokit/rest')({
      timeout: 0,
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'lighthouse test' // v1.2.3 will be current version
      },
      baseUrl
    })
  }
  authenticate(token) {
    this._octokit.authenticate({
      type: 'token',
      token
    })
  }
  sendReport(report) {
    this._octokit.pullRequests
      .createReview({
        owner: 'scmspain',
        repo: 'frontend-ma--web-app',
        number: process.env.TRAVIS_PULL_REQUEST || 48,
        event: report.code,
        body: `Lighthouse reporter:\n ${report.report}`
      })
      .then(result => console.log(result))
  }
}

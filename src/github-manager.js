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

    return this
  }
  sendReport(code, body, owner, repositoryName, prId) {
    this._octokit.pullRequests
      .createReview({
        owner,
        repo: repositoryName,
        number: prId,
        event: code,
        body
      })
      .then(result => console.log(result))

      return this
  }
}

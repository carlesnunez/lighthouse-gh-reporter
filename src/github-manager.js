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
  sendReport(body, owner, repositoryName, prId) {
    this._octokit.issues.createComment(
      {
        owner,
        repo: repositoryName,
        number: prId,
        body
      })
      return this
  }

  removeReports(owner, repositoryName, prId, reporterUserName) {
    let removedReports = []
    this._octokit.issues.getComments({
      owner,
      repo: repositoryName,
      number: prId,
      per_page: 100
      }).then(result => {
          result.data.forEach(review => {
            if(review.user.login === reporterUserName) {
              console.log('----------->')
              removedReports.push(this._octokit.issues.deleteComment({owner, repo: repositoryName, comment_id: review.id}))
            }
          })
      })

      return Promise.all(removedReports)
  }
}

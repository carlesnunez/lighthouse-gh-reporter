const colors = require('colors/safe');

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
    return this._octokit.issues.createComment(
      {
        owner,
        repo: repositoryName,
        number: prId,
        body
      })
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
              removedReports.push(this._octokit.issues.deleteComment({owner, repo: repositoryName, comment_id: review.id}).catch(e => console.log('--->',e)))
            }
            (!reporterUserName) && console.log(colors.red('WARNING: LOW NOISE LEVEL needs reporter github user name in order to detect the bot comments, no comments were deleted'))

          })
      })

      return Promise.all(removedReports)
  }
}

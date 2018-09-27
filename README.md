# Lighthouse report manager

> The configurable Lighthouse GitHub reporter

## Motivation

Nowadays benchmark our websites is a fact. Each day Google change it's algorithm being more strict and asking us to develop our websites in a more performant and clever way.

To have a view about our websites performance we have Lighthouse... But Lighthouse is not a tool that connects us with GitHub by itself. This is why I created `lighthouse-github-reporter`.

## Installation

```sh
npm install lighthouse-gh-reporter
```

# CLI commands

```sh
  Usage: lighthouse-github-reporter [command] [options]


  Options:
        --version  output the version number
    -h, --help     output usage information


  Commands:

    run         Run tests in a headless chrome
    help [cmd]  display help for [cmd]
```

## Run command CLI options

The lh-gh-reporter has two ways to get the config variables.

The first one is by **CLI options**:

```sh
  Usage: lighthouse-github-reporter run [options]

  Options:

    -u, --urls <urls>, The url/urls(array) where the test is going to be executed.
    -a, --apiUrl <apiUrl>, The url that the reporter will use as its API
    -i, --prId <prId>, The PR id where the tool is going to dump its report.
    -t, --authToken <authToken>, The auth token of the user that is going to dump the report.
    -o, --owner <owner>, The owner of the repository were we are going to put our report
    -n, --repository <repository>, The name of the repository were we are going to put the comment.
    -p, --pwa <pwa>, Set a minimum score limit for PWA, all scores under this number will be a non pass
    -f, --performance <performance>, Set a minimum score limit for PERFORMANCE, all scores under this number will be a non pass
    -p, --accessibility <accessibility>, ', 'Set a minimum score limit for PWA, all scores under this number will be a non pass
    -b, --bestPractices <bestPractices>, Set a minimum score limit for BEST PRACTICES, all scores under this number will be a non pass
    -s, --seo <seo>, Set a minimum score limit for SEO, all scores under this number will be a non pass
    -r, --reporterUserName <reporterUserName>, The reporter user name (who is going a put the comment) NEEDED for the low noise mode.
    -n, --noiseLevel <noiseLevel>, Set the noise level to low and it will remove old reports each time that needs to put a new one
```

The second one is by **package.json options**:

Inside our package.json we have should add the next structure

```json
{
  "config": {
    "lighthouse-github-reporter": {
      "urls": ["<array of urls to be tested>"],
      "apiUrl": "<github api url>",
      "authToken": "<the github token of the user that will made the comments>",
      "owner": "<owner of the repo>",
      "repository": "<repository name>",
      "scoreThresholds": {
        "performance": "0 to 100",
        "pwa": "0 to 100",
        "accessibility": "0 to 100",
        "best-practices": "0 to 100",
        "seo": "0 to 100"
      }
    }
  }
}
```

By default all the thresholds will be 100. If you want to modify them you can do it as we show on the threshold config property or by cli option.

## Hiding our user token

The tool is prepared to get the token from env variable.

You just need to add the next env variable on your CI or system:

`GH_USER_AUTH_TOKEN=<your token>`

## Adding more than one url

If you add more than one url on your urls array it will iterate running Lighthouse on each of them and doing 1 comment per url on the pr.

The comment have the next aspect

## Lighthouse report for the URL: **https://<your url>**

| Category       | Score | Threshold | Pass |
| -------------- | ----- | --------- | ---- |
| performance    | 100   | 100       | ✅   |
| pwa            | 42    | 100       | ❌   |
| accessibility  | 100   | 100       | ✅   |
| best-practices | 87    | 100       | ❌   |
| seo            | 50    | 100       | ❌   |

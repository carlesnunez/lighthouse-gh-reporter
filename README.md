# Lighthouse report manager

> The configurable Lighthouse GH reporter

## Motivation

Nowadays benchmark our websites is a fact. Google change it's algorithm constantly being more strict and asking us to develop our websites in a more performant and clever way.

To have a view about our websites performance we have Lighthouse... But Lighthouse is not a tool that connects us with GitHub by itself. This is why we've created `lighthouse-github-reporter`.

## Installation

If you want to use it on npm scripts:

```sh
npm install lighthouse-gh-reporter
```

Then you must use it from your package.json
```json
scripts: {
  "run:lighthouse": "lighthouse-github-reporter -- --prId=<myId>"
}
```

## CLI commands

```sh
  Usage: lighthouse-github-reporter [command] [options]


  Options:
        --version  output the version number
    -h, --help     output usage information


  Commands:

    run         Run tests in a headless chrome
    help [cmd]  display help for [cmd]
```

The lh-gh-reporter has two ways to get the config variables.

## Configuring

### By **CLI options**

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

### By **package.json options**

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
### By ENV VARIABLE (only for TOKEN)

And there's only ONE that we can set by a third way, env variable `GH_USER_AUTH_TOKEN`

By default all the thresholds will be 100. If you want to modify them you can do it as we show on the threshold config property or by cli option.

# Tips

## Adding more than one url

If you add more than one url on your urls array it will iterate running Lighthouse on each of them and doing 1 comment per url on the pr.

The comment have the next aspect

## Lighthouse report for the URL: **https://yoururl.com**

| Category       | Score | Threshold | Pass |
| -------------- | ----- | --------- | ---- |
| performance    | 100   | 100       | ✅   |
| pwa            | 42    | 100       | ❌   |
| accessibility  | 100   | 100       | ✅   |
| best-practices | 87    | 100       | ❌   |
| seo            | 50    | 100       | ❌   |

# Using it on a CI system

I'll put here as an example the travis-ci case, but if it works for travis it should work for any CI.

## Setting up travis.yaml

```yaml
jobs:
  include:
    - stage: Peformance reporter
      if: type = pull_request
      env:
        - NODE_ENV=preproduction
      script:
        - npm run test:lighthouse:ci
```

As you can see this is a trimmed travis.yml definition that will work on the performance reporter stage, for the preproduction env and will run a custom npm script called `test:lighthouse:ci`. Let's check what does this script have:

## Setting up npm script

```json
"lighthouse-github-reporter run -- --prId=${TRAVIS_PULL_REQUEST}"
```

As it is a npm script we should bypass our properties to the bin. In this scenario we are only passing the PRID to our tool and we are retrieveing it from tavis env variable `TRAVIS_PULL_REQUEST`. More info about travis env vars [here](https://docs.travis-ci.com/user/environment-variables/)

## Setting up tool config

Open you `package.json`project file:

Inside it, under devPackages, for example, create a new property called 'config'.

```
  "config": {
    "lighthouse-github-reporter": {
      "urls": [
        "http://localhost:3000",
        "http://localhost:3000/test/page1",
        "http://localhost:3000/test/page2"
      ],
      "apiUrl": "https://api.github.com",
      "owner": "myCompany",
      "repository": "myRepo",
      "reporterUserName": "your reporter user name",
      "noiseLevel": "low",
      "scoreThresholds": {
        "performance": 100,
        "pwa": 40,
        "accessibility": 30,
        "best-practices": 100,
        "seo": 100
      }
    }
  },
```

I'll explain this config further more:

  - urls: An array of urls is where our cli will point
  - apiUrl: Our github API url, if you have a GH enterprise repo this should be the url of your GH enterprise api
  - Owner: The owner of your repository for example if is a repository under your own it must be your username.
  - repository: The repo name
  - reporterUserName: used to IDENTIFY the 'bot' that is putting the reports as coments on our PR's
  - noiseLevel: By default setted to low. In low mode will delete older reports and put new ones each time that we run the tool.
  - scoreThresholds: This is an important part. Our tool will put a cross if our score is under the number that we setted on each thresholds or will put a check if is equal or greater than the number than we setted up.


!> Remember that reporterUserName is used to IDENTIFY the 'bot' that is putting the reports as coments on our PR's if we don't know who is the reporter we cannot delete its previous comments. If we don't tell the tool who is the reporter the low noise level will not work! - THIS IS VERY IMPORTANT!!

## Securing our github TOKEN

You can let the tool use your github TOKEN without put it as a command or config variable. Just set an env variable on your CI called `GH_USER_AUTH_TOKEN`. 

!> It must be setted on the settings of your travis CI and setted up as a hidden variable in order to avoid leaks.



# Troubleshooting

## I'm trying to run the tool on a low noise level but it doesn't works

If your error is that the tool is not removing the old report comments BEFORE put the new ones it could be happening because you did not setted up the --reporterUserName <reporterUserName> option.

!> Remember that this option is used to IDENTIFY the 'bot' that is putting the reports as coments on our PR's if we don't know who is the reporter we cannot delete its previous comments. THIS IS VERY IMPORTANT!!

## My cli doesn't run, finish and no message is shown

It could be happening because the cli have a conexion problem due to the environment where are you running the cli or because the URL is unreachable.

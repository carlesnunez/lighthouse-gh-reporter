#!/usr/bin/env node
const program = require('commander')

const pkg = require('../package.json')
const version = pkg.version

program.version(version, '    --version')

program.command('run', 'Run tests').alias('r')

program.parse(process.argv)

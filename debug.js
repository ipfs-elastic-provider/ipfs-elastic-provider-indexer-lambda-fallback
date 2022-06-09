'use strict'

process.env.DEBUG = 1
process.env.LOG_LEVEL = 'info'

const { fromIni } = require('@aws-sdk/credential-provider-ini')

const REGION = 'us-west-2'
const CREDENTIALS_PROFILE = 'plnitro'

const credentials = {
  region: REGION,
  credentials: fromIni({ profile: CREDENTIALS_PROFILE })
}

const lambda = require('./src/index').handler
lambda({
  credentials,
  start: "2022-06-08T00:00:00.000Z",
  end: "2022-06-09T00:00:00.000Z"
})

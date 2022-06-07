'use strict'

const { resolve } = require('path')

/* c8 ignore next */
require('dotenv').config({ path: process.env.ENV_FILE_PATH || resolve(process.cwd(), '.env') })

const { CLOUDWATCH_PING, CLOUDWATCH_LOG_GROUP, DYNAMO_CAR_TABLE, DYNAMO_CAR_KEY, SQS_QUEUE } = process.env

module.exports = {
  DYNAMO_CAR_TABLE: DYNAMO_CAR_TABLE ?? 'cars',
  DYNAMO_CAR_KEY: DYNAMO_CAR_KEY ?? 'path',
  SQS_QUEUE: SQS_QUEUE ?? 'indexer-topic',
  CLOUDWATCH_LOG_GROUP: CLOUDWATCH_LOG_GROUP ?? '/aws/lambda/indexer',
  CLOUDWATCH_PING: CLOUDWATCH_PING ?? 1000 // ms
}
